'use client';

/**
 * @fileoverview Result - full-page feedback for operation outcomes and HTTP status pages.
 * Supports statuses: success, error, info, warning, 404, 403, 500, with custom icons.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <Result
 *   status="success"
 *   title="Payment Complete"
 *   subTitle="Order #2024-1234 confirmed."
 *   extra={<Button variant="primary">Continue</Button>}
 * />
 * ```
 *
 * @module Result
 * @category Feedback
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ResultProps } from './contracts';

export {
  type ResultProps,
  type ResultStatus,
  RESULT_DEFAULTS,
  RESULT_ICONS,
  RESULT_COLORS,
} from './contracts';

/**
 * Result component with multi-engine support.
 * Seven status types with per-status icons, ARIA-compliant, custom icon override.
 * No compound sub-components -- title/subTitle/extra props control layout.
 */
export const Result = createEngineComponent<ResultProps>('Result', {
  classic: () => import('./engines/classic'),  // Ant Design
  modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
  rustic: () => import('./engines/rustic'),      // Vanilla HTML/CSS
});

export default Result;
