'use client';

/**
 * Flex - Apollo Engine (Vanilla HTML/CSS)
 */
import React from 'react';
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

    const flexStyle: React.CSSProperties = {
      display: inline ? 'inline-flex' : 'flex',
      flexDirection: direction,
      flexWrap: wrap,
      justifyContent: FLEX_JUSTIFY_MAP[justify!],
      alignItems: FLEX_ALIGN_MAP[align!],
      ...(flex !== undefined && { flex }),
      ...style,
    };

    if (gap !== undefined) {
      if (Array.isArray(gap)) {
        flexStyle.columnGap = `${gap[0]}px`;
        flexStyle.rowGap = `${gap[1]}px`;
      } else {
        flexStyle.gap = `${gap}px`;
      }
    }

    return (
      <div ref={ref} className={className} style={flexStyle} {...rest}>
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex.Apollo';

export default Flex;
