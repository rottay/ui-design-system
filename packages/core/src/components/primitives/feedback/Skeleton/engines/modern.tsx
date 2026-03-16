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
import type { SkeletonProps } from '../Skeleton.types';
import { SKELETON_DEFAULTS } from '../Skeleton.types';

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
 * - `skeleton`: DaisyUI skeleton animation
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

  // Shape variants render a single div with the DaisyUI skeleton class
  // and a dynamic border-radius to achieve the desired geometry
  if (variant === 'circular' || variant === 'rectangular' || variant === 'rounded') {
    return (
      <div
        className={`skeleton ${className}`}
        style={{
          ...getSkeletonStyle(),
          borderRadius: variant === 'circular' ? '50%' : variant === 'rounded' ? '0.5rem' : '0',
        }}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Text/Default Variant Rendering
  // ---------------------------------------------------------------------------

  return (
    <div className={`flex gap-4 ${className}`} style={style}>
      {/* Avatar placeholder */}
      {avatar && (
        <div
          className="skeleton"
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarShape === 'circle' ? '50%' : '0.5rem',
            flexShrink: 0,
          }}
        />
      )}

      {/* Content section with title and paragraph lines */}
      <div className="flex-1 space-y-2">
        {/* Title line is 60% width to visually distinguish it from body text */}
        {title && <div className="skeleton" style={{ height: '1.25rem', width: '60%' }} />}

        {/* Last paragraph line is 80% width to simulate a natural text ending,
            preventing the skeleton from looking like a uniform block */}
        {paragraph &&
          Array.from({
            length: typeof paragraph === 'object' ? paragraph.rows || rows! : rows!,
          }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: '1rem', width: i === rows! - 1 ? '80%' : '100%' }}
            />
          ))}
      </div>
    </div>
  );
}
