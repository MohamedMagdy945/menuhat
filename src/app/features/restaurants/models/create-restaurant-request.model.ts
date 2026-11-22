import { Base64FilePayload } from './base64-file-payload.model';

export interface CreateRestaurantRequest {
  clientName: string;
  clientName_En?: string;
  governmentId: number;
  cityId: number;
  address: string;
  address_En?: string;
  fieldId: number;
  orderConditionId: number;
  latitude: number;
  longitude: number;
  pdfURL?: Base64FilePayload | null;
  logoURL?: Base64FilePayload | null;
  coverURL?: Base64FilePayload | null;
  fromTime?: string | null;
  toTime?: string | null;
  notes?: string;
  isVisable: boolean;
}
