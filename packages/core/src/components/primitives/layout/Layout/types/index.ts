/**
 * Layout Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface LayoutProps {
  hasSider?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface LayoutHeaderProps {
  height?: number | string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface LayoutSiderProps {
  width?: number | string;
  collapsedWidth?: number | string;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  trigger?: ReactNode;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  theme?: 'light' | 'dark';
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface LayoutContentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface LayoutFooterProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const LAYOUT_DEFAULTS = {
  hasSider: false,
  siderWidth: 200,
  siderCollapsedWidth: 80,
  headerHeight: 64,
} as const;
