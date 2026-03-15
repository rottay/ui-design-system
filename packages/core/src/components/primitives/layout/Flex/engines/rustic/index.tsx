'use client';

/**
 * @fileoverview Flex Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Flex component.
 * Uses inline CSS styles for maximum compatibility without external dependencies.
 *
 * @remarks
 * The Rustic engine applies all flexbox properties via inline styles:
 * - `display: flex` or `display: inline-flex`
 * - `flexDirection`, `flexWrap`, `justifyContent`, `alignItems`
 * - `gap`, `columnGap`, `rowGap` for spacing
 *
 * This makes it ideal for:
 * - Embedding in third-party applications
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * // Pure inline CSS, no external dependencies
 * <Flex engine="rustic" direction="column" gap={16} align="center">
 *   <span>First</span>
 *   <span>Second</span>
 * </Flex>
 * ```
 *
 * @see {@link Flex} - The main engine-aware component
 * @module Flex/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */

import React from 'react';
import type { FlexProps } from '../../Flex.types';
import { FLEX_DEFAULTS, FLEX_JUSTIFY_MAP, FLEX_ALIGN_MAP } from '../../Flex.types';

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

Flex.displayName = 'Flex.Rustic';

export default Flex;
