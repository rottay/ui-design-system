'use client';

/**
 * Space - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { Children, Fragment } from 'react';
import type { SpaceProps } from '../../types';
import { SPACE_DEFAULTS, SPACE_SIZE_MAP, SPACE_ALIGN_MAP } from '../../types';

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

Space.displayName = 'Space.Apollo';

export default Space;
