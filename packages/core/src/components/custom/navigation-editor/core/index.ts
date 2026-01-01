/**
 * NavigationEditor - Core Interface
 * Visual editor for navigation menus with role-based access control
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type NavigationEditorPreset = 'standard' | 'advanced';
export type EditorTab = 'structure' | 'roles' | 'policies' | 'preview';

export interface MenuItem {
  id: string;
  key: string;
  label: string;
  icon?: string;
  path?: string;
  visible: boolean;
  disabled: boolean;
  order: number;
  parentId?: string | null;
  children?: MenuItem[];
  roles?: string[];
  permissions?: string[];
  badge?: string;
  badgeColor?: string;
  target?: '_self' | '_blank';
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface MenuGroup {
  id: string;
  key: string;
  label: string;
  items: MenuItem[];
  order: number;
  collapsed?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isSystem?: boolean;
  permissions?: string[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface RoutePolicy {
  id: string;
  pattern: string;
  roles: string[];
  permissions: string[];
  redirectTo?: string;
  showInMenu: boolean;
}

export interface MenuItemFormData {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  visible: boolean;
  disabled: boolean;
  badge?: string;
  badgeColor?: string;
  target?: '_self' | '_blank';
  description?: string;
  roles?: string[];
  permissions?: string[];
}

export interface DragItem {
  id: string;
  type: 'menu-item';
  index: number;
  parentId?: string | null;
}

export interface NavigationEditorProps extends EngineAwareProps {
  preset?: NavigationEditorPreset;

  // Data
  items: MenuItem[];
  groups?: MenuGroup[];
  roles?: Role[];
  permissions?: Permission[];
  policies?: RoutePolicy[];

  // Selected state
  selectedItemId?: string | null;
  activeTab?: EditorTab;

  // Callbacks
  onItemsChange?: (items: MenuItem[]) => void;
  onGroupsChange?: (groups: MenuGroup[]) => void;
  onPoliciesChange?: (policies: RoutePolicy[]) => void;
  onItemSelect?: (item: MenuItem | null) => void;
  onTabChange?: (tab: EditorTab) => void;
  onItemCreate?: (data: MenuItemFormData, parentId?: string | null) => Promise<void>;
  onItemUpdate?: (id: string, data: MenuItemFormData) => Promise<void>;
  onItemDelete?: (id: string) => Promise<void>;
  onItemMove?: (id: string, newParentId: string | null, newIndex: number) => Promise<void>;
  onPolicyCreate?: (policy: Omit<RoutePolicy, 'id'>) => Promise<void>;
  onPolicyUpdate?: (id: string, policy: Partial<RoutePolicy>) => Promise<void>;
  onPolicyDelete?: (id: string) => Promise<void>;

  // Configuration
  maxDepth?: number;
  enableDragDrop?: boolean;
  enableSearch?: boolean;
  enablePreview?: boolean;
  previewRole?: string;
  loading?: boolean;

  // Custom render
  header?: ReactNode;
  footer?: ReactNode;
  emptyState?: ReactNode;
}

export const NAVIGATION_EDITOR_DEFAULTS: Partial<NavigationEditorProps> = {
  preset: 'standard',
  maxDepth: 3,
  enableDragDrop: true,
  enableSearch: true,
  enablePreview: true,
  activeTab: 'structure',
};

// Icon options for menu items
export const ICON_OPTIONS = [
  { value: 'dashboard', label: 'Dashboard', icon: 'AppstoreOutlined' },
  { value: 'users', label: 'Users', icon: 'TeamOutlined' },
  { value: 'settings', label: 'Settings', icon: 'SettingOutlined' },
  { value: 'home', label: 'Home', icon: 'HomeOutlined' },
  { value: 'folder', label: 'Folder', icon: 'FolderOutlined' },
  { value: 'file', label: 'File', icon: 'FileOutlined' },
  { value: 'chart', label: 'Chart', icon: 'LineChartOutlined' },
  { value: 'calendar', label: 'Calendar', icon: 'CalendarOutlined' },
  { value: 'mail', label: 'Mail', icon: 'MailOutlined' },
  { value: 'bell', label: 'Notifications', icon: 'BellOutlined' },
  { value: 'lock', label: 'Security', icon: 'LockOutlined' },
  { value: 'credit-card', label: 'Billing', icon: 'CreditCardOutlined' },
  { value: 'building', label: 'Company', icon: 'BankOutlined' },
  { value: 'shield', label: 'Shield', icon: 'SafetyCertificateOutlined' },
  { value: 'code', label: 'Code', icon: 'CodeOutlined' },
  { value: 'database', label: 'Database', icon: 'DatabaseOutlined' },
  { value: 'globe', label: 'Globe', icon: 'GlobalOutlined' },
  { value: 'star', label: 'Star', icon: 'StarOutlined' },
  { value: 'heart', label: 'Heart', icon: 'HeartOutlined' },
  { value: 'flag', label: 'Flag', icon: 'FlagOutlined' },
  { value: 'audit', label: 'Audit', icon: 'AuditOutlined' },
  { value: 'api', label: 'API', icon: 'ApiOutlined' },
  { value: 'apartment', label: 'Tenant', icon: 'ApartmentOutlined' },
  { value: 'solution', label: 'Solution', icon: 'SolutionOutlined' },
  { value: 'safety', label: 'Compliance', icon: 'SafetyOutlined' },
] as const;

export const BADGE_COLORS: Array<{ value: string; label: string }> = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'gold', label: 'Gold' },
  { value: 'magenta', label: 'Magenta' },
];
