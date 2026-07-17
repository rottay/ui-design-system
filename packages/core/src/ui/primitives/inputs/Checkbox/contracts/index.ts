/**
 * @fileoverview Checkbox Types - Rottay Design System
 * @description Type definitions, interfaces, and constants for the Checkbox component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Checkbox component,
 * including all props, sizes, color variants, and group configuration.
 *
 * **Available Types:**
 * - `CheckboxProps` - Main component props interface
 * - `CheckboxSize` - Size variants (xs, sm, md, lg, xl)
 * - `CheckboxVariant` - Color variants (default, primary, secondary, success, warning, error)
 * - `CheckboxRadius` - Border radius options (none, sm, md, lg, full)
 * - `CheckboxLabelPlacement` - Label position (start, end)
 * - `CheckboxGroupProps` - Props for Checkbox.Group compound component
 * - `CheckboxOption` - Option structure for group mode
 *
 * **CSS Custom Properties:**
 * - Size: `--ds-checkbox-{size}-size` for checkbox dimensions
 * - Radius: `--ds-checkbox-radius-{radius}` for border radius
 * - Colors are mapped via COLOR_MAP to CSS variables
 *
 * @example Using Types
 * ```tsx
 * import type { CheckboxProps, CheckboxSize, CheckboxOption } from '@rottay/design-system';
 *
 * // Typed options array
 * const options: CheckboxOption[] = [
 *   { value: 'a', label: 'Option A' },
 *   { value: 'b', label: 'Option B', disabled: true },
 * ];
 *
 * // Custom checkbox wrapper
 * const MyCheckbox: React.FC<CheckboxProps> = (props) => {
 *   return <Checkbox {...props} />;
 * };
 * ```
 *
 * @example Using Constants
 * ```tsx
 * import { CHECKBOX_DEFAULTS, SIZE_MAP, COLOR_MAP } from '@rottay/design-system';
 *
 * console.log(CHECKBOX_DEFAULTS.size);  // 'md'
 * console.log(CHECKBOX_DEFAULTS.color); // 'primary'
 * console.log(COLOR_MAP.success.bg);    // 'var(--ds-color-success, #52c41a)'
 * ```
 *
 * @see {@link Checkbox} for the main component
 * @see {@link CheckboxGroup} for grouping checkboxes
 * @module CheckboxTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../../foundation/contracts';
import type { ReactNode, ChangeEvent, CSSProperties } from 'react';

/**
 * Size variants for the Checkbox component.
 * Maps to CSS custom properties `--ds-checkbox-{size}-size` via {@link SIZE_MAP}
 * and pixel values via {@link SIZE_MAP_NUMERIC}.
 */
export type CheckboxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color variants applied when the checkbox is checked.
 * Each variant maps to background, border, and checkmark colors
 * via {@link COLOR_MAP} and the tenant's CSS custom properties.
 */
export type CheckboxVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

/**
 * Border radius options for the checkbox indicator.
 * - `none` - Sharp corners (square)
 * - `sm` - Slightly rounded (default)
 * - `md` - Medium rounding
 * - `lg` - Large rounding
 * - `full` - Fully rounded (circle)
 */
export type CheckboxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Position of the label text relative to the checkbox indicator.
 * - `start` - Label appears before (left in LTR) the checkbox
 * - `end` - Label appears after (right in LTR) the checkbox
 */
export type CheckboxLabelPlacement = 'start' | 'end';

/**
 * Option structure for Checkbox.Group when using the `options` prop
 * instead of declarative `<Checkbox>` children.
 *
 * @example
 * ```tsx
 * const options: CheckboxOption[] = [
 *   { value: 'read', label: 'Read' },
 *   { value: 'write', label: 'Write', disabled: true },
 * ];
 * <Checkbox.Group options={options} />
 * ```
 */
export interface CheckboxOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Props for the Checkbox component.
 *
 * Supports controlled and uncontrolled modes, indeterminate state for
 * "select all" patterns, multiple color variants, configurable border radius,
 * and label placement.
 *
 * @example Basic controlled checkbox
 * ```tsx
 * <Checkbox
 *   checked={agreed}
 *   onChange={(checked) => setAgreed(checked)}
 *   label="I agree to the terms"
 *   color="primary"
 * />
 * ```
 *
 * @example Indeterminate "select all" pattern
 * ```tsx
 * <Checkbox
 *   indeterminate={someChecked && !allChecked}
 *   checked={allChecked}
 *   onChange={(checked) => toggleAll(checked)}
 *   label="Select all"
 * />
 * ```
 */
export interface CheckboxProps extends EngineAwareProps {
  /** Checkbox size */
  size?: CheckboxSize;
  /** Color variant when checked */
  color?: CheckboxVariant;
  /** Border radius */
  radius?: CheckboxRadius;
  /** Label placement relative to checkbox */
  labelPlacement?: CheckboxLabelPlacement;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Label text */
  label?: ReactNode;
  /** Description text */
  description?: ReactNode;
  /** Children (alternative to label) */
  children?: ReactNode;
  /** Change handler */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Value attribute */
  value?: string | number;
  /** Autofocus attribute */
  autoFocus?: boolean;
}

/**
 * Props for the Checkbox.Group compound component.
 * Manages a set of checkboxes as a single form control, tracking an array of selected values.
 *
 * @example Using options prop
 * ```tsx
 * <Checkbox.Group
 *   options={[
 *     { value: 'a', label: 'Option A' },
 *     { value: 'b', label: 'Option B' },
 *   ]}
 *   value={selected}
 *   onChange={(vals) => setSelected(vals)}
 *   direction="horizontal"
 * />
 * ```
 *
 * @example Using children
 * ```tsx
 * <Checkbox.Group value={selected} onChange={setSelected}>
 *   <Checkbox value="a" label="Option A" />
 *   <Checkbox value="b" label="Option B" />
 * </Checkbox.Group>
 * ```
 */
export interface CheckboxGroupProps extends EngineAwareProps {
  /** Group size */
  size?: CheckboxSize;
  /** Color variant */
  color?: CheckboxVariant;
  /** Options array */
  options?: CheckboxOption[];
  /** Selected values (controlled) */
  value?: (string | number)[];
  /** Default selected values (uncontrolled) */
  defaultValue?: (string | number)[];
  /** Disabled state */
  disabled?: boolean;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Spacing between items */
  spacing?: 'sm' | 'md' | 'lg';
  /** Change handler */
  onChange?: (values: (string | number)[]) => void;
  /** Children (Checkbox components) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms */
  name?: string;
}

/**
 * Default values for Checkbox component props.
 * Applied when no explicit value is provided by the consumer.
 *
 * @constant
 * @property {string} size - Default size variant ('md')
 * @property {string} color - Default color variant ('primary')
 * @property {string} radius - Default border radius ('sm')
 * @property {string} labelPlacement - Default label position ('end')
 * @property {boolean} defaultChecked - Default checked state (false)
 * @property {boolean} indeterminate - Default indeterminate state (false)
 * @property {boolean} disabled - Default disabled state (false)
 * @property {boolean} required - Default required state (false)
 * @property {boolean} error - Default error state (false)
 */
export const CHECKBOX_DEFAULTS = {
  size: 'md' as CheckboxSize,
  color: 'primary' as CheckboxVariant,
  radius: 'sm' as CheckboxRadius,
  labelPlacement: 'end' as CheckboxLabelPlacement,
  defaultChecked: false,
  indeterminate: false,
  disabled: false,
  required: false,
  error: false,
};

/**
 * Default values for Checkbox.Group component props.
 *
 * @constant
 * @property {string} size - Default size for all child checkboxes ('md')
 * @property {string} color - Default color for all child checkboxes ('primary')
 * @property {string} direction - Default layout direction ('vertical')
 * @property {string} spacing - Default gap between items ('md')
 * @property {boolean} disabled - Default disabled state (false)
 */
export const CHECKBOX_GROUP_DEFAULTS = {
  size: 'md' as CheckboxSize,
  color: 'primary' as CheckboxVariant,
  direction: 'vertical' as const,
  spacing: 'md' as const,
  disabled: false,
};

/**
 * Size mapping to CSS custom properties.
 * Each size variant references a `--ds-checkbox-{size}-size` CSS variable
 * that controls both width and height of the checkbox indicator.
 *
 * @constant
 */
export const SIZE_MAP: Record<CheckboxSize, string> = {
  xs: 'var(--ds-checkbox-xs-size)',
  sm: 'var(--ds-checkbox-sm-size)',
  md: 'var(--ds-checkbox-md-size)',
  lg: 'var(--ds-checkbox-lg-size)',
  xl: 'var(--ds-checkbox-xl-size)',
};

/**
 * Numeric size values in pixels for calculations that cannot use CSS variables
 * (e.g., SVG checkmark path sizing, canvas rendering).
 *
 * @constant
 */
export const SIZE_MAP_NUMERIC: Record<CheckboxSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
};

/**
 * Color configuration mapping for each checkbox variant.
 * References CSS custom properties with hardcoded fallback values.
 *
 * @constant
 * @property {string} bg - Background color when checked
 * @property {string} border - Border color when checked
 * @property {string} check - Checkmark stroke color (always white)
 */
export const COLOR_MAP: Record<CheckboxVariant, { bg: string; border: string; check: string }> = {
  default: {
    bg: 'var(--ds-color-neutral-600, #4b5563)',
    border: 'var(--ds-color-neutral-600, #4b5563)',
    check: '#ffffff',
  },
  primary: {
    bg: 'var(--ds-color-primary-500, #1890ff)',
    border: 'var(--ds-color-primary-500, #1890ff)',
    check: '#ffffff',
  },
  secondary: {
    bg: 'var(--ds-color-secondary-500, #6b7280)',
    border: 'var(--ds-color-secondary-500, #6b7280)',
    check: '#ffffff',
  },
  success: {
    bg: 'var(--ds-color-success-500, #52c41a)',
    border: 'var(--ds-color-success-500, #52c41a)',
    check: '#ffffff',
  },
  warning: {
    bg: 'var(--ds-color-warning-500, #faad14)',
    border: 'var(--ds-color-warning-500, #faad14)',
    check: '#ffffff',
  },
  error: {
    bg: 'var(--ds-color-error-500, #ff4d4f)',
    border: 'var(--ds-color-error-500, #ff4d4f)',
    check: '#ffffff',
  },
};

/**
 * Border radius mapping to CSS custom properties.
 * Controls the corner rounding of the checkbox indicator.
 *
 * @constant
 */
export const RADIUS_MAP: Record<CheckboxRadius, string> = {
  none: 'var(--ds-checkbox-radius-none)',
  sm: 'var(--ds-checkbox-radius-sm)',
  md: 'var(--ds-checkbox-radius-md)',
  lg: 'var(--ds-checkbox-radius-lg)',
  full: 'var(--ds-checkbox-radius-full)',
};
