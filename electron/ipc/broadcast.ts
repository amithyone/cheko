import { ipcMain } from "electron";
import {
  getBroadcastHealth,
  startBroadcast,
  stopBroadcast,
} from "../hardware/broadcast-client";

export function registerBroadcastIpc(): void {
  ipcMain.handle("broadcast:health", async () => {
    return getBroadcastHealth();
  });

  ipcMain.handle(
    "broadcast:start",
    async (
      _e,
      payload: { amountNgn: number; itemCount: number; mode: "public" | "checkout" }
    ) => {
      return startBroadcast(payload);
    }
  );

  ipcMain.handle("broadcast:stop", async () => {
    return stopBroadcast();
  });
}
