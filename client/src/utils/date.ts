export function formatDateOnly(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0;

  return isUtcMidnight
    ? new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(date)
    : date.toLocaleDateString();
}
