/**
 * @file Descriptions - Core Interface
 * @description Re-exports from centralized types with component-specific defaults.
 */

export type {
  DescriptionsProps,
  DescriptionsItemProps,
  DescriptionsLayout,
  DescriptionsSize,
  ResponsiveColumn,
} from '../../../../../types/primitives/display/Descriptions';

/**
 * Default values for the Descriptions component.
 * These values are used when no explicit prop is provided.
 */
export const DESCRIPTIONS_DEFAULTS = {
  /** Default border visibility */
  bordered: false,
  /** Default number of columns */
  column: 3,
  /** Default layout direction */
  layout: 'horizontal' as const,
  /** Default size variant */
  size: 'default' as const,
  /** Whether to show colon after labels */
  colon: true,
} as const;

/**
 * Size to font size mapping.
 * Maps size variants to corresponding font size values in pixels.
 */
export const SIZE_MAP: Record<string, string> = {
  default: '14px',
  small: '12px',
  middle: '14px',
};

/**
 * Size to padding mapping.
 * Maps size variants to corresponding padding values.
 */
export const PADDING_MAP: Record<string, string> = {
  default: '16px',
  small: '12px',
  middle: '14px',
};
