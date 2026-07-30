import type { ChekoHardwareBridge, ReceiptPayload, TerminalConfig } from "./types";

export function isElectronHardware(): boolean {
  return typeof window !== "undefined" && Boolean(window.chekoHardware);
}

function hw(): ChekoHardwareBridge | null {
  return window.chekoHardware ?? null;
}

const noopConfig: TerminalConfig = {
  terminalId: "WEB-DEMO",
  printerName: "",
  scalePort: "",
  isDesktop: false,
};

export const hardwareBridge = {
  async printReceipt(payload: ReceiptPayload) {
    const bridge = hw();
    if (bridge) return bridge.printReceipt(payload);
    console.log("[cheko web] print receipt stub", payload.transactionId);
    return { ok: true };
  },

  async openCashDrawer() {
    const bridge = hw();
    if (bridge) return bridge.openCashDrawer();
    console.log("[cheko web] cash drawer stub");
  },

  async getScaleWeight() {
    const bridge = hw();
    if (bridge) return bridge.getScaleWeight();
    return { kg: 1.234, stable: true };
  },

  async listPrinters() {
    const bridge = hw();
    if (bridge) return bridge.listPrinters();
    return [];
  },

  async getConfig() {
    const bridge = hw();
    if (bridge) return bridge.getConfig();
    return noopConfig;
  },

  async saveConfig(partial: Partial<TerminalConfig>) {
    const bridge = hw();
    if (bridge) return bridge.saveConfig(partial);
    return { ...noopConfig, ...partial };
  },

  onScan(callback: (barcode: string) => void) {
    const bridge = hw();
    if (bridge) return bridge.onScan(callback);
    return () => undefined;
  },

  async testScan(barcode: string) {
    const bridge = hw();
    if (bridge?.testScan) return bridge.testScan(barcode);
  },
};
