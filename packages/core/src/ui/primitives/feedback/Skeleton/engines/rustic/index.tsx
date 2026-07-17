/**
 * @fileoverview Skeleton Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Skeleton component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Rustic is the headless, zero-dependency engine that uses only vanilla
 * HTML, CSS, and React. It provides the smallest bundle size and maximum
 * control over styling and behavior.
 *
 * **Key Features:**
 * - Zero external dependencies (no UI library)
 * - Custom CSS keyframe animations
 * - Smallest bundle footprint
 * - Full CSS custom property support
 * - Semantic HTML structure
 *
 * **When to Use Rustic:**
 * - When bundle size is critical
 * - For accessibility-focused applications
 * - When full styling control is needed
 * - For custom design systems built on Rottay
 * - When avoiding third-party UI libraries
 *
 * **Multi-Tenant Theming:**
 * Rustic uses inline CSS and custom properties for theming.
 * Animation keyframes are injected via style tags.
 *
 * **Animation Types:**
 * | Animation | Effect |
 * |-----------|--------|
 * | pulse | Opacity fade in/out |
 * | wave | Gradient shimmer effect |
 * | false | No animation |
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * <Skeleton engine="rustic" active avatar paragraph title />
 * ```
 *
 * @example With Custom Styling
 * ```tsx
 * <Skeleton
 *   engine="rustic"
 *   variant="rectangular"
 *   width="100%"
 *   height={200}
 *   animation="wave"
 * />
 * ```
 *
 * @see {@link SkeletonProps} - Component props interface
 * @see {@link ClassicSkeleton} - Ant Design alternative
 * @see {@link ModernSkeleton} - DaisyUI alternative
 * @module Skeleton/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { SkeletonProps } from '../../contracts';
import { SKELETON_DEFAULTS } from '../../contracts';

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic Engine implementation of the Skeleton component.
 *
 * @description
 * Pure vanilla implementation using only HTML, CSS, and React.
 * Provides complete control over styling through inline styles
 * and CSS keyframe animations.
 *
 * @remarks
 * **Implementation Details:**
 * - Injects CSS keyframes via style tags
 * - Supports pulse and wave animations
 * - Uses flexbox for layout structure
 * - Dynamic border-radius for shape variants
 *
 * **CSS Keyframes (defined in the unlayered rustic Skeleton skin):**
 * - `ds-skeleton-pulse-rustic`: Opacity animation 1-0.4-1
 * - `ds-skeleton-wave-rustic`: Background position animation
 *
 * **Accessibility Features:**
 * - Semantic div structure
 * - ARIA attributes can be added via spread props
 * - High contrast friendly with opacity-based animation
 *
 * @param props - {@link SkeletonProps}
 * @returns The rendered vanilla Skeleton
 *
 * @example
 * ```tsx
 * <RusticSkeleton
 *   active
 *   animation="pulse"
 *   avatar
 *   avatarSize={48}
 *   paragraph={{ rows: 3 }}
 *   title
 * />
 * ```
 */
export default function RusticSkeleton(props: SkeletonProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Appearance
    variant = SKELETON_DEFAULTS.variant,
    width,
    height,

    // Animation
    animation = SKELETON_DEFAULTS.animation,
    active = SKELETON_DEFAULTS.active,

    // Text configuration
    rows = SKELETON_DEFAULTS.rows,

    // Avatar configuration
    avatar,
    avatarSize = SKELETON_DEFAULTS.avatarSize,
    avatarShape = SKELETON_DEFAULTS.avatarShape,

    // Content structure
    paragraph,
    title,

    // Styling
    className = '',
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Animation Styles
  // ---------------------------------------------------------------------------

  /**
   * Generate animation styles based on animation type.
   * Returns empty object if animation is disabled.
   */
  const getAnimationStyle = (): React.CSSProperties => {
    if (!active || !animation) return {};

    if (animation === 'pulse') {
      return { animation: 'ds-skeleton-pulse-rustic 1.5s ease-in-out infinite' };
    }

    // Wave: the sliding gradient background + its 400% sizing paint from the
    // rustic Skeleton skin (keyed on data-animation='wave'); only the animation
    // reference — which drives the background-position slide — stays inline.
    return { animation: 'ds-skeleton-wave-rustic 1.4s ease-in-out infinite' };
  };

  // ---------------------------------------------------------------------------
  // Base Styles
  // ---------------------------------------------------------------------------

  /**
   * Base skeleton element styles. The tenant background-color and (for wave) the
   * gradient background paint from the unlayered rustic Skeleton skin; only the
   * animation reference stays inline. Blocks carry `data-animation` so the skin
   * can apply the wave gradient without a foreign engine's inline value.
   */
  const baseSkeletonStyle: React.CSSProperties = {
    ...getAnimationStyle(),
  };

  // Resolved animation kind, stamped on each block so the skin can key the wave
  // gradient (mirrors getAnimationStyle's branch: pulse stays pulse, any other
  // active animation is the wave).
  const animationAttr = active && animation ? (animation === 'pulse' ? 'pulse' : 'wave') : undefined;

  // ---------------------------------------------------------------------------
  // Shape Variant Rendering
  // ---------------------------------------------------------------------------

  // Shape variants produce a single styled div; the border-radius
  // differentiates circles from rectangles and rounded rectangles
  if (variant === 'circular' || variant === 'rectangular' || variant === 'rounded') {
    return (
      <div
        data-part="root"
        data-active={active}
        data-animation={animationAttr}
        className={`rottay-skeleton rottay-skeleton--rustic ${className}`}
        style={{
          ...baseSkeletonStyle,
          width: typeof width === 'number' ? `${width}px` : width || '100%',
          height: typeof height === 'number' ? `${height}px` : height || '20px',
          '--ds-skeleton-shape-radius': variant === 'circular' ? '50%' : variant === 'rounded' ? '6px' : '0',
          ...style,
        } as React.CSSProperties}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Text/Default Variant Rendering
  // ---------------------------------------------------------------------------

  return (
    <div
      data-part="root"
      data-active={active}
      className={`rottay-skeleton-wrapper rottay-skeleton--rustic ${className}`}
      style={{ display: 'flex', gap: '16px', ...style }}
    >
      {/* Avatar placeholder */}
      {avatar && (
        <div
          data-part="avatar"
          data-animation={animationAttr}
          style={{
            ...baseSkeletonStyle,
            width: avatarSize,
            height: avatarSize,
            '--ds-skeleton-avatar-radius': avatarShape === 'circle' ? '50%' : '6px',
            flexShrink: 0,
          } as React.CSSProperties}
        />
      )}

      {/* Content section with title and paragraph lines */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Title line */}
        {title && (<div data-part="title" data-animation={animationAttr} style={{ ...baseSkeletonStyle, height: '20px', width: '60%' }} />)}

        {/* Paragraph lines with varying widths */}
        {paragraph &&
          Array.from({ length: typeof paragraph === 'object' ? paragraph.rows || rows! : rows! }).map((_, i) => (
            <div key={i} data-part="line" data-animation={animationAttr} style={{ ...baseSkeletonStyle, height: '16px', width: i === rows! - 1 ? '80%' : '100%' }} />
          ))}
      </div>
    </div>
  );
}
