# Pay at Shop — simple model (Cheko POS)

## You were right — we overcomplicated it

### Online mode (default — use this)

```
Cheko POS  ──BLE──►  CheckoutNow app  ──API──►  CheckoutPay
   │                      │                         │
   terminal_id            reads packet              returns account
   amount                 terminal_id + amount      for that terminal
   session_uuid           from your settlement
   signature (ed25519)
```

**POS configures only:**
- Terminal ID (`CP-1RK8Z`)
- Ed25519 signing key (from Pay at shop dashboard)
- API key (optional — for polling payment status)

**POS does NOT send:** bank name, account number, hash, masked suffix.

**CheckoutNow app** calls `POST /verify-broadcast` with the signed packet → CheckoutPay returns merchant name + settlement account.

---

### Offline mode (shop has no internet)

```
Cheko POS  ──BLE──►  CheckoutNow app
   │                      │
   terminal_id            uses account from BLE
   amount                 (saved on POS)
   offline_settlement
   signature
```

**POS also saves locally:**
- Settlement account number
- NIP bank code
- Bank name + account name

These go in the BLE packet under `offline_settlement` (protocol 2.1).

---

## BLE packet (online)

```json
{
  "payload": {
    "protocol_version": 2.1,
    "connectivity": "online",
    "timestamp_ms": 1738123456789,
    "session_uuid_v4": "550e8400-e29b-41d4-a716-446655440000",
    "terminal_id": "CP-1RK8Z",
    "transaction_details": {
      "currency_code": "NGN",
      "total_amount_ngn": 100,
      "item_count": 1
    }
  },
  "signature_alg": "ed25519",
  "signature": "…"
}
```

No `account_info_public_display`. No bank hash.

---

## Cheko Settings

**Settings → Payment Provider → CheckoutNow**

| Field | Online | Offline |
|-------|--------|---------|
| Terminal ID | Required | Required |
| Ed25519 signing key | Required | Required |
| API key | For session polling | For session polling |
| Settlement account | Not needed | Required |
| NIP bank code | Not needed | Required |

Mode toggle: **Online (recommended)** vs **Offline**.

---

## What still needs signing?

The **amount** and **terminal_id** are signed so a customer cannot tamper with the payment amount in transit. The signing key stays on the POS — not the account number.

---

## Pull & run

```powershell
cd cheko
git pull
npm install
npm run dev:desktop
```

Configure Settings → CheckoutNow → **Online** → save terminal + signing key → test broadcast.
