"""Build compact Pay at Shop BLE wire packets (presence + checkout)."""

from __future__ import annotations

import time
import uuid as uuid_lib
from typing import Any

import packet_signing


def _masked_suffix(cfg: dict[str, str]) -> str:
    return (cfg.get("masked_suffix") or "***0000").strip()


def build_signing_payload(
    *,
    terminal_id: str,
    session_uuid_v4: str,
    timestamp_ms: int | None = None,
    amount_kobo: int = 0,
    masked_account_suffix: str = "",
    session_kind: str | None = None,
) -> dict[str, Any]:
    """Canonical payload bytes are signed from this expanded dict."""
    payload: dict[str, Any] = {
        "protocol_version": 2.1,
        "timestamp_ms": int(timestamp_ms if timestamp_ms is not None else time.time() * 1000),
        "session_uuid_v4": session_uuid_v4,
        "terminal_id": terminal_id,
        "transaction_details": {"total_amount_ngn": max(0, int(amount_kobo))},
    }
    if masked_account_suffix:
        payload["account_info_public_display"] = {
            "masked_account_suffix": masked_account_suffix,
        }
    if session_kind:
        payload["session_kind"] = session_kind
    return payload


def to_compact_wire(envelope: dict[str, Any]) -> dict[str, Any]:
    """Full signed envelope → compact BLE wire { p, alg, sig }."""
    payload = envelope.get("payload") or {}
    tx = payload.get("transaction_details") or {}
    amount = int(tx.get("total_amount_ngn", 0) or 0)
    acct = payload.get("account_info_public_display") or {}

    wire_p: dict[str, Any] = {
        "v": payload.get("protocol_version", 2.1),
        "sid": payload.get("session_uuid_v4"),
        "tid": payload.get("terminal_id"),
        "ts": payload.get("timestamp_ms"),
    }
    if amount > 0:
        wire_p["amt"] = amount
    msk = acct.get("masked_account_suffix")
    if msk:
        wire_p["msk"] = msk
    kind = payload.get("session_kind")
    if kind:
        wire_p["k"] = kind

    return {
        "p": wire_p,
        "alg": envelope.get("signature_alg") or "ed25519",
        "sig": envelope.get("signature") or "",
    }


def build_presence_wire(
    *,
    cfg: dict[str, str],
    session_uuid_v4: str | None = None,
    timestamp_ms: int | None = None,
) -> dict[str, Any]:
    """Idle till beacon — amt omitted, signed with total_amount_ngn: 0."""
    sid = session_uuid_v4 or str(uuid_lib.uuid4())
    msk = _masked_suffix(cfg)
    payload = build_signing_payload(
        terminal_id=cfg["terminal_id"],
        session_uuid_v4=sid,
        timestamp_ms=timestamp_ms,
        amount_kobo=0,
        masked_account_suffix=msk,
    )
    envelope = packet_signing.build_signed_envelope(
        payload, cfg["signing_key"], cfg["signature_alg"]
    )
    return to_compact_wire(envelope)


def build_checkout_wire(
    *,
    cfg: dict[str, str],
    amount_kobo: int,
    session_uuid_v4: str | None = None,
    timestamp_ms: int | None = None,
) -> dict[str, Any]:
    """Active cart — wire includes amt (kobo for ed25519)."""
    sid = session_uuid_v4 or str(uuid_lib.uuid4())
    msk = _masked_suffix(cfg)
    payload = build_signing_payload(
        terminal_id=cfg["terminal_id"],
        session_uuid_v4=sid,
        timestamp_ms=timestamp_ms,
        amount_kobo=amount_kobo,
        masked_account_suffix=msk,
    )
    envelope = packet_signing.build_signed_envelope(
        payload, cfg["signing_key"], cfg["signature_alg"]
    )
    return to_compact_wire(envelope)
