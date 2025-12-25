/**
 * Mentions Component Types
 *
 * Unified type definitions for the Mentions component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Mention option
 */
export interface MentionOption {
  /** Value to insert when selected */
  value: string;
  /** Display label */
  label?: ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Additional data */
  [key: string]: unknown;
}

/**
 * Size variants for Mentions
 */
export type MentionsSize = 'small' | 'middle' | 'large';

/**
 * Status variants for Mentions
 */
export type MentionsStatus = 'error' | 'warning';

/**
 * Placement for the dropdown
 */
export type MentionsPlacement = 'top' | 'bottom';

/**
 * Base props shared by all Mentions implementations
 */
export interface MentionsBaseProps {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Current value (controlled) */
  value?: string;

  /** Default value (uncontrolled) */
  defaultValue?: string;

  /** Mention options */
  options?: MentionOption[];

  /** Placeholder text */
  placeholder?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  /** Whether the input is read-only */
  readOnly?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Trigger
  // ─────────────────────────────────────────────────────────────────────────────

  /** Character(s) to trigger the mention dropdown */
  prefix?: string | string[];

  /** Split character for mentions */
  split?: string;

  /** Content to show when no options match */
  notFoundContent?: ReactNode;

  // ─────────────────────────────────────────────────────────────────────────────
  // Appearance
  // ─────────────────────────────────────────────────────────────────────────────

  /** Size of the input */
  size?: MentionsSize;

  /** Status of the input (error/warning styling) */
  status?: MentionsStatus;

  /** Allow clearing the input */
  allowClear?: boolean;

  /** Whether the input has a border */
  bordered?: boolean;

  /** Variant style */
  variant?: 'outlined' | 'borderless' | 'filled';

  /** Auto size the textarea */
  autoSize?: boolean | { minRows?: number; maxRows?: number };

  /** Number of rows */
  rows?: number;

  // ─────────────────────────────────────────────────────────────────────────────
  // Dropdown Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Whether the dropdown is open (controlled) */
  open?: boolean;

  /** Placement of dropdown */
  placement?: MentionsPlacement;

  /** Class name for dropdown */
  popupClassName?: string;

  /** Get popup container */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  // ─────────────────────────────────────────────────────────────────────────────
  // Filtering
  // ─────────────────────────────────────────────────────────────────────────────

  /** Custom filter function */
  filterOption?: boolean | ((input: string, option: MentionOption) => boolean);

  /** Validate search text before filtering */
  validateSearch?: (text: string, props: MentionsBaseProps) => boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────────────────

  /** Callback when value changes */
  onChange?: (value: string) => void;

  /** Callback when an option is selected */
  onSelect?: (option: MentionOption, prefix: string) => void;

  /** Callback when searching */
  onSearch?: (text: string, prefix: string) => void;

  /** Callback when dropdown visibility changes */
  onPopupVisibleChange?: (visible: boolean) => void;

  /** Callback on focus */
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;

  /** Callback on blur */
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;

  /** Callback on key down */
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;

  /** Callback on press enter */
  onPressEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;

  // ─────────────────────────────────────────────────────────────────────────────
  // Styling
  // ─────────────────────────────────────────────────────────────────────────────

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** ID for the input */
  id?: string;

  /** Name attribute */
  name?: string;

  /** Auto focus */
  autoFocus?: boolean;
}

/**
 * Full Mentions props
 */
export interface MentionsProps extends MentionsBaseProps {
  /** Loading state */
  loading?: boolean;

  /** Custom dropdown render */
  dropdownRender?: (menu: ReactNode) => ReactNode;

  /** Custom option render */
  optionRender?: (option: MentionOption, info: { index: number }) => ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default filter function for mentions
 */
export function defaultMentionFilter(input: string, option: MentionOption): boolean {
  const label = String(option.label ?? option.value);
  return label.toLowerCase().includes(input.toLowerCase());
}

/**
 * Extract mention text from cursor position
 */
export function extractMentionText(
  value: string,
  cursorPosition: number,
  prefix: string | string[]
): { text: string; prefix: string; start: number } | null {
  const prefixes = Array.isArray(prefix) ? prefix : [prefix];
  const textBeforeCursor = value.slice(0, cursorPosition);

  for (const p of prefixes) {
    const lastPrefixIndex = textBeforeCursor.lastIndexOf(p);
    if (lastPrefixIndex !== -1) {
      const textAfterPrefix = textBeforeCursor.slice(lastPrefixIndex + p.length);
      // Check if there's no space after the prefix
      if (!textAfterPrefix.includes(' ')) {
        return {
          text: textAfterPrefix,
          prefix: p,
          start: lastPrefixIndex,
        };
      }
    }
  }

  return null;
}

/**
 * Insert mention into text
 */
export function insertMention(
  value: string,
  mentionText: string,
  start: number,
  prefix: string,
  split: string = ' '
): { value: string; cursorPosition: number } {
  const before = value.slice(0, start);
  const after = value.slice(start);

  // Find where the current mention ends
  const spaceIndex = after.indexOf(' ');
  const afterMention = spaceIndex !== -1 ? after.slice(spaceIndex) : '';

  const newValue = `${before}${prefix}${mentionText}${split}${afterMention.trim()}`;
  const cursorPosition = before.length + prefix.length + mentionText.length + split.length;

  return { value: newValue, cursorPosition };
}

/**
 * Get mentions from text
 */
export function getMentions(
  value: string,
  prefix: string | string[] = '@',
  split: string = ' '
): string[] {
  const prefixes = Array.isArray(prefix) ? prefix : [prefix];
  const mentions: string[] = [];

  for (const p of prefixes) {
    const regex = new RegExp(`${escapeRegex(p)}([^${escapeRegex(split)}]+)`, 'g');
    let match;
    while ((match = regex.exec(value)) !== null) {
      mentions.push(match[1]);
    }
  }

  return mentions;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
