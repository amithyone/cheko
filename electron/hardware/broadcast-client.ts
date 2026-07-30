import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { app } from "electron";
import { getPaymentCredentials, getTerminalConfig } from "../ipc/config";
import {
  getEmbeddedBroadcastHealth,
  startEmbeddedBroadcast,
  stopEmbeddedBroadcast,
  type BroadcastHealth,
  type BroadcastStartResult,
} from "./broadcast-embedded";

export type { BroadcastHealth, BroadcastStartResult };

const EXTERNAL_URL = process.env.CHEKO_BROADCAST_BRIDGE_URL ?? "http://127.0.0.1:8765";

let sidecarProcess: ChildProcess | null = null;
let externalSidecarChecked = false;
let externalSidecarAvailable = false;
let pythonSpawnFailed = false;

function bundledSidecarExe(): string | null {
  const candidates = [
    path.join(process.resourcesPath, "broadcast-sidecar", "ChekoBroadcastSidecar.exe"),
    path.join(process.resourcesPath, "broadcast-sidecar", "broadcast-sidecar.exe"),
    path.join(app.getAppPath(), "broadcast-sidecar", "ChekoBroadcastSidecar.exe"),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function sidecarScriptPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "broadcast-sidecar", "server.py");
  }
  return path.join(app.getAppPath(), "broadcast-sidecar", "server.py");
}

function pythonCandidates(): string[] {
  if (process.env.CHEKO_BROADCAST_PYTHON) return [process.env.CHEKO_BROADCAST_PYTHON];
  const localAppData = process.env.LOCALAPPDATA ?? "";
  return [
    path.join(localAppData, "Programs", "Python", "Python312", "python.exe"),
    path.join(localAppData, "Programs", "Python", "Python311", "python.exe"),
    "python",
    "python3",
    "py",
  ].filter(Boolean);
}

function sidecarEnv(): NodeJS.ProcessEnv {
  const creds = getPaymentCredentials();
  const cfg = getTerminalConfig();
  const terminalId = creds?.terminalId ?? cfg.terminalId ?? "POS-LAG-001";
  const isCheckoutPayTerminal = terminalId.toUpperCase().startsWith("CP-");
  const signingKey =
    creds?.signingKey?.trim() ||
    process.env.CHEKO_SIGNING_KEY?.trim() ||
    (isCheckoutPayTerminal ? "" : "demo-signing-key-min-16-chars");
  const sdkPath = app.isPackaged
    ? path.join(process.resourcesPath, "vendor", "checkout_broadcast", "sdk", "python")
    : path.join(app.getAppPath(), "vendor", "checkout_broadcast", "sdk", "python");
  const existingPyPath = process.env.PYTHONPATH ?? "";
  return {
    ...process.env,
    PYTHONPATH: existingPyPath ? `${sdkPath};${existingPyPath}` : sdkPath,
    CHEKO_TERMINAL_ID: terminalId,
    CHEKO_SIGNING_KEY: signingKey,
    CHEKO_SIGNATURE_ALG:
      creds?.signatureAlg ??
      process.env.CHEKO_SIGNATURE_ALG ??
      "ed25519",
    CHEKO_BANK_API_URL:
      process.env.CHEKO_BANK_API_URL ?? `${EXTERNAL_URL}`,
    CHEKO_BROADCAST_TRANSPORT: process.env.CHEKO_BROADCAST_TRANSPORT ?? "ble",
    CHEKO_MERCHANT_BANK:
      creds?.merchantBankName ?? process.env.CHEKO_MERCHANT_BANK ?? "",
    CHEKO_MASKED_SUFFIX:
      creds?.maskedAccountSuffix ?? process.env.CHEKO_MASKED_SUFFIX ?? "",
  };
}

async function fetchExternalHealth(): Promise<BroadcastHealth | null> {
  try {
    const res = await fetch(`${EXTERNAL_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ok: boolean;
      sdk_installed: boolean;
      transport: string;
      active_session: string | null;
      terminal_id: string;
      ble_live?: boolean;
      signature_alg?: string;
      bank_name?: string;
      bank_name_hash?: string;
      masked_account_suffix?: string;
      using_sdk_defaults?: boolean;
      credential_source?: string;
    };
    const transport = data.transport ?? "unknown";
    return {
      ok: data.ok,
      sdkInstalled: data.sdk_installed,
      transport,
      bleLive: data.ble_live ?? transport.includes("ble"),
      activeSession: data.active_session,
      terminalId: data.terminal_id,
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

function trySpawnProcess(command: string, args: string[]): Promise<ChildProcess | null> {
  return new Promise((resolve) => {
    let settled = false;
    const proc = spawn(command, args, {
      env: sidecarEnv(),
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    const finish = (result: ChildProcess | null) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    proc.on("error", (err) => {
      console.warn(`[broadcast] spawn failed (${command}): ${err.message}`);
      finish(null);
    });

    proc.stdout?.on("data", (chunk: Buffer) => {
      console.log(`[broadcast-sidecar] ${chunk.toString().trim()}`);
    });
    proc.stderr?.on("data", (chunk: Buffer) => {
      console.error(`[broadcast-sidecar] ${chunk.toString().trim()}`);
    });
    proc.on("exit", (code) => {
      console.log(`[broadcast-sidecar] exited code=${code}`);
      if (sidecarProcess === proc) sidecarProcess = null;
    });

    setTimeout(() => finish(proc), 80);
  });
}

async function waitForExternalHealth(maxAttempts = 25): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i += 1) {
    const health = await fetchExternalHealth();
    if (health?.ok) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

async function spawnPythonSidecar(): Promise<boolean> {
  if (pythonSpawnFailed) return false;
  const script = sidecarScriptPath();
  if (!fs.existsSync(script)) {
    pythonSpawnFailed = true;
    return false;
  }

  for (const python of pythonCandidates()) {
    if (python.includes(path.sep) && !fs.existsSync(python)) continue;
    const proc = await trySpawnProcess(python, [script]);
    if (!proc) continue;
    sidecarProcess = proc;
    const healthy = await waitForExternalHealth();
    if (healthy) {
      console.log(`[broadcast] Python BLE sidecar started via ${python}`);
      return true;
    }
    if (sidecarProcess && !sidecarProcess.killed) {
      sidecarProcess.kill();
      sidecarProcess = null;
    }
  }

  pythonSpawnFailed = true;
  return false;
}

async function spawnBundledSidecar(exePath: string): Promise<boolean> {
  const proc = await trySpawnProcess(exePath, []);
  if (!proc) return false;
  sidecarProcess = proc;
  return waitForExternalHealth();
}

async function ensureExternalSidecar(): Promise<boolean> {
  if (externalSidecarChecked && !externalSidecarAvailable) {
    return false;
  }

  const existing = await fetchExternalHealth();
  if (existing?.ok) {
    externalSidecarChecked = true;
    externalSidecarAvailable = true;
    return true;
  }

  const bundled = bundledSidecarExe();
  if (bundled && (await spawnBundledSidecar(bundled))) {
    externalSidecarChecked = true;
    externalSidecarAvailable = true;
    return true;
  }

  if (process.env.CHEKO_BROADCAST_FORCE_EMBEDDED === "1") {
    externalSidecarChecked = true;
    return false;
  }

  if (await spawnPythonSidecar()) {
    externalSidecarChecked = true;
    externalSidecarAvailable = true;
    return true;
  }

  externalSidecarChecked = true;
  externalSidecarAvailable = false;
  return false;
}

async function useExternalSidecar(): Promise<boolean> {
  return ensureExternalSidecar();
}

export async function getBroadcastHealth(): Promise<BroadcastHealth> {
  if (await useExternalSidecar()) {
    const health = await fetchExternalHealth();
    if (health) return health;
  }
  return getEmbeddedBroadcastHealth();
}

export async function startBroadcast(options: {
  amountNgn: number;
  itemCount: number;
  mode: "public" | "checkout";
}): Promise<BroadcastStartResult> {
  if (await useExternalSidecar()) {
    try {
      const res = await fetch(`${EXTERNAL_URL}/broadcast`, {
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
        mode?: "public" | "checkout";
        error?: string;
      };
      if (res.ok && data.ok) {
        return {
          ok: true,
          sessionId: data.session_id,
          transport: data.transport,
          mode: data.mode ?? options.mode,
        };
      }
      if (data.error) {
        return { ok: false, error: data.error };
      }
    } catch (err) {
      console.warn("[broadcast] external sidecar request failed:", err);
      if (externalSidecarAvailable) {
        return {
          ok: false,
          error:
            err instanceof Error
              ? err.message
              : "BLE sidecar timed out — ensure broadcast-sidecar is running",
        };
      }
    }
  }

  const embedded = startEmbeddedBroadcast(options);
  return embedded;
}

export async function stopBroadcast(): Promise<{ ok: boolean }> {
  if (externalSidecarAvailable) {
    try {
      const res = await fetch(`${EXTERNAL_URL}/stop`, {
        method: "POST",
        signal: AbortSignal.timeout(5000),
      });
      const data = (await res.json()) as { ok: boolean };
      if (res.ok && data.ok) return { ok: true };
    } catch {
      // fall through
    }
  }
  stopEmbeddedBroadcast();
  return { ok: true };
}

export function shutdownSidecar(): void {
  stopEmbeddedBroadcast();
  if (sidecarProcess && !sidecarProcess.killed) {
    sidecarProcess.kill();
    sidecarProcess = null;
  }
}

export function resetExternalSidecarCache(): void {
  externalSidecarChecked = false;
  externalSidecarAvailable = false;
  pythonSpawnFailed = false;
}
