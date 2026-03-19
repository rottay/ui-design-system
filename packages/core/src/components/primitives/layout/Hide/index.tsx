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

import React, { useId } from 'react';
import { RESPONSIVE_BREAKPOINTS } from '../../../../hooks/responsive/breakpoints';

// ---------------------------------------------------------------------------
// Breakpoint alias mapping (shared with Show)
// ---------------------------------------------------------------------------

const DEVICE_ALIASES = {
  phone: { min: 0, max: RESPONSIVE_BREAKPOINTS.sm - 1 },
  tablet: { min: RESPONSIVE_BREAKPOINTS.sm, max: RESPONSIVE_BREAKPOINTS.lg - 1 },
  desktop: { min: RESPONSIVE_BREAKPOINTS.lg, max: Infinity },
} as const;

type StandardBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type DeviceAlias = 'phone' | 'tablet' | 'desktop';
type Breakpoint = StandardBreakpoint | DeviceAlias;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HideProps {
  children: React.ReactNode;
  /** Hide content from this breakpoint and above (min-width). */
  from?: Breakpoint;
  /** Hide content below this breakpoint (max-width: breakpoint - 1). */
  below?: Breakpoint;
  /** Hide only on this specific device class. */
  on?: DeviceAlias;
  /** HTML element to render as. Defaults to `div`. */
  as?: 'div' | 'span';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveBreakpointPx(bp: Breakpoint): number {
  if (bp in DEVICE_ALIASES) {
    return DEVICE_ALIASES[bp as DeviceAlias].min;
  }
  return RESPONSIVE_BREAKPOINTS[bp as StandardBreakpoint];
}

/**
 * Builds the CSS media query string for a Hide component based on its props.
 * Returns `null` when no responsive constraint is specified (never hidden).
 */
export function buildHideMediaQuery(props: Pick<HideProps, 'from' | 'below' | 'on'>): string | null {
  const { from, below, on } = props;

  if (on) {
    const alias = DEVICE_ALIASES[on];
    if (alias.max === Infinity) {
      return `(min-width: ${alias.min}px)`;
    }
    if (alias.min === 0) {
      return `(max-width: ${alias.max}px)`;
    }
    return `(min-width: ${alias.min}px) and (max-width: ${alias.max}px)`;
  }

  if (from) {
    const px = resolveBreakpointPx(from);
    if (px === 0) return null; // hide from 0 means always hidden -- degenerate case
    return `(min-width: ${px}px)`;
  }

  if (below) {
    const px = resolveBreakpointPx(below);
    if (px === 0) return null;
    return `(max-width: ${px - 1}px)`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CSS-first conditional hiding component.
 *
 * Renders a wrapper element that is visible by default and becomes
 * `display: none !important` when the specified media query matches.
 * A colocated `<style>` tag ensures the rule is available before JS hydrates.
 */
export function Hide({ children, from, below, on, as: Tag = 'div' }: HideProps): React.ReactElement {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, '');
  const className = `ds-hide-${safeId}`;

  const mediaQuery = buildHideMediaQuery({ from, below, on });

  // When there is no responsive constraint the children are always visible
  if (mediaQuery === null) {
    return <Tag>{children}</Tag>;
  }

  const css = `@media ${mediaQuery} { .${className} { display: none !important; } }`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Tag className={className}>{children}</Tag>
    </>
  );
}

Hide.displayName = 'Hide';
