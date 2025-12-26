'use client';

/**
 * Flex - Hermes Engine (DaisyUI/Tailwind)
 */
import React from 'react';
import type { FlexProps } from '../../types';
import { FLEX_DEFAULTS } from '../../types';

const DIRECTION_CLASSES: Record<string, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

const WRAP_CLASSES: Record<string, string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const JUSTIFY_CLASSES: Record<string, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const ALIGN_CLASSES: Record<string, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

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

    const classes: string[] = [inline ? 'inline-flex' : 'flex'];

    if (direction) {
      classes.push(DIRECTION_CLASSES[direction] || DIRECTION_CLASSES.row);
    }

    if (wrap) {
      classes.push(WRAP_CLASSES[wrap] || WRAP_CLASSES.nowrap);
    }

    if (justify) {
      classes.push(JUSTIFY_CLASSES[justify] || JUSTIFY_CLASSES.start);
    }

    if (align) {
      classes.push(ALIGN_CLASSES[align] || ALIGN_CLASSES.stretch);
    }

    const customStyle: React.CSSProperties = { ...style };
    if (gap !== undefined) {
      if (Array.isArray(gap)) {
        customStyle.columnGap = `${gap[0]}px`;
        customStyle.rowGap = `${gap[1]}px`;
      } else {
        customStyle.gap = `${gap}px`;
      }
    }
    if (flex !== undefined) {
      customStyle.flex = flex;
    }

    const combinedClassName = [classes.join(' '), className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={Object.keys(customStyle).length > 0 ? customStyle : undefined}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex.Hermes';

export default Flex;
