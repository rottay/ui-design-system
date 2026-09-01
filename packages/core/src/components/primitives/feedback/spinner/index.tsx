'use client';

/**
 * @fileoverview Spinner - animated loading indicator for async operations.
 * Four sizes (sm/md/lg/xl), customizable color, optional label.
 * Multi-engine: Classic (Ant Design Spin), Modern (token skin), Rustic (pure CSS keyframes).
 *
 * @example
 * ```tsx
 * <Spinner size="lg" label="Loading..." />
 * <Button disabled={loading}>{loading ? <Spinner size="sm" /> : 'Submit'}</Button>
 * ```
 *
 * @module Spinner
 * @category Feedback
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { SpinnerProps } from './contracts';

export {
  type SpinnerProps,
  type SpinnerSize,
  SPINNER_DEFAULTS,
  SIZE_MAP,
} from './contracts';

/**
 * Spinner component with multi-engine support.
 * CSS-animated, ARIA-compliant, tenant-themeable.
 * No compound sub-components -- standalone loading widget.
 */
export const Spinner = createEngineComponent<SpinnerProps>('Spinner', {
  classic: () => import('./engines/classic'),  // Ant Design Spin
  modern: () => import('./engines/modern'),     // Token skin (no DaisyUI)
  rustic: () => import('./engines/rustic'),      // Pure CSS keyframes
});
