/**
 * @fileoverview Skeleton Apollo Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Skeleton component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Apollo is the headless, zero-dependency engine that uses only vanilla
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
 * **When to Use Apollo:**
 * - When bundle size is critical
 * - For accessibility-focused applications
 * - When full styling control is needed
 * - For custom design systems built on Rottay
 * - When avoiding third-party UI libraries
 *
 * **Multi-Tenant Theming:**
 * Apollo uses inline CSS and custom properties for theming.
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
 * <Skeleton engine="apollo" active avatar paragraph title />
 * ```
 *
 * @example With Custom Styling
 * ```tsx
 * <Skeleton
 *   engine="apollo"
 *   variant="rectangular"
 *   width="100%"
 *   height={200}
 *   animation="wave"
 * />
 * ```
 *
 * @see {@link SkeletonProps} - Component props interface
 * @see {@link TitanSkeleton} - Ant Design alternative
 * @see {@link HermesSkeleton} - DaisyUI alternative
 * @module Skeleton/Engines/Apollo
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { SkeletonProps } from '../../types';
import { SKELETON_DEFAULTS } from '../../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Apollo Engine implementation of the Skeleton component.
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
 * **CSS Keyframes:**
 * - `rottay-skeleton-pulse`: Opacity animation 1-0.4-1
 * - `rottay-skeleton-wave`: Background position animation
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
 * <ApolloSkeleton
 *   active
 *   animation="pulse"
 *   avatar
 *   avatarSize={48}
 *   paragraph={{ rows: 3 }}
 *   title
 * />
 * ```
 */
export default function ApolloSkeleton(props: SkeletonProps): React.ReactElement {
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
      return { animation: 'rottay-skeleton-pulse 1.5s ease-in-out infinite' };
    }

    // Wave animation uses gradient background
    return {
      background:
        'var(--ds-skeleton-wave-gradient, linear-gradient(90deg, rgba(190,190,190,0.2) 25%, rgba(129,129,129,0.24) 37%, rgba(190,190,190,0.2) 63%))',
      backgroundSize: '400% 100%',
      animation: 'rottay-skeleton-wave 1.4s ease-in-out infinite',
    };
  };

  // ---------------------------------------------------------------------------
  // Base Styles
  // ---------------------------------------------------------------------------

  /**
   * Base skeleton element styles.
   * Includes background color and animation.
   */
  const baseSkeletonStyle: React.CSSProperties = {
    backgroundColor: 'var(--ds-skeleton-bg, rgba(190, 190, 190, 0.2))',
    ...getAnimationStyle(),
  };

  // ---------------------------------------------------------------------------
  // CSS Keyframes
  // ---------------------------------------------------------------------------

  /**
   * Inline CSS keyframes for skeleton animations.
   * Injected via style tag for zero-dependency approach.
   */
  const keyframeStyles = `
    @keyframes rottay-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes rottay-skeleton-wave { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
  `;

  // ---------------------------------------------------------------------------
  // Shape Variant Rendering
  // ---------------------------------------------------------------------------

  // Handle circular, rectangular, and rounded variants
  if (variant === 'circular' || variant === 'rectangular' || variant === 'rounded') {
    return (
      <>
        <style>{keyframeStyles}</style>
        <div
          className={`rottay-skeleton ${className}`}
          style={{
            ...baseSkeletonStyle,
            width: typeof width === 'number' ? `${width}px` : width || '100%',
            height: typeof height === 'number' ? `${height}px` : height || '20px',
            borderRadius: variant === 'circular' ? '50%' : variant === 'rounded' ? '6px' : '0',
            ...style,
          }}
        />
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Text/Default Variant Rendering
  // ---------------------------------------------------------------------------

  return (
    <>
      <style>{keyframeStyles}</style>
      <div className={`rottay-skeleton-wrapper ${className}`} style={{ display: 'flex', gap: '16px', ...style }}>
        {/* Avatar placeholder */}
        {avatar && (
          <div
            style={{
              ...baseSkeletonStyle,
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarShape === 'circle' ? '50%' : '6px',
              flexShrink: 0,
            }}
          />
        )}

        {/* Content section with title and paragraph lines */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Title line */}
          {title && (<div style={{ ...baseSkeletonStyle, height: '20px', width: '60%', borderRadius: '4px' }} />)}

          {/* Paragraph lines with varying widths */}
          {paragraph &&
            Array.from({ length: typeof paragraph === 'object' ? paragraph.rows || rows! : rows! }).map((_, i) => (
              <div key={i} style={{ ...baseSkeletonStyle, height: '16px', width: i === rows! - 1 ? '80%' : '100%', borderRadius: '4px' }} />
            ))}
        </div>
      </div>
    </>
  );
}
