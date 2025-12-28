/**
 * @fileoverview Cascader Component Types - Rottay Design System
 * @description Type definitions for the Cascader component including hierarchical
 * options, selection modes, expand triggers, and customization.
 *
 * @remarks
 * The Cascader types provide comprehensive configuration for:
 * - Hierarchical options: Nested structure with value, label, children
 * - Selection modes: Single or multiple selection
 * - Expand triggers: Click or hover to expand
 * - Customization: Display render, field name mapping
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   CascaderProps,
 *   CascaderOption,
 *   CascaderValue,
 * } from '@rottay/design-system';
 *
 * const options: CascaderOption[] = [
 *   {
 *     value: 'usa',
 *     label: 'United States',
 *     children: [
 *       { value: 'ca', label: 'California' },
 *     ],
 *   },
 * ];
 *
 * const config: CascaderProps = {
 *   options,
 *   expandTrigger: 'hover',
 *   multiple: true,
 * };
 * ```
 *
 * @module Cascader/Types
 * @category Inputs
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Size variants for the Cascader input.
 */
export type CascaderSize = 'small' | 'middle' | 'large';

/**
 * Trigger behavior for expanding child options.
 *
 * @example
 * ```tsx
 * // Click to expand (default)
 * <Cascader expandTrigger="click" />
 *
 * // Hover to expand
 * <Cascader expandTrigger="hover" />
 * ```
 */
export type CascaderExpandTrigger = 'click' | 'hover';

/**
 * Structure for a cascader option with hierarchical children.
 *
 * @example
 * ```tsx
 * const options: CascaderOption[] = [
 *   {
 *     value: 'electronics',
 *     label: 'Electronics',
 *     children: [
 *       { value: 'phones', label: 'Phones', isLeaf: true },
 *       { value: 'laptops', label: 'Laptops', isLeaf: true },
 *     ],
 *   },
 * ];
 * ```
 */
export interface CascaderOption {
  /** Unique value for this option */
  value: string | number;
  /** Display content for this option */
  label: ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Child options (nested hierarchy) */
  children?: CascaderOption[];
  /** Whether this is a leaf node (no children) */
  isLeaf?: boolean;
  /** Additional custom properties */
  [key: string]: unknown;
}

/**
 * Selected value as an array of keys representing the path.
 *
 * @example
 * ```tsx
 * // Single selection: ['usa', 'california', 'sf']
 * // Multiple selection: [['usa', 'ca'], ['usa', 'ny']]
 * ```
 */
export type CascaderValue = (string | number)[];

/**
 * Props for the Cascader component.
 *
 * @example Basic usage
 * ```tsx
 * <Cascader
 *   options={options}
 *   placeholder="Select..."
 *   onChange={(value, options) => handleChange(value)}
 * />
 * ```
 *
 * @example Multiple selection with search
 * ```tsx
 * <Cascader
 *   options={options}
 *   multiple
 *   showSearch
 *   maxTagCount={3}
 * />
 * ```
 */
export interface CascaderProps {
  /** Options data */
  options: CascaderOption[];
  /** Selected value */
  value?: CascaderValue | CascaderValue[];
  /** Default selected value */
  defaultValue?: CascaderValue | CascaderValue[];
  /** Callback when value changes */
  onChange?: (value: CascaderValue | CascaderValue[], selectedOptions: CascaderOption[] | CascaderOption[][]) => void;
  /** Custom display render */
  displayRender?: (labels: string[], selectedOptions?: CascaderOption[]) => ReactNode;
  /** Expand trigger */
  expandTrigger?: CascaderExpandTrigger;
  /** Support multiple selection */
  multiple?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether disabled */
  disabled?: boolean;
  /** Show search input */
  showSearch?: boolean;
  /** Allow clear */
  allowClear?: boolean;
  /** Size of input */
  size?: CascaderSize;
  /** Not found content */
  notFoundContent?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Status */
  status?: 'error' | 'warning';
  /** Open state (controlled) */
  open?: boolean;
  /** Callback when dropdown visibility changes */
  onDropdownVisibleChange?: (open: boolean) => void;
  /** Max tag count (multiple mode) */
  maxTagCount?: number | 'responsive';
  /** Field names mapping */
  fieldNames?: {
    label?: string;
    value?: string;
    children?: string;
  };
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Popup class name */
  popupClassName?: string;
  /** Rendering engine override */
  engine?: 'titan' | 'hermes' | 'apollo';
}

/**
 * Default values for Cascader props.
 * Used across all engine implementations for consistency.
 */
export const CASCADER_DEFAULTS: Partial<CascaderProps> = {
  /** Click to expand children */
  expandTrigger: 'click',
  /** Single selection by default */
  multiple: false,
  /** Not disabled by default */
  disabled: false,
  /** Search hidden by default */
  showSearch: false,
  /** Clear button enabled */
  allowClear: true,
  /** Default size variant */
  size: 'middle',
  /** Default placeholder text */
  placeholder: 'Please select',
};
