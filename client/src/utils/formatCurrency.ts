const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number | string | null | undefined): string {
  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount) ? currencyFormatter.format(numericAmount) : '—';
}
