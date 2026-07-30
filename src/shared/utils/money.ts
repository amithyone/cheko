export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(
  amount: number,
  currencySymbol: string,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options ?? {};
  return `${currencySymbol}${amount.toLocaleString("en-US", { minimumFractionDigits, maximumFractionDigits })}`;
}
