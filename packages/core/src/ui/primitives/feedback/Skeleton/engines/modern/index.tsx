/**
 * @fileoverview Skeleton Modern Engine - Rottay Design System
 * @description Token-driven skeleton: the unlayered modern skin
 * (`skin/skeleton.css`) owns the flat/shimmer fills, the canon animation
 * wiring, all layout and the line/title geometry. No DaisyUI `skeleton`
 * class remains (drained in the TASK S canon-shimmer pass).
 *
 * @remarks
 * **Engine Overview:**
 * Modern renders placeholder blocks whose every visual decision — fill,
 * radius, cadence, rhythm — resolves through governed tokens, so tenant
 * density, motion and surface personality retune the skeleton like any
 * other family.
 *
 * **Key Features:**
 * - Canon keyframe set (ds-skeleton-pulse/shimmer/wave) selected through
 *   `--ds-skeleton-animation-name`
 * - Cadence rides `--ds-skeleton-animation-duration`
 * - Skin-owned anatomy: shape variants, avatar, title/line rhythm
 * - Global reduced-motion guard pins every canon animation to its final
 *   frame (personality.css wildcard, OS media query + data-ds-motion)
 *
 * **Multi-Tenant Theming:**
 * The tenant background, highlight and cadence arrive through
 * `--ds-skeleton-*` channels; the personality `skeletonStyle` chooses
 * pulse vs wave and the engine maps it onto the canon animation name.
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
 * @example Variant Shapes
 * ```tsx
 * <Skeleton engine="modern" variant="circular" width={48} height={48} />
 * <Skeleton engine="modern" variant="rectangular" width="100%" height={200} />
 * ```
 *
 * @see {@link SkeletonProps} - Component props interface
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
 * Token-driven skeleton: the unlayered modern skin
 * (`skin/skeleton.css`) owns the flat/shimmer fills, the canon animation
 * wiring, all layout and the line/title geometry. No DaisyUI `skeleton`
 * class remains (drained in the TASK S canon-shimmer pass, decrementing
 * `daisy.classConsumers`).
 *
 * @remarks
 * **Implementation Details:**
 * - Canon keyframe set (ds-skeleton-pulse/shimmer/wave) selected through
 *   `--ds-skeleton-animation-name`; cadence rides
 *   `--ds-skeleton-animation-duration`; the global reduced-motion guard
 *   (personality.css wildcard, OS media query + data-ds-motion='reduced')
 *   pins every canon animation to its final frame instantly.
 * - `data-animation` selects the flat-vs-gradient background in the skin.
 * - `data-part='content'` marks the text column so the skin owns the
 *   title/line rhythm (60% title, 80% natural-ending last line).
 *
 * @param props - {@link SkeletonProps}
 * @returns The rendered token-driven Skeleton
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
        // Purely decorative placeholder: hidden from AT; the busy state is
        // announced by the region that owns the loading contract.
        aria-hidden="true"
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
  // paints as descendants keyed on data-part + data-animation. All layout
  // (wrapper gap, content column, title/line geometry, the natural 80% last
  // line) lives in the skin so density tokens can retune it.
  return (
    <div
      data-part="root"
      className={`rottay-skeleton-wrapper rottay-skeleton--modern ${className}`}
      aria-hidden="true"
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

      {/* Content section with title and paragraph lines; geometry is
          skin-owned (title 60% / last line 80% widths, token line heights). */}
      <div data-part="content">
        {title && <div data-part="title" data-animation={resolvedStyle} />}

        {paragraph &&
          Array.from({
            length: typeof paragraph === 'object' ? paragraph.rows || rows! : rows!,
          }).map((_, i) => (
            <div
              key={i}
              data-part="line"
              data-animation={resolvedStyle}
            />
          ))}
      </div>
    </div>
  );
}
