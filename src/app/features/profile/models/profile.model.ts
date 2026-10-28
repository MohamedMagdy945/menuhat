export interface UserProfile {
  id: number;
  userTypeId?: number;
  fullName: string;
  username?: string;
  email: string | null;
  mobile: string;
  photoURL?: string | null;
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
  defaultLang?: string;
}

export interface UserAddress {
  id?: number;
  userId?: number;
  governmentId?: number;
  cityId?: number;
  address?: string;
  title?: string;
  type?: 'home' | 'work' | 'other';
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPass: string;
}
