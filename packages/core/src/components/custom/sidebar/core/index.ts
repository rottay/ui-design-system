/**
 * Sidebar - Core Interface
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type SidebarPreset = 'slim' | 'standard' | 'collapsible';

export interface SidebarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: SidebarItem[];
  /** When true, renders as a section header/divider instead of a clickable item */
  disabled?: boolean;
}

export interface SidebarProps extends EngineAwareProps {
  preset?: SidebarPreset;
  items: SidebarItem[];
  activeKey?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  header?: ReactNode;
  footer?: ReactNode;
  width?: number;
  collapsedWidth?: number;
  /** Spacing between sidebar items. Defaults to 'xs'. Use 'sm', 'md', 'lg', etc. for more space */
  itemSpacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const SIDEBAR_DEFAULTS: Partial<SidebarProps> = {
  preset: 'standard',
  width: 260,
  collapsedWidth: 72,
};
