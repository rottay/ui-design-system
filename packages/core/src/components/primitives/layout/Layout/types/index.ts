/**
 * @fileoverview Layout Component Types - Rottay Design System
 * @description Type definitions for the Layout compound component including
 * props for Layout, Header, Sider, Content, and Footer sub-components.
 *
 * @remarks
 * The Layout types support:
 * - Main layout container with sider detection
 * - Header with customizable height
 * - Sider with collapsible behavior, responsive breakpoints, and theming
 * - Content with flexible growth
 * - Footer for bottom content
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   LayoutProps,
 *   LayoutHeaderProps,
 *   LayoutSiderProps,
 *   LayoutContentProps,
 *   LayoutFooterProps,
 * } from '@rottay/design-system';
 *
 * const siderConfig: LayoutSiderProps = {
 *   width: 240,
 *   collapsedWidth: 64,
 *   collapsible: true,
 *   theme: 'dark',
 * };
 * ```
 *
 * @module Layout/Types
 * @category Layout
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Supported rendering engines for Layout components.
 */
type LayoutEngine = 'classic' | 'modern' | 'rustic';

/**
 * Props for the main Layout container component.
 *
 * @interface LayoutProps
 * @example
 * ```tsx
 * <Layout hasSider className="app-layout">
 *   <Layout.Sider>...</Layout.Sider>
 *   <Layout>...</Layout>
 * </Layout>
 * ```
 */
export interface LayoutProps {
  /**
   * Whether the layout contains a Sider component.
   * Affects flex direction (row vs column).
   * @default false
   */
  hasSider?: boolean;

  /** Child components (Header, Sider, Content, Footer). */
  children?: ReactNode;

  /** Additional CSS class names. */
  className?: string;

  /** Inline CSS styles. */
  style?: CSSProperties;

  /**
   * Rendering engine override.
   * Overrides the engine from EngineProvider context.
   */
  engine?: LayoutEngine;
}

/**
 * Props for the Layout.Header sub-component.
 *
 * @interface LayoutHeaderProps
 * @example
 * ```tsx
 * <Layout.Header height={56} className="app-header">
 *   <Logo />
 *   <Navigation />
 * </Layout.Header>
 * ```
 */
export interface LayoutHeaderProps {
  /**
   * Custom header height.
   * Can be a number (pixels) or CSS string value.
   * @default 64
   */
  height?: number | string;

  /** Header content. */
  children?: ReactNode;

  /** Additional CSS class names. */
  className?: string;

  /** Inline CSS styles. */
  style?: CSSProperties;

  /** Rendering engine override. */
  engine?: LayoutEngine;
}

/**
 * Props for the Layout.Sider sub-component.
 * Supports collapsible sidebars with controlled/uncontrolled state.
 *
 * @interface LayoutSiderProps
 * @example
 * ```tsx
 * <Layout.Sider
 *   width={250}
 *   collapsedWidth={80}
 *   collapsible
 *   collapsed={isCollapsed}
 *   onCollapse={setIsCollapsed}
 *   theme="dark"
 *   breakpoint="lg"
 * >
 *   <Menu mode="inline" />
 * </Layout.Sider>
 * ```
 */
export interface LayoutSiderProps {
  /**
   * Width of the sidebar when expanded.
   * @default 200
   */
  width?: number | string;

  /**
   * Width of the sidebar when collapsed.
   * @default 80
   */
  collapsedWidth?: number | string;

  /**
   * Controlled collapsed state.
   * When provided, component becomes controlled.
   */
  collapsed?: boolean;

  /**
   * Initial collapsed state for uncontrolled usage.
   * @default false
   */
  defaultCollapsed?: boolean;

  /**
   * Whether the sider can be collapsed.
   * Shows a toggle trigger when true.
   * @default false
   */
  collapsible?: boolean;

  /**
   * Callback fired when collapse state changes.
   * @param collapsed - The new collapsed state
   */
  onCollapse?: (collapsed: boolean) => void;

  /**
   * Custom collapse trigger element.
   * Replaces the default arrow trigger.
   */
  trigger?: ReactNode;

  /**
   * Responsive breakpoint for auto-collapse.
   * Sider collapses when viewport is smaller than this breakpoint.
   */
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

  /**
   * Color theme of the sider.
   * @default 'light' (Modern) or 'dark' (Rustic)
   */
  theme?: 'light' | 'dark';

  /** Sider content. */
  children?: ReactNode;

  /** Additional CSS class names. */
  className?: string;

  /** Inline CSS styles. */
  style?: CSSProperties;

  /** Rendering engine override. */
  engine?: LayoutEngine;
}

/**
 * Props for the Layout.Content sub-component.
 *
 * @interface LayoutContentProps
 * @example
 * ```tsx
 * <Layout.Content className="main-content">
 *   <Outlet />
 * </Layout.Content>
 * ```
 */
export interface LayoutContentProps {
  /** Main content. */
  children?: ReactNode;

  /** Additional CSS class names. */
  className?: string;

  /** Inline CSS styles. */
  style?: CSSProperties;

  /** Rendering engine override. */
  engine?: LayoutEngine;
}

/**
 * Props for the Layout.Footer sub-component.
 *
 * @interface LayoutFooterProps
 * @example
 * ```tsx
 * <Layout.Footer className="app-footer">
 *   © 2024 Company Name. All rights reserved.
 * </Layout.Footer>
 * ```
 */
export interface LayoutFooterProps {
  /** Footer content. */
  children?: ReactNode;

  /** Additional CSS class names. */
  className?: string;

  /** Inline CSS styles. */
  style?: CSSProperties;

  /** Rendering engine override. */
  engine?: LayoutEngine;
}

/**
 * Default values for Layout component props.
 * Used when props are not explicitly provided.
 */
export const LAYOUT_DEFAULTS = {
  /** Whether layout contains a sider. */
  hasSider: false,
  /** Default sider width when expanded. */
  siderWidth: 200,
  /** Default sider width when collapsed. */
  siderCollapsedWidth: 80,
  /** Default header height in pixels. */
  headerHeight: 64,
} as const;
