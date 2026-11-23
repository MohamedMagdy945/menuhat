import { AdminMenu } from './admin-menu.model';

/** AdminMenu plus the display values the restaurants table needs. */
export interface AdminRestaurantRow {
  menu: AdminMenu;
  logoUrl: string;
  pdfUrl: string;
  qrUrl: string;
  hours: string;
  location: string;
  createdLabel: string;
}
