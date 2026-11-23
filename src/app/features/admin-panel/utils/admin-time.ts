/** "10:00:00" → "10:00 ص", "23:59:59.997" → "11:59 م". */
export function formatAdminTime(value: string | null | undefined): string {
  if (!value) return '';
  const [h, m] = value.split(':').map((part) => parseInt(part, 10));
  if (isNaN(h) || isNaN(m)) return value;
  const period = h < 12 ? 'ص' : 'م';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/** Working-hours label; 00:00 → 23:59 reads as "24 ساعة", identical times as not set. */
export function formatWorkingHours(from: string | null, to: string | null): string {
  if (!from || !to) return '—';
  if (from.slice(0, 5) === to.slice(0, 5)) return 'غير محدد';
  const isFullDay = from.startsWith('00:00') && to.startsWith('23:59');
  if (isFullDay) return '24 ساعة';
  return `${formatAdminTime(from)} - ${formatAdminTime(to)}`;
}
