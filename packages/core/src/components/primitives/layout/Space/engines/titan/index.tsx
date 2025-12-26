'use client';

/**
 * Space - Titan Engine (Ant Design)
 */
import React from 'react';
import { Space as AntSpace } from 'antd';
import type { SpaceProps } from '../../types';
import { SPACE_DEFAULTS } from '../../types';

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

    const computedSize =
      typeof size === 'string'
        ? size
        : Array.isArray(size)
          ? size
          : size;

    return (
      <AntSpace
        ref={ref}
        size={computedSize}
        direction={direction}
        wrap={wrap}
        align={align}
        split={split}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </AntSpace>
    );
  }
);

Space.displayName = 'Space.Titan';

export default Space;
