export interface BroadcastHealth {
  ok: boolean;
  sdkInstalled: boolean;
  transport: string;
  bleLive: boolean;
  activeSession: string | null;
  terminalId: string;
  terminalLabel?: string;
  sessionStatus?: "open" | "paid" | "cancelled" | null;
}

export type SessionStatus = "open" | "paid" | "cancelled";

export type BroadcastMode = "public" | "checkout";

export interface BroadcastStartResult {
  ok: boolean;
  sessionId?: string;
  transport?: string;
  mode?: BroadcastMode;
  sessionStatus?: SessionStatus;
  terminalLabel?: string;
  error?: string;
}

export type BroadcastStatus = "idle" | "starting" | "broadcasting" | "stopped" | "error";

export interface BroadcastStartOptions {
  amountNgn: number;
  itemCount: number;
  mode: BroadcastMode;
  /** Reuse open session on 90s BLE refresh (same session_uuid_v4). */
  sessionId?: string | null;
}
