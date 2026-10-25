export interface RegisterRequest {
  userTypeId: number;
  fullName: string | null;
  mobile?: string | null;
  mobile2?: string | null;
  password: string | null;
  username: string | null;
  email: string | null;
  defaultLang?: string | null;
  photoURL?: string | null;
  governmentId: number | null;
  cityId: number | null;
  address: string | null;
  appId?: number | null;
}
