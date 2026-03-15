'use client';

/**
 * @fileoverview TagInput - Rottay Design System
 * @description Input that creates tags on Enter or separator key.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The TagInput component provides a multi-value input where each value
 * is displayed as a removable tag.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Wraps Ant Design Select with mode="tags"
 * - **Modern**: DaisyUI input + badge list
 * - **Rustic**: Vanilla input with tag rendering
 *
 * @example Basic Usage
 * ```tsx
 * import { TagInput } from '@rottay/design-system';
 *
 * const [tags, setTags] = useState(['react', 'typescript']);
 *
 * <TagInput
 *   value={tags}
 *   onChange={setTags}
 *   placeholder="Add tags..."
 *   maxTags={10}
 * />
 * ```
 *
 * @module TagInput
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { TagInputProps } from './TagInput.types';

export {
  type TagInputProps,
  type TagInputSize,
  TAGINPUT_DEFAULTS,
} from './TagInput.types';

export const TagInput = createEngineComponent<TagInputProps>('TagInput', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

TagInput.displayName = 'TagInput';
