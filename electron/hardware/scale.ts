import { getTerminalConfig } from "../ipc/config";

let lastWeight = 0;
let stableCount = 0;

export async function getScaleWeight(): Promise<{ kg: number; stable: boolean }> {
  const { scalePort } = getTerminalConfig();

  if (process.platform !== "win32") {
    const mock = 1.234 + Math.random() * 0.01;
    stableCount += 1;
    return { kg: Math.round(mock * 1000) / 1000, stable: stableCount > 2 };
  }

  try {
    const { SerialPort } = require("serialport") as {
      SerialPort: {
        list: () => Promise<{ path: string }[]>;
      };
    };
    const ports = await SerialPort.list();
    const portPath = ports.find((p) => p.path === scalePort)?.path ?? scalePort;

    return new Promise((resolve) => {
      try {
        const { SerialPort: SP } = require("serialport");
        const port = new SP({ path: portPath, baudRate: 9600, autoOpen: false });

        port.open((err: Error | null) => {
          if (err) {
            resolve({ kg: lastWeight || 0, stable: false });
            return;
          }

          let data = "";
          const timeout = setTimeout(() => {
            port.close();
            resolve({ kg: lastWeight, stable: stableCount >= 3 });
          }, 500);

          port.on("data", (chunk: Buffer) => {
            data += chunk.toString();
            const match = data.match(/(\d+\.?\d*)/);
            if (match) {
              const w = parseFloat(match[1]) / 1000;
              if (Math.abs(w - lastWeight) < 0.002) {
                stableCount += 1;
              } else {
                stableCount = 0;
              }
              lastWeight = w;
            }
          });

          port.on("error", () => {
            clearTimeout(timeout);
            port.close();
            resolve({ kg: lastWeight, stable: false });
          });
        });
      } catch {
        resolve({ kg: 1.0, stable: true });
      }
    });
  } catch {
    return { kg: 1.234, stable: true };
  }
}
