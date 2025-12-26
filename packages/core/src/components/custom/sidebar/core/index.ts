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
}

export const SIDEBAR_DEFAULTS: Partial<SidebarProps> = {
  preset: 'standard',
  width: 260,
  collapsedWidth: 72,
};
