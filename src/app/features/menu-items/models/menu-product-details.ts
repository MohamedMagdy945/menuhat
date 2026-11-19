import { ProductDetailItem } from './product-detail-item';

export interface MenuProductDetails {
  id: number;
  no: number;
  name: string;
  name_En: string | null;
  menuCategoryId: number;
  menuSubCategoryId: number;
  price: number | null;
  oldPrice: number | null;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  haveMoreInfo: boolean;
  isOffer: boolean;
  discountPercentage: number | null;
  details: ProductDetailItem[];
  productName?: string;
  serial?: string;
  clientName?: string;
  menuCategoryName?: string;
}
