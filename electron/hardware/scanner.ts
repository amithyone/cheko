import { BrowserWindow, ipcMain } from "electron";

const SCAN_CHANNEL = "hardware:scan";
const MAX_GAP_MS = 50;
const MIN_LENGTH = 4;

let buffer = "";
let lastKeyTime = 0;
let registered = false;

export function registerScannerIpc(getWindow: () => BrowserWindow | null): void {
  if (registered) return;
  registered = true;

  ipcMain.on("hardware:scanner-key", (_event, char: string) => {
    const now = Date.now();
    if (now - lastKeyTime > MAX_GAP_MS) {
      buffer = "";
    }
    lastKeyTime = now;
    buffer += char;
  });

  ipcMain.on("hardware:scanner-enter", () => {
    const code = buffer.trim();
    buffer = "";
    if (code.length >= MIN_LENGTH) {
      getWindow()?.webContents.send(SCAN_CHANNEL, code);
    }
  });
}

export function emitTestScan(getWindow: () => BrowserWindow | null, barcode: string): void {
  getWindow()?.webContents.send(SCAN_CHANNEL, barcode);
}
