/** Body of PUT /Admin/PutMenu/{id} (ClientsMenusputDTO). Times are "HH:mm:ss". */
export interface AdminMenuUpdateRequest {
  id: number;
  clientName: string | null;
  clientName_En: string | null;
  governmentId: number;
  cityId: number;
  address: string | null;
  address_En: string | null;
  fieldId: number;
  orderConditionId: number;
  notes: string | null;
  hasNoImage: boolean | null;
  latitude: number | null;
  longitude: number | null;
  fromTime: string;
  toTime: string;
}
