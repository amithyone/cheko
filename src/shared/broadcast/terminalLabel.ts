/** Terminal label for multi-POS picker (TERM-01 → "01"). */
export function formatTerminalPickerLabel(terminalId: string): string {
  const upper = terminalId.toUpperCase();
  if (upper.startsWith("TERM-")) {
    const suffix = terminalId.split("-").pop() ?? "";
    if (/^\d+$/.test(suffix)) return suffix.padStart(2, "0");
  }
  const digits = terminalId.replace(/\D/g, "");
  if (digits.length >= 1) return digits.slice(-2).padStart(2, "0");
  return terminalId.slice(0, 8);
}
