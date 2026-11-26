import { AdminMenu } from '../../restaurants/models/admin-menu.model';

/** Restaurant picked in the add-category form (from the picker or preselected via `?menuId=`). */
export type AdminCategoryRestaurant = Pick<AdminMenu, 'serial' | 'clientName' | 'no' | 'logoURL'>;
