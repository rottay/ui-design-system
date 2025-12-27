/**
 * Rate Component Types
 * Star rating component with support for multiple engines
 * @module Rate
 */

import type { ReactNode, CSSProperties, HTMLAttributes } from 'react';

/**
 * Available size options for the Rate component
 * @description Sizes map to CSS variables for consistent styling
 */
export type RateSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Available engine options
 */
export type RateEngine = 'titan' | 'hermes' | 'apollo';

/**
 * Character render function props
 */
export interface RateCharacterProps {
  /** Current star index (0-based) */
  index: number;
  /** Current display value */
  value: number;
}

/**
 * Rate Component Props
 * @description Props interface for the Rate star rating component
 */
export interface RateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Current rating value (controlled mode)
   * @description When provided, component becomes controlled
   */
  value?: number;

  /**
   * Default rating value (uncontrolled mode)
   * @default 0
   */
  defaultValue?: number;

  /**
   * Total number of stars to display
   * @default 5
   */
  count?: number;

  /**
   * Allow selection of half stars
   * @default false
   */
  allowHalf?: boolean;

  /**
   * Allow clearing the rating by clicking the same star
   * @default true
   */
  allowClear?: boolean;

  /**
   * Whether the rating is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the rating is read-only (displays value but not interactive)
   * @default false
   */
  readOnly?: boolean;

  /**
   * Callback fired when the value changes
   * @param value - The new rating value
   */
  onChange?: (value: number) => void;

  /**
   * Callback fired when hovering over stars
   * @param value - The hovered value (0 when not hovering)
   */
  onHoverChange?: (value: number) => void;

  /**
   * Custom character/icon for each star
   * @description Can be a ReactNode or a render function for dynamic characters
   */
  character?: ReactNode | ((props: RateCharacterProps) => ReactNode);

  /**
   * Custom class name for the container
   */
  className?: string;

  /**
   * Custom inline styles for the container
   */
  style?: CSSProperties;

  /**
   * Array of tooltips for each star
   * @description Index corresponds to star (0-based)
   */
  tooltips?: string[];

  /**
   * Auto focus on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Enable keyboard navigation
   * @default true
   */
  keyboard?: boolean;

  /**
   * Size of the rate component
   * @default 'md'
   */
  size?: RateSize;

  /**
   * Engine override for this component instance
   * @description Overrides the global engine setting
   */
  engine?: RateEngine;

  /**
   * Direction of the rating (for RTL support)
   * @default 'ltr'
   */
  direction?: 'ltr' | 'rtl';

  /**
   * Color of the active (filled) stars
   */
  activeColor?: string;

  /**
   * Color of the inactive (empty) stars
   */
  inactiveColor?: string;
}

/**
 * Default values for Rate component props
 */
export const RATE_DEFAULTS: Required<Pick<RateProps,
  | 'count'
  | 'defaultValue'
  | 'allowHalf'
  | 'allowClear'
  | 'disabled'
  | 'readOnly'
  | 'keyboard'
  | 'size'
  | 'direction'
>> = {
  count: 5,
  defaultValue: 0,
  allowHalf: false,
  allowClear: true,
  disabled: false,
  readOnly: false,
  keyboard: true,
  size: 'md',
  direction: 'ltr',
};

/**
 * Size mapping to pixel values (matches CSS tokens)
 */
export const RATE_SIZE_MAP: Record<RateSize, number> = {
  xs: 16,   // --rate-xs-size: 1rem
  sm: 20,   // --rate-sm-size: 1.25rem
  md: 24,   // --rate-md-size: 1.5rem (default)
  lg: 32,   // --rate-lg-size: 2rem
  xl: 40,   // --rate-xl-size: 2.5rem
};
