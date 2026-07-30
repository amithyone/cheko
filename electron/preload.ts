import { contextBridge, ipcRenderer } from "electron";
import type {
  PaymentConfigSummary,
  PaymentProviderCredentials,
  ReceiptPayload,
  TerminalConfig,
} from "./types";

const chekoHardware = {
  printReceipt: (payload: ReceiptPayload) =>
    ipcRenderer.invoke("hardware:printReceipt", payload) as Promise<{ ok: boolean }>,

  openCashDrawer: () => ipcRenderer.invoke("hardware:openCashDrawer") as Promise<void>,

  getScaleWeight: () =>
    ipcRenderer.invoke("hardware:getScaleWeight") as Promise<{ kg: number; stable: boolean }>,

  listPrinters: () => ipcRenderer.invoke("hardware:listPrinters") as Promise<string[]>,

  getConfig: () => ipcRenderer.invoke("hardware:getConfig") as Promise<TerminalConfig>,

  saveConfig: (partial: Partial<TerminalConfig>) =>
    ipcRenderer.invoke("hardware:saveConfig", partial) as Promise<TerminalConfig>,

  onScan: (callback: (barcode: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, barcode: string) => callback(barcode);
    ipcRenderer.on("hardware:scan", handler);
    return () => ipcRenderer.removeListener("hardware:scan", handler);
  },

  testScan: (barcode: string) => ipcRenderer.invoke("hardware:testScan", barcode) as Promise<void>,

  getPaymentConfig: () => ipcRenderer.invoke("payment:getConfig") as Promise<PaymentConfigSummary>,

  getPaymentCredentials: () =>
    ipcRenderer.invoke("payment:getCredentials") as Promise<PaymentProviderCredentials | null>,

  savePaymentConfig: (creds: PaymentProviderCredentials) =>
    ipcRenderer.invoke("payment:saveConfig", creds) as Promise<PaymentConfigSummary>,
};

contextBridge.exposeInMainWorld("chekoHardware", chekoHardware);
