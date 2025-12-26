/**
 * TagGroup - Compound Component
 *
 * @module Tag/compound/Group
 * @description A container component for grouping multiple Tag components
 * with consistent spacing and optional wrapping behavior.
 */

'use client';

import React, { forwardRef } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../../../../types/common';

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
 * @param props - TagGroup component properties
 * @param ref - Forwarded ref to the root div element
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
