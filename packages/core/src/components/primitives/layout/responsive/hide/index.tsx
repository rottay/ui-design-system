'use client';

/**
 * @fileoverview Hide Component - Rottay Design System
 * @description CSS-first conditional visibility component that hides children
 * at specified breakpoints using pure CSS media queries. The inverse of Show.
 * Works without JavaScript -- the server-rendered HTML includes a `<style>` tag
 * with the correct `@media` rule so the browser hides content before JS loads.
 *
 * @remarks
 * Hide accepts three mutually-informative props:
 * - `from` -- hide content from this breakpoint and above (min-width)
 * - `below` -- hide content below this breakpoint (max-width)
 * - `on` -- hide only on a specific device class (phone / tablet / desktop)
 *
 * The component reads from `RESPONSIVE_BREAKPOINTS` so all values stay in sync
 * with the rest of the design system's responsive scale.
 *
 * @example Hide on phone
 * ```tsx
 * <Hide on="phone">
 *   <SidebarNavigation />
 * </Hide>
 * ```
 *
 * @example Hide from desktop and above
 * ```tsx
 * <Hide from="desktop">
 *   <MobileOnlyBanner />
 * </Hide>
 * ```
 *
 * @example Hide below tablet
 * ```tsx
 * <Hide below="tablet">
 *   <DesktopOnlyWidget />
 * </Hide>
 * ```
 *
 * @see {@link Show} - Inverse of Hide
 * @see {@link RESPONSIVE_BREAKPOINTS} - Breakpoint scale
 * @module Hide
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

export interface HideProps {
  children: React.ReactNode;
  /** Hide content from this breakpoint and above (min-width). */
  from?: ResponsiveBreakpoint;
  /** Hide content below this breakpoint (max-width: breakpoint - 1). */
  below?: ResponsiveBreakpoint;
  /** Hide only on this specific device class. */
  on?: ResponsiveDeviceAlias;
  /** HTML element to render as. Defaults to `div`. */
  as?: 'div' | 'span';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the CSS media query string for a Hide component based on its props.
 * Returns `null` when no responsive constraint is specified (never hidden).
 */
export function buildHideMediaQuery(props: Pick<HideProps, 'from' | 'below' | 'on'>): string | null {
  return buildVisibilityMediaQuery(props);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CSS-first conditional hiding component.
 *
 * Renders a wrapper element that generates no box of its own while visible
 * (`display: contents`, mirroring Show's visible state) and becomes
 * `display: none !important` when the specified media query matches.
 * A colocated `<style>` tag ensures the rule is available before JS hydrates.
 */
export function Hide({ children, from, below, on, as: Tag = 'div' }: HideProps): React.ReactElement {
  return (
    <ResponsiveVisibility mode="hide" from={from} below={below} on={on} as={Tag}>
      {children}
    </ResponsiveVisibility>
  );
}

Hide.displayName = 'Hide';
