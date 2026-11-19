export interface AddMenuProductDetailPayload {
  id?: number;
  oneClickParentId?: string | null;
  oneClickProductId?: string | null;
  title: string;
  title_En?: string | null;
  price: number;
}

export interface AddMenuProductPhotoPayload {
  base64String: string;
}

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
