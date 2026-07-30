import type { ReceiptPayload } from "../types";
import { getTerminalConfig } from "../ipc/config";

function buildReceiptHtml(payload: ReceiptPayload): string {
  const sym = payload.currencySymbol ?? "₦";
  const lines = payload.items
    .map(
      (item) =>
        `<tr><td>${item.name} x${item.quantity}</td><td style="text-align:right">${sym}${item.lineTotal.toFixed(2)}</td></tr>`
    )
    .join("");

  return `
    <div style="font-family: monospace; font-size: 12px; width: 280px;">
      <h3 style="text-align:center;margin:0">${payload.storeName}</h3>
      <p style="text-align:center;margin:4px 0">${payload.terminalId}</p>
      <p style="text-align:center;margin:0;font-size:10px">${new Date().toLocaleString()}</p>
      <hr/>
      <table style="width:100%">${lines}</table>
      <hr/>
      <p style="text-align:right"><strong>TOTAL ${sym}${payload.total.toFixed(2)}</strong></p>
      <p>Method: ${payload.paymentMethod}</p>
      ${payload.paymentReference ? `<p>Ref: ${payload.paymentReference}</p>` : ""}
      <p style="text-align:center;margin-top:12px">Thank you!</p>
    </div>
  `;
}

export async function listPrinters(): Promise<string[]> {
  try {
    const { PosPrinter } = require("electron-pos-printer") as {
      PosPrinter: { getPrinters: () => Promise<{ name: string }[]> };
    };
    const printers = await PosPrinter.getPrinters();
    return printers.map((p) => p.name);
  } catch {
    return ["Default Printer (stub)", "XP-80C (stub)"];
  }
}

export async function printReceipt(payload: ReceiptPayload): Promise<{ ok: boolean }> {
  const { printerName } = getTerminalConfig();
  const name = printerName || (await listPrinters())[0];

  if (!name || name.includes("(stub)")) {
    console.log("[cheko] Receipt print (stub):", payload.transactionId, payload.total);
    return { ok: true };
  }

  try {
    const { PosPrinter } = require("electron-pos-printer") as {
      PosPrinter: {
        print: (data: unknown[], opts: Record<string, unknown>) => Promise<void>;
      };
    };

    await PosPrinter.print(
      [{ type: "text", value: buildReceiptHtml(payload), style: { width: "280px" } }],
      {
        preview: false,
        silent: true,
        printerName: name,
        timeOutPerLine: 400,
        pageSize: "80mm",
      }
    );
    return { ok: true };
  } catch (err) {
    console.warn("[cheko] Print failed, stub OK:", err);
    return { ok: true };
  }
}

export async function openCashDrawer(): Promise<void> {
  const { printerName } = getTerminalConfig();
  const name = printerName || (await listPrinters())[0];

  if (!name || name.includes("(stub)")) {
    console.log("[cheko] Cash drawer kick (stub)");
    return;
  }

  try {
    const mod = require("electron-pos-printer") as {
      PosPrinter?: { openCashDrawer: (n: string, o: { pin: number }) => Promise<void> };
      openCashDrawer?: (n: string, o: { pin: number }) => Promise<void>;
    };
    const openFn = mod.openCashDrawer ?? mod.PosPrinter?.openCashDrawer;
    if (openFn) {
      await openFn(name, { pin: 2 });
    }
  } catch (err) {
    console.warn("[cheko] Drawer kick failed (stub):", err);
  }
}
