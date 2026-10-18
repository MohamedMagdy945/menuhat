export interface LoginUserData {
  isAuthenticated: boolean;
  fullName: string;
  username: string;
  email: string;
  userTypeId: number;
  uId: number;
  id: number;
  cityId: number;
  governmentId: number;
  cartMenuCount: number;
  token: string;
  defaultLang: string;
  businessOwner: any | null;
  isFreeTrail: boolean;
  isSubscriber: boolean;
}

export interface LoginResponse {
  message: string;
  data: LoginUserData;
}
