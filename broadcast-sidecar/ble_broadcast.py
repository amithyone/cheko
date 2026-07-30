"""Build signed BLE envelopes for session-stable broadcast."""

from __future__ import annotations

import time
import uuid as uuid_lib
from typing import Any

from checkout_broadcast.protocol import build_payload

import packet_signing


def build_signed_packet(
    *,
    terminal_id: str,
    signing_key: str,
    signature_alg: str,
    bank_name: str,
    masked_suffix: str,
    amount_ngn: int,
    item_count: int,
    session_uuid_v4: str | None = None,
) -> dict[str, Any]:
    base = build_payload(
        terminal_id=terminal_id,
        amount_ngn=amount_ngn,
        item_count=item_count,
        bank_name=bank_name,
        masked_account_suffix=masked_suffix,
    )
    payload = dict(base)
    payload["session_uuid_v4"] = session_uuid_v4 or str(uuid_lib.uuid4())
    payload["timestamp_ms"] = int(time.time() * 1000)
    return packet_signing.build_signed_envelope(payload, signing_key, signature_alg)
