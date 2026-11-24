import { AdminMenuSerialMain } from './admin-menu-serial-main.model';

/** GET /Admin/GetMenus/{serial}: restaurant info plus its category → sub-category → product tree. */
export interface AdminMenuBySerial {
  main: AdminMenuSerialMain;
  /** Only the counts are used by the admin pages. */
  details: { subCategories: { menuProducts: unknown[] | null }[] | null }[] | null;
}
