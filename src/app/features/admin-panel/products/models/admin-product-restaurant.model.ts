import { AdminMenu } from '../../restaurants/models/admin-menu.model';

/** Restaurant chosen in the product form (picker, `?menuId=` or derived from a category). */
export type AdminProductRestaurant = Pick<
  AdminMenu,
  'menuId' | 'serial' | 'clientName' | 'no' | 'logoURL'
>;
