'use client';

/**
 * Flex - Titan Engine (Ant Design)
 */
import React from 'react';
import { Flex as AntFlex } from 'antd';
import type { FlexProps } from '../../types';
import { FLEX_DEFAULTS, FLEX_JUSTIFY_MAP, FLEX_ALIGN_MAP } from '../../types';

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (props, ref) => {
    const {
      direction = FLEX_DEFAULTS.direction,
      wrap = FLEX_DEFAULTS.wrap,
      justify = FLEX_DEFAULTS.justify,
      align = FLEX_DEFAULTS.align,
      gap,
      flex,
      inline = FLEX_DEFAULTS.inline,
      children,
      className,
      style,
      ...rest
    } = props;

    const computedGap = Array.isArray(gap) ? gap : gap;

    const flexStyle: React.CSSProperties = {
      ...(flex !== undefined && { flex }),
      ...style,
    };

    return (
      <AntFlex
        ref={ref}
        vertical={direction === 'column' || direction === 'column-reverse'}
        wrap={wrap === 'wrap' ? 'wrap' : wrap === 'wrap-reverse' ? 'wrap-reverse' : undefined}
        justify={FLEX_JUSTIFY_MAP[justify!]}
        align={FLEX_ALIGN_MAP[align!]}
        gap={computedGap as any}
        className={className}
        style={flexStyle}
        {...rest}
      >
        {children}
      </AntFlex>
    );
  }
);

Flex.displayName = 'Flex.Titan';

export default Flex;
