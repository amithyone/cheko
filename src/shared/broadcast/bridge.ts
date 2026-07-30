import type {
  BroadcastHealth,
  BroadcastMode,
  BroadcastStartOptions,
  BroadcastStartResult,
  SessionStatus,
} from "./types";

const sidecarUrl = (): string =>
  import.meta.env.VITE_BROADCAST_BRIDGE_URL ?? "http://127.0.0.1:8765";

function hw() {
  return typeof window !== "undefined" ? window.chekoHardware : undefined;
}

async function httpHealth(): Promise<BroadcastHealth | null> {
  try {
    const res = await fetch(`${sidecarUrl()}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ok: boolean;
      sdk_installed: boolean;
      transport: string;
      active_session: string | null;
      terminal_id: string;
      terminal_label?: string;
      session_status?: SessionStatus | null;
      ble_live?: boolean;
      signature_alg?: string;
      bank_name?: string;
      bank_name_hash?: string;
      masked_account_suffix?: string;
      using_sdk_defaults?: boolean;
      credential_source?: string;
    };
    return {
      ok: data.ok,
      sdkInstalled: data.sdk_installed,
      transport: data.transport,
      bleLive: data.ble_live ?? data.transport.includes("ble"),
      activeSession: data.active_session,
      terminalId: data.terminal_id,
      terminalLabel: data.terminal_label,
      sessionStatus: data.session_status ?? null,
      signatureAlg: data.signature_alg,
      bankName: data.bank_name,
      bankNameHash: data.bank_name_hash,
      maskedAccountSuffix: data.masked_account_suffix,
      usingSdkDefaults: data.using_sdk_defaults,
      credentialSource: data.credential_source,
    };
  } catch {
    return null;
  }
}

async function httpStart(options: BroadcastStartOptions): Promise<BroadcastStartResult> {
  try {
    const res = await fetch(`${sidecarUrl()}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: options.mode,
        amount_ngn: options.amountNgn,
        item_count: options.itemCount,
        ...(options.sessionId ? { session_id: options.sessionId } : {}),
      }),
      signal: AbortSignal.timeout(45000),
    });
    const data = (await res.json()) as {
      ok: boolean;
      session_id?: string;
      transport?: string;
      mode?: BroadcastMode;
      session_status?: SessionStatus;
      terminal_label?: string;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? `HTTP ${res.status}` };
    }
    return {
      ok: true,
      sessionId: data.session_id,
      transport: data.transport,
      mode: data.mode ?? options.mode,
      sessionStatus: data.session_status,
      terminalLabel: data.terminal_label,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Broadcast failed" };
  }
}

async function httpStop(): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`${sidecarUrl()}/stop`, { method: "POST", signal: AbortSignal.timeout(5000) });
    const data = (await res.json()) as { ok: boolean };
    return { ok: res.ok && data.ok };
  } catch {
    return { ok: false };
  }
}

export const broadcastBridge = {
  async getHealth(): Promise<BroadcastHealth> {
    const bridge = hw();
    if (bridge?.getBroadcastHealth) {
      return bridge.getBroadcastHealth();
    }
    const health = await httpHealth();
    return (
      health ?? {
        ok: false,
        sdkInstalled: false,
        transport: "unavailable",
        bleLive: false,
        activeSession: null,
        terminalId: "WEB-DEMO",
      }
    );
  },

  async start(options: BroadcastStartOptions): Promise<BroadcastStartResult> {
    const bridge = hw();
    if (bridge?.startBroadcast) {
      return bridge.startBroadcast(options);
    }
    return httpStart(options);
  },

  async stop(): Promise<{ ok: boolean }> {
    const bridge = hw();
    if (bridge?.stopBroadcast) {
      return bridge.stopBroadcast();
    }
    return httpStop();
  },

  /** Re-sign and push BLE packet; reuses open session_uuid_v4 on sidecar. */
  async refresh(options: BroadcastStartOptions): Promise<BroadcastStartResult> {
    return this.start(options);
  },

  async markSessionPaid(sessionId: string): Promise<{ ok: boolean }> {
    try {
      const res = await fetch(`${sidecarUrl()}/session/paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
        signal: AbortSignal.timeout(5000),
      });
      const data = (await res.json()) as { ok: boolean };
      return { ok: res.ok && data.ok };
    } catch {
      return { ok: false };
    }
  },

  /** Release active BLE slot; parked session stays open for Pay at Shop verify. */
  async parkSession(sessionId: string): Promise<{ ok: boolean }> {
    try {
      const res = await fetch(`${sidecarUrl()}/session/park`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
        signal: AbortSignal.timeout(5000),
      });
      const data = (await res.json()) as { ok: boolean };
      return { ok: res.ok && data.ok };
    } catch {
      return { ok: false };
    }
  },
};
