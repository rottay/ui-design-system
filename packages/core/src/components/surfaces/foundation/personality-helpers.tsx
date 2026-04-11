'use client';

/**
 * @fileoverview Personality rendering helpers for the surface layer.
 * @description Translates personality profile defaults into concrete visual
 * elements: accent bars (solid/gradient/animated), heading weights, label text
 * transforms, and section spacing. Each surface composes these helpers rather
 * than reimplementing personality-driven differentiation.
 */

import React from 'react';
import { Box } from '../../primitives';
import type { SurfaceSectionSpacing, ResolvedSurfaceProfileDefaults } from './profile-defaults';

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

export function SurfaceAccentBar({
  position,
  thickness,
  barStyle,
}: AccentBarProps): React.ReactElement | null {
  if (position === 'none') {
    return null;
  }

  const isTop = position === 'top';

  // The bar is absolutely positioned inside its container so it does not
  // affect content flow. The container must have position:relative and
  // overflow:hidden (handled by SurfaceAccentBarWrapper).
  const baseStyle: React.CSSProperties = {
    position: 'absolute' as const,
    // Gradient falls back to primary-only when --ds-color-secondary is not
    // defined, keeping single-brand products visually clean.
    background:
      barStyle === 'gradient'
        ? 'linear-gradient(90deg, var(--ds-color-primary), var(--ds-color-secondary, var(--ds-color-primary)))'
        : 'var(--ds-color-primary)',
    borderRadius: isTop ? `${thickness}px ${thickness}px 0 0` : `${thickness}px 0 0 ${thickness}px`,
    ...(isTop
      ? { top: 0, left: 0, right: 0, height: thickness }
      : { top: 0, left: 0, bottom: 0, width: thickness }),
  };

  // Animated style uses a wider gradient (200%) that shifts via keyframes,
  // creating a shimmer effect. The keyframe `ds-accent-bar-shimmer` must be
  // defined in the global DS stylesheet.
  if (barStyle === 'animated') {
    baseStyle.backgroundSize = '200% 100%';
    baseStyle.background =
      'linear-gradient(90deg, var(--ds-color-primary), var(--ds-color-secondary, var(--ds-color-primary)), var(--ds-color-primary))';
    baseStyle.animation = 'ds-accent-bar-shimmer 3s ease-in-out infinite';
  }

  return <Box style={baseStyle} aria-hidden />;
}

/**
 * Wraps children in an accent-bar-aware container when accent position is not
 * "none". Returns children unchanged when no accent is needed.
 */
export function SurfaceAccentBarWrapper({
  children,
  defaults,
}: {
  children: React.ReactNode;
  defaults: ResolvedSurfaceProfileDefaults;
}): React.ReactElement {
  if (defaults.accentPosition === 'none') {
    return <>{children}</>;
  }

  return (
    <Box style={{ position: 'relative', overflow: 'hidden' }}>
      <SurfaceAccentBar
        position={defaults.accentPosition}
        thickness={defaults.accentBarThickness}
        barStyle={defaults.accentBarStyle}
      />
      <Box
        style={{
          ...(defaults.accentPosition === 'left'
            ? { paddingLeft: defaults.accentBarThickness + 4 }
            : { paddingTop: defaults.accentBarThickness }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
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
