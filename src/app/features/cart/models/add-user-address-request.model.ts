/** Body of POST /UsersAddress (UsersAddressDTO). */
export interface AddUserAddressRequest {
  userId: number;
  governmentId: number;
  cityId: number;
  address: string;
}
