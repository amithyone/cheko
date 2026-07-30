"""Sign and verify checkout broadcast packets (HMAC-SHA256 + ed25519)."""

from __future__ import annotations

import base64
import json
from typing import Any, Literal

SignatureAlg = Literal["HMAC-SHA256", "ed25519"]


def normalize_signature_alg(value: str | None) -> SignatureAlg:
    if not value:
        return "ed25519"
    normalized = value.strip().lower()
    if normalized in ("hmac-sha256", "hmac_sha256"):
        return "HMAC-SHA256"
    if normalized == "ed25519":
        return "ed25519"
    return "ed25519"


def canonical_payload_bytes(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _decode_signing_key_material(signing_key: str) -> bytes:
    raw = signing_key.strip()
    try:
        padded = raw + "=" * (-len(raw) % 4)
        return base64.b64decode(padded)
    except Exception:
        return raw.encode("utf-8")


def _load_ed25519_private_key(signing_key: str):
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
    from cryptography.hazmat.primitives.serialization import (
        Encoding,
        PrivateFormat,
        NoEncryption,
        load_der_private_key,
        load_pem_private_key,
    )

    material = _decode_signing_key_material(signing_key)

    if len(material) == 32:
        return Ed25519PrivateKey.from_private_bytes(material)
    if len(material) == 64:
        return Ed25519PrivateKey.from_private_bytes(material[:32])

    if material.startswith(b"-----BEGIN"):
        return load_pem_private_key(material, password=None)

    try:
        return load_der_private_key(material, password=None)
    except Exception as exc:
        raise ValueError(
            "ed25519 signing key must be base64 (32-byte seed), PEM, or PKCS#8 DER"
        ) from exc


def sign_ed25519(payload: dict[str, Any], signing_key: str) -> str:
    private_key = _load_ed25519_private_key(signing_key)
    message = canonical_payload_bytes(payload)
    signature = private_key.sign(message)
    return base64.b64encode(signature).decode("ascii")


def verify_ed25519(payload: dict[str, Any], signing_key: str, signature_b64: str) -> bool:
    from cryptography.exceptions import InvalidSignature
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

    private_key = _load_ed25519_private_key(signing_key)
    public_key = private_key.public_key()
    if not isinstance(public_key, Ed25519PublicKey):
        return False
    try:
        public_key.verify(base64.b64decode(signature_b64), canonical_payload_bytes(payload))
        return True
    except (InvalidSignature, ValueError):
        return False


def build_signed_envelope(
    payload: dict[str, Any], signing_key: str, signature_alg: str
) -> dict[str, Any]:
    alg = normalize_signature_alg(signature_alg)
    if alg == "ed25519":
        signature = sign_ed25519(payload, signing_key)
    else:
        from checkout_broadcast.signing import sign_payload

        signature = sign_payload(payload, signing_key)
    return {"payload": payload, "signature_alg": alg, "signature": signature}


def verify_signed_envelope(
    envelope: dict[str, Any], signing_key: str
) -> tuple[bool, str | None]:
    payload = envelope.get("payload")
    if not isinstance(payload, dict):
        return False, "Missing payload object"
    if payload.get("timestamp_ms") is None:
        return False, "Missing timestamp_ms in payload"

    signature = envelope.get("signature") or ""
    alg = normalize_signature_alg(envelope.get("signature_alg"))

    if alg == "ed25519":
        ok = verify_ed25519(payload, signing_key, signature)
    else:
        from checkout_broadcast.signing import verify_signature

        ok = verify_signature(payload, signing_key, signature)

    if not ok:
        return False, "Invalid signature"
    return True, None
