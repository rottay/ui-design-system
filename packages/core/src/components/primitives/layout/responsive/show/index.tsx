'use client';

/**
 * @fileoverview Show Component - Rottay Design System
 * @description CSS-first conditional visibility component that renders children
 * only at specified breakpoints using pure CSS media queries. Works without
 * JavaScript -- the server-rendered HTML includes a `<style>` tag with the
 * correct `@media` rule so the browser applies visibility before any JS loads.
 *
 * @remarks
 * Show accepts three mutually-informative props:
 * - `from` -- show content from this breakpoint and above (min-width)
 * - `below` -- show content below this breakpoint (max-width)
 * - `on` -- show only on a specific device class (phone / tablet / desktop)
 *
 * The component reads from `RESPONSIVE_BREAKPOINTS` so all values stay in sync
 * with the rest of the design system's responsive scale.
 *
 * @example Show on tablet and above
 * ```tsx
 * <Show from="tablet">
 *   <DesktopNavigation />
 * </Show>
 * ```
 *
 * @example Show only on phone
 * ```tsx
 * <Show on="phone">
 *   <MobileMenu />
 * </Show>
 * ```
 *
 * @example Show below desktop
 * ```tsx
 * <Show below="desktop">
 *   <TabletLayout />
 * </Show>
 * ```
 *
 * @see {@link Hide} - Inverse of Show
 * @see {@link RESPONSIVE_BREAKPOINTS} - Breakpoint scale
 * @module Show
 * @category Layout
 * @package @rottay/design-system
 */

import React from 'react';

import {
  ResponsiveVisibility,
  buildVisibilityMediaQuery,
  type ResponsiveBreakpoint,
  type ResponsiveDeviceAlias,
} from '../runtime/visibility';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ShowProps {
  children: React.ReactNode;
  /** Show content from this breakpoint and above (min-width). */
  from?: ResponsiveBreakpoint;
  /** Show content below this breakpoint (max-width: breakpoint - 1). */
  below?: ResponsiveBreakpoint;
  /** Show only on this specific device class. */
  on?: ResponsiveDeviceAlias;
  /** HTML element to render as. Defaults to `div`. */
  as?: 'div' | 'span';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the CSS media query string for a Show component based on its props.
 * Returns `null` when no responsive constraint is specified (always visible).
 */
export function buildShowMediaQuery(props: Pick<ShowProps, 'from' | 'below' | 'on'>): string | null {
  return buildVisibilityMediaQuery(props);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CSS-first conditional visibility component.
 *
 * Renders a wrapper element that is `display: none` by default and becomes
 * `display: contents` when the specified media query matches. A colocated
 * `<style>` tag ensures the rule is available before JavaScript hydrates.
 */
export function Show({ children, from, below, on, as: Tag = 'div' }: ShowProps): React.ReactElement {
  return (
    <ResponsiveVisibility mode="show" from={from} below={below} on={on} as={Tag}>
      {children}
    </ResponsiveVisibility>
  );
}

Show.displayName = 'Show';
