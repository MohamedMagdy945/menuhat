/** One label/value row on the admin restaurant details page; `value: null` renders as "فارغ". */
export interface AdminDetailField {
  label: string;
  value: string | null;
  /** Render left-to-right (serials, numbers, English text). */
  ltr?: boolean;
  /** Span both grid columns (long text). */
  wide?: boolean;
}
