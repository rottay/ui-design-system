import type { ReactNode, CSSProperties } from 'react';

export interface DashboardLayoutProps {
  /** Child elements (main content) */
  children: ReactNode;

  /** Logo element or image source */
  logo?: ReactNode | string;

  /** Sidebar menu items */
  menuItems?: MenuItem[];

  /** Header right content (user menu, notifications, etc.) */
  headerRight?: ReactNode;

  /** Footer content */
  footer?: ReactNode;

  /** Sidebar collapsed by default */
  defaultCollapsed?: boolean;

  /** Show footer */
  showFooter?: boolean;

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Callback when menu item is clicked */
  onMenuClick?: (key: string) => void;
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  children?: MenuItem[];
  disabled?: boolean;
}
