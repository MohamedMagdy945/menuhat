/** Item of GET /Admin/GetAllMenu (one restaurant menu). */
export interface AdminMenu {
  menuId: number;
  userId: number;
  no: number;
  serial: string;
  notes: string | null;
  clientName: string;
  clientName_En: string | null;
  governmentId: number;
  cityId: number;
  address: string | null;
  address_En: string | null;
  fieldId: number;
  createdDate: string;
  hasNoImage: boolean | null;
  logoURL: string | null;
  pdfURL: string | null;
  fromTime: string | null;
  toTime: string | null;
  isVisable: boolean | null;
  isOpen: boolean | null;
  qrCodePath: string | null;
  visitsCount: number;
}
