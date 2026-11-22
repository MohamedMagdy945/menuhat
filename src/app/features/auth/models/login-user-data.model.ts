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
  address?: string;
  cartMenuCount: number;
  token: string;
  defaultLang: string;
  businessOwner: any | null;
  isFreeTrail: boolean;
  isSubscriber: boolean;
}
