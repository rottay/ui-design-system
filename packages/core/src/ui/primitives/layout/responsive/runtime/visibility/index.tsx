'use client';

/**
 * Shared CSS-first visibility runtime for the responsive layout family.
 * Show, Hide, and ResponsiveSlot own their public contracts while delegating
 * media-query generation and wrapper rendering to this lower-level support.
 */

import React, { useId } from 'react';

import { RESPONSIVE_BREAKPOINTS } from '@/foundation/contracts/kernel/responsive/breakpoints';

export type StandardResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ResponsiveDeviceAlias = 'phone' | 'tablet' | 'desktop';
export type ResponsiveBreakpoint = StandardResponsiveBreakpoint | ResponsiveDeviceAlias;

export interface VisibilityConstraints {
  from?: ResponsiveBreakpoint;
  below?: ResponsiveBreakpoint;
  on?: ResponsiveDeviceAlias;
}

interface ResponsiveVisibilityProps extends VisibilityConstraints {
  children: React.ReactNode;
  mode: 'show' | 'hide';
  as?: 'div' | 'span';
}

const DEVICE_RANGES = {
  phone: { min: 0, max: RESPONSIVE_BREAKPOINTS.sm - 1 },
  tablet: { min: RESPONSIVE_BREAKPOINTS.sm, max: RESPONSIVE_BREAKPOINTS.lg - 1 },
  desktop: { min: RESPONSIVE_BREAKPOINTS.lg, max: Infinity },
} as const;

function resolveBreakpointPx(breakpoint: ResponsiveBreakpoint): number {
  if (breakpoint in DEVICE_RANGES) {
    return DEVICE_RANGES[breakpoint as ResponsiveDeviceAlias].min;
  }
  return RESPONSIVE_BREAKPOINTS[breakpoint as StandardResponsiveBreakpoint];
}

/** Build the media query shared by visible-at and hidden-at boundaries. */
export function buildVisibilityMediaQuery({
  from,
  below,
  on,
}: VisibilityConstraints): string | null {
  if (on) {
    const range = DEVICE_RANGES[on];
    if (range.max === Infinity) return `(min-width: ${range.min}px)`;
    if (range.min === 0) return `(max-width: ${range.max}px)`;
    return `(min-width: ${range.min}px) and (max-width: ${range.max}px)`;
  }

  if (from) {
    const pixels = resolveBreakpointPx(from);
    return pixels === 0 ? null : `(min-width: ${pixels}px)`;
  }

  if (below) {
    const pixels = resolveBreakpointPx(below);
    return pixels === 0 ? null : `(max-width: ${pixels - 1}px)`;
  }

  return null;
}

/** Render one CSS-first visibility boundary without viewport JavaScript. */
export function ResponsiveVisibility({
  children,
  mode,
  from,
  below,
  on,
  as: Tag = 'div',
}: ResponsiveVisibilityProps): React.ReactElement {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, '');
  const className = `ds-${mode}-${safeId}`;
  const mediaQuery = buildVisibilityMediaQuery({ from, below, on });

  if (mediaQuery === null) return <Tag>{children}</Tag>;

  const css = mode === 'show'
    ? `.${className} { display: none; }\n@media ${mediaQuery} { .${className} { display: contents; } }`
    : `@media ${mediaQuery} { .${className} { display: none !important; } }`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Tag className={className}>{children}</Tag>
    </>
  );
}
