export function parseWeightBarcode(raw: string): {
  plu?: string;
  weightKg?: number;
  expiry?: string;
} | null {
  const trimmed = raw.trim();
  if (trimmed.length < 8) return null;

  const gs1Match = trimmed.match(/310(\d)(\d{6})/);
  if (gs1Match) {
    const decimals = parseInt(gs1Match[1], 10);
    const weightRaw = gs1Match[2];
    const weightKg = parseInt(weightRaw, 10) / Math.pow(10, decimals);
    return { weightKg };
  }

  if (/^\d{13}$/.test(trimmed)) {
    return { plu: trimmed.slice(2, 7) };
  }

  return null;
}
