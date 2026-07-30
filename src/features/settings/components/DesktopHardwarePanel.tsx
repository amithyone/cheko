import { useEffect, useState } from "react";
import { Printer, Scale, Terminal, RefreshCw, Radio } from "lucide-react";
import { hardwareBridge, isElectronHardware } from "@/shared/hardware/bridge";
import { broadcastBridge } from "@/shared/broadcast/bridge";
import {
  BROADCAST_MODE_LABELS,
  loadBroadcastSettings,
  saveBroadcastSettings,
  type BroadcastSettings,
} from "@/shared/broadcast/settings";
import type { BroadcastHealth, BroadcastMode } from "@/shared/broadcast/types";
import type { TerminalConfig } from "@/shared/hardware/types";
import { Button, Input, Select } from "@/shared/ui";

interface DesktopHardwarePanelProps {
  onSaved?: (message: string) => void;
}

export function DesktopHardwarePanel({ onSaved }: DesktopHardwarePanelProps) {
  const [config, setConfig] = useState<TerminalConfig | null>(null);
  const [printers, setPrinters] = useState<string[]>([]);
  const [scaleReading, setScaleReading] = useState<string>("—");
  const [loading, setLoading] = useState(false);
  const [broadcastHealth, setBroadcastHealth] = useState<BroadcastHealth | null>(null);
  const [broadcastTestMsg, setBroadcastTestMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        hardwareBridge.getConfig(),
        hardwareBridge.listPrinters(),
      ]);
      setConfig(c);
      setPrinters(p);
      const bh = await broadcastBridge.getHealth();
      setBroadcastHealth(bh);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (!isElectronHardware()) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
          <Terminal className="w-5 h-5 text-slate-400 mb-2" />
          Desktop hardware settings appear when running inside the Cheko Windows / Electron app.
        </div>
        <BroadcastTestSection onSaved={onSaved} />
      </div>
    );
  }

  const save = async () => {
    if (!config) return;
    await hardwareBridge.saveConfig({
      terminalId: config.terminalId,
      printerName: config.printerName,
      scalePort: config.scalePort,
    });
    onSaved?.("Terminal hardware config saved");
  };

  const readScale = async () => {
    const w = await hardwareBridge.getScaleWeight();
    setScaleReading(`${w.kg.toFixed(3)} kg${w.stable ? " (stable)" : " (settling…)"}`);
  };

  const testBroadcast = async () => {
    setBroadcastTestMsg("Starting…");
    const settings = loadBroadcastSettings();
    const result = await broadcastBridge.start({
      mode: settings.mode,
      amountNgn: settings.mode === "public" ? 0 : 2500,
      itemCount: settings.mode === "public" ? 0 : 3,
    });
    if (result.ok) {
      setBroadcastTestMsg(
        `Broadcasting ₦2,500 via ${result.transport ?? "unknown"} — session ${result.sessionId?.slice(0, 8)}…`
      );
      onSaved?.("Test broadcast started");
    } else {
      setBroadcastTestMsg(result.error ?? "Broadcast failed");
    }
    const bh = await broadcastBridge.getHealth();
    setBroadcastHealth(bh);
  };

  const stopBroadcastTest = async () => {
    await broadcastBridge.stop();
    setBroadcastTestMsg("Broadcast stopped");
    const bh = await broadcastBridge.getHealth();
    setBroadcastHealth(bh);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            Desktop Hardware
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Printer, scale, and terminal ID for the Windows POS lane.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {config && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Terminal ID"
            value={config.terminalId}
            onChange={(e) => setConfig({ ...config, terminalId: e.target.value })}
          />
          <Select
            label="Receipt printer"
            value={config.printerName}
            onChange={(e) => setConfig({ ...config, printerName: e.target.value })}
          >
            <option value="">— Select printer —</option>
            {printers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Input
            label="Scale COM port"
            value={config.scalePort}
            onChange={(e) => setConfig({ ...config, scalePort: e.target.value })}
            placeholder="COM3"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={() => void save()}>
          Save hardware
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => void readScale()}>
          <Scale className="w-4 h-4" />
          Read scale
        </Button>
        <span className="text-xs font-mono text-slate-500">{scaleReading}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void hardwareBridge.testScan?.("5901234123457")}
        >
          Test scan (demo EAN)
        </Button>
      </div>

      <BroadcastTestSection
        broadcastHealth={broadcastHealth}
        broadcastTestMsg={broadcastTestMsg}
        onTest={() => void testBroadcast()}
        onStop={() => void stopBroadcastTest()}
        onRefresh={() => void load()}
      />
    </div>
  );
}

function BroadcastTestSection({
  broadcastHealth,
  broadcastTestMsg,
  onTest,
  onStop,
  onRefresh,
  onSaved,
}: {
  broadcastHealth?: BroadcastHealth | null;
  broadcastTestMsg?: string;
  onTest?: () => void;
  onStop?: () => void;
  onRefresh?: () => void;
  onSaved?: (message: string) => void;
}) {
  const [localHealth, setLocalHealth] = useState<BroadcastHealth | null>(broadcastHealth ?? null);
  const [localMsg, setLocalMsg] = useState(broadcastTestMsg ?? "");
  const [settings, setSettings] = useState<BroadcastSettings>(() => loadBroadcastSettings());

  useEffect(() => {
    if (broadcastHealth) setLocalHealth(broadcastHealth);
  }, [broadcastHealth]);

  useEffect(() => {
    if (broadcastTestMsg) setLocalMsg(broadcastTestMsg);
  }, [broadcastTestMsg]);

  const applyMode = (mode: BroadcastMode) => {
    const next = { ...settings, mode };
    setSettings(next);
    saveBroadcastSettings(next);
    onSaved?.(`Broadcast mode set to ${BROADCAST_MODE_LABELS[mode].title}`);
  };

  const runTest = async () => {
    if (onTest) {
      onTest();
      return;
    }
    setLocalMsg("Starting…");
    const result = await broadcastBridge.start({
      mode: settings.mode,
      amountNgn: settings.mode === "public" ? 0 : 2500,
      itemCount: settings.mode === "public" ? 0 : 3,
    });
    if (result.ok) {
      setLocalMsg(
        settings.mode === "public"
          ? `Public merchant beacon via ${result.transport ?? "unknown"} — session ${result.sessionId?.slice(0, 8)}…`
          : `Checkout broadcast ₦2,500 via ${result.transport ?? "unknown"} — session ${result.sessionId?.slice(0, 8)}…`
      );
      onSaved?.("Test broadcast started");
    } else {
      setLocalMsg(result.error ?? "Broadcast failed to start");
    }
    setLocalHealth(await broadcastBridge.getHealth());
  };

  const runStop = async () => {
    if (onStop) {
      onStop();
      return;
    }
    await broadcastBridge.stop();
    setLocalMsg("Broadcast stopped");
    setLocalHealth(await broadcastBridge.getHealth());
  };

  const refresh = async () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    setLocalHealth(await broadcastBridge.getHealth());
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
      <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
        <Radio className="w-4 h-4 text-sky-500" />
        Bluetooth broadcast (Checkout Broadcast)
      </h4>
      <p className="text-xs text-slate-400">
        Built into the Cheko desktop app — no Python install needed. Real BLE radio uses the bundled
        sidecar in production installers when available.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(["public", "checkout"] as BroadcastMode[]).map((mode) => {
          const meta = BROADCAST_MODE_LABELS[mode];
          const active = settings.mode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => applyMode(mode)}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                active
                  ? "border-sky-400 bg-sky-50 text-sky-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">{meta.title}</p>
              <p className="text-[10px] mt-1 opacity-80 leading-relaxed">{meta.description}</p>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400">{BROADCAST_MODE_LABELS[settings.mode].protocolNote}</p>

      {localHealth && (
        <div className="text-xs font-mono text-slate-600 space-y-1">
          <p>
            Status:{" "}
            <span className={localHealth.ok ? "text-emerald-600" : "text-red-600"}>
              {localHealth.ok ? "online" : "offline"}
            </span>
            {" · "}
            Transport: {localHealth.transport}
            {" · "}
            SDK: {localHealth.sdkInstalled ? "installed" : "simulated"}
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => void refresh()}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
        <Button type="button" size="sm" onClick={() => void runTest()}>
          {settings.mode === "public" ? "Test public beacon" : "Test checkout (₦2,500)"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => void runStop()}>
          Stop broadcast
        </Button>
      </div>
      {localMsg && <p className="text-xs text-slate-500 font-medium">{localMsg}</p>}
    </div>
  );
}
