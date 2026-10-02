'use client';

/**
 * @fileoverview GlassCard - Rottay Design System
 *
 * A glassmorphism container that applies backdrop blur, a translucent
 * background, and a subtle semi-transparent border to simulate frosted
 * glass. Its skin (`presentation/components/skin/glass-card`) paints from the
 * tenant glass channels (`--ds-glass-*`), so tenant theming needs no prop
 * changes; the props only feed the innermost fallback.
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
      className={className ? `ds-glass-card ${className}` : 'ds-glass-card'}
      data-part="root"
      style={{
        // The skin paints from the tenant glass channels; the props only feed
        // the innermost fallback for an untokenised page.
        ['--_ds-glass-card-blur' as string]: `${blur}px`,
        ['--_ds-glass-card-bg' as string]: `rgba(255, 255, 255, ${bgOpacity})`,
        ['--_ds-glass-card-border' as string]: `rgba(255, 255, 255, ${borderOpacity})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

GlassCard.displayName = 'GlassCard';
