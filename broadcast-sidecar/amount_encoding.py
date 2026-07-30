"""Map POS decimal NGN totals to checkout_broadcast packet integers."""

from __future__ import annotations

import packet_signing


def normalize_checkout_amount(amount: float | int) -> float:
    """Two-decimal NGN (₦9003.76)."""
    return round(float(amount), 2)


def to_packet_amount(amount: float | int, signature_alg: str) -> int:
    """
    CheckoutNow / ed25519: integer kobo (9003.76 → 900376).
    Open HMAC dev protocol: integer whole naira (2500.00 → 2500).
    """
    normalized = normalize_checkout_amount(amount)
    if packet_signing.normalize_signature_alg(signature_alg) == "ed25519":
        kobo = int(round(normalized * 100))
        return max(1, kobo)
    whole = int(round(normalized))
    return max(1, whole)


def packet_amount_label(amount: float | int, signature_alg: str) -> str:
    normalized = normalize_checkout_amount(amount)
    packet = to_packet_amount(amount, signature_alg)
    if packet_signing.normalize_signature_alg(signature_alg) == "ed25519":
        return f"checkout={normalized} packet_kobo={packet}"
    return f"checkout={normalized} packet_ngn={packet}"


def from_packet_amount(packet_amount: int, signature_alg: str) -> float:
    """Verify API / mobile display — ed25519 packets store kobo."""
    if packet_signing.normalize_signature_alg(signature_alg) == "ed25519":
        return normalize_checkout_amount(packet_amount / 100)
    return normalize_checkout_amount(packet_amount)

