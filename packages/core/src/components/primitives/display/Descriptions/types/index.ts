/**
 * @fileoverview Descriptions Types - Rottay Design System
 * @description Type definitions and constants for the Descriptions component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports types from the centralized type system and provides
 * default configuration values and size mappings for the Descriptions component.
 *
 * **Exported Types:**
 * - `DescriptionsProps` - Main component properties
 * - `DescriptionsItemProps` - Item properties (label, span, styles)
 * - `DescriptionsLayout` - Layout direction ('horizontal' | 'vertical')
 * - `DescriptionsSize` - Size variants ('small' | 'default' | 'middle')
 * - `ResponsiveColumn` - Responsive column configuration
 *
 * **Exported Constants:**
 * - `DESCRIPTIONS_DEFAULTS` - Default configuration values
 * - `SIZE_MAP` - Size to font size mapping
 * - `PADDING_MAP` - Size to padding mapping
 *
 * @example Type Usage
 * ```tsx
 * import type { DescriptionsProps, DescriptionsItemProps } from '@rottay/design-system';
 *
 * const props: DescriptionsProps = {
 *   title: 'User Info',
 *   bordered: true,
 *   column: 2,
 * };
 * ```
 *
 * @see {@link Descriptions} for component implementation
 * @module Descriptions/types
 * @category Display
 * @package @rottay/design-system
 */

export type {
  DescriptionsProps,
  DescriptionsItemProps,
  DescriptionsLayout,
  DescriptionsSize,
  ResponsiveColumn,
} from '../../../../../core/types/primitives/display/Descriptions';

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
