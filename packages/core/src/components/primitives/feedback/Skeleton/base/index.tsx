/**
 * @fileoverview Skeleton Base Component - Rottay Design System
 * @description Base/fallback implementation for the Skeleton component.
 * Provides a minimal structure when no engine is available.
 *
 * @remarks
 * The BaseSkeleton serves as a fallback implementation used when:
 * - No engine is configured in the application
 * - An engine fails to load (caught by ErrorBoundary)
 * - Server-side rendering requires minimal markup
 *
 * **Important:** This is NOT the recommended way to use the Skeleton.
 * For full functionality, use the Skeleton with an engine:
 * - **Titan**: Full-featured with Ant Design animations
 * - **Hermes**: Utility-first with Tailwind/DaisyUI
 * - **Apollo**: Zero-dependency vanilla implementation
 *
 * **Multi-Tenant Integration:**
 * The base component respects tenant-specific CSS variables but
 * provides minimal styling. Engine implementations add the visual
 * polish expected in production applications.
 *
 * @example Direct Usage (Not Recommended)
 * ```tsx
 * import { BaseSkeleton } from '@rottay/design-system/components/primitives/feedback/Skeleton/base';
 *
 * // Only use directly for testing or edge cases
 * <BaseSkeleton className="my-skeleton">
 *   <p>Fallback content</p>
 * </BaseSkeleton>
 * ```
 *
 * @example Recommended Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * // Always prefer the main Skeleton export
 * <Skeleton active avatar paragraph title />
 * ```
 *
 * @see {@link SkeletonProps} - Component props interface
 * @see {@link TitanSkeleton} - Ant Design implementation
 * @see {@link HermesSkeleton} - DaisyUI implementation
 * @see {@link ApolloSkeleton} - Vanilla implementation
 * @module Skeleton/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { SkeletonProps } from '../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Base Skeleton component - minimal fallback implementation.
 *
 * @description
 * Provides a simple container element with the `rottay-skeleton` class.
 * Does NOT implement skeleton functionality (animations, variants, etc.).
 * Engine implementations provide the full skeleton experience.
 *
 * @remarks
 * - Forwards ref to the container div for DOM access
 * - Merges className with 'rottay-skeleton' prefix
 * - Passes through style for custom styling
 * - Destructures SkeletonProps to avoid spreading to DOM
 *
 * **CSS Classes:**
 * - `rottay-skeleton`: Base class for styling hooks
 * - Additional classes from `className` prop are appended
 *
 * @param props - {@link SkeletonProps}
 * @param ref - Forwarded ref to the container div
 * @returns A simple div wrapper (non-functional skeleton)
 *
 * @internal This component is primarily for internal use.
 * Use the main `Skeleton` export for application development.
 */
export const BaseSkeleton = forwardRef<HTMLDivElement, SkeletonProps>((props, ref) => {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------
  // Destructure all custom props to prevent them from being spread onto
  // the HTML element, which would cause React warnings for unknown props.

  const { className = '', style = {}, children } = props;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={ref}
      className={`rottay-skeleton ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
});

// Set display name for React DevTools debugging
BaseSkeleton.displayName = 'BaseSkeleton';
