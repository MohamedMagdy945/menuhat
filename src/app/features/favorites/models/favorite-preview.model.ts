/**
 * Display fields of any product card (menu item, restaurant product, product details)
 * used to show a favorite instantly before the server list is reloaded.
 */
export interface FavoritePreview {
  productName?: string | null;
  productName_En?: string | null;
  name?: string | null;
  name_En?: string | null;
  menuId?: number | null;
  serial?: string | null;
  haveMoreInfo?: boolean | null;
  clientName?: string | null;
  clientName_En?: string | null;
  price?: number | null;
  oldPrice?: number | null;
  isOffer?: boolean | null;
  discountPercentage?: number | null;
  description?: string | null;
  description_En?: string | null;
  photoURL?: string | null;
}
