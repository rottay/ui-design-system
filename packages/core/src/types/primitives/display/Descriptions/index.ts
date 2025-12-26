/**
 * @file Descriptions Component Types
 * @description Type definitions for the Descriptions component, which displays key-value pairs
 * in a structured layout format. Supports horizontal and vertical layouts with customizable
 * columns and responsive configurations.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { BaseComponentProps, WithChildren, BorderedProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

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
   * Custom styles applied to the label element.
   */
  labelStyle?: CSSProperties;

  /**
   * Custom styles applied to the content/value element.
   */
  contentStyle?: CSSProperties;
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
   * Custom styles applied to all label elements.
   * Can be overridden by individual item labelStyle.
   */
  labelStyle?: CSSProperties;

  /**
   * Custom styles applied to all content elements.
   * Can be overridden by individual item contentStyle.
   */
  contentStyle?: CSSProperties;
}
