/**
 * @fileoverview Skeleton Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Skeleton component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Classic is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Multiple skeleton variants (text, circular, rectangular)
 * - Pulse animation effects
 * - Avatar, title, and paragraph configurations
 * - Customizable row counts
 *
 * **When to Use Classic:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 *
 * **Multi-Tenant Theming:**
 * Classic skeletons inherit Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
 *
 * **Variant Support:**
 * | Variant | Implementation |
 * |---------|---------------|
 * | text | AntSkeleton with paragraph |
 * | circular | AntSkeleton.Button (circle shape) |
 * | rectangular | AntSkeleton.Button (square shape) |
 * | rounded | AntSkeleton.Button with border-radius |
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * // Classic is the default engine
 * <Skeleton active avatar paragraph title />
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Skeleton engine="classic" active avatar paragraph>
 *   Explicitly using Classic engine
 * </Skeleton>
 * ```
 *
 * @example Shape Variants
 * ```tsx
 * <Skeleton variant="circular" width={48} height={48} />
 * <Skeleton variant="rectangular" width="100%" height={200} />
 * <Skeleton variant="rounded" width="100%" height={120} />
 * ```
 *
 * @see {@link SkeletonProps} - Component props interface
 * @see {@link ModernSkeleton} - DaisyUI alternative
 * @see {@link RusticSkeleton} - Vanilla alternative
 * @see {@link https://ant.design/components/skeleton} - Ant Design Skeleton docs
 * @module Skeleton/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import { Skeleton as AntSkeleton } from 'antd';
import type { SkeletonProps } from '../Skeleton.types';
import { SKELETON_DEFAULTS } from '../Skeleton.types';

// ============================================================================
// Component
// ============================================================================

/**
 * Classic Engine implementation of the Skeleton component.
 *
 * @description
 * Wraps Ant Design's Skeleton component with Rottay's standardized props API.
 * Provides enterprise-grade skeleton functionality with full animation support.
 *
 * @remarks
 * **Key Features:**
 * - Native Ant Design pulse animation
 * - Avatar, title, and paragraph configurations
 * - Multiple shape variants via Skeleton.Button
 * - Customizable dimensions
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | active | active |
 * | avatar | avatar |
 * | paragraph | paragraph |
 * | title | title |
 *
 * @param props - {@link SkeletonProps}
 * @returns The rendered Ant Design Skeleton
 *
 * @example
 * ```tsx
 * <ClassicSkeleton
 *   active
 *   avatar
 *   avatarSize={48}
 *   avatarShape="circle"
 *   paragraph={{ rows: 3 }}
 *   title
 * />
 * ```
 */
export default function ClassicSkeleton(props: SkeletonProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Appearance
    variant = SKELETON_DEFAULTS.variant,
    width,
    height,

    // Animation
    animation: _animation = SKELETON_DEFAULTS.animation,
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
    className,
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Shape Variant Rendering
  // ---------------------------------------------------------------------------

  // Handle circular, rectangular, and rounded variants using Skeleton.Button
  if (variant === 'circular' || variant === 'rectangular' || variant === 'rounded') {
    const skeletonStyle: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius:
        variant === 'circular' ? '50%' : variant === 'rounded' ? '6px' : 0,
      ...style,
    };

    return (
      <AntSkeleton.Button
        active={active}
        shape={variant === 'circular' ? 'circle' : 'square'}
        style={skeletonStyle}
        className={className}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Text/Default Variant Rendering
  // ---------------------------------------------------------------------------

  // Configure paragraph based on prop type
  const paragraphConfig =
    typeof paragraph === 'object' ? paragraph : paragraph ? { rows } : false;

  return (
    <AntSkeleton
      active={active}
      avatar={avatar ? { size: avatarSize, shape: avatarShape } : false}
      paragraph={paragraphConfig}
      title={title}
      className={className}
      style={style}
    />
  );
}
