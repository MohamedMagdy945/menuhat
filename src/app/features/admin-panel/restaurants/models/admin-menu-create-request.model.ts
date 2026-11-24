import { AdminMenuFilePayload } from './admin-menu-file-payload.model';

/** Body of POST /Admin/PostMenu (AdminPostClientsMenusDTO). Times are "HH:mm:ss". */
export interface AdminMenuCreateRequest {
  userId: number;
  clientName: string;
  clientName_En: string | null;
  governmentId: number;
  cityId: number;
  address: string | null;
  address_En: string | null;
  fieldId: number;
  orderConditionId: number;
  latitude: number | null;
  longitude: number | null;
  pdfURL: AdminMenuFilePayload | null;
  logoURL: AdminMenuFilePayload | null;
  coverURL: AdminMenuFilePayload | null;
  fromTime: string;
  toTime: string;
  notes: string | null;
  isVisable: boolean;
  deliveryCompanies: [];
}
