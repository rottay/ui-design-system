'use client';

/**
 * @fileoverview Textarea - Rottay Design System
 * @description Multi-line text input for longer form content.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Textarea component provides a multi-line text input field for
 * collecting longer text content like comments, descriptions, and
 * messages. It supports auto-sizing, character counting, and validation.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Wraps Ant Design TextArea with full feature support
 * - **Modern**: Uses DaisyUI textarea classes with Tailwind
 * - **Rustic**: Pure HTML textarea with custom styling
 *
 * **Key Features:**
 * - Controlled and uncontrolled modes
 * - Auto-resize with min/max rows
 * - Character count display
 * - Clear button support
 * - Size variants (sm, md, lg)
 * - Visual variants (outlined, filled, borderless)
 * - Validation status (default, error, warning, success)
 *
 * **CSS Custom Properties:**
 * - `--textarea-font-size` - Text font size
 * - `--textarea-padding` - Internal padding
 * - `--textarea-border-radius` - Corner radius
 * - `--textarea-border-color` - Border color
 * - `--textarea-bg` - Background color
 *
 * @example Basic Textarea
 * ```tsx
 * import { Textarea } from '@rottay/design-system';
 *
 * <Textarea
 *   placeholder="Enter your message..."
 *   rows={4}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 *
 * @example With Character Count
 * ```tsx
 * <Textarea
 *   placeholder="Bio (max 200 characters)"
 *   maxLength={200}
 *   showCount
 *   autoSize={{ minRows: 3, maxRows: 6 }}
 * />
 * ```
 *
 * @example Controlled with Validation
 * ```tsx
 * const [comment, setComment] = useState('');
 * const hasError = comment.length < 10;
 *
 * <Textarea
 *   value={comment}
 *   onChange={setComment}
 *   status={hasError ? 'error' : 'default'}
 *   placeholder="Enter at least 10 characters"
 * />
 * ```
 *
 * @see {@link Input} for single-line text input
 * @see {@link Form} for form integration
 * @module Textarea
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { TextareaProps } from './types';

export {
  type TextareaProps,
  type TextareaVariant,
  type TextareaSize,
  type TextareaStatus,
  TEXTAREA_DEFAULTS,
} from './types';

export const Textarea = createEngineComponent<TextareaProps>('Textarea', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
