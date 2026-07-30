import fs from "fs";
import path from "path";
import { app } from "electron";
import type { PaymentConfigSummary, PaymentProviderCredentials, TerminalConfig } from "../types";

const CONFIG_FILE = "cheko-config.json";

function configPath(): string {
  return path.join(app.getPath("userData"), CONFIG_FILE);
}

interface StoredConfig {
  terminal?: Partial<TerminalConfig>;
  payment?: PaymentProviderCredentials;
}

function readStore(): StoredConfig {
  try {
    const raw = fs.readFileSync(configPath(), "utf-8");
    return JSON.parse(raw) as StoredConfig;
  } catch {
    return {};
  }
}

function writeStore(data: StoredConfig): void {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(data, null, 2), "utf-8");
}

export function getTerminalConfig(): TerminalConfig {
  const stored = readStore().terminal ?? {};
  return {
    terminalId: stored.terminalId ?? process.env.CHEKO_TERMINAL_ID ?? "POS-LAG-001",
    printerName: stored.printerName ?? process.env.CHEKO_PRINTER_NAME ?? "",
    scalePort: stored.scalePort ?? process.env.CHEKO_SCALE_PORT ?? "COM3",
    isDesktop: true,
  };
}

export function saveTerminalConfig(partial: Partial<TerminalConfig>): TerminalConfig {
  const store = readStore();
  store.terminal = { ...store.terminal, ...partial };
  writeStore(store);
  return getTerminalConfig();
}

export function getPaymentConfigSummary(): PaymentConfigSummary {
  const creds = readStore().payment;
  if (!creds?.provider) {
    return { configured: false, provider: "checkoutnow", testMode: true };
  }
  const hasSecret =
    Boolean(creds.apiKey) || Boolean(creds.secretKey) || Boolean(creds.publicKey);
  return {
    configured: hasSecret,
    provider: creds.provider,
    testMode: creds.testMode ?? true,
    terminalId: creds.terminalId,
    merchantId: creds.merchantId,
  };
}

export function getPaymentCredentials(): PaymentProviderCredentials | null {
  return readStore().payment ?? null;
}

export function savePaymentCredentials(creds: PaymentProviderCredentials): PaymentConfigSummary {
  const store = readStore();
  store.payment = creds;
  writeStore(store);
  return getPaymentConfigSummary();
}
