export interface AppNotification {
  id: number;
  rowNo?: number;
  userId?: number;
  fullName?: string;
  title?: string;
  title_Ar?: string;
  title_En?: string;
  description_Ar?: string;
  description_En?: string;
  description?: string;
  message?: string;
  body?: string;
  date?: string;
  createdDate?: string;
  createDate?: string;
  photo?: string | null;
  screenId?: number;
  orderId?: number | null;
  serial?: string | null;
  orderSerial?: string | null;
  name?: string;
  joString?: string;
  isReaded?: boolean;
  isRead?: boolean;
  icon?: string;
  type?: 'order' | 'offer' | 'menu' | 'system' | string;
}

export interface NotificationsApiResponse {
  items?: AppNotification[];
  itemsCount?: number;
  totalPages?: number;
  result?: AppNotification[] | { items?: AppNotification[]; totalCount?: number };
  data?: AppNotification[];
  totalCount?: number;
  success?: boolean;
}
