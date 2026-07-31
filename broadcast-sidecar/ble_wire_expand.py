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
    }
)


def normalize_ble_read_for_verify(gatt_json: Any) -> dict[str, Any]:
    if not isinstance(gatt_json, dict):
        raise ValueError("Invalid BLE packet")

    payload = gatt_json.get("payload")
    signature = gatt_json.get("signature")
    if isinstance(payload, dict) and isinstance(signature, str) and signature:
        return {
            "payload": payload,
            "signature_alg": gatt_json.get("signature_alg") or gatt_json.get("signatureAlg") or "ed25519",
            "signature": signature,
        }

    wire_payload = gatt_json.get("p")
    wire_sig = gatt_json.get("sig")
    if isinstance(wire_payload, dict) and isinstance(wire_sig, str) and wire_sig:
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
