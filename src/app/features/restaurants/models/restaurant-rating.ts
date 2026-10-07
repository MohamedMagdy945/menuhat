export interface RestaurantRatingResponse {
  items: RestaurantRating[];
}

export interface RestaurantRating {
  id: number;
  rowNo: number;
  userId: number;
  fullName: string;
  email: string;
  photoURL: string | null;
  menuId: number;
  serial: string;
  rate: number;
  comment: string;
  insertedDate: string;
  lastModifiedDate: string | null;
}
