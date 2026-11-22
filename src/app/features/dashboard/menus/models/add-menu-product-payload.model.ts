import { AddMenuProductPhotoPayload } from './add-menu-product-photo-payload.model';
import { AddMenuProductDetailPayload } from './add-menu-product-detail-payload.model';
export interface AddMenuProductPayload {
  name: string;
  name_En?: string;
  menuCategoryId: number;
  menuSubCategoryId: number;
  price: number;
  description?: string;
  description_En?: string;
  haveMoreInfo?: boolean;
  photoURL?: AddMenuProductPhotoPayload | null;
  details?: AddMenuProductDetailPayload[];
  selectedSystemImageId?: number;
}
