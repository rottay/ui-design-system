'use client';

/**
 * @fileoverview Progress - visual indicator for operation completion (line or circle).
 * Compound sub-components: Circle, Line for explicit shape variants.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <Progress percent={75} type="line" status="active" />
 * <Progress.Circle percent={90} size={120} />
 * ```
 *
 * @module Progress
 * @category Feedback
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { ProgressProps } from './Progress.types';
import { ProgressCircle, ProgressLine } from './compound';

export {
  type ProgressProps,
  type ProgressType,
  type ProgressStatus,
  PROGRESS_DEFAULTS,
} from './Progress.types';

export { ProgressCircle, ProgressLine };
export type { ProgressCircleProps, ProgressLineProps } from './compound';

/**
 * Progress component with multi-engine support.
 * Line and circle display types, status variants (normal/success/error/active),
 * customizable stroke colors, and percentage display.
 */
export const Progress = Object.assign(
  // Create the engine-switchable base component
  createEngineComponent<ProgressProps>('Progress', {
    classic: () => import('./engines/classic'),  // Ant Design
    modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
    rustic: () => import('./engines/rustic'),      // Vanilla HTML/CSS
  }),
  // Attach compound sub-components for explicit shape selection (Progress.Circle, .Line)
  {
    /** Circular ring with percentage centered inside. */
    Circle: ProgressCircle,
    /** Horizontal bar with optional percentage label. */
    Line: ProgressLine,
  }
);
