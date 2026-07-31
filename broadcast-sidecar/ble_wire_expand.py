"""Expand BLE GATT JSON or wire POST body into signed verify envelope."""

from __future__ import annotations

from typing import Any

_PAYLOAD_ROOT_KEYS = frozenset(
    {
        "protocol_version",
        "connectivity",
        "timestamp_ms",
        "session_uuid_v4",
        "terminal_id",
        "transaction_details",
        "account_info_public_display",
        "offline_settlement",
        "broadcast_kind",
        "wallet_receive",
        "session_kind",
    }
)


def _is_compact_wire_payload(payload: dict[str, Any]) -> bool:
    if payload.get("session_uuid_v4") or payload.get("terminal_id"):
        return False
    return "v" in payload or "sid" in payload or "tid" in payload


def expand_compact_wire_payload(wire: dict[str, Any]) -> dict[str, Any]:
    amount_kobo = 0
    if wire.get("amt") is not None and wire.get("amt") != "":
        amount_kobo = int(wire["amt"])

    expanded: dict[str, Any] = {
        "protocol_version": float(wire.get("v", 2.1)),
        "timestamp_ms": int(wire.get("ts", 0)),
        "session_uuid_v4": str(wire.get("sid", "")),
        "terminal_id": str(wire.get("tid", "")),
        "transaction_details": {"total_amount_ngn": amount_kobo},
    }
    msk = wire.get("msk")
    if msk:
        expanded["account_info_public_display"] = {"masked_account_suffix": str(msk)}
    kind = wire.get("k")
    if kind:
        expanded["session_kind"] = str(kind)
    return expanded


def normalize_ble_read_for_verify(gatt_json: Any) -> dict[str, Any]:
    if not isinstance(gatt_json, dict):
        raise ValueError("Invalid BLE packet")

    payload = gatt_json.get("payload")
    signature = gatt_json.get("signature")
    if isinstance(payload, dict) and isinstance(signature, str) and signature:
        if _is_compact_wire_payload(payload):
            payload = expand_compact_wire_payload(payload)
        return {
            "payload": payload,
            "signature_alg": gatt_json.get("signature_alg") or gatt_json.get("signatureAlg") or "ed25519",
            "signature": signature,
        }

    wire_payload = gatt_json.get("p")
    wire_sig = gatt_json.get("sig")
    if isinstance(wire_payload, dict) and isinstance(wire_sig, str) and wire_sig:
        if _is_compact_wire_payload(wire_payload):
            wire_payload = expand_compact_wire_payload(wire_payload)
        return {
            "payload": wire_payload,
            "signature_alg": gatt_json.get("alg") or gatt_json.get("signature_alg") or "ed25519",
            "signature": wire_sig,
        }

    if (
        isinstance(signature, str)
        and signature
        and isinstance(gatt_json.get("session_uuid_v4"), str)
        and isinstance(gatt_json.get("terminal_id"), str)
    ):
        flat_payload = {
            key: value
            for key, value in gatt_json.items()
            if key in _PAYLOAD_ROOT_KEYS
        }
        return {
            "payload": flat_payload,
            "signature_alg": gatt_json.get("signature_alg") or gatt_json.get("signatureAlg") or "ed25519",
            "signature": signature,
        }

    raise ValueError("Unrecognized BLE packet shape")
