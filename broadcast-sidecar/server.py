"""
Cheko Checkout Broadcast sidecar — HTTP bridge for BLE bank-pay.
"""

from __future__ import annotations

import os
import uuid
import logging
from typing import Any

from flask import Flask, jsonify, request

import session_store
import amount_encoding
import cheko_config

logging.basicConfig(level=logging.INFO, format="[broadcast-sidecar] %(message)s")
log = logging.getLogger(__name__)

app = Flask(__name__)

_addon: Any = None
_active_session: str | None = None
_transport_mode = os.environ.get("CHEKO_BROADCAST_TRANSPORT", "simulated")
_ble_ready = False


def _env(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


def _config() -> dict[str, str]:
    return cheko_config.build_broadcast_config()


def _ble_available() -> bool:
    try:
        from winrt.windows.devices.bluetooth.genericattributeprofile import (  # noqa: F401
            GattServiceProvider,
        )

        return True
    except ImportError:
        return False


def _bless_available() -> bool:
    """Legacy alias — BLE uses WinRT directly, not bless."""
    return _ble_available()


def _init_addon() -> Any:
    global _addon
    if _addon is not None:
        return _addon
    if _transport_mode == "ble":
        return None

    try:
        from checkout_broadcast import CheckoutBroadcastAddon, CheckoutBroadcastConfig

        cfg = _config()
        _addon = CheckoutBroadcastAddon(
            CheckoutBroadcastConfig(
                role="send",
                terminal_id=cfg["terminal_id"],
                signing_key=cfg["signing_key"],
                bank_api_url=cfg["bank_api_url"],
                bank_name=cfg["bank_name"],
                masked_account_suffix=cfg["masked_suffix"],
                transport="simulated",
                on_send_complete=lambda sid: log.info("Simulated broadcast: %s", sid),
                on_error=lambda err: log.error("Broadcast error: %s", err),
            )
        )
        log.info("checkout_broadcast SDK loaded (simulated)")
    except ImportError:
        log.warning("checkout_broadcast SDK not on PYTHONPATH")
        _addon = None

    return _addon


def _broadcast_ble(
    mode: str,
    amount_checkout: float,
    item_count: int,
    *,
    force_session_id: str | None = None,
) -> dict[str, Any]:
    global _active_session, _ble_ready
    import ble_peripheral
    import ble_broadcast

    cfg = _config()
    packet_amount = amount_encoding.to_packet_amount(
        1 if mode == "public" else amount_checkout,
        cfg["signature_alg"],
    )

    session = None
    if force_session_id:
        session = session_store.reuse_if_open(force_session_id)

    if session is None:
        session = session_store.open_or_reuse(
            terminal_id=cfg["terminal_id"],
            mode=mode,
            amount_ngn=packet_amount,
            item_count=item_count,
        )
    envelope = ble_broadcast.build_signed_packet(
        terminal_id=cfg["terminal_id"],
        signing_key=cfg["signing_key"],
        signature_alg=cfg["signature_alg"],
        amount_ngn=packet_amount,
        item_count=item_count,
        session_uuid_v4=session.session_uuid,
        connectivity=cfg.get("connectivity", "online"),
        settlement={
            "recipient_account": cfg.get("settlement_account", ""),
            "recipient_bank_code": cfg.get("settlement_bank_code", ""),
            "bank_name": cfg.get("settlement_bank_name", ""),
            "recipient_account_name": cfg.get("settlement_account_name", ""),
        }
        if cfg.get("connectivity") == "offline"
        else None,
    )
    ble_peripheral.publish_envelope(envelope)

    session_id = envelope["payload"]["session_uuid_v4"]
    session.payload_timestamp_ms = envelope["payload"]["timestamp_ms"]
    _active_session = session_id
    _ble_ready = True
    log.info(
        "BLE LIVE broadcast checkout_mode=%s connectivity=%s session=%s terminal=%s amount_ngn=%s ts=%s signature_alg=%s",
        mode,
        cfg.get("connectivity", "online"),
        session_id[:8],
        cfg["terminal_id"],
        envelope["payload"]["transaction_details"]["total_amount_ngn"],
        envelope["payload"]["timestamp_ms"],
        envelope.get("signature_alg", cfg["signature_alg"]),
    )
    return {
        "ok": True,
        "session_id": session_id,
        "session_status": session.status,
        "terminal_label": session_store.terminal_picker_label(cfg["terminal_id"]),
        "transport": "ble",
        "mode": mode,
    }


@app.get("/health")
def health():
    cfg = _config()
    sdk = _init_addon() is not None or _bless_available()
    transport = "ble" if _transport_mode == "ble" and _bless_available() else (
        "simulated" if sdk else "unavailable"
    )
    adv_started = False
    if _transport_mode == "ble":
        try:
            import ble_peripheral

            adv_started = ble_peripheral.is_advertising()
        except Exception:
            pass
    return jsonify(
        {
            "ok": True,
            "sdk_installed": sdk,
            "transport": transport,
            "ble_live": transport == "ble" and adv_started,
            "advertising_started": adv_started,
            "active_session": _active_session,
            "session_status": (
                session_store.get(_active_session).status
                if _active_session and session_store.get(_active_session)
                else None
            ),
            "terminal_id": cfg["terminal_id"],
            "terminal_label": session_store.terminal_picker_label(cfg["terminal_id"]),
            "signature_alg": cfg["signature_alg"],
            "connectivity": cfg.get("connectivity", "online"),
            "using_sdk_defaults": cfg.get("using_sdk_defaults") == "true",
            "offline_incomplete": cfg.get("offline_incomplete") == "true",
            "credential_source": cfg.get("credential_source"),
            "config_path": cfg.get("config_path"),
        }
    )


@app.post("/broadcast")
def broadcast():
    global _active_session
    body = request.get_json(silent=True) or {}
    mode = body.get("mode", "checkout")
    cfg = _config()
    amount_raw = float(body.get("amount_ngn", 0))
    item_count = int(body.get("item_count", 0))

    if mode == "public":
        item_count = 1
    elif amount_raw <= 0:
        return jsonify({"ok": False, "error": "amount_ngn must be positive for checkout mode"}), 400

    if cfg.get("offline_incomplete") == "true":
        return jsonify(
            {
                "ok": False,
                "error": "Offline mode: save settlement account + bank code in Settings → CheckoutNow",
            }
        ), 400
    if cfg.get("using_sdk_defaults") == "true":
        return jsonify(
            {
                "ok": False,
                "error": (
                    "Pay at Shop credentials incomplete — Settings → Payment Provider → "
                    "CheckoutNow: terminal ID + Ed25519 signing key (bank/account come from server)"
                ),
                "credential_source": cfg.get("credential_source"),
                "using_sdk_defaults": True,
            }
        ), 400
    if not cfg.get("signing_key"):
        return jsonify(
            {
                "ok": False,
                "error": "Missing Ed25519 signing key — Settings → CheckoutNow → Signing key from Pay at shop dashboard",
            }
        ), 400
    if cfg.get("signing_key") == "demo-signing-key-min-16-chars":
        return jsonify(
            {
                "ok": False,
                "error": "Demo signing key cannot be used for CheckoutPay terminals — paste Ed25519 key from dashboard",
            }
        ), 400
    if cfg["signature_alg"].strip().upper() == "HMAC-SHA256":
        return jsonify(
            {
                "ok": False,
                "error": "CheckoutNow requires signature_alg ed25519 — not HMAC-SHA256 (SDK default)",
            }
        ), 400

    checkout_amount = 1.0 if mode == "public" else amount_raw
    packet_amount = amount_encoding.to_packet_amount(checkout_amount, cfg["signature_alg"])
    force_session_id = body.get("session_id") or body.get("session_uuid_v4")

    if _transport_mode == "ble":
        if not _ble_available():
            return jsonify({
                "ok": False,
                "error": "WinRT BLE not available — pip install bleak>=3.0 (needs Python 3.12 + Bluetooth ON)",
            }), 500
        try:
            return jsonify(
                _broadcast_ble(
                    mode,
                    checkout_amount,
                    max(item_count, 1),
                    force_session_id=str(force_session_id) if force_session_id else None,
                )
            )
        except Exception as exc:
            log.exception("BLE broadcast failed")
            return jsonify({"ok": False, "error": str(exc)}), 500

    addon = _init_addon()
    if addon is not None:
        try:
            from checkout_broadcast import CheckoutData

            addon.start()
            packet = addon.send_checkout(
                CheckoutData(amount_ngn=packet_amount, item_count=max(item_count, 1))
            )
            session_id = packet.payload.session_uuid_v4
            _active_session = session_id
            return jsonify({
                "ok": True,
                "session_id": session_id,
                "transport": "simulated",
                "mode": mode,
            })
        except Exception as exc:
            log.exception("Simulated broadcast failed")
            return jsonify({"ok": False, "error": str(exc)}), 500

    session_id = str(uuid.uuid4())
    _active_session = session_id
    return jsonify({"ok": True, "session_id": session_id, "transport": "simulated", "mode": mode})


@app.get("/broadcast/open-sessions")
def open_sessions():
    """Dev helper — list open sessions (multi-POS picker, max 20)."""
    sessions = session_store.list_open_sessions()
    return jsonify(
        {
            "ok": True,
            "count": len(sessions),
            "sessions": [
                {
                    "session_uuid": s.session_uuid,
                    "terminal_id": s.terminal_id,
                    "terminal_label": session_store.terminal_picker_label(s.terminal_id),
                    "amount_packet": s.amount_ngn,
                    "item_count": s.item_count,
                    "session_status": s.status,
                }
                for s in sessions
            ],
        }
    )


@app.post("/stop")
def stop():
    global _active_session
    if _transport_mode != "ble":
        addon = _init_addon()
        if addon is not None:
            try:
                addon.stop()
            except Exception as exc:
                log.warning("addon.stop() error: %s", exc)
    prev = _active_session
    session_store.mark_cancelled(prev)
    _active_session = None
    return jsonify({"ok": True, "stopped_session": prev, "session_status": "cancelled"})


@app.post("/session/park")
def session_park():
    """Hand off payment — keep session open for wallet verify; release active slot for new BLE session."""
    body = request.get_json(silent=True) or {}
    session_id = body.get("session_id") or _active_session
    if not session_id:
        return jsonify({"ok": False, "error": "No session to park"}), 400
    session = session_store.park_session(session_id)
    if not session:
        return jsonify({"ok": False, "error": "Unknown session"}), 404
    global _active_session
    if _active_session == session_id:
        _active_session = None
    return jsonify(
        {
            "ok": True,
            "session_id": session_id,
            "session_status": session.status,
        }
    )


@app.post("/session/paid")
def session_paid():
    """Mark open session paid (POS calls after transfer succeeds)."""
    body = request.get_json(silent=True) or {}
    session_id = body.get("session_id") or _active_session
    if not session_id:
        return jsonify({"ok": False, "error": "No active session"}), 400
    session = session_store.mark_paid(session_id)
    if not session:
        return jsonify({"ok": False, "error": "Unknown session"}), 404
    global _active_session
    if _active_session == session_id:
        _active_session = None
    return jsonify({"ok": True, "session_id": session_id, "session_status": "paid"})


@app.post("/verify-broadcast")
def verify_broadcast():
    """Dev bank API — Android Pay at Shop POSTs here after reading BLE packet."""
    body = request.get_json(silent=True) or {}
    cfg = _config()
    try:
        import packet_signing
        import ble_wire_expand

        body = ble_wire_expand.normalize_ble_read_for_verify(body)

        payload = body.get("payload")
        if not isinstance(payload, dict):
            return jsonify({"valid": False, "error": "Missing payload object"}), 200

        terminal_id = payload.get("terminal_id", "")
        session = payload.get("session_uuid_v4", "")
        payload_ts = payload.get("timestamp_ms")

        log.info(
            "verify-broadcast terminal=%s session=%s alg=%s payload_timestamp_ms=%s",
            terminal_id,
            session[:8] if session else "?",
            body.get("signature_alg"),
            payload_ts,
        )

        if payload_ts is None:
            return jsonify({"valid": False, "error": "Missing timestamp_ms in payload"}), 200

        known_status = session_store.status_for_verify(session)
        if known_status == "paid":
            return jsonify(
                {
                    "valid": False,
                    "error": "Session already paid",
                    "session_status": "paid",
                }
            ), 200
        if known_status == "cancelled":
            return jsonify(
                {
                    "valid": False,
                    "error": "Session cancelled",
                    "session_status": "cancelled",
                }
            ), 200

        # Open or unknown session: do not reject verify solely on packet age.
        session_status = known_status or "open"

        if terminal_id != cfg["terminal_id"]:
            return jsonify(
                {
                    "valid": False,
                    "error": f"Unknown terminal_id: {terminal_id}",
                    "session_status": session_status,
                }
            ), 200

        ok, sig_err = packet_signing.verify_signed_envelope(body, cfg["signing_key"])
        if not ok:
            return jsonify(
                {
                    "valid": False,
                    "error": sig_err or "Invalid signature",
                    "session_status": session_status,
                }
            ), 200

        tx = payload["transaction_details"]
        acct = payload["account_info_public_display"]
        packet_amount = int(tx.get("total_amount_ngn", 0))
        sig_alg = body.get("signature_alg") or cfg["signature_alg"]
        display_amount = amount_encoding.from_packet_amount(packet_amount, sig_alg)
        terminal_label = session_store.terminal_picker_label(terminal_id)

        return jsonify(
            {
                "valid": True,
                "merchant_name": "Cheko Retail Store",
                "amount_ngn": display_amount,
                "masked_account_suffix": acct.get("masked_account_suffix", cfg["masked_suffix"]),
                "session_uuid": session,
                "terminal_id": terminal_id,
                "terminal_label": terminal_label,
                "session_status": session_status,
                "recipient_account": _env("CHEKO_RECIPIENT_ACCOUNT", "0123456789"),
                "recipient_bank_code": _env("CHEKO_RECIPIENT_BANK_CODE", "50211"),
            }
        )
    except Exception as exc:
        log.exception("verify-broadcast failed")
        return jsonify({"valid": False, "error": str(exc)}), 200


@app.post("/mock-bank/verify")
def mock_bank_verify():
    body = request.get_json(silent=True) or {}
    cfg = _config()
    payload = body.get("payload", {})
    tx = payload.get("transaction_details", {})
    acct = payload.get("account_info_public_display", {})
    return jsonify(
        {
            "valid": True,
            "merchant_name": "Cheko Retail Store",
            "amount_ngn": tx.get("total_amount_ngn", 0),
            "masked_account_suffix": acct.get("masked_account_suffix", cfg["masked_suffix"]),
            "session_uuid": payload.get("session_uuid_v4"),
            "terminal_id": payload.get("terminal_id", cfg["terminal_id"]),
        }
    )


@app.post("/ble/restart")
def ble_restart():
    """Recover BLE after advertisement Aborted (status=3)."""
    if _transport_mode != "ble":
        return jsonify({"ok": False, "error": "transport is not ble"}), 400
    try:
        import ble_peripheral

        ble_peripheral.restart()
        return jsonify({"ok": True, "advertising": ble_peripheral.is_advertising()})
    except Exception as exc:
        log.exception("BLE restart failed")
        return jsonify({"ok": False, "error": str(exc)}), 500


def _warm_ble_radio() -> None:
    if _transport_mode != "ble" or not _ble_available():
        return

    def _run() -> None:
        try:
            import ble_peripheral

            # GATT only — no signed packet until POST /broadcast (avoids consuming a session at startup).
            ble_peripheral.start()
            log.info(
                "BLE radio pre-warmed (advertising=%s) — payload sent on each /broadcast",
                ble_peripheral.is_advertising(),
            )
        except Exception as exc:
            log.warning("BLE pre-warm failed: %s", exc)

    import threading

    threading.Thread(target=_run, name="cheko-ble-warm", daemon=True).start()


def main() -> None:
    host = _env("CHEKO_BROADCAST_HOST", "0.0.0.0")
    port = int(_env("CHEKO_BROADCAST_PORT", "8765"))
    cfg = _config()
    log.info("Starting on http://%s:%s (transport=%s)", host, port, _transport_mode)
    log.info(
        "Terminal=%s signature_alg=%s",
        cfg["terminal_id"],
        cfg["signature_alg"],
    )
    if host == "0.0.0.0":
        log.info("Phone verify URL: http://<this-pc-lan-ip>:%s/verify-broadcast", port)
    _warm_ble_radio()
    app.run(host=host, port=port, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
