import { ToastType } from './toast-type.model';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration: number;
}
