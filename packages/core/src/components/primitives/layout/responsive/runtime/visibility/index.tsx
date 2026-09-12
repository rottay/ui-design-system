'use client';

/**
 * Shared CSS-first visibility runtime for the responsive layout family.
 * Show, Hide, and ResponsiveSlot own their public contracts while delegating
 * the boundary vocabulary to the responsive contract and the rules to the one
 * static sheet (`foundation/tokens/css/foundation/responsive/visibility`).
 */

import React from 'react';

import {
  RESPONSIVE_HIDE_ATTRIBUTE,
  RESPONSIVE_SHOW_ATTRIBUTE,
  responsiveVisibilityQuery,
  responsiveVisibilityToken,
  type ResponsiveDeviceAlias,
  type ResponsiveVisibilityBound,
  type ResponsiveVisibilityConstraints,
} from '@/foundation/contracts/kernel/responsive/visibility';

export type StandardResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type { ResponsiveDeviceAlias };
export type ResponsiveBreakpoint = ResponsiveVisibilityBound;
export type VisibilityConstraints = ResponsiveVisibilityConstraints;

interface ResponsiveVisibilityProps extends VisibilityConstraints {
  children: React.ReactNode;
  mode: 'show' | 'hide';
  as?: 'div' | 'span';
}

/** Build the media query shared by visible-at and hidden-at boundaries. */
export function buildVisibilityMediaQuery(
  constraints: VisibilityConstraints,
): string | null {
  return responsiveVisibilityQuery(constraints);
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
  const token = responsiveVisibilityToken({ from, below, on });

  if (token === null) return <Tag>{children}</Tag>;

  const attribute = mode === 'show' ? RESPONSIVE_SHOW_ATTRIBUTE : RESPONSIVE_HIDE_ATTRIBUTE;

  return <Tag {...{ [attribute]: token }}>{children}</Tag>;
}
