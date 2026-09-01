/**
 * @fileoverview AppShell types — DS-owned shell contract.
 *
 * The shell is a structure-tier component that owns:
 * - Sidebar geometry (width, collapsed width, transitions)
 * - Header chrome (sticky, height, backdrop)
 * - Content offset and padding
 * - Phone/tablet responsive behavior (accessible overlay navigation)
 * - Safe-area and bottom-navigation insets
 *
 * The consuming app provides slot content for:
 * - Sidebar: logo, navigation menu, user footer
 * - Header: left, center, right sections
 * - Floating panels (radial menu, chat, etc.)
 */

import type { ReactNode, CSSProperties } from 'react';

/** Canonical shell posture derived from the shared responsive authority. */
export type ShellPosture = 'phone' | 'tablet' | 'desktop';

/** CSS length accepted by shell inset contracts. Numbers are interpreted as px. */
export type ShellInset = number | string;

/** Optional per-posture fixed-chrome insets. Missing tiers fall back to safe-area. */
export type ShellInsetByPosture = Partial<Record<ShellPosture, ShellInset>>;

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
  /** Accessible name for compact navigation and its trigger. @default 'Navigation' */
  navigationLabel?: string;
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
  /**
   * Total fixed chrome inset at the viewport bottom. AppShell publishes it as
   * `--ds-shell-bottom-inset` and reserves it exactly once around the main area.
   * It may be one value for every posture or a posture map. Missing posture
   * entries fall back to the device safe area. Include the safe area when
   * composing a bottom navigation value, for example
   * `{ phone: 'calc(58px + env(safe-area-inset-bottom, 0px))' }`.
   * @default 'env(safe-area-inset-bottom, 0px)'
   */
  bottomInset?: ShellInset | ShellInsetByPosture;
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
  bottomInset: 'env(safe-area-inset-bottom, 0px)',
} as const;
