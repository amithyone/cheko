<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

/**
 * Checkout Broadcast verify API for check-outpay.com
 * Session stays open until paid/cancelled — do not reject verify on timestamp_ms alone while open.
 */
class BroadcastVerifyController extends Controller
{
    public function health(): JsonResponse
    {
        $terminals = DB::table('broadcast_terminals')->where('active', 1)->count();

        return response()->json([
            'ok' => true,
            'status' => 'ok',
            'terminals' => $terminals,
        ]);
    }

    public function verifyBroadcast(Request $request): JsonResponse
    {
        $key = 'broadcast-verify:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, (int) config('broadcast.rate_limit_verify', 120))) {
            return response()->json([
                'valid' => false,
                'error' => 'Rate limit exceeded',
            ], 429);
        }
        RateLimiter::hit($key, 60);

        $packet = $request->all();
        $payload = $packet['payload'] ?? null;
        if (! is_array($payload)) {
            return response()->json(['valid' => false, 'error' => 'Invalid packet'], 422);
        }

        $terminalId = $payload['terminal_id'] ?? '';
        $sessionUuid = $payload['session_uuid_v4'] ?? '';

        $terminal = DB::table('broadcast_terminals')
            ->where('terminal_id', $terminalId)
            ->where('active', 1)
            ->first();

        if (! $terminal) {
            return response()->json(['valid' => false, 'error' => 'Unknown terminal_id']);
        }

        if (! $this->merchantBroadcastActive($terminal)) {
            return response()->json([
                'valid' => false,
                'error' => 'Pay at shop is not active for this merchant',
            ]);
        }

        $sessionStatus = $this->sessionStatus($sessionUuid, $terminalId);
        if ($sessionStatus === 'paid') {
            return response()->json([
                'valid' => false,
                'error' => 'Session already paid',
                'session_status' => 'paid',
            ]);
        }
        if ($sessionStatus === 'cancelled') {
            return response()->json([
                'valid' => false,
                'error' => 'Session cancelled',
                'session_status' => 'cancelled',
            ]);
        }

        // Open / unknown: do not reject solely on packet age while session is still open.
        $signatureAlg = $packet['signature_alg'] ?? 'HMAC-SHA256';
        if (! $this->verifySignature($payload, $terminal->signing_key, $packet['signature'] ?? '', $signatureAlg)) {
            return response()->json([
                'valid' => false,
                'error' => 'Invalid signature',
                'session_status' => $sessionStatus ?: 'open',
            ]);
        }

        $display = $payload['account_info_public_display'] ?? [];
        if (($display['bank_name_hash'] ?? '') !== $terminal->bank_name_hash) {
            return response()->json([
                'valid' => false,
                'error' => 'Bank name hash mismatch',
                'session_status' => $sessionStatus ?: 'open',
            ]);
        }

        $packetAmount = (int) ($payload['transaction_details']['total_amount_ngn'] ?? 0);
        $amountNgn = $this->displayAmountNgn($packetAmount, $signatureAlg);

        $this->ensureOpenSession($sessionUuid, $terminalId, $packetAmount);

        return response()->json([
            'valid' => true,
            'merchant_name' => $terminal->merchant_name,
            'amount_ngn' => $amountNgn,
            'masked_account_suffix' => $terminal->masked_account_suffix,
            'session_uuid' => $sessionUuid,
            'terminal_id' => $terminalId,
            'terminal_label' => $this->terminalPickerLabel($terminalId),
            'session_status' => 'open',
            'recipient_account' => $terminal->account_number,
            'recipient_bank_code' => $terminal->recipient_bank_code,
        ]);
    }

    public function registerTerminal(Request $request): JsonResponse
    {
        $adminKey = $request->header('X-Admin-Key');
        if ($adminKey !== config('broadcast.admin_key')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $data = $request->validate([
            'terminal_id' => 'required|string|max:64',
            'signing_key' => 'required|string|min:16|max:512',
            'signature_alg' => 'nullable|string|in:HMAC-SHA256,ed25519',
            'merchant_name' => 'required|string|max:128',
            'bank_name' => 'required|string|max:64',
            'masked_account_suffix' => 'required|regex:/^\*{3}[0-9]{4}$/',
            'account_number' => 'nullable|digits:10',
            'recipient_bank_code' => 'nullable|string|max:6',
            'business_id' => 'nullable|integer',
        ]);

        $bankNameHash = 'sha256:'.hash('sha256', strtolower(trim($data['bank_name'])));

        DB::table('broadcast_terminals')->updateOrInsert(
            ['terminal_id' => $data['terminal_id']],
            [
                'signing_key' => $data['signing_key'],
                'merchant_name' => $data['merchant_name'],
                'bank_name' => $data['bank_name'],
                'bank_name_hash' => $bankNameHash,
                'masked_account_suffix' => $data['masked_account_suffix'],
                'account_number' => $data['account_number'] ?? null,
                'recipient_bank_code' => $data['recipient_bank_code'] ?? null,
                'business_id' => $data['business_id'] ?? null,
                'active' => 1,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return response()->json(['ok' => true, 'terminal_id' => $data['terminal_id']]);
    }

    /** Mark session paid (transfer webhook / POS callback). */
    public function markSessionPaid(Request $request): JsonResponse
    {
        $sessionUuid = $request->input('session_uuid');
        if (! Str::isUuid($sessionUuid)) {
            return response()->json(['ok' => false, 'error' => 'Invalid session_uuid'], 422);
        }

        DB::table('broadcast_sessions')->updateOrInsert(
            ['session_uuid' => $sessionUuid],
            ['status' => 'paid', 'updated_at' => now(), 'created_at' => now()]
        );

        return response()->json(['ok' => true, 'session_status' => 'paid']);
    }

    private function sessionStatus(string $sessionUuid, string $terminalId): ?string
    {
        if ($sessionUuid === '' || ! Str::isUuid($sessionUuid)) {
            return null;
        }

        $row = DB::table('broadcast_sessions')
            ->where('session_uuid', $sessionUuid)
            ->where('terminal_id', $terminalId)
            ->first();

        return $row?->status;
    }

    private function ensureOpenSession(string $sessionUuid, string $terminalId, int $amountKobo): void
    {
        if ($sessionUuid === '' || ! Str::isUuid($sessionUuid)) {
            return;
        }

        DB::table('broadcast_sessions')->updateOrInsert(
            ['session_uuid' => $sessionUuid],
            [
                'terminal_id' => $terminalId,
                'status' => 'open',
                'amount_kobo' => $amountKobo,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    private function merchantBroadcastActive(object $terminal): bool
    {
        if (! $terminal->business_id) {
            return true;
        }

        $business = DB::table('businesses')
            ->where('id', $terminal->business_id)
            ->first();

        if (! $business) {
            return true;
        }

        return (bool) ($business->broadcast_pay_at_shop_enabled ?? true)
            && (bool) ($business->broadcast_pay_at_shop_active ?? true)
            && (bool) ($business->is_active ?? true);
    }

    private function displayAmountNgn(int $packetAmount, string $signatureAlg): float
    {
        if (strtolower($signatureAlg) === 'ed25519') {
            return round($packetAmount / 100, 2);
        }

        return (float) $packetAmount;
    }

    private function terminalPickerLabel(string $terminalId): string
    {
        $upper = strtoupper($terminalId);
        if (str_starts_with($upper, 'TERM-')) {
            $suffix = substr($terminalId, strrpos($terminalId, '-') + 1);
            if (ctype_digit($suffix)) {
                return str_pad($suffix, 2, '0', STR_PAD_LEFT);
            }
        }
        preg_match_all('/\d/', $terminalId, $matches);
        $digits = implode('', $matches[0] ?? []);
        if ($digits !== '') {
            return str_pad(substr($digits, -2), 2, '0', STR_PAD_LEFT);
        }

        return substr($terminalId, 0, 8);
    }

    private function verifySignature(array $payload, string $signingKey, string $signatureB64, string $alg): bool
    {
        if ($signatureB64 === '') {
            return false;
        }

        $canonical = json_encode($this->sortKeysRecursive($payload), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if (strtolower($alg) === 'ed25519') {
            if (! function_exists('sodium_crypto_sign_verify_detached')) {
                return false;
            }
            $message = $canonical;
            $signature = base64_decode($signatureB64, true);
            if ($signature === false) {
                return false;
            }
            $publicKey = $this->ed25519PublicKeyFromSigningKey($signingKey);
            if ($publicKey === null) {
                return false;
            }

            return sodium_crypto_sign_verify_detached($signature, $message, $publicKey);
        }

        $expected = base64_encode(hash_hmac('sha256', $canonical, $signingKey, true));

        return hash_equals($expected, $signatureB64);
    }

    /** Derive Ed25519 public key from stored seed (CheckoutNow one-time key format). */
    private function ed25519PublicKeyFromSigningKey(string $signingKey): ?string
    {
        $raw = base64_decode($signingKey, true);
        if ($raw === false) {
            return null;
        }
        if (strlen($raw) === 32) {
            $keypair = sodium_crypto_sign_seed_keypair($raw);

            return sodium_crypto_sign_publickey($keypair);
        }
        if (strlen($raw) === 64) {
            return sodium_crypto_sign_publickey_from_secretkey($raw);
        }

        return null;
    }

    private function sortKeysRecursive(array $data): array
    {
        ksort($data);
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->sortKeysRecursive($value);
            }
        }

        return $data;
    }
}
