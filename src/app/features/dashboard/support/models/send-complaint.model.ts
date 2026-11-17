export interface SendComplaintPayload {
  id?: number;
  title: string;
  discription: string;
  phone: string;
  email: string;
  menuId?: number;
  base64Images?: string[];
}
