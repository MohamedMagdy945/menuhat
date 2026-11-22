import { ProductPhotoPayload } from './product-photo-payload.model';
export interface CreateProductPayload {
  id?: number;
  name_Ar: string;
  name_En: string;
  specfication_Ar?: string;
  specfication_En?: string;
  brandId?: number;
  categoryId?: number;
  statusId?: number;
  modelName?: string;
  countryId?: number;
  oldPrice?: number;
  newPrice: number;
  isOffer?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  photo?: ProductPhotoPayload | null;
  selectedSystemImageUrl?: string | null;
  [key: string]: any;
}
