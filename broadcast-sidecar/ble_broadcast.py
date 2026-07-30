"""Build signed BLE envelopes — online (terminal + amount) or offline (+ settlement on POS)."""

from __future__ import annotations

import time
import uuid as uuid_lib
from typing import Any

import packet_signing


def build_signed_packet(
    *,
    terminal_id: str,
    signing_key: str,
    signature_alg: str,
    amount_ngn: int,
    item_count: int,
    session_uuid_v4: str | None = None,
    connectivity: str = "online",
    settlement: dict[str, str] | None = None,
) -> dict[str, Any]:
    """
    Online (default): terminal_id + amount + session only.
    CheckoutNow fetches settlement account from CheckoutPay after verify.

    Offline: same plus offline_settlement saved on this POS (no live API).
    """
    payload: dict[str, Any] = {
        "protocol_version": 2.1,
        "connectivity": connectivity if connectivity in ("online", "offline") else "online",
        "timestamp_ms": int(time.time() * 1000),
        "session_uuid_v4": session_uuid_v4 or str(uuid_lib.uuid4()),
        "terminal_id": terminal_id,
        "transaction_details": {
            "currency_code": "NGN",
            "total_amount_ngn": amount_ngn,
            "item_count": max(item_count, 1),
        },
    }

    if connectivity == "offline" and settlement:
        payload["offline_settlement"] = {
            "recipient_account": settlement.get("recipient_account", ""),
            "recipient_bank_code": settlement.get("recipient_bank_code", ""),
            "bank_name": settlement.get("bank_name", ""),
            "recipient_account_name": settlement.get("recipient_account_name", ""),
        }

    return packet_signing.build_signed_envelope(payload, signing_key, signature_alg)
