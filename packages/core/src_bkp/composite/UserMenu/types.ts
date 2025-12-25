import type { AvatarProps } from '../../components/Display/Avatar/types';

export interface UserInfo {
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  avatarProps?: AvatarProps;
}

export interface UserMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface UserMenuProps {
  user: UserInfo;
  menuItems: UserMenuItem[];
  notificationCount?: number;
  showBadge?: boolean;
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight';
  trigger?: ('click' | 'hover')[];
  className?: string;
  style?: React.CSSProperties;
  onOpenChange?: (open: boolean) => void;
}
