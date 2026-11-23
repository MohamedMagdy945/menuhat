/** Item of GET /Profile/GetAddressByUserId. */
export interface CheckoutAddress {
  id: number;
  rowNo?: number;
  userId: number;
  fullName: string | null;
  governmentId: number;
  govenmentName_Ar: string | null;
  govenmentName_En: string | null;
  cityId: number;
  cityName_Ar: string | null;
  cityName_En: string | null;
  address: string | null;
}
