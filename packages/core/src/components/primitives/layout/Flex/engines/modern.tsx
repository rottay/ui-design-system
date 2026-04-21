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
import { FLEX_ALIGN_MAP, FLEX_DEFAULTS, FLEX_JUSTIFY_MAP } from '../Flex.types';
import { isResponsiveValue, generateResponsiveCSS } from '../../shared/responsive-props';
import { scalarOrDefault, collectFlexResponsiveEntries } from '../../shared/responsive-helpers.js';

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

    // The showroom can render the modern engine without Tailwind loaded, so
    // layout primitives must resolve their scalar behavior into real inline
    // styles instead of utility classes.
    const scalarDirection = scalarOrDefault<FlexDirection>(direction, 'row');
    const scalarWrap = scalarOrDefault<FlexWrap>(wrap, 'nowrap');
    const scalarJustify = scalarOrDefault<FlexJustify>(justify, 'start');
    const scalarAlign = scalarOrDefault<FlexAlign>(align, 'stretch');

    const customStyle: React.CSSProperties = {
      display: inline ? 'inline-flex' : 'flex',
      ...style,
    };

    if (!isResponsiveValue(direction)) {
      customStyle.flexDirection = scalarDirection;
    }

    if (!isResponsiveValue(wrap)) {
      customStyle.flexWrap = scalarWrap;
    }

    if (!isResponsiveValue(justify)) {
      customStyle.justifyContent = FLEX_JUSTIFY_MAP[scalarJustify];
    }

    if (!isResponsiveValue(align)) {
      customStyle.alignItems = FLEX_ALIGN_MAP[scalarAlign];
    }

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

    const combinedClassName = ['rottay-flex', 'rottay-flex--modern', className]
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
