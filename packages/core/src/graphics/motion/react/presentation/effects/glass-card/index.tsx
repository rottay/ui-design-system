'use client';

/**
 * @fileoverview GlassCard - Rottay Design System
 *
 * A glassmorphism container that applies backdrop blur, a translucent
 * background, and a subtle semi-transparent border to simulate frosted
 * glass. All visual properties fall through to CSS custom properties
 * (`--ds-glass-*`) first, enabling tenant-level theming without prop
 * changes, then fall back to the inline defaults.
 *
 * @example
 * <GlassCard blur={16} bgOpacity={0.15}>
 *   <Text>Frosted content panel</Text>
 * </GlassCard>
 */

import React from 'react';
import type { GlassCardProps } from '@/graphics/motion/foundation/contracts';

/**
 * Frosted-glass container with configurable blur, background opacity,
 * and border opacity. Fully theme-aware via CSS custom properties.
 *
 * @param props - {@link GlassCardProps}
 * @param props.blur - Backdrop blur radius in pixels (default: 12).
 * @param props.bgOpacity - Opacity of the white background fill, 0-1 (default: 0.1).
 * @param props.borderOpacity - Opacity of the white border stroke, 0-1 (default: 0.2).
 * @param props.children - Content rendered inside the glass panel.
 * @param props.className - Optional CSS class for the outer container.
 * @param props.style - Optional inline styles merged onto the container.
 * @returns A styled div with glassmorphism visual treatment.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  blur = 12,
  bgOpacity = 0.1,
  borderOpacity = 0.2,
  children,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        // Both standard and WebKit-prefixed backdrop-filter are required
        // because Safari still needs the prefix as of 2025.
        backdropFilter: `blur(var(--ds-glass-blur, ${blur}px))`,
        WebkitBackdropFilter: `blur(var(--ds-glass-blur, ${blur}px))`,
        // Three-layer CSS variable cascade:
        //   1. --ds-glass-bg  (tenant/page override)
        //   2. --ds-color-alpha-white-10  (design-token alpha)
        //   3. rgba() fallback  (hard default for non-themed contexts)
        background: `var(--ds-glass-bg, var(--ds-color-alpha-white-10, rgba(255, 255, 255, ${bgOpacity})))`,
        border: `1px solid var(--ds-glass-border, var(--ds-color-alpha-white-20, rgba(255, 255, 255, ${borderOpacity})))`,
        borderRadius: 'var(--ds-radius-lg, 12px)',
        // overflow: hidden ensures child content respects the border-radius
        // rounding and doesn't bleed outside the frosted area.
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

GlassCard.displayName = 'GlassCard';
