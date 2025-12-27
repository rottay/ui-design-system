/**
 * Layout Types
 */
import type { ReactNode, CSSProperties } from 'react';

/** Engine type for layout components */
type LayoutEngine = 'titan' | 'hermes' | 'apollo';

export interface LayoutProps {
  /** Whether the layout contains a Sider */
  hasSider?: boolean;
  /** Layout content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: LayoutEngine;
}

export interface LayoutHeaderProps {
  /** Custom header height */
  height?: number | string;
  /** Header content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: LayoutEngine;
}

export interface LayoutSiderProps {
  /** Width of the sidebar */
  width?: number | string;
  /** Width when collapsed */
  collapsedWidth?: number | string;
  /** Collapsed state (controlled) */
  collapsed?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Whether the sider is collapsible */
  collapsible?: boolean;
  /** Callback when collapse state changes */
  onCollapse?: (collapsed: boolean) => void;
  /** Custom trigger element */
  trigger?: ReactNode;
  /** Responsive breakpoint for auto-collapse */
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  /** Color theme of the sider */
  theme?: 'light' | 'dark';
  /** Sider content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: LayoutEngine;
}

export interface LayoutContentProps {
  /** Content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: LayoutEngine;
}

export interface LayoutFooterProps {
  /** Footer content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: LayoutEngine;
}

export const LAYOUT_DEFAULTS = {
  hasSider: false,
  siderWidth: 200,
  siderCollapsedWidth: 80,
  headerHeight: 64,
} as const;
