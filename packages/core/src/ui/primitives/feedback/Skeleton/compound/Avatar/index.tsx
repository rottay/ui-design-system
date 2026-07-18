/**
 * @fileoverview Skeleton Avatar Compound Component - Rottay Design System
 * @description Avatar placeholder component for the Skeleton primitive.
 * Displays a circular or square loading indicator for user avatars.
 *
 * @remarks
 * The SkeletonAvatar is a compound component that provides a specialized
 * loading placeholder for avatar images. It renders independently of
 * the engine system, using CSS animations for the loading effect.
 *
 * **Key Features:**
 * - Multiple size presets (sm, md, lg) or custom pixel values
 * - Circle and square shape options
 * - Shimmer animation effect
 * - Ref forwarding for DOM access
 *
 * **Size Mapping:**
 * | Size | Pixels |
 * |------|--------|
 * | sm | 32px |
 * | md | 40px (default) |
 * | lg | 48px |
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * // Using compound component syntax
 * <Skeleton.Avatar size="lg" shape="circle" />
 * ```
 *
 * @example Custom Size
 * ```tsx
 * // Using pixel value for size
 * <Skeleton.Avatar size={64} shape="circle" />
 * ```
 *
 * @example Square Avatar
 * ```tsx
 * // Square shape for thumbnails
 * <Skeleton.Avatar size="md" shape="square" />
 * ```
 *
 * @example With User Card
 * ```tsx
 * function UserCardLoading() {
 *   return (
 *     <div className="flex gap-4 items-center">
 *       <Skeleton.Avatar size="lg" />
 *       <div>
 *         <Skeleton.Text lines={2} width={120} />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link SkeletonAvatarProps} - Component props interface
 * @see {@link SkeletonText} - Text skeleton companion
 * @see {@link SkeletonButton} - Button skeleton companion
 * @module Skeleton/Compound/Avatar
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonAvatar component.
 *
 * @interface SkeletonAvatarProps
 *
 * @example
 * ```tsx
 * const props: SkeletonAvatarProps = {
 *   size: 'lg',
 *   shape: 'circle',
 *   className: 'my-avatar-skeleton',
 * };
 * ```
 */
export interface SkeletonAvatarProps {
  /**
   * Size of the avatar skeleton.
   * Preset values: 'sm' (32px), 'md' (40px), 'lg' (48px)
   * Or a custom pixel value as number.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | number;

  /**
   * Shape of the avatar skeleton.
   * @default 'circle'
   */
  shape?: 'circle' | 'square';

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the avatar skeleton.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Size preset mappings for avatar skeleton.
 * Maps semantic size names to pixel values.
 *
 * @internal
 */
const SIZE_MAP = {
  /** Small avatar - 32px */
  sm: 32,
  /** Medium avatar - 40px (default) */
  md: 40,
  /** Large avatar - 48px */
  lg: 48,
};

// ============================================================================
// Component
// ============================================================================

/**
 * Skeleton Avatar compound component.
 *
 * @description
 * Renders an animated placeholder for avatar images during loading states.
 * Supports multiple sizes and shapes with a shimmer animation effect.
 *
 * @remarks
 * - Uses CSS gradient animation for shimmer effect
 * - Forwards ref for DOM manipulation
 * - Applies `rottay-skeleton-avatar` class for styling hooks
 *
 * @param props - {@link SkeletonAvatarProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered avatar skeleton element
 *
 * @example
 * ```tsx
 * <SkeletonAvatar size="lg" shape="circle" className="profile-avatar" />
 * ```
 */
export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { size = 'md', shape = 'circle', className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Size Calculation
    // -------------------------------------------------------------------------

    // Convert preset size to pixel value, or use custom number directly
    const sizeValue = typeof size === 'number' ? size : SIZE_MAP[size];

    // -------------------------------------------------------------------------
    // Style Generation
    // -------------------------------------------------------------------------

    /**
     * Avatar skeleton styles with animation.
     * Uses CSS gradient for shimmer effect.
     */
    // The shimmer gradient background + 200% sizing paint from the unlayered
    // skeleton-compounds skin; the shape-conditional corner radius rides the
    // --ds-skeleton-avatar-radius hatch; only the animation reference stays inline.
    const avatarStyle = {
      width: sizeValue,
      height: sizeValue,
      '--ds-skeleton-avatar-radius': shape === 'circle' ? '50%' : '4px',
      animation: 'ds-skeleton-shimmer var(--ds-skeleton-animation-duration, 1.5s) infinite',
      ...style,
    } as React.CSSProperties;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} data-part="root" className={`rottay-skeleton-avatar ${className}`} style={avatarStyle} />
    );
  }
);

// Set display name for React DevTools debugging
SkeletonAvatar.displayName = 'Skeleton.Avatar';

export default SkeletonAvatar;
