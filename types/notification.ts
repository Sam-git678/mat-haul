export type NotificationItem = {
  id: string;
  userid?: string;
  usertype?: string;
  type?: string;
  title?: string;
  time?: string;
  message?: string;
  data?: Record<string, unknown> | null;
  isread?: 0 | 1 | boolean;
  is_unread?: boolean;
  readat?: string | null;
  createdat?: string;
  [key: string]: unknown;
};

export type NotificationsData = {
  data?: NotificationItem[];
  items?: NotificationItem[];
  page?: number;
  perPage?: number;
  total?: number;
  unread_count: number;
  [key: string]: unknown;
};

export type NotificationsResponse = {
  success: boolean;
  message?: string;
  data?: NotificationsData;
};

 
export type NotificationMarkReadData = null;
export type NotificationsMarkAllReadData = null;
