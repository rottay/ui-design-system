'use client';

/**
 * @fileoverview Textarea -- multi-line text input with auto-resize,
 * character count, validation status, and clear button support.
 *
 * @example
 * ```tsx
 * import { Textarea } from '@rottay/design-system';
 *
 * // Basic with placeholder
 * <Textarea placeholder="Enter your message..." rows={4} />
 *
 * // Auto-sizing with character count
 * <Textarea maxLength={200} showCount autoSize={{ minRows: 3, maxRows: 6 }} />
 * ```
 *
 * @module Textarea
 * @category Inputs
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { TextareaProps } from './contracts';

export {
  type TextareaProps,
  type TextareaVariant,
  type TextareaSize,
  type TextareaStatus,
  TEXTAREA_DEFAULTS,
} from './contracts';

/** Public textarea primitive resolved through the active engine. */
export const Textarea = createEngineComponent<TextareaProps>('Textarea', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
