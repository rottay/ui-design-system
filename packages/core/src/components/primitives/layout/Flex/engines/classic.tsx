'use client';

/**
 * @fileoverview Flex Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Flex component.
 * Uses Ant Design's Flex component for consistent styling with the Ant ecosystem.
 *
 * @remarks
 * The Classic engine leverages Ant Design's built-in Flex component, providing:
 * - Seamless integration with Ant Design themes
 * - Consistent styling with other Ant Design components
 * - Vertical direction support via the `vertical` prop
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * // Uses Ant Design's Flex under the hood
 * <Flex engine="classic" justify="between" align="center" gap={16}>
 *   <Button>Cancel</Button>
 *   <Button type="primary">Submit</Button>
 * </Flex>
 * ```
 *
 * @see {@link Flex} - The main engine-aware component
 * @module Flex/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */

import React from 'react';
import { Flex as AntFlex } from 'antd';
import type { FlexProps } from '../Flex.types';
import { FLEX_DEFAULTS, FLEX_JUSTIFY_MAP, FLEX_ALIGN_MAP } from '../Flex.types';

/**
 * Classic Flex component backed by Ant Design's Flex primitive.
 *
 * Translates the engine-agnostic FlexProps into Ant Design's prop contract,
 * delegating layout rendering entirely to AntFlex for pixel-perfect
 * consistency with the Ant ecosystem.
 *
 * @param props - Engine-agnostic flex layout props (direction, wrap, justify, align, gap, etc.)
 * @returns A ref-forwarding Ant Design Flex wrapper element.
 */
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

    // Ant Design accepts gap as-is (number or tuple); preserve the original value
    const computedGap = Array.isArray(gap) ? gap : gap;

    // Merge the shorthand `flex` CSS property with any user-provided styles
    const flexStyle: React.CSSProperties = {
      ...(flex !== undefined && { flex }),
      ...style,
    };

    return (
      // Ant Design uses `vertical` boolean instead of flexDirection string,
      // so we map column/column-reverse to vertical=true
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

Flex.displayName = 'Flex.Classic';

export default Flex;
