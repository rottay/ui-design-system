/**
 * @fileoverview AutoComplete Component Types - Rottay Design System
 * @description Type definitions for the AutoComplete component including options,
 * filtering, search callbacks, and customization.
 *
 * @remarks
 * The AutoComplete types provide comprehensive configuration for:
 * - Option structure: Value, label, disabled state
 * - Filtering: Built-in or custom filter functions
 * - Async search: onSearch callback for dynamic options
 * - Customization: Sizes, status, popup styling
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   AutoCompleteProps,
 *   AutoCompleteOption,
 * } from '@rottay/design-system';
 *
 * const options: AutoCompleteOption[] = [
 *   { value: 'react', label: 'React Framework' },
 *   { value: 'vue', label: 'Vue.js' },
 * ];
 *
 * const config: AutoCompleteProps = {
 *   options,
 *   filterOption: true,
 *   placeholder: 'Search...',
 * };
 * ```
 *
 * @module AutoComplete/Types
 * @category Inputs
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';
import type { Size } from '../../../../../foundation/contracts/kernel/common';

/**
 * Size variants for the AutoComplete input, derived from the canonical {@link Size} scale.
 */
export type AutoCompleteSize = Extract<Size, 'sm' | 'md' | 'lg'>;

/**
 * @deprecated Legacy antd-style spelling; use {@link AutoCompleteSize} ('sm' | 'md' | 'lg')
 * instead. Retained for one release so existing values keep compiling.
 */
export type LegacyAutoCompleteSize = 'small' | 'middle' | 'large';

/**
 * Structure for an autocomplete option.
 *
 * @example
 * ```tsx
 * const options: AutoCompleteOption[] = [
 *   { value: 'react' },
 *   { value: 'vue', label: <span>💚 Vue</span> },
 *   { value: 'angular', disabled: true },
 * ];
 * ```
 */
export interface AutoCompleteOption {
  /** The value to be selected and returned */
  value: string;
  /** Custom display content (defaults to value) */
  label?: ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Additional custom properties */
  [key: string]: unknown;
}

/**
 * Props for the AutoComplete component.
 *
 * @example Basic usage
 * ```tsx
 * <AutoComplete
 *   options={options}
 *   placeholder="Search..."
 *   onChange={(value) => setQuery(value)}
 * />
 * ```
 *
 * @example With async search
 * ```tsx
 * <AutoComplete
 *   options={asyncOptions}
 *   onSearch={(text) => fetchOptions(text)}
 *   onSelect={(value, option) => handleSelect(option)}
 * />
 * ```
 */
export interface AutoCompleteProps {
  /** Options list */
  options?: AutoCompleteOption[];
  /** Current value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when search */
  onSearch?: (value: string) => void;
  /** Callback when option is selected */
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  /** Custom filter function */
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean);
  /** Placeholder text */
  placeholder?: string;
  /** Whether disabled */
  disabled?: boolean;
  /** Whether to allow clear */
  allowClear?: boolean;
  /** Auto focus */
  autoFocus?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Open state (controlled) */
  open?: boolean;
  /** Callback when dropdown visibility changes */
  onDropdownVisibleChange?: (open: boolean) => void;
  /** Size of input */
  size?: AutoCompleteSize | LegacyAutoCompleteSize;
  /** Status */
  status?: 'error' | 'warning';
  /** Not found content */
  notFoundContent?: ReactNode;
  /**
   * Async posture for the suggestion list. While `true` the open panel shows
   * the loading state and never the not-found copy: a list still awaiting
   * results must not claim it found nothing. Suggestions that are already
   * loaded keep rendering, so a background refresh does not blank the list.
   */
  loading?: boolean;
  /**
   * Copy shown beside the loading indicator. Defaults to the localized
   * `autocomplete.loading` entry.
   */
  loadingText?: ReactNode;
  /** Dropdown class name */
  popupClassName?: string;
  /** Dropdown match select width */
  popupMatchSelectWidth?: boolean | number;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: 'classic' | 'modern' | 'rustic';
}

/**
 * Default values for AutoComplete props.
 * Used across all engine implementations for consistency.
 */
export const AUTOCOMPLETE_DEFAULTS: Partial<AutoCompleteProps> = {
  /** Not disabled by default */
  disabled: false,
  /** Clear button hidden by default */
  allowClear: false,
  /** No auto focus by default */
  autoFocus: false,
  /** Default size variant */
  size: 'middle',
  /** Dropdown matches input width */
  popupMatchSelectWidth: true,
  /** Built-in filtering enabled */
  filterOption: true,
};
