import { LoginUserData } from './login-user-data.model';
export interface LoginResponse {
  message: string;
  data: LoginUserData;
}
