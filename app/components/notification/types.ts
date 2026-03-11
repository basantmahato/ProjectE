export type NotificationStatus = 'new' | 'read' | 'unread';

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  timeAgo: string;
  status: NotificationStatus;
  icon?: string; // icon name for MaterialIcons, or type for default icon
  type?: 'info' | 'success' | 'warning' | 'transaction';
}

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  primary: string;
  danger: string;
  success: string;
  accent: string;
};
