export interface UserProfile {
  id: number;
  userTypeId?: number;
  fullName: string;
  email: string | null;
  mobile: string;
  defaultLang?: string;
  isInTop?: boolean;
  governmentId?: number;
  cityId?: number;
  address?: string | null;
  photo?: {
    base64String?: string;
    photoTitle?: string;
    photoDiscription?: string;
  } | null;
}

export interface UpdateProfileRequest {
  fullName: string;
  defaultLang: string;
}

export interface UserAddress {
  id?: number;
  userId?: number;
  governmentId?: number;
  cityId?: number;
  address?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPass: string;
}
