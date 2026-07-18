/**
 * @fileoverview Skeleton Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Skeleton component.
 * A lightweight, utility-first alternative to the Classic engine.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine built on DaisyUI and Tailwind CSS.
 * It provides a smaller bundle size compared to Classic while maintaining
 * core skeleton functionality.
 *
 * **Key Features:**
 * - Utility-first styling with Tailwind
 * - Smaller bundle size than Ant Design
 * - DaisyUI skeleton class
 * - Custom shape handling
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS
 * - When bundle size is a concern
 * - Landing pages and marketing sites
 * - When DaisyUI theme is preferred
 *
 * **Multi-Tenant Theming:**
 * Modern uses DaisyUI's color system with CSS custom properties.
 * Tenant themes can override the skeleton background via DaisyUI tokens.
 *
 * **Size Handling:**
 * | Size | Implementation |
 * |------|---------------|
 * | number | Converted to pixels |
 * | string | Used directly (%, rem, etc.) |
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * <Skeleton engine="modern" active avatar paragraph />
 * ```
 *
 * @example Global Engine Configuration
 * ```tsx
 * import { EngineProvider, Skeleton } from '@rottay/design-system';
 *
 * <EngineProvider engine="modern">
 *   <App>
 *     <Skeleton active avatar paragraph>
 *       All skeletons use Modern engine
 *     </Skeleton>
 *   </App>
 * </EngineProvider>
 * ```
 *
 * @example Variant Shapes
 * ```tsx
 * <Skeleton engine="modern" variant="circular" width={48} height={48} />
 * <Skeleton engine="modern" variant="rectangular" width="100%" height={200} />
 * ```
 *
 * @see {@link SkeletonProps} - Component props interface
 * @see {@link ClassicSkeleton} - Ant Design alternative
 * @see {@link RusticSkeleton} - Vanilla alternative
 * @see {@link https://daisyui.com/components/skeleton} - DaisyUI Skeleton docs
 * @module Skeleton/Engines/Modern
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
 * Modern Engine implementation of the Skeleton component.
 *
 * @description
 * Custom skeleton implementation using DaisyUI classes and Tailwind utilities.
 * Provides a lightweight alternative to Ant Design with smaller bundle size.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses DaisyUI `skeleton` class for base styling
 * - Flexbox layout for avatar + content structure
 * - Dynamic border-radius for shape variants
 * - Percentage-based last line width for realistic text appearance
 *
 * **CSS Classes Used:**
 * - `rottay-skeleton` / `rottay-skeleton-wrapper`: scope classes the unlayered
 *   modern Skeleton skin paints (fill + canon animation), mirroring rustic
 * - `flex`, `gap-4`: Container layout
 * - `space-y-2`: Paragraph line spacing
 * - `flex-1`: Content area expansion
 *
 * @param props - {@link SkeletonProps}
 * @returns The rendered DaisyUI Skeleton
 *
 * @example
 * ```tsx
 * <ModernSkeleton
 *   variant="text"
 *   avatar
 *   avatarSize={48}
 *   paragraph={{ rows: 3 }}
 *   title
 * />
 * ```
 */
export default function ModernSkeleton(props: SkeletonProps): React.ReactElement {
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
  // Animation Resolution
  // ---------------------------------------------------------------------------

  // The Skeleton wrapper injects `animation` from the tenant personality
  // (resolveSkeletonPersonalityDefaults -> 'pulse' | 'wave'), so this honors
  // skeletonStyle across engines. Modern renders the premium sweeping gradient
  // (ds-skeleton-shimmer) for any moving style and the flat opacity pulse
  // (ds-skeleton-pulse) for 'pulse'; an inactive/false skeleton holds static.
  // `data-animation` selects the flat-vs-gradient background in the unlayered
  // skin; --ds-skeleton-animation-name selects the shared canon keyframe.
  const resolvedStyle = active && animation ? (animation === 'pulse' ? 'pulse' : 'shimmer') : undefined;
  const animationName =
    resolvedStyle === 'pulse' ? 'ds-skeleton-pulse' : resolvedStyle === 'shimmer' ? 'ds-skeleton-shimmer' : 'none';

  // ---------------------------------------------------------------------------
  // Style Helpers
  // ---------------------------------------------------------------------------

  /**
   * Generate styles with dimension handling.
   * Converts number values to pixel strings.
   */
  const getSkeletonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = { ...style };
    if (width) baseStyle.width = typeof width === 'number' ? `${width}px` : width;
    if (height) baseStyle.height = typeof height === 'number' ? `${height}px` : height;
    return baseStyle;
  };

  // ---------------------------------------------------------------------------
  // Shape Variant Rendering
  // ---------------------------------------------------------------------------

  // Shape variants render a single block carrying the `.rottay-skeleton` scope
  // class (mirroring the rustic engine). The tenant background, the canon
  // animation and the variant-driven corner radius paint from the unlayered
  // modern Skeleton skin; the radius rides the --ds-skeleton-shape-radius hatch
  // because it is variant-conditional, and data-animation selects the flat/
  // gradient background.
  if (variant === 'circular' || variant === 'rectangular' || variant === 'rounded') {
    return (
      <div
        data-part="root"
        data-animation={resolvedStyle}
        className={`rottay-skeleton rottay-skeleton--modern ${className}`}
        style={{
          ...getSkeletonStyle(),
          '--ds-skeleton-shape-radius': variant === 'circular'
            ? '50%'
            : variant === 'rounded'
              ? 'var(--ds-skeleton-radius, var(--ds-radius-md, 0.5rem))'
              : '0',
          '--ds-skeleton-animation-name': animationName,
        } as React.CSSProperties}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Text/Default Variant Rendering
  // ---------------------------------------------------------------------------

  // Text/default variant: the wrapper is a flex container (NOT a painted block),
  // so it carries `.rottay-skeleton-wrapper` and owns --ds-skeleton-animation-name
  // plus the personality style (which carries --ds-skeleton-animation-duration);
  // both inherit to the avatar/title/line blocks below, which the unlayered skin
  // paints as descendants keyed on data-part + data-animation.
  return (
    <div
      data-part="root"
      className={`flex gap-4 rottay-skeleton-wrapper rottay-skeleton--modern ${className}`}
      style={{ ...style, '--ds-skeleton-animation-name': animationName } as React.CSSProperties}
    >
      {/* Avatar placeholder */}
      {avatar && (
        <div
          data-part="avatar"
          data-animation={resolvedStyle}
          style={{
            width: avatarSize,
            height: avatarSize,
            '--ds-skeleton-avatar-radius': avatarShape === 'circle' ? '50%' : 'var(--ds-skeleton-radius, var(--ds-radius-md, 0.5rem))',
            flexShrink: 0,
          } as React.CSSProperties}
        />
      )}

      {/* Content section with title and paragraph lines */}
      <div className="flex-1 space-y-2">
        {/* Title line is 60% width to visually distinguish it from body text */}
        {title && <div data-part="title" data-animation={resolvedStyle} style={{ height: '1.25rem', width: '60%' }} />}

        {/* Last paragraph line is 80% width to simulate a natural text ending,
            preventing the skeleton from looking like a uniform block */}
        {paragraph &&
          Array.from({
            length: typeof paragraph === 'object' ? paragraph.rows || rows! : rows!,
          }).map((_, i) => (
            <div
              key={i}
              data-part="line"
              data-animation={resolvedStyle}
              style={{ height: '1rem', width: i === rows! - 1 ? '80%' : '100%' }}
            />
          ))}
      </div>
    </div>
  );
}
