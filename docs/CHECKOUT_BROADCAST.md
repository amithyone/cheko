# Checkout Broadcast — Cheko POS + check-outpay.com

CheckoutNow uses **two Bluetooth payment systems**. This doc covers the **open** Checkout Broadcast protocol (Pay at Shop). Nearby Pay is internal only — do not change when working on Broadcast.

| System | Scope |
|--------|--------|
| **Checkout Broadcast (open)** | POS → wallet (OPay, Kuda, GTBank, CheckoutNow) |
| **Nearby Pay (proprietary)** | CheckoutNow ↔ CheckoutNow P2P only |

Open spec: [`vendor/checkout_broadcast/spec/`](../vendor/checkout_broadcast/spec/)  
Production verify: `https://check-outpay.com/api/v1/broadcast/verify-broadcast`

---

## End-to-end flow

```
Shop POS (Cheko Windows) → signed BLE packet → Wallet app scans GATT
→ POST verify-broadcast → pre-fill transfer → customer PIN
```

---

## Cheko POS responsibilities

| Rule | Implementation |
|------|----------------|
| Same `session_uuid_v4` until paid/cancel | `broadcast-sidecar/session_store.py` + `POST /broadcast` with optional `session_id` on 90s refresh |
| Fresh `timestamp_ms` on BLE | Re-sign packet every `/broadcast` (including refresh) |
| Cancel | `POST /stop` → `session_status: cancelled` |
| Paid | `POST /session/paid` when cashier completes payment |
| Park payment | `POST /session/park` — session stays **open** for wallet verify; POS serves next customer |
| Execute Payment amount | Cart total locked at Execute Payment click → decimal NGN sent to sidecar |
| Terminal picker label | `TERM-01` … `TERM-20` → `01`–`20` via `formatTerminalPickerLabel()` / `terminal_picker_label()` |
| Max open sessions | Sidecar keeps up to **20** open sessions (multi-POS / parked payments) |

### Amount encoding

- POS sends **decimal NGN** (e.g. `9003.76`) from active cart at Execute Payment.
- **ed25519 / CheckoutNow**: packet `total_amount_ngn` = **kobo** (`900376`).
- Verify response `amount_ngn` = decimal NGN (`9003.76`) for mobile transfer screen.

### BLE

| | UUID |
|---|------|
| Service | `cbbc0001-0000-4000-8000-000000000001` |
| Packet char | `cbbc0002-0000-4000-8000-000000000001` |

Payload: full signed JSON UTF-8 on GATT read (`signature_alg`: `ed25519` for check-outpay.com).

---

## Dev sidecar (`broadcast-sidecar/`)

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Sidecar status, `signature_alg`, `bank_name_hash`, active session |
| `GET /broadcast/open-sessions` | List open sessions (dev / multi-POS) |
| `POST /broadcast` | Open/reuse session + push signed BLE packet (`session_id` optional for refresh) |
| `POST /stop` | Cancel active session |
| `POST /session/paid` | Close session after payment |
| `POST /session/park` | Release active BLE slot; session stays open for verify |
| `POST /verify-broadcast` | Dev bank API — matches production contract below |

Run: `npm run sidecar:broadcast`

---

## `POST /broadcast/verify-broadcast` contract

**Request:** full signed packet from POS (same JSON on GATT `cbbc0002-…`):

```json
{
  "payload": {
    "protocol_version": 2.0,
    "timestamp_ms": 1738123456789,
    "session_uuid_v4": "550e8400-e29b-41d4-a716-446655440000",
    "terminal_id": "TERM-01",
    "transaction_details": {
      "currency_code": "NGN",
      "total_amount_ngn": 900376,
      "item_count": 3
    },
    "account_info_public_display": {
      "bank_name_hash": "sha256:…",
      "masked_account_suffix": "***9876"
    }
  },
  "signature_alg": "ed25519",
  "signature": "…"
}
```

### Session lifecycle (backend + POS)

- Session stays **open** until customer pays or cashier cancels on POS.
- **Do not** reject verify solely on `timestamp_ms` age while `session_status` is `open`.
- Optional response field: `session_status`: `open` | `paid` | `cancelled`.

**Success (HTTP 200):**

```json
{
  "valid": true,
  "merchant_name": "Shop Name",
  "amount_ngn": 9003.76,
  "masked_account_suffix": "***9876",
  "session_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "terminal_id": "TERM-01",
  "terminal_label": "01",
  "session_status": "open",
  "recipient_account": "0123456789",
  "recipient_bank_code": "058"
}
```

**Closed session (HTTP 200):**

```json
{
  "valid": false,
  "error": "Session already paid",
  "session_status": "paid"
}
```

```json
{
  "valid": false,
  "error": "Session cancelled",
  "session_status": "cancelled"
}
```

**Other failures:** `Unknown terminal_id`, `Invalid signature`, `Pay at shop is not active for this merchant`, HTTP 429 rate limit.

### Backend ops (check-outpay.com)

| Step | Endpoint | Notes |
|------|----------|--------|
| Health | `GET /broadcast/health` | `{"ok":true,"status":"ok","terminals":N}` |
| Register terminal | `POST /broadcast/terminals/register` | Header `X-Admin-Key: BROADCAST_ADMIN_KEY` |
| Verify packet | `POST /broadcast/verify-broadcast` | Public, rate-limited |
| Mark paid | `POST /broadcast/sessions/paid` | Webhook / transfer complete |

Reference Laravel controller: [`vendor/checkout_broadcast/deploy/laravel/BroadcastVerifyController.php`](../vendor/checkout_broadcast/deploy/laravel/BroadcastVerifyController.php)  
Session migration: [`migration_broadcast_sessions_v2.sql`](../vendor/checkout_broadcast/deploy/laravel/migration_broadcast_sessions_v2.sql)

`.env`: `BROADCAST_ADMIN_KEY`, `BROADCAST_RATE_LIMIT_VERIFY=120`

---

## Mobile app mapping (Pay at Shop)

| Verify field | App use |
|--------------|---------|
| `merchant_name` | Recipient name |
| `amount_ngn` | Transfer amount |
| `recipient_account` | NUBAN |
| `recipient_bank_code` | Bank picker |
| `session_uuid` | Idempotency on bank transfer |
| `terminal_label` | Multi-POS picker (`01`–`20`) |
| `session_status` | Hide when `paid` / `cancelled` |

**Multi-POS:** App scans nearby terminals, verifies up to 3 in parallel, shows picker (terminal label + amount). Up to **20** simultaneous open sessions.

---

## Park payment (Cheko)

1. **Park & serve next customer** — payment in **Parked payments**; BLE session stays **open** (`POST /session/park`).
2. Next checkout gets a **new BLE session** automatically.
3. Background poller completes parked payments when webhook/verify succeeds.
4. **Open** on a parked row to return to that payment screen.

---

## Settings (CheckoutNow provider)

- **Signing key** + **Signature algorithm: ed25519**
- **Settlement bank** → SDK `bank_name_hash` (must match terminal registry)
- **Masked account suffix** → must match terminal registry

Bank hash rule: `sha256:` + hex(SHA256(lowercase(trim(bank_name))))

---

## Related

- Open protocol: [`vendor/checkout_broadcast/`](../vendor/checkout_broadcast/)
- Production deploy: [`vendor/checkout_broadcast/deploy/checkoutpay-production.md`](../vendor/checkout_broadcast/deploy/checkoutpay-production.md)
- Conformance fixtures: [`vendor/checkout_broadcast/tests/fixtures/`](../vendor/checkout_broadcast/tests/fixtures/)
