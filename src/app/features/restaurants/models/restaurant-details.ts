export interface RestaurantDetails {
  main: RestaurantDetailsMain;
  details: RestaurantMenuCategory[];
}

export interface RestaurantDetailsMain {
  id: number;
  no: number;
  serial: string;
  notes: string | null;
  clientName: string;
  clientName_En: string;
  createdDate: string;
  hasNoImage: boolean | null;
  logoURL: string | null;
  pdfURL: string | null;
  rate: number | null;
  visitsCount: number;
  latitude: number;
  longitude: number;
  fromTime: string;
  toTime: string;
  cityId: number;
  governmentId: number;
  city_Ar: string;
  city_En: string;
  government_Ar: string;
  government_En: string;
  fieldId: number;
  field_Ar: string;
  field_En: string;
  orderConditionId: number;
  orderConditions_Ar: string;
  orderConditions_En: string;
  isOpen: boolean;
  statusOpen: number;
  isVisable: boolean;
  isSubscription: boolean;
  straightDistance: number | null;
  drivingDistance: number | null;
  drivingDistanceValue: number | null;
  duration: number | null;
  durationValue: number | null;
}

export interface RestaurantMenuCategory {
  id: number;
  menuId: number;
  name: string;
  name_En: string;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  catOrder: number;
  subCategories: RestaurantMenuSubCategory[];
}

export interface RestaurantMenuSubCategory {
  id: number;
  no: number;
  name: string;
  name_En: string;
  menuCategoryId: number;
  catOrder: number;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  menuProducts: RestaurantMenuProduct[];
}

export interface RestaurantMenuProduct {
  id: number;
  no: number;
  serial: string;
  productName: string;
  productName_En: string | null;
  menuCategoryId: number;
  menuSubCategoryId: number;
  price: number;
  oldPrice: number;
  photoURL: string | null;
  description: string | null;
  description_En: string | null;
  isHidden: boolean;
  isOffer: boolean;
  discountPercentage: number;
  isFavorite: boolean;
  details: unknown[];
}
