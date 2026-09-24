import { HttpContextToken } from '@angular/common/http';

export const USE_GLOBAL_LOADING =
  new HttpContextToken<boolean>(() => false);