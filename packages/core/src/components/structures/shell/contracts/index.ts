/**
 * @fileoverview The shell group's contract: AppShell's slots, geometry and
 * adaptation, the posture and inset vocabulary every shell owner shares, and
 * the two `--ds-shell-*` bands the family resolves at runtime.
 *
 * THE `--ds-shell-*` SPLIT. The namespace carries three bands with different
 * audiences, and this file is where the first two are drawn:
 *
 *   PUBLISHED (`SHELL_PUBLISHED_CHANNELS`) — geometry and insets AppShell
 *   resolves at runtime and publishes on its root for anyone below it.
 *   Measured consumers outside this family: `skin/action-dock`,
 *   `skin/chat-surface`, `engines/modern/skin/layout`,
 *   `structures/dashboard/insights`, plus app-bithire, app-evnto and
 *   app-platform. A name in this band may not be renamed or dropped without
 *   moving those consumers first.
 *
 *   RESOLVED (`SHELL_RESOLVED_CHANNELS`) — values AppShell computes per
 *   instance from props, posture and the platform's `env()` readings. The
 *   skin floors them on the shell root so a server render is correct before
 *   hydration; nothing outside this family reads them.
 *
 * The third band is the family's chrome paint, and it belongs to the chrome
 * deriver (`derivation/chrome/app-shell`) and to nothing else. Resolved and
 * derived are disjoint, and together they cover every `--ds-shell-*` channel
 * the skin reads; `AppShell.cut.test.tsx` proves both halves.
 *
 * @module Components/Structures/Shell/Contracts
 */

import type { ReactNode, CSSProperties } from 'react';

import type { Adapt, ViewportPosture } from '@/foundation/contracts/kernel/adaptation';

/**
 * The shell's posture is the shared viewport vocabulary, not a second one.
 * The name survives because the structures barrel publishes it; the union it
 * used to spell does not.
 */
export type ShellPosture = ViewportPosture;

/** CSS length accepted by shell inset contracts. Numbers are interpreted as px. */
export type ShellInset = number | string;

/** Optional per-posture fixed-chrome insets. Missing tiers fall back to safe-area. */
export type ShellInsetByPosture = Partial<Record<ShellPosture, ShellInset>>;

// ---------------------------------------------------------------------------
// The channel bands
// ---------------------------------------------------------------------------

/** The channels AppShell publishes on its root for other owners to read. */
export const SHELL_PUBLISHED_CHANNELS = [
  '--ds-shell-safe-area-top',
  '--ds-shell-safe-area-right',
  '--ds-shell-safe-area-bottom',
  '--ds-shell-safe-area-left',
  '--ds-shell-header-height',
  '--ds-shell-top-inset',
  '--ds-shell-bottom-inset',
  '--ds-shell-inline-start-inset',
  '--ds-shell-inline-end-inset',
  '--ds-shell-sidebar-width',
  '--ds-shell-sidebar-collapsed-width',
  '--ds-shell-header-block-size',
  '--ds-shell-sidebar-header-block-size',
  '--ds-shell-collapse-transition',
] as const;

export type ShellPublishedChannel = (typeof SHELL_PUBLISHED_CHANNELS)[number];

/**
 * The per-instance values AppShell resolves and its own skin consumes. A
 * deriver never names one of these: a decision cannot answer a question whose
 * answer is a prop, a posture or a device inset.
 */
export const SHELL_RESOLVED_CHANNELS = [
  '--ds-shell-safe-area-top',
  '--ds-shell-safe-area-right',
  '--ds-shell-safe-area-bottom',
  '--ds-shell-safe-area-left',
  '--ds-shell-header-height',
  '--ds-shell-top-inset',
  '--ds-shell-bottom-inset',
  '--ds-shell-inline-start-inset',
  '--ds-shell-inline-end-inset',
  '--ds-shell-main-padding-block-start',
  '--ds-shell-main-padding-inline-start',
  '--ds-shell-main-padding-inline-end',
  '--ds-shell-resolved-main-transition',
  '--ds-shell-resolved-drawer-inline-size',
  '--ds-shell-resolved-sidebar-header-block-size',
  '--ds-shell-resolved-sidebar-header-min-block-size',
] as const;

export type ShellResolvedChannel = (typeof SHELL_RESOLVED_CHANNELS)[number];

/**
 * The four geometry reads the structure resolves with, each stating the same
 * chain `derivation/chrome/app-shell` produces for that channel.
 *
 * They exist because a resolution has to survive two places the derived value
 * cannot reach: a package consumed before the deriver is registered, and the
 * Sheet portal, which inherits from the document root rather than from the
 * shell. The fallback arm is dead wherever the channel has a producer, and
 * the deriver's contract suite pins these texts against the derived values so
 * the two cannot drift apart.
 */
export const SHELL_GEOMETRY_READS = {
  sidebarWidth: 'var(--ds-shell-sidebar-width, var(--ds-sidebar-width, 18.5rem))',
  sidebarCollapsedWidth:
    'var(--ds-shell-sidebar-collapsed-width, var(--ds-sidebar-collapsed-width, 6rem))',
  headerBlockSize: 'var(--ds-shell-header-block-size, var(--ds-shell-topbar-height, 4rem))',
  sidebarHeaderBlockSize:
    'var(--ds-shell-sidebar-header-block-size, var(--ds-sidebar-header-height, 6.5rem))',
} as const;

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
// Adaptation
// ---------------------------------------------------------------------------

/** How the shell presents its navigation at a posture. */
export type ShellNavigationPresentation = 'sidebar' | 'drawer';

/**
 * The shell's adaptation. An app declares deltas per posture, never a
 * threshold of its own: the family's own defaults put phone and tablet on the
 * overlay drawer, and an app that wants a fixed track on tablet says so here.
 */
export interface AppShellAdaptation {
  readonly navigation?: ShellNavigationPresentation;
}

export interface ResolvedAppShellAdaptation {
  readonly navigation: ShellNavigationPresentation;
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/**
 * Runtime geometry the app states. A stated value is written on the family's
 * own published channel, where it outranks both the derived floor and a
 * tenant's chrome — which is what a static-first vertical identity requires.
 * An omitted one leaves the channel to the theme, so the design system holds
 * no geometry number of its own.
 */
export interface ShellGeometry {
  /** Sidebar expanded width in px. Omit to take the theme's track. */
  sidebarWidth?: number;
  /** Sidebar collapsed width in px. Omit to take the theme's track. */
  sidebarCollapsedWidth?: number;
  /** Header height in px. Omit to take the theme's header block size. */
  headerHeight?: number;
  /** Logo area height inside the sidebar in px. Omit to take the theme's. */
  sidebarHeaderHeight?: number;
  /** Collapse transition (`<duration> <easing>`). Omit to take the motion dial. */
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

  // -- Adaptation -----------------------------------------------------------
  /** Per-posture deltas; the family's defaults drawer phone and tablet. */
  adapt?: Adapt<AppShellAdaptation>;

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

/**
 * The one shell default left in TypeScript: the platform's own safe-area
 * reading, which is a device fact rather than a visual decision. The five
 * geometry numbers that used to live here are decisions, and decisions belong
 * to `derivation/chrome/app-shell`.
 */
export const SHELL_DEFAULTS = {
  bottomInset: 'env(safe-area-inset-bottom, 0px)',
} as const;
