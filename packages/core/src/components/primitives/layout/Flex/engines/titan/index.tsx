'use client';

/**
 * @fileoverview Flex Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Flex component.
 * Uses Ant Design's Flex component for consistent styling with the Ant ecosystem.
 *
 * @remarks
 * The Titan engine leverages Ant Design's built-in Flex component, providing:
 * - Seamless integration with Ant Design themes
 * - Consistent styling with other Ant Design components
 * - Vertical direction support via the `vertical` prop
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * // Uses Ant Design's Flex under the hood
 * <Flex engine="titan" justify="between" align="center" gap={16}>
 *   <Button>Cancel</Button>
 *   <Button type="primary">Submit</Button>
 * </Flex>
 * ```
 *
 * @see {@link Flex} - The main engine-aware component
 * @module Flex/Engines/Titan
 * @category Layout
 * @package @rottay/design-system
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
