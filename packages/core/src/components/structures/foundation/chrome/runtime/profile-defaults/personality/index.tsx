'use client';

/**
 * @fileoverview Personality rendering helpers for the surface layer.
 * @description Translates personality profile defaults into concrete visual
 * decisions such as heading weights, label text transforms, and section
 * spacing. White-label differentiation must come from semantic surface
 * recipes, never from a colored edge rail.
 */

import type React from 'react';
import type { SurfaceSectionSpacing } from '..';

// ---------------------------------------------------------------------------
// Section spacing
// ---------------------------------------------------------------------------

const SECTION_SPACING_MAP: Record<SurfaceSectionSpacing, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export function resolveStackSpacing(sectionSpacing: SurfaceSectionSpacing): 'sm' | 'md' | 'lg' {
  return SECTION_SPACING_MAP[sectionSpacing];
}

// ---------------------------------------------------------------------------
// Heading weight
// ---------------------------------------------------------------------------

export function resolveHeadingFontWeight(bias: 'lighter' | 'normal' | 'heavier'): number {
  switch (bias) {
    case 'lighter':
      return 500;
    case 'heavier':
      return 800;
    case 'normal':
    default:
      return 600;
  }
}

// ---------------------------------------------------------------------------
// Accent bar
// ---------------------------------------------------------------------------

export interface AccentBarProps {
  position: 'top' | 'left' | 'none';
  thickness: number;
  barStyle: 'solid' | 'gradient' | 'animated';
}

// ---------------------------------------------------------------------------
// Label text transform
// ---------------------------------------------------------------------------

export function resolveLabelTextTransform(
  labelStyle: 'uppercase' | 'sentence' | 'capitalize'
): React.CSSProperties['textTransform'] {
  switch (labelStyle) {
    case 'uppercase':
      return 'uppercase';
    case 'capitalize':
      return 'capitalize';
    case 'sentence':
    default:
      return 'none';
  }
}
