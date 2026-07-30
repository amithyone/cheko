import { randomUUID } from "crypto";
import { getTerminalConfig, getPaymentCredentials } from "../ipc/config";

export interface BroadcastHealth {
  ok: boolean;
  sdkInstalled: boolean;
  transport: string;
  bleLive: boolean;
  activeSession: string | null;
  terminalId: string;
  signatureAlg?: string;
  bankName?: string;
  bankNameHash?: string;
  maskedAccountSuffix?: string;
  usingSdkDefaults?: boolean;
  credentialSource?: string;
}

export interface BroadcastStartResult {
  ok: boolean;
  sessionId?: string;
  transport?: string;
  mode?: "public" | "checkout";
  error?: string;
}

let activeSession: string | null = null;

function terminalId(): string {
  const cfg = getTerminalConfig();
  const creds = getPaymentCredentials();
  return creds?.terminalId ?? cfg.terminalId ?? "POS-LAG-001";
}

export function getEmbeddedBroadcastHealth(): BroadcastHealth {
  return {
    ok: true,
    sdkInstalled: false,
    transport: "simulated",
    bleLive: false,
    activeSession,
    terminalId: terminalId(),
  };
}

export function startEmbeddedBroadcast(options: {
  amountNgn: number;
  itemCount: number;
  mode: "public" | "checkout";
}): BroadcastStartResult {
  if (options.mode === "checkout" && options.amountNgn <= 0) {
    return { ok: false, error: "Checkout broadcast requires a positive amount" };
  }

  const sessionId = randomUUID();
  activeSession = sessionId;

  console.log(
    `[cheko broadcast] SIMULATED only (no BLE radio) — mode=${options.mode} terminal=${terminalId()} session=${sessionId.slice(0, 8)}`
  );

  return {
    ok: true,
    sessionId,
    transport: "simulated",
    mode: options.mode,
  };
}

export function stopEmbeddedBroadcast(): { ok: boolean; stoppedSession: string | null } {
  const prev = activeSession;
  activeSession = null;
  return { ok: true, stoppedSession: prev };
}

export function resetEmbeddedBroadcast(): void {
  activeSession = null;
}
