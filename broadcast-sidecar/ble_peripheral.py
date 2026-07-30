"""Real BLE GATT peripheral for checkout_broadcast using WinRT (Windows)."""

from __future__ import annotations

import asyncio

import json

import logging

import os

import threading

import time

import uuid as uuid_lib

from typing import Any

from checkout_broadcast.protocol import SignedPacket, build_payload

from checkout_broadcast.signing import sign_payload

from checkout_broadcast.transport.ble_constants import PACKET_CHAR_UUID, SERVICE_UUID

log = logging.getLogger(__name__)

_latest_packet = b""

_service_provider: Any = None

_characteristic: Any = None

_loop: asyncio.AbstractEventLoop | None = None

_thread: threading.Thread | None = None

_running = False

_advertising_ready = threading.Event()

_start_lock = threading.Lock()

_ble_instance_lock: Any = None

MAX_ADVERTISE_ATTEMPTS = 4

ADVERTISE_RETRY_DELAY_S = 2.0

def _lock_path() -> str:

    return os.path.join(os.environ.get("TEMP", "."), "cheko-ble-gatt.lock")

def _pid_alive(pid: int) -> bool:

    if pid <= 0:

        return False

    if os.name == "nt":

        import ctypes

        kernel32 = ctypes.windll.kernel32

        handle = kernel32.OpenProcess(0x100000, False, pid)

        if not handle:

            return False

        kernel32.CloseHandle(handle)

        return True

    try:

        os.kill(pid, 0)

        return True

    except OSError:

        return False

def _acquire_ble_instance_lock() -> None:

    """Only one process on this PC may own the WinRT GATT peripheral."""

    global _ble_instance_lock

    lock_file = _lock_path()

    my_pid = os.getpid()

    if os.path.exists(lock_file):

        try:

            other = int(open(lock_file, encoding="utf-8").read().strip())

        except (OSError, ValueError):

            other = 0

        if other and other != my_pid and _pid_alive(other):

            raise RuntimeError(

                f"Another Cheko BLE sidecar is already running (pid={other}). "

                "Stop duplicate sidecars — run only one: Electron OR npm run sidecar:broadcast."

            )

        try:

            os.remove(lock_file)

        except OSError:

            pass

    if os.name == "nt":

        import msvcrt

        handle = open(lock_file, "w", encoding="utf-8")

        try:

            msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)

        except OSError as exc:

            handle.close()

            raise RuntimeError(

                "Cheko BLE lock busy — another sidecar holds the Bluetooth peripheral. "

                "Close other Cheko/Electron windows and retry."

            ) from exc

        handle.write(str(my_pid))

        handle.flush()

        _ble_instance_lock = handle

    else:

        with open(lock_file, "w", encoding="utf-8") as handle:

            handle.write(str(my_pid))

def _release_ble_instance_lock() -> None:

    global _ble_instance_lock

    if _ble_instance_lock is not None:

        try:

            if os.name == "nt":

                import msvcrt

                msvcrt.locking(_ble_instance_lock.fileno(), msvcrt.LK_UNLCK, 1)

            _ble_instance_lock.close()

        except OSError:

            pass

        _ble_instance_lock = None

    try:

        os.remove(_lock_path())

    except OSError:

        pass

def _ensure_loop() -> asyncio.AbstractEventLoop:

    global _loop, _thread

    if _loop and _thread and _thread.is_alive() and _loop.is_running():

        return _loop

    _loop = None

    _thread = None

    ready = threading.Event()

    def _run() -> None:

        global _loop

        loop = asyncio.new_event_loop()

        asyncio.set_event_loop(loop)

        _loop = loop

        ready.set()

        loop.run_forever()

        loop.close()

    _thread = threading.Thread(target=_run, name="cheko-winrt-ble", daemon=True)

    _thread.start()

    ready.wait(timeout=10)

    if not _loop:

        raise RuntimeError("Failed to start BLE event loop")

    return _loop

async def _check_bluetooth_ready() -> None:

    from winrt.windows.devices.bluetooth import BluetoothAdapter

    from winrt.windows.devices.radios import Radio, RadioKind, RadioState

    adapter = await BluetoothAdapter.get_default_async()

    if adapter is None:

        raise RuntimeError("No Bluetooth adapter found on this PC.")

    if not adapter.is_low_energy_supported:

        raise RuntimeError("Bluetooth LE is not supported on this adapter.")

    if not adapter.is_peripheral_role_supported:

        raise RuntimeError(

            "This PC cannot act as a BLE peripheral. Use a Windows POS device with peripheral support."

        )

    radios = await Radio.get_radios_async()

    bt_radio = next((r for r in radios if r.kind == RadioKind.BLUETOOTH), None)

    if bt_radio is not None and bt_radio.state != RadioState.ON:

        raise RuntimeError(

            "Bluetooth radio is OFF. Turn on Bluetooth in Windows Settings (Quick Settings → Bluetooth)."

        )

async def _teardown_provider(provider: Any | None) -> None:

    if provider is None:

        return

    try:

        provider.stop_advertising()

    except Exception as exc:

        log.debug("stop_advertising during teardown: %s", exc)

    await asyncio.sleep(0.5)

async def _start_server_async() -> None:

    global _service_provider, _characteristic, _running

    if _running and _service_provider is not None and is_advertising():

        return

    await _check_bluetooth_ready()

    if _service_provider is not None:

        await _teardown_provider(_service_provider)

        _service_provider = None

        _characteristic = None

        _running = False

    from winrt.windows.devices.bluetooth.genericattributeprofile import (

        GattCharacteristicProperties,

        GattLocalCharacteristicParameters,

        GattProtectionLevel,

        GattReadRequestedEventArgs,

        GattServiceProvider,

        GattServiceProviderAdvertisingParameters,

        GattServiceProviderAdvertisementStatusChangedEventArgs,

    )

    from winrt.windows.foundation import Deferral

    from winrt.windows.storage.streams import DataWriter

    service_uuid = uuid_lib.UUID(SERVICE_UUID)

    char_uuid = uuid_lib.UUID(PACKET_CHAR_UUID)

    last_error = "unknown"

    provider: Any = None

    characteristic: Any = None

    for attempt in range(1, MAX_ADVERTISE_ATTEMPTS + 1):

        if provider is not None:

            await _teardown_provider(provider)

            provider = None

            characteristic = None

            await asyncio.sleep(ADVERTISE_RETRY_DELAY_S)

        _advertising_ready.clear()

        result = await GattServiceProvider.create_async(service_uuid)

        provider = result.service_provider

        if provider is None:

            last_error = "Failed to create GATT service provider"

            log.warning("BLE attempt %s/%s: %s", attempt, MAX_ADVERTISE_ATTEMPTS, last_error)

            continue

        local_service = provider.service

        if local_service is None:

            last_error = "GATT service provider returned no local service"

            log.warning("BLE attempt %s/%s: %s", attempt, MAX_ADVERTISE_ATTEMPTS, last_error)

            continue

        char_params = GattLocalCharacteristicParameters()

        char_params.characteristic_properties = GattCharacteristicProperties.READ

        char_params.read_protection_level = GattProtectionLevel.PLAIN

        char_params.write_protection_level = GattProtectionLevel.PLAIN

        char_result = await local_service.create_characteristic_async(char_uuid, char_params)

        characteristic = char_result.characteristic

        if characteristic is None:

            last_error = "Failed to create GATT packet characteristic"

            log.warning("BLE attempt %s/%s: %s", attempt, MAX_ADVERTISE_ATTEMPTS, last_error)

            continue

        def _on_ad_status(

            _prov: Any, args: GattServiceProviderAdvertisementStatusChangedEventArgs

        ) -> None:

            status = int(args.status)

            if status == 2:

                _advertising_ready.set()

                log.info("BLE advertisement Started (discoverable by Android scan)")

            elif status == 3:

                log.warning(

                    "BLE advertisement Aborted (attempt %s/%s) — often a stale GATT registration; retrying…",

                    attempt,

                    MAX_ADVERTISE_ATTEMPTS,

                )

        def _on_read(_sender: Any, args: GattReadRequestedEventArgs) -> None:

            deferral: Deferral | None = args.get_deferral()

            if deferral is None:

                return

            async def _respond() -> None:

                try:

                    request = await args.get_request_async()

                    writer = DataWriter()

                    if not _latest_packet:

                        writer.write_bytes(b"")

                    else:

                        writer.write_bytes(_latest_packet)

                    request.respond_with_value(writer.detach_buffer())

                finally:

                    deferral.complete()

            loop = _ensure_loop()

            asyncio.run_coroutine_threadsafe(_respond(), loop)

        provider.add_advertisement_status_changed(_on_ad_status)

        characteristic.add_read_requested(_on_read)

        adv = GattServiceProviderAdvertisingParameters()

        adv.is_discoverable = True

        adv.is_connectable = True

        try:

            adv.use_legacy_advertisement = True

        except AttributeError:

            pass

        provider.start_advertising_with_parameters(adv)

        if _advertising_ready.wait(timeout=12):

            _service_provider = provider

            _characteristic = characteristic

            _running = True

            log.info("BLE GATT server started (service %s)", SERVICE_UUID)

            return

        final = int(provider.advertisement_status)

        last_error = f"advertisement status={final}"

        log.warning(

            "BLE attempt %s/%s did not reach Started (%s)",

            attempt,

            MAX_ADVERTISE_ATTEMPTS,

            last_error,

        )

    if provider is not None:

        await _teardown_provider(provider)

    raise RuntimeError(

        f"BLE advertisement never reached Started ({last_error}). "

        "Fix: (1) Turn Bluetooth ON in Windows Settings. "

        "(2) Close duplicate Cheko/Electron windows — only one BLE sidecar allowed. "

        "(3) Toggle Bluetooth off/on, then restart the app."

    )

async def _update_packet_async(packet_bytes: bytes) -> None:

    global _latest_packet

    _latest_packet = packet_bytes

async def _stop_server_async() -> None:

    global _service_provider, _characteristic, _running

    if _service_provider is not None:

        await _teardown_provider(_service_provider)

    _service_provider = None

    _characteristic = None

    _running = False

def is_advertising() -> bool:

    if _service_provider is None:

        return False

    try:

        return int(_service_provider.advertisement_status) == 2

    except Exception:

        return _running

def start() -> None:

    with _start_lock:

        _acquire_ble_instance_lock()

        loop = _ensure_loop()

        future = asyncio.run_coroutine_threadsafe(_start_server_async(), loop)

        future.result(timeout=60)

def stop() -> None:

    """Stop advertising but keep the BLE thread alive for the next broadcast."""

    if not (_loop and _thread and _thread.is_alive() and _loop.is_running() and _running):

        return

    future = asyncio.run_coroutine_threadsafe(_stop_server_async(), _loop)

    try:

        future.result(timeout=15)

    except Exception as exc:

        log.warning("BLE stop error: %s", exc)

def restart() -> None:

    """Release and re-acquire GATT advertising (recovery after Aborted)."""

    stop()

    time.sleep(1.0)

    start()

def shutdown() -> None:

    """Tear down BLE thread (sidecar exit only)."""

    global _loop, _thread

    stop()

    _release_ble_instance_lock()

    if _loop and _loop.is_running():

        _loop.call_soon_threadsafe(_loop.stop)

    if _thread:

        _thread.join(timeout=5)

    _loop = None

    _thread = None

def publish_envelope(envelope: dict) -> None:
    """Push signed JSON envelope to BLE read characteristic."""
    packet_bytes = json.dumps(envelope, separators=(",", ":")).encode("utf-8")
    if b'"timestamp_ms"' not in packet_bytes:
        raise RuntimeError("Signed BLE packet missing timestamp_ms in payload")
    if not is_advertising():
        try:
            start()
        except RuntimeError:
            restart()
    loop = _ensure_loop()
    future = asyncio.run_coroutine_threadsafe(_update_packet_async(packet_bytes), loop)
    future.result(timeout=15)


def broadcast_packet(

    *,

    terminal_id: str,

    signing_key: str,

    bank_name: str,

    masked_suffix: str,

    amount_ngn: int,

    item_count: int,

) -> SignedPacket:

    payload = build_payload(

        terminal_id=terminal_id,

        amount_ngn=amount_ngn,

        item_count=item_count,

        bank_name=bank_name,

        masked_account_suffix=masked_suffix,

    )

    ts = payload.get("timestamp_ms")

    if ts is None or not isinstance(ts, int) or ts <= 0:

        payload["timestamp_ms"] = int(time.time() * 1000)

    signature = sign_payload(payload, signing_key)

    packet = SignedPacket(payload=payload, signature=signature)

    packet_bytes = json.dumps(packet.model_dump(), separators=(",", ":")).encode("utf-8")

    if b'"timestamp_ms"' not in packet_bytes:

        raise RuntimeError("Signed BLE packet missing timestamp_ms in payload")

    if not is_advertising():

        try:

            start()

        except RuntimeError:

            restart()

    loop = _ensure_loop()

    future = asyncio.run_coroutine_threadsafe(_update_packet_async(packet_bytes), loop)

    future.result(timeout=15)

    log.info(

        "BLE packet broadcast session=%s amount=%s timestamp_ms=%s",

        payload["session_uuid_v4"][:8],

        amount_ngn,

        payload["timestamp_ms"],

    )

    return packet

