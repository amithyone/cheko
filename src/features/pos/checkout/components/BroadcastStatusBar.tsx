import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { broadcastBridge } from "@/shared/broadcast/bridge";
import { loadBroadcastSettings } from "@/shared/broadcast/settings";
import { useBroadcastPay } from "@/hooks/useBroadcastPay";
import { usePaymentProvider } from "@/context/PaymentProviderContext";

interface BroadcastStatusBarProps {
  enabled: boolean;
  amountNgn?: number;
  itemCount?: number;
}

export function BroadcastStatusBar({
  enabled,
  amountNgn = 1,
  itemCount = 1,
}: BroadcastStatusBarProps) {
  const { capabilities } = usePaymentProvider();
  const settings = loadBroadcastSettings();
  const [healthTransport, setHealthTransport] = useState<string>("…");
  const [bleLive, setBleLive] = useState(false);

  const shouldBroadcast =
    enabled &&
    capabilities.broadcastPay &&
    settings.mode === "public" &&
    settings.alwaysOnPublic;

  const { status, sessionId, transport, error } = useBroadcastPay({
    enabled: shouldBroadcast,
    mode: "public",
    amountNgn,
    itemCount,
  });

  useEffect(() => {
    if (!shouldBroadcast) return;
    void broadcastBridge.getHealth().then((h) => {
      setHealthTransport(h.transport);
      setBleLive(h.bleLive);
    });
    const id = setInterval(() => {
      void broadcastBridge.getHealth().then((h) => {
        setHealthTransport(h.transport);
        setBleLive(h.bleLive);
      });
    }, 5000);
    return () => clearInterval(id);
  }, [shouldBroadcast]);

  if (!shouldBroadcast) return null;

  const isLive = bleLive || transport.includes("ble");
  const isSimulated = transport === "simulated" || healthTransport === "simulated";

  return (
    <div
      className={`flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-semibold ${
        isLive
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : isSimulated
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-slate-50 border-slate-200 text-slate-600"
      }`}
    >
      <Radio className={`w-4 h-4 ${status === "broadcasting" ? "animate-pulse" : ""}`} />
      <span>
        {isLive ? "BLE broadcast LIVE" : "Broadcast SIMULATED (no radio)"}
        {" · "}
        {status === "broadcasting" ? "transmitting" : status}
      </span>
      {sessionId && (
        <span className="font-mono text-[10px] opacity-70">session {sessionId.slice(0, 8)}…</span>
      )}
      {isSimulated && !isLive && (
        <span className="text-[10px] font-medium opacity-80">
          Phone app won&apos;t receive until BLE sidecar is active — run setup-broadcast-ble.ps1
        </span>
      )}
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
