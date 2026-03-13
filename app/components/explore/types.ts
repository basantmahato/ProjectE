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

export interface AchievementItem {
  id: string;
  label: string;
  icon: 'star' | 'code' | 'emoji-events' | 'workspace-premium';
  accentColor: string; // from theme or custom
  unlocked?: boolean; // when false, show as locked (muted)
}

export interface ActivityItem {
  id: string;
  title: string;
  timeAgo: string;
  dotColor: string;
}
