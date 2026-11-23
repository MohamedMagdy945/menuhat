/** Formats an order date as "05 مايو • 02:30 م" (year shown only when it is not the current year). */
export function formatOrderDate(raw: string | null | undefined): string {
  if (!raw) return '';
  // Already localized by the backend.
  if (/[؀-ۿ]/.test(raw)) return raw;

  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;

  const isCurrentYear = d.getFullYear() === new Date().getFullYear();
  const datePart = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    day: '2-digit',
    month: 'long',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  }).format(d);
  const timePart = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);

  return `${datePart} • ${timePart}`;
}
