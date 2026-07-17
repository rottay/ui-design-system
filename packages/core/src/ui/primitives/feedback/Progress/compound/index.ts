/**
 * @fileoverview Progress Compound Components - Rottay Design System
 * @description Re-exports all compound components for the Progress primitive.
 *
 * @remarks
 * This barrel file provides convenient access to all Progress compound
 * components. These components are designed to work together to create
 * different progress visualizations with consistent styling and behavior.
 *
 * **Component Hierarchy:**
 * ```
 * <Progress>
 *   <Progress.Circle />  ← Circular progress indicator
 *   <Progress.Line />    ← Linear progress bar
 * </Progress>
 * ```
 *
 * @example Full Progress Layout
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * // Using compound components directly
 * <div className="progress-grid">
 *   <Progress.Circle percent={75} size={120} strokeColor="#1890ff" />
 *   <Progress.Line percent={50} size="lg" showInfo />
 * </div>
 * ```
 *
 * @example Circle Progress Customization
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * <Progress.Circle
 *   percent={85}
 *   size={150}
 *   strokeWidth={10}
 *   strokeColor="var(--ds-color-success-500)"
 *   format={(p) => `${p}% Done`}
 * />
 * ```
 *
 * @example Line Progress Sizes
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * <Progress.Line percent={30} size="sm" />
 * <Progress.Line percent={50} size="md" />
 * <Progress.Line percent={70} size="lg" />
 * ```
 *
 * @module Progress/Compound
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Component Exports
// ============================================================================

export { ProgressCircle } from './Circle';
export type { ProgressCircleProps } from './Circle';

export { ProgressLine } from './Line';
export type { ProgressLineProps } from './Line';
