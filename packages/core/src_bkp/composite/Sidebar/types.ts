export interface SidebarItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  badge?: string | number;
}

export interface SidebarGroup {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  groups: SidebarGroup[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  activeKey?: string;
  onItemClick?: (item: SidebarItem) => void;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  collapsedWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}
