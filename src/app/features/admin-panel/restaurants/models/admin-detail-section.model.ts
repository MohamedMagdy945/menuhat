import { AdminDetailField } from './admin-detail-field.model';

/** A titled group of fields on the admin restaurant details page. */
export interface AdminDetailSection {
  title: string;
  icon: string;
  fields: AdminDetailField[];
}
