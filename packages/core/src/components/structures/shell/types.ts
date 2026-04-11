/**
 * @fileoverview AppShell types — DS-owned shell contract.
 *
 * The shell is a structure-tier component that owns:
 * - Sidebar geometry (width, collapsed width, transitions)
 * - Header chrome (sticky, height, backdrop)
 * - Content offset and padding
 * - Mobile responsive behavior (overlay sidebar)
 *
 * The consuming app provides slot content for:
 * - Sidebar: logo, navigation menu, user footer
 * - Header: left, center, right sections
 * - Floating panels (radial menu, chat, etc.)
 */

import type { ReactNode, CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Sidebar slots
// ---------------------------------------------------------------------------

export interface ShellSidebarSlots {
  /** Logo/branding area at the top of the sidebar. */
  logo?: ReactNode;
  /** Navigation menu (fills the middle, scrollable). */
  nav?: ReactNode;
  /** User profile card at the bottom of the sidebar. */
  footer?: ReactNode;
}

// ---------------------------------------------------------------------------
// Header slots
// ---------------------------------------------------------------------------

export interface ShellHeaderSlots {
  /** Left area (e.g. breadcrumbs, badges). */
  left?: ReactNode;
  /** Center area (e.g. global search). */
  center?: ReactNode;
  /** Right area (e.g. action buttons). */
  right?: ReactNode;
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

export interface ShellGeometry {
  /** Sidebar expanded width in px. @default 296 */
  sidebarWidth?: number;
  /** Sidebar collapsed width in px. @default 96 */
  sidebarCollapsedWidth?: number;
  /** Header height in px. @default 64 */
  headerHeight?: number;
  /** Logo area height inside sidebar in px. @default 104 */
  sidebarHeaderHeight?: number;
  /** Collapse transition. @default '220ms cubic-bezier(0.16, 1, 0.3, 1)' */
  collapseTransition?: string;
}

// ---------------------------------------------------------------------------
// Main props
// ---------------------------------------------------------------------------

export interface AppShellProps {
  /** Sidebar slot content. Omit to render without a sidebar. */
  sidebar?: ShellSidebarSlots;
  /** Header slot content. Omit to render without a header. */
  header?: ShellHeaderSlots;
  /** Page content. */
  children: ReactNode;

  // -- Collapse state -------------------------------------------------------
  /** Controlled collapsed state. */
  collapsed?: boolean;
  /** Initial collapsed state (uncontrolled). @default false */
  defaultCollapsed?: boolean;
  /** Called when collapse state changes. */
  onCollapsedChange?: (collapsed: boolean) => void;

  // -- Geometry -------------------------------------------------------------
  /** Override shell geometry tokens. */
  geometry?: ShellGeometry;

  // -- Extras ---------------------------------------------------------------
  /** Floating panel rendered outside the main flow (e.g. radial menu, chat). */
  floatingContent?: ReactNode;
  /** Optional footer below the content area. */
  footer?: ReactNode;

  // -- Styling --------------------------------------------------------------
  className?: string;
  style?: CSSProperties;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const SHELL_DEFAULTS = {
  sidebarWidth: 296,
  sidebarCollapsedWidth: 96,
  headerHeight: 64,
  sidebarHeaderHeight: 104,
  collapseTransition: '220ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const;
