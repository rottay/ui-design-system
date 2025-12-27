/**
 * @fileoverview Progress Base Component - Rottay Design System
 * @description Base/fallback implementation for the Progress component.
 * Provides a minimal structure when no engine is available.
 *
 * @remarks
 * The BaseProgress serves as a fallback implementation used when:
 * - No engine is configured in the application
 * - An engine fails to load (caught by ErrorBoundary)
 * - Server-side rendering requires a minimal markup
 *
 * **Important:** This is NOT the recommended way to use the Progress.
 * For full functionality, use the Progress with an engine:
 * - **Titan**: Full-featured with Ant Design styling
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
 * import { BaseProgress } from '@rottay/design-system/components/primitives/feedback/Progress/base';
 *
 * // Only use directly for testing or edge cases
 * <BaseProgress className="my-progress" percent={50}>
 *   <span>50%</span>
 * </BaseProgress>
 * ```
 *
 * @example Recommended Usage
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * // Always prefer the main Progress export
 * <Progress percent={75} type="line" status="active" />
 * ```
 *
 * @see {@link ProgressProps} - Component props interface
 * @see {@link TitanProgress} - Ant Design implementation
 * @see {@link HermesProgress} - DaisyUI implementation
 * @see {@link ApolloProgress} - Vanilla implementation
 * @module Progress/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { ProgressProps } from '../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Base Progress component - minimal fallback implementation.
 *
 * @description
 * Provides a simple container element with the `rottay-progress` class.
 * Does NOT implement progress visualization (bars, circles, etc.).
 * Engine implementations provide the full progress experience.
 *
 * @remarks
 * - Forwards ref to the container div for DOM access
 * - Merges className with 'rottay-progress' prefix
 * - Passes through style prop for custom styling
 * - Renders children if provided (for custom content)
 *
 * **CSS Classes:**
 * - `rottay-progress`: Base class for styling hooks
 * - Additional classes from `className` prop are appended
 *
 * @param props - {@link ProgressProps}
 * @param ref - Forwarded ref to the container div
 * @returns A simple div wrapper (non-functional progress)
 *
 * @internal This component is primarily for internal use.
 * Use the main `Progress` export for application development.
 */
export const BaseProgress = forwardRef<HTMLDivElement, ProgressProps>(
  (props, ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const { className = '', style = {}, children } = props;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`rottay-progress ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
BaseProgress.displayName = 'BaseProgress';
