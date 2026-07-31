"""Load CheckoutNow credentials from Cheko Settings (cheko-config.json)."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any


def config_path() -> Path:
    appdata = os.environ.get("APPDATA") or os.path.expanduser("~")
    return Path(appdata) / "Cheko POS" / "cheko-config.json"


def load_payment_store() -> dict[str, Any]:
    path = config_path()
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        payment = data.get("payment")
        return payment if isinstance(payment, dict) else {}
    except Exception:
        return {}


def resolve_credential(
    *,
    store: dict[str, Any],
    env_key: str,
    store_key: str,
    default: str = "",
) -> tuple[str, str]:
    force_env = os.environ.get("CHEKO_FORCE_ENV") == "1"
    env_val = os.environ.get(env_key, "").strip()
    store_val = store.get(store_key)
    store_str = str(store_val).strip() if store_val is not None else ""

    if force_env and env_val:
        return env_val, "env"
    if store_str:
        return store_str, "cheko-config"
    if env_val:
        return env_val, "env"
    return default, "default"


def build_broadcast_config() -> dict[str, str]:
    store = load_payment_store()
    terminal_id, _ = resolve_credential(
        store=store,
        env_key="CHEKO_TERMINAL_ID",
        store_key="terminalId",
        default="POS-LAG-001",
    )
    signing_key, key_src = resolve_credential(
        store=store,
        env_key="CHEKO_SIGNING_KEY",
        store_key="signingKey",
        default="",
    )
    signature_alg, sig_src = resolve_credential(
        store=store,
        env_key="CHEKO_SIGNATURE_ALG",
        store_key="signatureAlg",
        default="ed25519",
    )
    connectivity, conn_src = resolve_credential(
        store=store,
        env_key="CHEKO_BROADCAST_CONNECTIVITY",
        store_key="broadcastConnectivity",
        default="online",
    )
    if connectivity not in ("online", "offline"):
        connectivity = "online"

    settlement_account, acct_src = resolve_credential(
        store=store,
        env_key="CHEKO_SETTLEMENT_ACCOUNT",
        store_key="settlementAccountNumber",
        default="",
    )
    settlement_bank_code, code_src = resolve_credential(
        store=store,
        env_key="CHEKO_SETTLEMENT_BANK_CODE",
        store_key="settlementBankCode",
        default="",
    )
    settlement_bank_name, bank_src = resolve_credential(
        store=store,
        env_key="CHEKO_MERCHANT_BANK",
        store_key="merchantBankName",
        default="",
    )
    settlement_account_name, name_src = resolve_credential(
        store=store,
        env_key="CHEKO_SETTLEMENT_ACCOUNT_NAME",
        store_key="settlementAccountName",
        default="",
    )
    bank_api_url, _ = resolve_credential(
        store=store,
        env_key="CHEKO_BANK_API_URL",
        store_key="bankApiUrl",
        default="http://127.0.0.1:8765/mock-bank/verify",
    )
    api_key, api_src = resolve_credential(
        store=store,
        env_key="CHEKO_TERMINAL_API_KEY",
        store_key="apiKey",
        default="",
    )
    checkout_broadcast_api, cba_src = resolve_credential(
        store=store,
        env_key="CHEKO_CHECKOUT_BROADCAST_API",
        store_key="checkoutBroadcastApi",
        default="https://check-outpay.com/api/v1/broadcast",
    )
    masked_suffix, _ = resolve_credential(
        store=store,
        env_key="CHEKO_MASKED_SUFFIX",
        store_key="maskedAccountSuffix",
        default="***0000",
    )

    if not signing_key and not terminal_id.upper().startswith("CP-"):
        signing_key = "demo-signing-key-min-16-chars"

    using_sdk_defaults = (
        sig_src == "default"
        or signature_alg.upper() == "HMAC-SHA256"
        or (not signing_key and terminal_id.upper().startswith("CP-"))
    )

    offline_incomplete = connectivity == "offline" and (
        not settlement_account or not settlement_bank_code
    )

    return {
        "terminal_id": terminal_id,
        "signing_key": signing_key,
        "signature_alg": signature_alg,
        "connectivity": connectivity,
        "settlement_account": settlement_account,
        "settlement_bank_code": settlement_bank_code,
        "settlement_bank_name": settlement_bank_name,
        "settlement_account_name": settlement_account_name,
        "bank_api_url": bank_api_url,
        "api_key": api_key,
        "checkout_broadcast_api": checkout_broadcast_api,
        "masked_suffix": masked_suffix,
        "config_path": str(config_path()),
        "credential_source": f"alg={sig_src} connectivity={conn_src}",
        "using_sdk_defaults": str(using_sdk_defaults).lower(),
        "offline_incomplete": str(offline_incomplete).lower(),
    }
