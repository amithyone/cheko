import { ipcMain, BrowserWindow } from "electron";
import type { PaymentProviderCredentials, ReceiptPayload } from "../types";
import {
  getPaymentConfigSummary,
  getPaymentCredentials,
  getTerminalConfig,
  savePaymentCredentials,
  saveTerminalConfig,
} from "./config";
import { resetExternalSidecarCache, shutdownSidecar } from "../hardware/broadcast-client";
import { listPrinters, openCashDrawer, printReceipt } from "../hardware/escpos";
import { getScaleWeight } from "../hardware/scale";
import { emitTestScan, registerScannerIpc } from "../hardware/scanner";

export function registerHardwareIpc(getWindow: () => BrowserWindow | null): void {
  registerScannerIpc(getWindow);

  ipcMain.handle("hardware:printReceipt", async (_e, payload: ReceiptPayload) => {
    return printReceipt(payload);
  });

  ipcMain.handle("hardware:openCashDrawer", async () => {
    await openCashDrawer();
  });

  ipcMain.handle("hardware:getScaleWeight", async () => {
    return getScaleWeight();
  });

  ipcMain.handle("hardware:listPrinters", async () => {
    return listPrinters();
  });

  ipcMain.handle("hardware:getConfig", async () => {
    return getTerminalConfig();
  });

  ipcMain.handle("hardware:saveConfig", async (_e, partial: Record<string, string>) => {
    return saveTerminalConfig(partial);
  });

  ipcMain.handle("payment:getConfig", async () => {
    return getPaymentConfigSummary();
  });

  ipcMain.handle("payment:getCredentials", async () => {
    return getPaymentCredentials();
  });

  ipcMain.handle("payment:saveConfig", async (_e, creds: PaymentProviderCredentials) => {
    const summary = savePaymentCredentials(creds);
    shutdownSidecar();
    resetExternalSidecarCache();
    return summary;
  });

  ipcMain.handle("hardware:testScan", async (_e, barcode: string) => {
    emitTestScan(getWindow, barcode);
  });
}
