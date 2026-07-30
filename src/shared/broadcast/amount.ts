import { roundMoney } from "@/shared/utils/money";
import type { SignatureAlg } from "@/types/payment-provider";

/**
 * Decimal NGN shown on POS → integer for BLE packet.
 * CheckoutNow / ed25519: kobo (9003.76 → 900376).
 * HMAC dev: whole naira (2500.00 → 2500).
 */
export function toBroadcastPacketAmount(
  totalNgn: number,
  signatureAlg: SignatureAlg = "ed25519"
): number {
  const normalized = roundMoney(totalNgn);
  if (signatureAlg === "ed25519") {
    return Math.max(1, Math.round(normalized * 100));
  }
  return Math.max(1, Math.round(normalized));
}
