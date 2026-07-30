import { useEffect, useState } from "react";
import { Printer, Scale, Terminal, RefreshCw } from "lucide-react";
import { hardwareBridge, isElectronHardware } from "@/shared/hardware/bridge";
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

  const load = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        hardwareBridge.getConfig(),
        hardwareBridge.listPrinters(),
      ]);
      setConfig(c);
      setPrinters(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (!isElectronHardware()) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
        <Terminal className="w-5 h-5 text-slate-400 mb-2" />
        Desktop hardware settings appear when running inside the Cheko Windows / Electron app.
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
    </div>
  );
}
