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

import React, { useId } from 'react';
import { RESPONSIVE_BREAKPOINTS } from '../../../../hooks/responsive/breakpoints';

// ---------------------------------------------------------------------------
// Breakpoint alias mapping
// ---------------------------------------------------------------------------

/**
 * Device-class aliases mapped to the underlying breakpoint scale.
 *
 * - phone:   0 -- 639px  (max-width: 639px)
 * - tablet:  640 -- 1023px (min-width: 640px) and (max-width: 1023px)
 * - desktop: 1024px+     (min-width: 1024px)
 */
const DEVICE_ALIASES = {
  phone: { min: 0, max: RESPONSIVE_BREAKPOINTS.sm - 1 },
  tablet: { min: RESPONSIVE_BREAKPOINTS.sm, max: RESPONSIVE_BREAKPOINTS.lg - 1 },
  desktop: { min: RESPONSIVE_BREAKPOINTS.lg, max: Infinity },
} as const;

/** Standard breakpoint keys from the responsive scale (excludes xs which is 0). */
type StandardBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Device-class alias keys. */
type DeviceAlias = 'phone' | 'tablet' | 'desktop';

/** All accepted breakpoint identifiers. */
type Breakpoint = StandardBreakpoint | DeviceAlias;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ShowProps {
  children: React.ReactNode;
  /** Show content from this breakpoint and above (min-width). */
  from?: Breakpoint;
  /** Show content below this breakpoint (max-width: breakpoint - 1). */
  below?: Breakpoint;
  /** Show only on this specific device class. */
  on?: DeviceAlias;
  /** HTML element to render as. Defaults to `div`. */
  as?: 'div' | 'span';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves a breakpoint identifier to its pixel value.
 * Device aliases resolve to their lower bound (min).
 */
function resolveBreakpointPx(bp: Breakpoint): number {
  if (bp in DEVICE_ALIASES) {
    return DEVICE_ALIASES[bp as DeviceAlias].min;
  }
  return RESPONSIVE_BREAKPOINTS[bp as StandardBreakpoint];
}

/**
 * Builds the CSS media query string for a Show component based on its props.
 * Returns `null` when no responsive constraint is specified (always visible).
 */
export function buildShowMediaQuery(props: Pick<ShowProps, 'from' | 'below' | 'on'>): string | null {
  const { from, below, on } = props;

  // `on` takes highest precedence -- bounded range for the device class
  if (on) {
    const alias = DEVICE_ALIASES[on];
    if (alias.max === Infinity) {
      // desktop: only min-width
      return `(min-width: ${alias.min}px)`;
    }
    if (alias.min === 0) {
      // phone: only max-width
      return `(max-width: ${alias.max}px)`;
    }
    // tablet: bounded range
    return `(min-width: ${alias.min}px) and (max-width: ${alias.max}px)`;
  }

  // `from` -- min-width
  if (from) {
    const px = resolveBreakpointPx(from);
    if (px === 0) return null; // always visible from 0
    return `(min-width: ${px}px)`;
  }

  // `below` -- max-width (breakpoint - 1)
  if (below) {
    const px = resolveBreakpointPx(below);
    if (px === 0) return null; // below 0 is never visible, but treat as always visible
    return `(max-width: ${px - 1}px)`;
  }

  // No constraint -- always visible
  return null;
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
  const reactId = useId();
  // CSS class names cannot contain colons, so strip them from the React ID
  const safeId = reactId.replace(/:/g, '');
  const className = `ds-show-${safeId}`;

  const mediaQuery = buildShowMediaQuery({ from, below, on });

  // When there is no responsive constraint the children are always visible
  if (mediaQuery === null) {
    return <Tag>{children}</Tag>;
  }

  const css = `.${className} { display: none; }\n@media ${mediaQuery} { .${className} { display: contents; } }`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Tag className={className}>{children}</Tag>
    </>
  );
}

Show.displayName = 'Show';
