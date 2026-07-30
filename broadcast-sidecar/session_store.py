"""Open broadcast session lifecycle (open → paid | cancelled)."""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Literal

SessionStatus = Literal["open", "paid", "cancelled"]


@dataclass
class BroadcastSession:
    session_uuid: str
    terminal_id: str
    mode: str
    amount_ngn: int
    item_count: int
    status: SessionStatus = "open"
    created_at_ms: int = field(default_factory=lambda: int(time.time() * 1000))
    payload_timestamp_ms: int = field(default_factory=lambda: int(time.time() * 1000))


_store: dict[str, BroadcastSession] = {}
_active: BroadcastSession | None = None


def terminal_picker_label(terminal_id: str) -> str:
    """TERM-01 … TERM-20 → 01–20 for multi-POS picker display."""
    upper = terminal_id.upper()
    if upper.startswith("TERM-"):
        suffix = terminal_id.split("-", 1)[-1]
        if suffix.isdigit():
            return suffix.zfill(2)
    digits = "".join(ch for ch in terminal_id if ch.isdigit())
    if digits:
        return digits[-2:].zfill(2)
    return terminal_id[:8]


def get_active() -> BroadcastSession | None:
    if _active and _active.status == "open":
        return _active
    return None


def get(session_uuid: str) -> BroadcastSession | None:
    return _store.get(session_uuid)


def open_or_reuse(
    *,
    terminal_id: str,
    mode: str,
    amount_ngn: int,
    item_count: int,
) -> BroadcastSession:
    global _active
    active = get_active()
    if (
        active
        and active.terminal_id == terminal_id
        and active.mode == mode
        and active.amount_ngn == amount_ngn
        and active.item_count == item_count
    ):
        active.payload_timestamp_ms = int(time.time() * 1000)
        return active

    if active:
        active.status = "cancelled"

    session = BroadcastSession(
        session_uuid=str(uuid.uuid4()),
        terminal_id=terminal_id,
        mode=mode,
        amount_ngn=amount_ngn,
        item_count=item_count,
        status="open",
    )
    _store[session.session_uuid] = session
    _active = session
    _prune_open_sessions()
    return session


def park_session(session_uuid: str) -> BroadcastSession | None:
    """Hand off POS UI — session stays open for verify; new checkout gets a new BLE session."""
    global _active
    session = _store.get(session_uuid)
    if session and _active and _active.session_uuid == session_uuid:
        _active = None
    return session


def list_open_sessions() -> list[BroadcastSession]:
    return [s for s in _store.values() if s.status == "open"]


def reuse_if_open(session_uuid: str) -> BroadcastSession | None:
    """Keep same session_uuid_v4 on BLE timestamp refresh (90s tick)."""
    global _active
    session = _store.get(session_uuid)
    if not session or session.status != "open":
        return None
    session.payload_timestamp_ms = int(time.time() * 1000)
    _active = session
    return session


def _prune_open_sessions(max_open: int = 20) -> None:
    open_sessions = sorted(list_open_sessions(), key=lambda s: s.created_at_ms)
    while len(open_sessions) > max_open:
        oldest = open_sessions.pop(0)
        oldest.status = "cancelled"


def mark_paid(session_uuid: str) -> BroadcastSession | None:
    session = _store.get(session_uuid)
    if not session:
        return None
    session.status = "paid"
    global _active
    if _active and _active.session_uuid == session_uuid:
        _active = None
    return session


def mark_cancelled(session_uuid: str | None = None) -> BroadcastSession | None:
    global _active
    target = session_uuid or (_active.session_uuid if _active else None)
    if not target:
        _active = None
        return None
    session = _store.get(target)
    if session and session.status == "open":
        session.status = "cancelled"
    if _active and _active.session_uuid == target:
        _active = None
    return session


def status_for_verify(session_uuid: str) -> SessionStatus | None:
    session = _store.get(session_uuid)
    return session.status if session else None
