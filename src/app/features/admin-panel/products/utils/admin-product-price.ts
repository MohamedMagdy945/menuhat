import { AdminProductDetail } from '../models/admin-product-detail.model';

function formatPrice(value: number): string {
  return `${Number(value.toFixed(2))} ج.م`;
}

/** "25 ج.م" for a single price, "3 أحجام · من 20 ج.م" for sized products, "—" when unknown. */
export function formatAdminProductPrice(
  haveMoreInfo: boolean | null,
  price: number | null,
  details: AdminProductDetail[] | null,
): string {
  const sizes = (details ?? []).filter((d) => d.price != null);
  if (haveMoreInfo && sizes.length > 0) {
    const min = Math.min(...sizes.map((d) => d.price as number));
    if (sizes.length === 1) return formatPrice(min);
    const count = sizes.length === 2 ? 'حجمان' : `${sizes.length} أحجام`;
    return `${count} · من ${formatPrice(min)}`;
  }
  return price != null ? formatPrice(price) : '—';
}
