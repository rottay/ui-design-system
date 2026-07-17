'use client';

/**
 * @fileoverview Flex Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Flex component.
 * Uses inline CSS styles for maximum compatibility without external dependencies.
 *
 * @module Flex/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */

import React, { useId } from 'react';
import type { FlexProps, FlexDirection, FlexWrap, FlexJustify, FlexAlign } from '../../contracts';
import { FLEX_DEFAULTS, FLEX_JUSTIFY_MAP, FLEX_ALIGN_MAP } from '../../contracts';
import {
  generateResponsiveCSS,
  isResponsiveValue,
  scalarOrDefault,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import { collectFlexResponsiveEntries } from '../../runtime/responsive';

/**
 * Rustic Flex component using pure inline CSS styles.
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

    // Scalar values for inline styles
    const scalarDirection = scalarOrDefault<FlexDirection>(direction, 'row');
    const scalarWrap = scalarOrDefault<FlexWrap>(wrap, 'nowrap');
    const scalarJustify = scalarOrDefault<FlexJustify>(justify, 'start');
    const scalarAlign = scalarOrDefault<FlexAlign>(align, 'stretch');

    const flexStyle: React.CSSProperties = {
      display: inline ? 'inline-flex' : 'flex',
      // Only set inline values for non-responsive props
      ...(!isResponsiveValue(direction) && { flexDirection: scalarDirection }),
      ...(!isResponsiveValue(wrap) && { flexWrap: scalarWrap }),
      ...(!isResponsiveValue(justify) && { justifyContent: FLEX_JUSTIFY_MAP[scalarJustify] }),
      ...(!isResponsiveValue(align) && { alignItems: FLEX_ALIGN_MAP[scalarAlign] }),
      ...(flex !== undefined && { flex }),
      ...style,
    };

    // Gap supports both uniform (number) and asymmetric ([column, row]) spacing
    const scalarGap = isResponsiveValue(gap) ? undefined : gap;
    if (scalarGap !== undefined) {
      if (Array.isArray(scalarGap)) {
        flexStyle.columnGap = `${scalarGap[0]}px`;
        flexStyle.rowGap = `${scalarGap[1]}px`;
      } else {
        flexStyle.gap = `${scalarGap}px`;
      }
    }

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <div
          ref={ref}
          className={className}
          style={flexStyle}
          {...(responsive ? responsive.attrs : {})}
          {...rest}
        >
          {children}
        </div>
      </>
    );
  }
);

Flex.displayName = 'Flex.Rustic';

export default Flex;
