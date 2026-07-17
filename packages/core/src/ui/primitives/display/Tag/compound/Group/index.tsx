/**
 * @fileoverview Tag.Group Compound - Rottay Design System
 * @description Container for grouping multiple tags with consistent spacing.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The TagGroup provides a flexbox container for organizing multiple tags
 * with configurable gap, direction, and wrapping behavior.
 *
 * **Layout Options:**
 * - `gap` - Space between tags (xs, sm, md, lg)
 * - `wrap` - Whether tags wrap to new lines
 * - `direction` - Horizontal or vertical layout
 * - `align` - Alignment within the group
 *
 * @example Basic Group
 * ```tsx
 * <Tag.Group gap="md">
 *   <Tag>React</Tag>
 *   <Tag>TypeScript</Tag>
 * </Tag.Group>
 * ```
 *
 * @example Vertical Group
 * ```tsx
 * <Tag.Group direction="vertical" gap="sm">
 *   <Tag variant="success">Active</Tag>
 *   <Tag variant="warning">Pending</Tag>
 * </Tag.Group>
 * ```
 *
 * @see {@link Tag} for the main component
 * @module TagGroup
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../../../../foundation/contracts/kernel/common';

/**
 * Props for the TagGroup component.
 */
export interface TagGroupProps extends BaseComponentProps, WithChildren {
  /**
   * Gap between tags.
   * @default 'sm'
   */
  gap?: 'xs' | 'sm' | 'md' | 'lg';

  /**
   * Whether tags should wrap to new lines.
   * @default true
   */
  wrap?: boolean;

  /**
   * Direction of tag layout.
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Alignment of tags within the group.
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end';
}

/**
 * Gap size mapping to CSS values.
 */
const GAP_MAP: Record<string, string> = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
};

/**
 * TagGroup component for organizing multiple tags.
 *
 * Provides consistent spacing and layout options for tag collections.
 *
 * @param props - TagGroup component properties (gap, wrap, direction, align, children)
 * @param ref - Forwarded ref to the root div element
 * @returns A flexbox group container div with role="group" and configured layout styles
 *
 * @example
 * ```tsx
 * <TagGroup gap="md" wrap>
 *   <Tag variant="primary">React</Tag>
 *   <Tag variant="secondary">TypeScript</Tag>
 *   <Tag variant="success">Vite</Tag>
 * </TagGroup>
 * ```
 */
export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(
  (props, ref) => {
    const {
      children,
      gap = 'sm',
      wrap = true,
      direction = 'horizontal',
      align = 'start',
      className = '',
      style = {},
      ...restProps
    } = props;

    // Alignment mapping
    const alignMap: Record<string, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
    };

    // Container styles
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction === 'vertical' ? 'column' : 'row',
      flexWrap: wrap ? 'wrap' : 'nowrap',
      gap: GAP_MAP[gap] || GAP_MAP.sm,
      alignItems: alignMap[align] || alignMap.start,
      ...style,
    };

    // Build class names
    const classNames = [
      'rottay-tag-group',
      `rottay-tag-group--${direction}`,
      wrap && 'rottay-tag-group--wrap',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={classNames}
        style={containerStyle}
        role="group"
        {...restProps}
      >
        {children}
      </div>
    );
  }
);

TagGroup.displayName = 'TagGroup';
