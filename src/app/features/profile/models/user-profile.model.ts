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
