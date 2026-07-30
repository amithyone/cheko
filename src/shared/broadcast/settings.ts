export type BroadcastMode = "public" | "checkout";

/** Matches checkout_broadcast: public = merchant beacon; checkout = signed pending amount */
export interface BroadcastSettings {
  mode: BroadcastMode;
  defaultEnabled: boolean;
  /** When mode=public, keep broadcasting on the checkout screen */
  alwaysOnPublic: boolean;
}

const STORAGE_KEY = "cheko_broadcast_settings";

const DEFAULTS: BroadcastSettings = {
  mode: "public",
  defaultEnabled: true,
  alwaysOnPublic: true,
};

export function loadBroadcastSettings(): BroadcastSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<BroadcastSettings>;
    return {
      mode: parsed.mode === "checkout" ? "checkout" : "public",
      defaultEnabled: parsed.defaultEnabled ?? DEFAULTS.defaultEnabled,
      alwaysOnPublic: parsed.alwaysOnPublic ?? DEFAULTS.alwaysOnPublic,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveBroadcastSettings(settings: BroadcastSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const BROADCAST_MODE_LABELS: Record<
  BroadcastMode,
  { title: string; description: string; protocolNote: string }
> = {
  public: {
    title: "Public merchant broadcast",
    description:
      "Always advertise this terminal's merchant account to nearby phones — customers can pay any amount.",
    protocolNote:
      "Uses BLE GATT + signed packet. Same session stays open until payment or cancel. " +
      "Phones show terminal label (e.g. TERM-01 → 01) in the multi-POS picker.",
  },
  checkout: {
    title: "Checkout payment broadcast",
    description:
      "Only broadcast when a cart payment is pending — amount is locked by signature.",
    protocolNote:
      "One session UUID stays open until the customer pays or you cancel — the POS re-signs with a fresh timestamp but keeps the same session. " +
      "Wallet verify ignores packet age while session_status is open.",
  },
};
