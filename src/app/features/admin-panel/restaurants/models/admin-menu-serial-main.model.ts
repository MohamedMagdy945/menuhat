/** `main` of GET /Admin/GetMenus/{serial} (no address / orderConditionId — see GetMenu). */
export interface AdminMenuSerialMain {
  id: number;
  no: number;
  serial: string;
  notes: string | null;
  clientName: string;
  clientName_En: string | null;
  createdDate: string;
  hasNoImage: boolean | null;
  logoURL: string | null;
  pdfURL: string | null;
  rate: number | null;
  visitsCount: number;
  latitude: number | null;
  longitude: number | null;
  fromTime: string | null;
  toTime: string | null;
  cityId: number;
  governmentId: number;
  city_Ar: string | null;
  government_Ar: string | null;
  fieldId: number;
  field_Ar: string | null;
  isOpen: boolean | null;
  isVisable: boolean | null;
}
