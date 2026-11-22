import { AppNotification } from './app-notification.model';

export interface NotificationsApiResponse {
  items?: AppNotification[];
  itemsCount?: number;
  totalPages?: number;
  result?: AppNotification[] | { items?: AppNotification[]; totalCount?: number };
  data?: AppNotification[];
  totalCount?: number;
  success?: boolean;
}
