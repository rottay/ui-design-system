'use client';

/**
 * @fileoverview Flex Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Flex component.
 * Generates Tailwind CSS utility classes for flexbox layouts.
 *
 * @remarks
 * The Modern engine translates Flex props to Tailwind CSS classes:
 * - Direction: `flex-row`, `flex-col`, `flex-row-reverse`, `flex-col-reverse`
 * - Wrap: `flex-nowrap`, `flex-wrap`, `flex-wrap-reverse`
 * - Justify: `justify-start`, `justify-end`, `justify-center`, `justify-between`, etc.
 * - Align: `items-start`, `items-end`, `items-center`, `items-baseline`, `items-stretch`
 *
 * Gap values are applied via inline styles since Tailwind gap classes are spacing-based.
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * // Generates Tailwind classes
 * <Flex engine="modern" direction="row" justify="between" align="center">
 *   Outputs: class="flex flex-row justify-between items-center"
 * </Flex>
 * ```
 *
 * @see {@link Flex} - The main engine-aware component
 * @module Flex/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

import React from 'react';
import type { FlexProps } from '../../Flex.types';
import { FLEX_DEFAULTS } from '../../Flex.types';

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

Flex.displayName = 'Flex.Modern';

export default Flex;
