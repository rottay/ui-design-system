'use client';

/**
 * @fileoverview Progress Component - Rottay Design System
 * @description A visual indicator that displays the current progress of an operation.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Progress component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - progress styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const [percent, setPercent] = useState(30);
 *
 *   return (
 *     <Progress percent={percent} />
 *   );
 * }
 * ```
 *
 * @example With Compound Components
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * // Circle progress indicator
 * <Progress.Circle percent={75} size={120} strokeColor="#52c41a" />
 *
 * // Line progress indicator
 * <Progress.Line percent={50} size="lg" showInfo />
 * ```
 *
 * @example Different Types
 * ```tsx
 * // Line progress (default)
 * <Progress type="line" percent={30} />
 *
 * // Circle progress
 * <Progress type="circle" percent={75} />
 * ```
 *
 * @example Status Variants
 * ```tsx
 * // Normal progress
 * <Progress percent={50} status="normal" />
 *
 * // Success state
 * <Progress percent={100} status="success" />
 *
 * // Error state
 * <Progress percent={30} status="error" />
 *
 * // Active/animated state
 * <Progress percent={60} status="active" />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Progress automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Progress percent={75}>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Progress>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Progress engine="modern" percent={50}>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Progress>
 * ```
 *
 * @see {@link ProgressProps} for complete prop documentation
 * @see {@link ProgressCircle} for circle compound component
 * @see {@link ProgressLine} for line compound component
 *
 * @module Progress
 * @category Feedback
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { ProgressProps } from './types';
import { ProgressCircle, ProgressLine } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type ProgressProps,
  type ProgressType,
  type ProgressStatus,
  PROGRESS_DEFAULTS,
} from './types';

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Compound Component Exports
// ============================================================================

export { ProgressCircle, ProgressLine };
export type { ProgressCircleProps, ProgressLineProps } from './compound';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Progress component with multi-engine support and compound components.
 *
 * @description
 * A visual indicator that displays the current progress of an operation. Ideal for:
 * - File uploads and downloads
 * - Form completion tracking
 * - Loading states with known progress
 * - Task completion indicators
 * - Dashboard metrics
 *
 * @remarks
 * - Supports both line and circle display types
 * - Includes status variants (normal, success, error, active)
 * - Customizable stroke colors and widths
 * - Shows percentage info by default
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link ProgressProps}
 * @returns React component with Circle and Line compound components
 *
 * @example
 * ```tsx
 * <Progress percent={75} type="line" status="active">
 *   <Progress.Circle percent={75} />
 *   <Progress.Line percent={50} />
 * </Progress>
 * ```
 */
export const Progress = Object.assign(
  createEngineComponent<ProgressProps>('Progress', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /**
     * Circle progress indicator.
     * Displays progress as a circular ring with percentage in center.
     * @see {@link ProgressCircle}
     */
    Circle: ProgressCircle,

    /**
     * Line progress indicator.
     * Displays progress as a horizontal bar with optional percentage.
     * @see {@link ProgressLine}
     */
    Line: ProgressLine,
  }
);
