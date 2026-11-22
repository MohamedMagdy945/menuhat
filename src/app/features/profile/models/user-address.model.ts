export interface UserAddress {
  id?: number;
  userId?: number;
  governmentId?: number;
  cityId?: number;
  address?: string;
  title?: string;
  type?: 'home' | 'work' | 'other';
}
