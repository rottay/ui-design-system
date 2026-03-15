'use client';

/**
 * @fileoverview Space Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Space component.
 * Uses inline CSS flexbox styles for spacing without external dependencies.
 *
 * @remarks
 * The Rustic engine provides:
 * - Pure inline CSS with flexbox layout
 * - `display: inline-flex` for inline container
 * - `flexDirection` based on direction prop
 * - `flexWrap` for wrapping behavior
 * - `alignItems` using SPACE_ALIGN_MAP values
 * - `gap` CSS property for spacing
 *
 * This implementation is ideal for:
 * - Embedded widgets without CSS framework dependencies
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Space } from '@rottay/design-system';
 *
 * // Pure inline CSS styling
 * <Space engine="rustic" size={16} direction="vertical">
 *   <span>Item 1</span>
 *   <span>Item 2</span>
 * </Space>
 * ```
 *
 * @see {@link Space} - The main engine-aware component
 * @module Space/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */
import React, { Children, Fragment } from 'react';
import type { SpaceProps } from '../Space.types';
import { SPACE_DEFAULTS, SPACE_SIZE_MAP, SPACE_ALIGN_MAP } from '../Space.types';

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

    let gapValue: string;
    if (typeof size === 'number') {
      gapValue = `${size}px`;
    } else if (Array.isArray(size)) {
      gapValue = `${size[1]}px ${size[0]}px`;
    } else {
      gapValue = `${SPACE_SIZE_MAP[size || 'small'] || SPACE_SIZE_MAP.small}px`;
    }

    const spaceStyle: React.CSSProperties = {
      display: 'inline-flex',
      flexDirection: isVertical ? 'column' : 'row',
      flexWrap: wrap ? 'wrap' : 'nowrap',
      alignItems: SPACE_ALIGN_MAP[align!] || SPACE_ALIGN_MAP.center,
      gap: gapValue,
      ...style,
    };

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
      <div ref={ref} className={className} style={spaceStyle} {...rest}>
        {renderedChildren}
      </div>
    );
  }
);

Space.displayName = 'Space.Rustic';

export default Space;
