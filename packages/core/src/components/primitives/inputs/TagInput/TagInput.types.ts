/**
 * @fileoverview TagInput Types - Rottay Design System
 * @description Type definitions for the TagInput component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module TagInput/Types
 * @category Inputs
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../contracts';

/** Size variants for TagInput */
export type TagInputSize = 'sm' | 'md' | 'lg';

/**
 * Props for the TagInput component.
 * An input that creates tags on Enter or separator key.
 */
export interface TagInputProps extends EngineAwareProps {
  /** Current tag values */
  value?: string[];
  /** Callback when tags change */
  onChange?: (tags: string[]) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Maximum number of tags allowed */
  maxTags?: number;
  /** Allow duplicate tag values */
  allowDuplicates?: boolean;
  /** Character(s) that trigger tag creation (default: ',') */
  separator?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: TagInputSize;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Name attribute for forms */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Auto focus */
  autoFocus?: boolean;
  /** Callback when a tag is removed */
  onRemove?: (tag: string, index: number) => void;
  /** Validate tag before adding (return true to accept) */
  validateTag?: (tag: string) => boolean;
}

/**
 * Default values for TagInput component props.
 */
export const TAGINPUT_DEFAULTS = {
  separator: ',',
  allowDuplicates: false,
  disabled: false,
  size: 'md' as TagInputSize,
  error: false,
};
