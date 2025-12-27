/**
 * Mentions Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type MentionsPlacement = 'top' | 'bottom';
export type MentionsStatus = 'error' | 'warning';

export interface MentionsOption {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  [key: string]: unknown;
}

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

export const MENTIONS_DEFAULTS: Partial<MentionsProps> = {
  prefix: '@',
  split: ' ',
  disabled: false,
  readOnly: false,
  rows: 3,
  placement: 'bottom',
  filterOption: true,
};
