/**
 * @fileoverview Descriptions Types - Rottay Design System
 * @description Type definitions and constants for the Descriptions component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides type definitions, default configuration values, and
 * size mappings for the Descriptions component. The Descriptions component
 * renders key-value pairs in a structured, table-like layout suitable for
 * detail pages, profile views, and metadata displays.
 *
 * **Type Categories:**
 * - `DescriptionsProps`: Main component properties (title, bordered, column, layout, size)
 * - `DescriptionsItemProps`: Individual item properties (label, span, styles)
 * - `DescriptionsLayout`: Layout direction ('horizontal' | 'vertical')
 * - `DescriptionsSize`: Size variants ('small' | 'default' | 'middle')
 * - `ResponsiveColumn`: Responsive column configuration per breakpoint
 *
 * **Multi-Tenant Support:**
 * Descriptions respect tenant theming via CSS variables for font sizes,
 * padding, and border colors defined in the size/padding maps.
 *
 * @example Type Usage
 * ```tsx
 * import type { DescriptionsProps, DescriptionsItemProps } from '@rottay/design-system';
 *
 * // Typed props for a user detail view
 * const props: DescriptionsProps = {
 *   title: 'User Info',
 *   bordered: true,
 *   column: 2,
 *   layout: 'horizontal',
 *   size: 'default',
 * };
 *
 * // Individual description item
 * const item: DescriptionsItemProps = {
 *   label: 'Full Name',
 *   children: 'John Doe',
 *   span: 1,
 * };
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { DESCRIPTIONS_DEFAULTS, SIZE_MAP, PADDING_MAP } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(DESCRIPTIONS_DEFAULTS.column);  // 3
 * console.log(DESCRIPTIONS_DEFAULTS.layout);  // 'horizontal'
 * console.log(SIZE_MAP.default);              // '14px'
 * console.log(PADDING_MAP.small);             // '12px'
 * ```
 *
 * @see {@link DescriptionsProps} - Main component props
 * @see {@link DESCRIPTIONS_DEFAULTS} - Default configuration values
 * @see {@link SIZE_MAP} - Size to font size mapping
 * @see {@link PADDING_MAP} - Size to padding mapping
 * @module Descriptions/types
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { BaseComponentProps, WithChildren, BorderedProps } from '../../../../contracts/common';
import type { EngineAwareProps } from '../../../../contracts/engine';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Layout direction for descriptions.
 * - horizontal: Labels and values are displayed side by side
 * - vertical: Labels are displayed above values
 */
export type DescriptionsLayout = 'horizontal' | 'vertical';

/**
 * Size variants for descriptions.
 * - default: Standard size with comfortable spacing
 * - small: Compact size for dense layouts
 * - middle: Medium size between default and small
 */
export type DescriptionsSize = 'default' | 'small' | 'middle';

/**
 * Responsive column configuration type.
 * Allows specifying different column counts for different breakpoints.
 */
export type ResponsiveColumn = Partial<
  Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>
>;

/**
 * Props for individual description items.
 * Each item represents a single key-value pair within the Descriptions component.
 */
export interface DescriptionsItemProps extends BaseComponentProps, WithChildren {
  /**
   * Label text or element for the description item.
   * Typically displays the field name or key.
   */
  label: ReactNode;

  /**
   * Number of columns this item should span.
   * Useful for items that need more horizontal space.
   * @default 1
   */
  span?: number;

  /**
   * Custom styles applied to label and content elements.
   * Replaces deprecated labelStyle and contentStyle props.
   */
  styles?: {
    label?: CSSProperties;
    content?: CSSProperties;
  };
}

/**
 * Main props interface for the Descriptions component.
 * Provides configuration for displaying structured key-value data.
 */
export interface DescriptionsProps
  extends BaseComponentProps,
    EngineAwareProps,
    WithChildren,
    BorderedProps {
  /**
   * Title displayed at the top of the descriptions block.
   * Can be a string or any React node for custom formatting.
   */
  title?: ReactNode;

  /**
   * Extra content displayed in the header, typically action buttons.
   * Positioned to the right of the title.
   */
  extra?: ReactNode;

  /**
   * Number of columns per row, or responsive configuration object.
   * When an object is provided, different column counts can be set for
   * different screen sizes (xs, sm, md, lg, xl, xxl).
   * @default 3
   */
  column?: number | ResponsiveColumn;

  /**
   * Layout direction for label-value pairs.
   * @default 'horizontal'
   */
  layout?: DescriptionsLayout;

  /**
   * Size variant affecting spacing and font sizes.
   * @default 'default'
   */
  size?: DescriptionsSize;

  /**
   * Whether to display a colon after labels.
   * @default true
   */
  colon?: boolean;

  /**
   * Custom styles applied to all label and content elements.
   * Can be overridden by individual item styles.
   * Replaces deprecated labelStyle and contentStyle props.
   */
  styles?: {
    label?: CSSProperties;
    content?: CSSProperties;
  };
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Descriptions component.
 * Used by engine implementations to ensure consistent behavior
 * when no explicit props are provided.
 *
 * @constant
 *
 * @example Applying Defaults
 * ```tsx
 * import { DESCRIPTIONS_DEFAULTS } from '@rottay/design-system';
 *
 * const MyDescriptions = (props: DescriptionsProps) => {
 *   const bordered = props.bordered ?? DESCRIPTIONS_DEFAULTS.bordered;
 *   const column = props.column ?? DESCRIPTIONS_DEFAULTS.column;
 *   const layout = props.layout ?? DESCRIPTIONS_DEFAULTS.layout;
 *   // ...
 * };
 * ```
 */
export const DESCRIPTIONS_DEFAULTS = {
  /** Whether borders are shown around cells. @default false */
  bordered: false,

  /** Number of description items per row. @default 3 */
  column: 3,

  /** Layout direction: 'horizontal' places labels beside values, 'vertical' stacks them. @default 'horizontal' */
  layout: 'horizontal' as const,

  /** Size variant controlling font size and padding. @default 'default' */
  size: 'default' as const,

  /** Whether to display a colon after each label. @default true */
  colon: true,
} as const;

// ============================================================================
// Size Mapping
// ============================================================================

/**
 * Font size mapping for each Descriptions size variant.
 * Maps size variant names to CSS font-size values in pixels.
 *
 * @constant
 *
 * | Size | Font Size |
 * |------|-----------|
 * | `default` | 14px |
 * | `small` | 12px |
 * | `middle` | 14px |
 *
 * @example
 * ```tsx
 * import { SIZE_MAP } from '@rottay/design-system';
 *
 * const fontSize = SIZE_MAP[props.size || 'default'];
 * // '14px'
 * ```
 */
export const SIZE_MAP: Record<string, string> = {
  /** Standard font size for default density */
  default: '14px',
  /** Compact font size for dense layouts */
  small: '12px',
  /** Medium font size, same as default */
  middle: '14px',
};

// ============================================================================
// Padding Mapping
// ============================================================================

/**
 * Padding mapping for each Descriptions size variant.
 * Maps size variant names to CSS padding values applied to cells.
 *
 * @constant
 *
 * | Size | Padding |
 * |------|---------|
 * | `default` | 16px |
 * | `small` | 12px |
 * | `middle` | 14px |
 *
 * @example
 * ```tsx
 * import { PADDING_MAP } from '@rottay/design-system';
 *
 * const cellPadding = PADDING_MAP[props.size || 'default'];
 * // '16px'
 * ```
 */
export const PADDING_MAP: Record<string, string> = {
  /** Standard padding for default density */
  default: '16px',
  /** Compact padding for dense layouts */
  small: '12px',
  /** Medium padding between default and small */
  middle: '14px',
};
