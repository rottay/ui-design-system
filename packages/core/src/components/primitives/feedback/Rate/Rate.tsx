'use client';

/**
 * @fileoverview Rate - star rating input for collecting user feedback.
 * Supports half-stars, custom icons, read-only mode, tooltips, and keyboard navigation.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <Rate defaultValue={3} allowHalf tooltips={['Bad', 'OK', 'Good', 'Great', 'Perfect']} />
 * ```
 *
 * @module Rate
 * @category Feedback
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { RateProps } from './Rate.types';

export type {
  RateProps,
  RateSize,
  RateEngine,
  RateCharacterProps,
} from './Rate.types';

export { RATE_DEFAULTS, RATE_SIZE_MAP } from './Rate.types';

/**
 * Rate component with multi-engine support.
 * Controlled/uncontrolled modes, half-star precision, custom icons,
 * keyboard navigation (Arrow/Home/End), ARIA radiogroup semantics.
 * No compound sub-components -- this is a single self-contained widget.
 */
export const Rate = createEngineComponent<RateProps>('Rate', {
  classic: () => import('./engines/classic'),  // Ant Design
  modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
  rustic: () => import('./engines/rustic'),      // Vanilla HTML/CSS
});

export default Rate;
