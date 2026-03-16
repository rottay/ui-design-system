/**
 * @fileoverview Radio Types - Rottay Design System
 * @description Type definitions, interfaces, and constants for the Radio component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Radio component,
 * including all props, sizes, color variants, and group configuration.
 *
 * **Available Types:**
 * - `RadioProps` - Main component props interface
 * - `RadioSize` - Size variants (xs, sm, md, lg, xl)
 * - `RadioVariant` - Color variants (default, primary, secondary, success, warning, error)
 * - `RadioLabelPlacement` - Label position (start, end)
 * - `RadioGroupProps` - Props for Radio.Group compound component
 * - `RadioOption` - Option structure for group mode (includes description)
 *
 * **CSS Custom Properties:**
 * - Size: `--ds-radio-{size}-size` for radio dimensions
 * - Colors are mapped via COLOR_MAP to CSS variables
 *
 * **Key Differences from Checkbox Types:**
 * - RadioGroupProps uses single `value` instead of array
 * - RadioOption includes optional `description` field
 * - No indeterminate state (radios are always checked or unchecked)
 *
 * @example Using Types
 * ```tsx
 * import type { RadioProps, RadioSize, RadioOption } from '@rottay/design-system';
 *
 * // Typed options with descriptions
 * const options: RadioOption[] = [
 *   { value: 'free', label: 'Free Plan', description: 'Limited features' },
 *   { value: 'pro', label: 'Pro Plan', description: 'All features' },
 * ];
 *
 * // Custom radio wrapper
 * const MyRadio: React.FC<RadioProps> = (props) => {
 *   return <Radio {...props} />;
 * };
 * ```
 *
 * @example Using Constants
 * ```tsx
 * import { RADIO_DEFAULTS, SIZE_MAP, COLOR_MAP } from '@rottay/design-system';
 *
 * console.log(RADIO_DEFAULTS.size);  // 'md'
 * console.log(RADIO_DEFAULTS.color); // 'primary'
 * console.log(COLOR_MAP.success.bg); // 'var(--ds-color-success, #52c41a)'
 * ```
 *
 * @see {@link Radio} for the main component
 * @see {@link RadioGroup} for grouping radios
 * @module RadioTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../contracts';
import type { ReactNode, ChangeEvent, CSSProperties } from 'react';

/**
 * Size variants for the Radio component.
 * Maps to CSS custom properties `--ds-radio-{size}-size` via {@link SIZE_MAP}
 * and pixel values via {@link SIZE_MAP_NUMERIC}.
 */
export type RadioSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color variants applied when the radio button is selected.
 * Each variant maps to background, border, and inner dot colors
 * via {@link COLOR_MAP} and the tenant's CSS custom properties.
 */
export type RadioVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

/**
 * Position of the label text relative to the radio indicator.
 * - `start` - Label appears before (left in LTR) the radio
 * - `end` - Label appears after (right in LTR) the radio
 */
export type RadioLabelPlacement = 'start' | 'end';

/**
 * Option structure for Radio.Group when using the `options` prop.
 * Includes an optional `description` field for richer option displays
 * (e.g., pricing plans, feature descriptions).
 *
 * @example
 * ```tsx
 * const plans: RadioOption[] = [
 *   { value: 'free', label: 'Free', description: 'Limited features' },
 *   { value: 'pro', label: 'Pro', description: 'All features included' },
 * ];
 * <Radio.Group options={plans} />
 * ```
 */
export interface RadioOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Description text */
  description?: ReactNode;
}

/**
 * Props for the Radio component.
 *
 * Supports controlled and uncontrolled modes, multiple color variants,
 * label placement, and optional description text. Unlike Checkbox,
 * Radio does not support an indeterminate state.
 *
 * @example Basic controlled radio
 * ```tsx
 * <Radio
 *   checked={selectedPlan === 'pro'}
 *   onChange={() => setSelectedPlan('pro')}
 *   label="Pro Plan"
 *   description="All features included"
 *   color="primary"
 * />
 * ```
 *
 * @example Within a group (preferred)
 * ```tsx
 * <Radio.Group value={plan} onChange={setPlan} name="plan">
 *   <Radio value="free" label="Free" />
 *   <Radio value="pro" label="Pro" />
 * </Radio.Group>
 * ```
 */
export interface RadioProps extends EngineAwareProps {
  /** Radio size */
  size?: RadioSize;
  /** Color variant when checked */
  color?: RadioVariant;
  /** Label placement relative to radio */
  labelPlacement?: RadioLabelPlacement;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
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
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms (required for radio groups) */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Value attribute */
  value?: string | number;
  /** Autofocus attribute */
  autoFocus?: boolean;
}

/**
 * Props for the Radio.Group compound component.
 * Manages a set of radio buttons as a single form control, tracking a single selected value.
 * Unlike Checkbox.Group, only one value can be selected at a time.
 *
 * @example Using options prop
 * ```tsx
 * <Radio.Group
 *   options={[
 *     { value: 'sm', label: 'Small' },
 *     { value: 'lg', label: 'Large' },
 *   ]}
 *   value={size}
 *   onChange={(val) => setSize(val)}
 *   direction="horizontal"
 *   buttonStyle="solid"
 * />
 * ```
 *
 * @example Using children
 * ```tsx
 * <Radio.Group value={size} onChange={setSize} name="size">
 *   <Radio value="sm" label="Small" />
 *   <Radio value="lg" label="Large" />
 * </Radio.Group>
 * ```
 */
export interface RadioGroupProps extends EngineAwareProps {
  /** Group size */
  size?: RadioSize;
  /** Color variant */
  color?: RadioVariant;
  /** Options array */
  options?: RadioOption[];
  /** Selected value (controlled) */
  value?: string | number;
  /** Default selected value (uncontrolled) */
  defaultValue?: string | number;
  /** Disabled state */
  disabled?: boolean;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Spacing between items */
  spacing?: 'sm' | 'md' | 'lg';
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Children (Radio components) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms */
  name?: string;
  /** Button style variant */
  buttonStyle?: 'outline' | 'solid';
}

/**
 * Default values for Radio component props.
 * Applied when no explicit value is provided by the consumer.
 *
 * @constant
 * @property {string} size - Default size variant ('md')
 * @property {string} color - Default color variant ('primary')
 * @property {string} labelPlacement - Default label position ('end')
 * @property {boolean} defaultChecked - Default checked state (false)
 * @property {boolean} disabled - Default disabled state (false)
 * @property {boolean} required - Default required state (false)
 * @property {boolean} error - Default error state (false)
 */
export const RADIO_DEFAULTS = {
  size: 'md' as RadioSize,
  color: 'primary' as RadioVariant,
  labelPlacement: 'end' as RadioLabelPlacement,
  defaultChecked: false,
  disabled: false,
  required: false,
  error: false,
};

/**
 * Default values for Radio.Group component props.
 *
 * @constant
 * @property {string} size - Default size for all child radios ('md')
 * @property {string} color - Default color for all child radios ('primary')
 * @property {string} direction - Default layout direction ('vertical')
 * @property {string} spacing - Default gap between items ('md')
 * @property {boolean} disabled - Default disabled state (false)
 */
export const RADIO_GROUP_DEFAULTS = {
  size: 'md' as RadioSize,
  color: 'primary' as RadioVariant,
  direction: 'vertical' as const,
  spacing: 'md' as const,
  disabled: false,
};

/**
 * Size mapping to CSS custom properties.
 * Each size variant references a `--ds-radio-{size}-size` CSS variable
 * that controls both width and height of the radio indicator.
 *
 * @constant
 */
export const SIZE_MAP: Record<RadioSize, string> = {
  xs: 'var(--ds-radio-xs-size)',
  sm: 'var(--ds-radio-sm-size)',
  md: 'var(--ds-radio-md-size)',
  lg: 'var(--ds-radio-lg-size)',
  xl: 'var(--ds-radio-xl-size)',
};

/**
 * Numeric size values in pixels for calculations that cannot use CSS variables
 * (e.g., SVG inner dot sizing, canvas rendering).
 *
 * @constant
 */
export const SIZE_MAP_NUMERIC: Record<RadioSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
};

/**
 * Color configuration mapping for each radio variant.
 * References CSS custom properties with hardcoded fallback values.
 *
 * @constant
 * @property {string} bg - Background color when selected
 * @property {string} border - Border color when selected
 * @property {string} dot - Inner dot color (always white)
 */
export const COLOR_MAP: Record<RadioVariant, { bg: string; border: string; dot: string }> = {
  default: {
    bg: 'var(--ds-color-neutral-600, #4b5563)',
    border: 'var(--ds-color-neutral-600, #4b5563)',
    dot: '#ffffff',
  },
  primary: {
    bg: 'var(--ds-color-primary-500, #1890ff)',
    border: 'var(--ds-color-primary-500, #1890ff)',
    dot: '#ffffff',
  },
  secondary: {
    bg: 'var(--ds-color-secondary-500, #6b7280)',
    border: 'var(--ds-color-secondary-500, #6b7280)',
    dot: '#ffffff',
  },
  success: {
    bg: 'var(--ds-color-success-500, #52c41a)',
    border: 'var(--ds-color-success-500, #52c41a)',
    dot: '#ffffff',
  },
  warning: {
    bg: 'var(--ds-color-warning-500, #faad14)',
    border: 'var(--ds-color-warning-500, #faad14)',
    dot: '#ffffff',
  },
  error: {
    bg: 'var(--ds-color-error-500, #ff4d4f)',
    border: 'var(--ds-color-error-500, #ff4d4f)',
    dot: '#ffffff',
  },
};
