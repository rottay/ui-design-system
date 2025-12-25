/**
 * Slider Component Types
 *
 * Unified type definitions for Slider component across all engines.
 * These types are implemented by titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Tooltip configuration for slider
 */
export interface SliderTooltipProps {
  /** Whether to show tooltip */
  open?: boolean;
  /** Tooltip placement */
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
  /** Tooltip value formatter */
  formatter?: ((value?: number) => ReactNode) | null;
}

/**
 * Mark style and label configuration
 */
export interface SliderMarkConfig {
  /** Custom style for the mark */
  style?: CSSProperties;
  /** Label content (string or ReactNode) */
  label?: ReactNode;
}

/**
 * Marks definition - can be simple strings or detailed configurations
 */
export type SliderMarks = Record<number, ReactNode | SliderMarkConfig>;

/**
 * Slider value type - can be single number or range tuple
 */
export type SliderValue = number | [number, number];

/**
 * Base Slider Props
 *
 * Common properties supported by ALL engines.
 * All engines MUST implement these props.
 */
export interface SliderBaseProps {
  /**
   * Current value (controlled)
   * - number: single value
   * - [number, number]: range values
   */
  value?: SliderValue;

  /**
   * Default value (uncontrolled)
   * - number: single value
   * - [number, number]: range values
   */
  defaultValue?: SliderValue;

  /**
   * Minimum value
   * @default 0
   */
  min?: number;

  /**
   * Maximum value
   * @default 100
   */
  max?: number;

  /**
   * Step size for value increments
   * - number: specific step (e.g., 1, 5, 10)
   * - null: continuous (no stepping)
   * @default 1
   */
  step?: number | null;

  /**
   * Whether to enable range mode (dual handles)
   * @default false
   */
  range?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Change handler - called while dragging
   * @param value - current value or range
   */
  onChange?: (value: SliderValue) => void;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: CSSProperties;
}

/**
 * Slider Props
 *
 * Extended properties with engine-specific features.
 * Some props may be ignored by certain engines.
 */
export interface SliderProps extends SliderBaseProps {
  /**
   * Marks to show on the slider
   * - titan: full support with custom styles and labels
   * - hermes: basic support with text labels
   * - apollo: custom implementation with positioned labels
   * @engine-specific Styling may vary between engines
   */
  marks?: SliderMarks;

  /**
   * Show dots at each step
   * - titan: full support
   * - hermes: limited support
   * - apollo: custom implementation
   * @default false
   */
  dots?: boolean;

  /**
   * Whether to include the starting point in the range
   * - titan: full support
   * - hermes: limited support
   * - apollo: custom implementation
   * @default true
   */
  included?: boolean;

  /**
   * Reverse the slider direction
   * - titan: full support
   * - hermes: limited support
   * - apollo: CSS-based implementation
   * @default false
   */
  reverse?: boolean;

  /**
   * Vertical orientation
   * - titan: full support
   * - hermes: limited support
   * - apollo: CSS transform implementation
   * @default false
   */
  vertical?: boolean;

  /**
   * Tooltip configuration
   * - titan: full support with rich customization
   * - hermes: basic support
   * - apollo: custom implementation with HTML tooltips
   * @engine-specific Appearance may vary between engines
   */
  tooltip?: SliderTooltipProps;

  /**
   * Change complete handler - called after drag ends
   * @param value - final value or range
   * - titan: full support
   * - hermes: supported via onMouseUp/onTouchEnd
   * - apollo: supported via onMouseUp/onTouchEnd
   */
  onChangeComplete?: (value: SliderValue) => void;

  /**
   * ID attribute for the slider input
   */
  id?: string;

  /**
   * Name attribute for the slider input
   */
  name?: string;

  /**
   * Auto focus on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Tab index for keyboard navigation
   */
  tabIndex?: number;
}
