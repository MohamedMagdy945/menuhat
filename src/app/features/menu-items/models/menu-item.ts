export interface MenuItem {
  mostrequestesId: number;
  productName: string;
  productName_En: string | null;

  rowNo: number;
  no: number;

  description: string | null;
  description_En: string | null;

  photoURL: string | null;

  price: number;
  oldPrice: number;

  isOffer: boolean;
  isOfferProductPrice: boolean;
  discountPercentage: number;

  productAppearanceCount: number;
  haveMoreInfo: boolean;

  menuCategoryId: number;
  menuSubCategoryId: number;

  menuCategoryName: string;
  menuSubCategoryName: string;

  menuId: number;

  serial: string;

  clientName: string;
  clientName_En: string | null;

  latitude: number;
  longitude: number;

  isOpen: boolean;
  isHidden: boolean;
  statusOpen: number;

  distance: number;

  details: unknown[];
}
