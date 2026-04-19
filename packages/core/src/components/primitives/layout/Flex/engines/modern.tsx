'use client';

/**
 * @fileoverview Flex Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Flex component.
 * Generates Tailwind CSS utility classes for flexbox layouts.
 *
 * @module Flex/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

import React, { useId } from 'react';
import type { FlexProps, FlexDirection, FlexWrap, FlexJustify, FlexAlign } from '../Flex.types';
import { FLEX_DEFAULTS } from '../Flex.types';
import { isResponsiveValue, generateResponsiveCSS } from '../../shared/responsive-props';
import { scalarOrDefault, collectFlexResponsiveEntries } from '../../shared/responsive-helpers.js';

/** Maps flexDirection values to Tailwind direction utilities */
const DIRECTION_CLASSES: Record<string, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

/** Maps flexWrap values to Tailwind wrap utilities */
const WRAP_CLASSES: Record<string, string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

/** Maps justifyContent shorthand values to Tailwind justify utilities */
const JUSTIFY_CLASSES: Record<string, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

/** Maps alignItems shorthand values to Tailwind items utilities */
const ALIGN_CLASSES: Record<string, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

/**
 * Modern Flex component using Tailwind CSS utility classes.
 */
export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (props, ref) => {
    const {
      direction,
      wrap,
      justify,
      align,
      gap,
      flex,
      inline = FLEX_DEFAULTS.inline,
      children,
      className,
      style,
      ...rest
    } = props;

    const reactId = useId();
    const responsiveEntries = collectFlexResponsiveEntries(props);
    const needsResponsiveCSS = responsiveEntries.length > 0;

    const elementId = needsResponsiveCSS ? `flex-${reactId.replace(/:/g, '')}` : '';
    const responsive = needsResponsiveCSS
      ? generateResponsiveCSS(elementId, responsiveEntries)
      : null;

    // Start with the display class
    const classes: string[] = [inline ? 'inline-flex' : 'flex'];

    // Only add Tailwind classes for scalar (non-responsive) values
    const scalarDirection = scalarOrDefault<FlexDirection>(direction, 'row');
    if (scalarDirection && !isResponsiveValue(direction)) {
      classes.push(DIRECTION_CLASSES[scalarDirection] || DIRECTION_CLASSES.row);
    }

    const scalarWrap = scalarOrDefault<FlexWrap>(wrap, 'nowrap');
    if (scalarWrap && !isResponsiveValue(wrap)) {
      classes.push(WRAP_CLASSES[scalarWrap] || WRAP_CLASSES.nowrap);
    }

    const scalarJustify = scalarOrDefault<FlexJustify>(justify, 'start');
    if (scalarJustify && !isResponsiveValue(justify)) {
      classes.push(JUSTIFY_CLASSES[scalarJustify] || JUSTIFY_CLASSES.start);
    }

    const scalarAlign = scalarOrDefault<FlexAlign>(align, 'stretch');
    if (scalarAlign && !isResponsiveValue(align)) {
      classes.push(ALIGN_CLASSES[scalarAlign] || ALIGN_CLASSES.stretch);
    }

    // Gap and flex via inline styles for non-responsive values
    const customStyle: React.CSSProperties = { ...style };
    const scalarGap = isResponsiveValue(gap) ? undefined : gap;
    if (scalarGap !== undefined) {
      if (Array.isArray(scalarGap)) {
        customStyle.columnGap = `${scalarGap[0]}px`;
        customStyle.rowGap = `${scalarGap[1]}px`;
      } else {
        customStyle.gap = `${scalarGap}px`;
      }
    }
    if (flex !== undefined) {
      customStyle.flex = flex;
    }

    const combinedClassName = [classes.join(' '), className]
      .filter(Boolean)
      .join(' ');
    const renderedChildren = React.Children.toArray(children);

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <div
          ref={ref}
          className={combinedClassName}
          style={Object.keys(customStyle).length > 0 ? customStyle : undefined}
          {...(responsive ? responsive.attrs : {})}
          {...rest}
        >
          {renderedChildren}
        </div>
      </>
    );
  }
);

Flex.displayName = 'Flex.Modern';

export default Flex;
