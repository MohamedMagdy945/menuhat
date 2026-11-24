/**
 * Menu entity returned by PutMenu (`result`) and the logo/PDF upload endpoints (unwrapped).
 * Only the fields the admin pages read are typed.
 */
export interface AdminMenuRecord {
  id: number;
  logoURL: string | null;
  pdfURL: string | null;
}
