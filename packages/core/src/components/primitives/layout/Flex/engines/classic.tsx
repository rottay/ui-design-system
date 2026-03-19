'use client';

/**
 * @fileoverview Flex Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Flex component.
 * Uses Ant Design's Flex component for consistent styling with the Ant ecosystem.
 *
 * @module Flex/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */

import React, { useId } from 'react';
import { Flex as AntFlex } from 'antd';
import type { FlexProps } from '../Flex.types';
import { FLEX_DEFAULTS, FLEX_JUSTIFY_MAP, FLEX_ALIGN_MAP } from '../Flex.types';
import { isResponsiveValue, generateResponsiveCSS } from '../../shared/responsive-props';
import { scalarOrDefault, collectFlexResponsiveEntries } from '../../shared/responsive-helpers.js';
import type { FlexDirection, FlexWrap, FlexJustify, FlexAlign } from '../Flex.types';

/**
 * Classic Flex component backed by Ant Design's Flex primitive.
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

    // Use scalar values for Ant props; responsive values handled by CSS
    const scalarDirection = scalarOrDefault<FlexDirection>(direction, 'row');
    const scalarWrap = scalarOrDefault<FlexWrap>(wrap, 'nowrap');
    const scalarJustify = scalarOrDefault<FlexJustify>(justify, 'start');
    const scalarAlign = scalarOrDefault<FlexAlign>(align, 'stretch');
    const scalarGap = isResponsiveValue(gap) ? undefined : gap;

    // Ant Design accepts gap as-is (number or tuple); preserve the original value
    const computedGap = scalarGap !== undefined
      ? (Array.isArray(scalarGap) ? scalarGap : scalarGap)
      : undefined;

    // Merge the shorthand `flex` CSS property with any user-provided styles
    const flexStyle: React.CSSProperties = {
      ...(flex !== undefined && { flex }),
      ...style,
    };

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <AntFlex
          ref={ref}
          vertical={scalarDirection === 'column' || scalarDirection === 'column-reverse'}
          wrap={scalarWrap === 'wrap' ? 'wrap' : scalarWrap === 'wrap-reverse' ? 'wrap-reverse' : undefined}
          justify={FLEX_JUSTIFY_MAP[scalarJustify]}
          align={FLEX_ALIGN_MAP[scalarAlign]}
          gap={computedGap as any}
          className={className}
          style={flexStyle}
          {...(responsive ? responsive.attrs : {})}
          {...rest}
        >
          {children}
        </AntFlex>
      </>
    );
  }
);

Flex.displayName = 'Flex.Classic';

export default Flex;
