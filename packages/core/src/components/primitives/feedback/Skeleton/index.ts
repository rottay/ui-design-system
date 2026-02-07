'use client';

/**
 * @fileoverview Skeleton Component - Rottay Design System
 * @description A placeholder loading component that mimics content structure.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Skeleton component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - skeleton styling automatically adapts
 * to your tenant's brand colors, spacing, and animation tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * function LoadingState() {
 *   return (
 *     <Skeleton
 *       active
 *       avatar
 *       paragraph={{ rows: 3 }}
 *       title
 *     />
 *   );
 * }
 * ```
 *
 * @example With Compound Components
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * <div className="loading-card">
 *   <Skeleton.Avatar size="lg" shape="circle" />
 *   <Skeleton.Text lines={3} />
 *   <Skeleton.Button size="md" />
 * </div>
 * ```
 *
 * @example Different Variants
 * ```tsx
 * // Text skeleton (default)
 * <Skeleton variant="text" width={200} height={16} />
 *
 * // Circular skeleton (for avatars)
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * // Rectangular skeleton (for images)
 * <Skeleton variant="rectangular" width="100%" height={200} />
 *
 * // Rounded skeleton (for cards)
 * <Skeleton variant="rounded" width="100%" height={120} />
 * ```
 *
 * @example Animation Options
 * ```tsx
 * // Pulse animation (default)
 * <Skeleton animation="pulse" active />
 *
 * // Wave animation
 * <Skeleton animation="wave" active />
 *
 * // No animation
 * <Skeleton animation={false} />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Skeleton automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Skeleton avatar paragraph title>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Skeleton>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Skeleton engine="modern" active avatar paragraph>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Skeleton>
 * ```
 *
 * @see {@link SkeletonProps} for complete prop documentation
 * @see {@link SkeletonAvatar} for avatar compound component
 * @see {@link SkeletonText} for text compound component
 * @see {@link SkeletonButton} for button compound component
 *
 * @module Skeleton
 * @category Feedback
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { SkeletonProps } from './types';
import { SkeletonAvatar, SkeletonText, SkeletonButton } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type SkeletonProps,
  type SkeletonVariant,
  type SkeletonAnimation,
  SKELETON_DEFAULTS,
} from './types';

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Compound Component Exports
// ============================================================================

export { SkeletonAvatar, SkeletonText, SkeletonButton };
export type { SkeletonAvatarProps, SkeletonTextProps, SkeletonButtonProps } from './compound';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Skeleton component with multi-engine support and compound components.
 *
 * @description
 * A placeholder component that displays loading states. Ideal for:
 * - Content loading indicators
 * - Lazy-loaded component placeholders
 * - Data fetching states
 * - Progressive content rendering
 * - Perceived performance improvement
 *
 * @remarks
 * - Supports multiple variants (text, circular, rectangular, rounded)
 * - Includes pulse and wave animation modes
 * - Configurable avatar, title, and paragraph sections
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link SkeletonProps}
 * @returns React component with Avatar, Text, and Button compound components
 *
 * @example
 * ```tsx
 * <Skeleton active avatar paragraph={{ rows: 3 }} title>
 *   {/* Loading placeholder *\/}
 * </Skeleton>
 *
 * // Or use compound components
 * <Skeleton.Avatar size="lg" />
 * <Skeleton.Text lines={4} />
 * <Skeleton.Button shape="round" />
 * ```
 */
export const Skeleton = Object.assign(
  createEngineComponent<SkeletonProps>('Skeleton', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /**
     * Avatar skeleton placeholder.
     * Displays a circular or square loading indicator for avatars.
     * @see {@link SkeletonAvatar}
     */
    Avatar: SkeletonAvatar,

    /**
     * Text skeleton placeholder.
     * Displays multiple lines of loading indicators for text content.
     * @see {@link SkeletonText}
     */
    Text: SkeletonText,

    /**
     * Button skeleton placeholder.
     * Displays a button-shaped loading indicator.
     * @see {@link SkeletonButton}
     */
    Button: SkeletonButton,
  }
);
