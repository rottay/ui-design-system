/**
 * @fileoverview TagInput Types - Rottay Design System
 * @description Type definitions for the TagInput component including tag management,
 * validation, separator configuration, and removal callbacks.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants
 * for the TagInput component. These types are shared across all engines.
 *
 * **Exported Types:**
 * - `TagInputProps` - Main component props interface
 * - `TagInputSize` - Size variant type
 *
 * **Configuration Constants:**
 * - `TAGINPUT_DEFAULTS` - Default prop values
 *
 * **Key Features:**
 * - Tags are created on Enter key press or when the separator character is typed
 * - Backspace removes the last tag when the input is empty
 * - Optional duplicate prevention and custom validation
 * - `maxTags` limit with automatic input disabling when reached
 *
 * @example Type Usage
 * ```tsx
 * import type { TagInputProps } from '@rottay/design-system';
 *
 * interface SkillsInputProps extends Omit<TagInputProps, 'separator'> {
 *   label: string;
 * }
 * ```
 *
 * @see {@link TagInput} for the main component
 * @module TagInput/Types
 * @category Inputs
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../../foundation/contracts';

/**
 * Size variants for the TagInput component.
 * - `'sm'`: Compact size for dense forms
 * - `'md'`: Default size for standard layouts
 * - `'lg'`: Larger size for prominent inputs
 */
export type TagInputSize = 'sm' | 'md' | 'lg';

/**
 * Props for the TagInput component.
 *
 * Renders an input field that converts typed text into removable tags.
 * Tags are created when the user presses Enter or types the separator
 * character. Supports validation, max limits, and duplicate prevention.
 *
 * @example Basic usage
 * ```tsx
 * <TagInput
 *   value={tags}
 *   placeholder="Add tags..."
 *   onChange={(tags) => setTags(tags)}
 * />
 * ```
 *
 * @example With validation and max limit
 * ```tsx
 * <TagInput
 *   value={skills}
 *   maxTags={5}
 *   validateTag={(tag) => tag.length >= 2}
 *   onRemove={(tag, index) => console.log(`Removed: ${tag}`)}
 *   onChange={(tags) => setSkills(tags)}
 * />
 * ```
 */
export interface TagInputProps extends EngineAwareProps {
  /** Current array of tag values (controlled) */
  value?: string[];
  /** Callback fired when the tags array changes (add or remove) */
  onChange?: (tags: string[]) => void;
  /** Placeholder text shown in the input when no text is being typed */
  placeholder?: string;
  /** Maximum number of tags allowed. Input is disabled when limit is reached. */
  maxTags?: number;
  /** Whether to allow duplicate tag values (default: false) */
  allowDuplicates?: boolean;
  /** Character that triggers tag creation in addition to Enter key (default: ',') */
  separator?: string;
  /** Whether the input and all tags are disabled */
  disabled?: boolean;
  /** Size variant controlling the height and font size */
  size?: TagInputSize;
  /** Whether to display error state styling */
  error?: boolean;
  /** Error message text displayed below the input */
  errorMessage?: string;
  /** HTML name attribute for form submission */
  name?: string;
  /** HTML id attribute for the input element */
  id?: string;
  /** Whether to auto-focus the input on mount */
  autoFocus?: boolean;
  /** Callback fired when a tag is removed, receives the tag value and its index */
  onRemove?: (tag: string, index: number) => void;
  /** Validation function called before adding a tag. Return true to accept, false to reject. */
  validateTag?: (tag: string) => boolean;
}

/**
 * Default values for TagInput component props.
 * Used across all engine implementations for consistency.
 */
export const TAGINPUT_DEFAULTS = {
  /** Comma separator by default */
  separator: ',',
  /** Duplicates rejected by default */
  allowDuplicates: false,
  /** Not disabled by default */
  disabled: false,
  /** Medium size by default */
  size: 'md' as TagInputSize,
  /** No error state by default */
  error: false,
};
