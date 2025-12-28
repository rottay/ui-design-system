/**
 * @fileoverview Mentions Component Types - Rottay Design System
 * @description Type definitions for the Mentions component including options,
 * trigger prefixes, search callbacks, and textarea configuration.
 *
 * @remarks
 * The Mentions types provide comprehensive configuration for:
 * - Option structure: Value, label, disabled state
 * - Trigger prefixes: @, #, or custom characters
 * - Async search: onSearch callback for dynamic options
 * - Textarea: Auto-sizing, rows, read-only
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   MentionsProps,
 *   MentionsOption,
 * } from '@rottay/design-system';
 *
 * const users: MentionsOption[] = [
 *   { value: 'john', label: 'John Doe' },
 *   { value: 'jane', label: 'Jane Smith' },
 * ];
 *
 * const config: MentionsProps = {
 *   options: users,
 *   prefix: '@',
 *   autoSize: { minRows: 2, maxRows: 6 },
 * };
 * ```
 *
 * @module Mentions/Types
 * @category Inputs
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Dropdown placement options for the suggestions popup.
 */
export type MentionsPlacement = 'top' | 'bottom';

/**
 * Validation status for the Mentions input.
 */
export type MentionsStatus = 'error' | 'warning';

/**
 * Structure for a mention suggestion option.
 *
 * @example
 * ```tsx
 * const options: MentionsOption[] = [
 *   { value: 'john', label: 'John Doe' },
 *   { value: 'jane', label: <span>Jane Smith</span>, disabled: true },
 * ];
 * ```
 */
export interface MentionsOption {
  /** Unique value to insert when selected */
  value: string;
  /** Display content for this option */
  label?: ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Additional custom properties */
  [key: string]: unknown;
}

/**
 * Props for the Mentions component.
 *
 * @example Basic usage
 * ```tsx
 * <Mentions
 *   options={users}
 *   placeholder="Type @ to mention"
 *   onChange={(value) => setValue(value)}
 * />
 * ```
 *
 * @example With async search
 * ```tsx
 * <Mentions
 *   options={options}
 *   onSearch={(text, prefix) => searchUsers(text)}
 *   onSelect={(option) => console.log('Selected:', option)}
 * />
 * ```
 */
export interface MentionsProps {
  /** Options for mention suggestions */
  options?: MentionsOption[];
  /** Current value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when an option is selected */
  onSelect?: (option: MentionsOption, prefix: string) => void;
  /** Callback when search */
  onSearch?: (text: string, prefix: string) => void;
  /** Trigger prefix character(s) */
  prefix?: string | string[];
  /** Character to split mentions */
  split?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether disabled */
  disabled?: boolean;
  /** Whether readonly */
  readOnly?: boolean;
  /** Auto size textarea */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** Number of rows */
  rows?: number;
  /** Status */
  status?: MentionsStatus;
  /** Dropdown placement */
  placement?: MentionsPlacement;
  /** Not found content */
  notFoundContent?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Filter option function */
  filterOption?: boolean | ((input: string, option: MentionsOption) => boolean);
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Textarea class name */
  textareaClassName?: string;
  /** Popup class name */
  popupClassName?: string;
  /** Rendering engine override */
  engine?: 'titan' | 'hermes' | 'apollo';
}

/**
 * Default values for Mentions props.
 * Used across all engine implementations for consistency.
 */
export const MENTIONS_DEFAULTS: Partial<MentionsProps> = {
  /** Default trigger prefix */
  prefix: '@',
  /** Space to split mentions */
  split: ' ',
  /** Not disabled by default */
  disabled: false,
  /** Editable by default */
  readOnly: false,
  /** Default textarea rows */
  rows: 3,
  /** Dropdown below input */
  placement: 'bottom',
  /** Built-in filtering enabled */
  filterOption: true,
};
