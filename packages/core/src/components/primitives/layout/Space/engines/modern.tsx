'use client';

/**
 * @fileoverview Space Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Space component.
 * Uses Tailwind CSS utility classes with inline gap styles.
 *
 * @remarks
 * The Modern engine generates:
 * - `inline-flex` for inline display
 * - `flex-row` or `flex-col` based on direction
 * - `flex-wrap` when wrapping is enabled
 * - `items-*` classes for alignment
 * - Inline `gap` style for spacing (supports all size formats)
 *
 * Split separators are handled by inserting elements between children.
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Space } from '@rottay/design-system';
 *
 * // Generates: class="inline-flex flex-row items-center flex-wrap"
 * <Space engine="modern" size="middle" wrap>
 *   <Tag>Tag 1</Tag>
 *   <Tag>Tag 2</Tag>
 * </Space>
 * ```
 *
 * @see {@link Space} - The main engine-aware component
 * @module Space/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */
import React, { Children, Fragment } from 'react';
import type { SpaceProps } from '../Space.types';
import { SPACE_DEFAULTS, SPACE_SIZE_MAP } from '../Space.types';

const ALIGN_CLASSES: Record<string, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
};

export const Space = React.forwardRef<HTMLDivElement, SpaceProps>(
  (props, ref) => {
    const {
      size = SPACE_DEFAULTS.size,
      direction = SPACE_DEFAULTS.direction,
      wrap = SPACE_DEFAULTS.wrap,
      align = SPACE_DEFAULTS.align,
      split,
      children,
      className,
      style,
      ...rest
    } = props;

    const isVertical = direction === 'vertical';
    const classes: string[] = [
      'inline-flex',
      isVertical ? 'flex-col' : 'flex-row',
    ];

    if (wrap) {
      classes.push('flex-wrap');
    }

    if (align) {
      classes.push(ALIGN_CLASSES[align] || ALIGN_CLASSES.center);
    }

    let gapValue: string;
    if (typeof size === 'number') {
      gapValue = `${size}px`;
    } else if (Array.isArray(size)) {
      gapValue = `${size[1]}px ${size[0]}px`;
    } else {
      gapValue = `${SPACE_SIZE_MAP[size || 'small'] || SPACE_SIZE_MAP.small}px`;
    }

    const customStyle: React.CSSProperties = {
      gap: gapValue,
      ...style,
    };

    const combinedClassName = [classes.join(' '), className]
      .filter(Boolean)
      .join(' ');

    const childArray = Children.toArray(children).filter(Boolean);
    const renderedChildren = split
      ? childArray.map((child, index) => (
          <Fragment key={index}>
            {child}
            {index < childArray.length - 1 && split}
          </Fragment>
        ))
      : children;

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={customStyle}
        {...rest}
      >
        {renderedChildren}
      </div>
    );
  }
);

Space.displayName = 'Space.Modern';

export default Space;
