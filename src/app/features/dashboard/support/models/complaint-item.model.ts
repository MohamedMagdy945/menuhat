import { ComplaintStatus } from './complaint-status.model';

export interface ComplaintItem {
  id: number | string;
  code: string;
  title: string;
  phone: string;
  date: string;
  status: ComplaintStatus;
  discription: string;
  email?: string;
  menuId?: number;
  base64Images?: string[];
}
