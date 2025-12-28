'use client';

/**
 * @fileoverview Space Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Space component.
 * Wraps Ant Design's Space component with full feature parity.
 *
 * @remarks
 * The Titan engine provides:
 * - Direct passthrough to Ant Design Space component
 * - Preset sizes (small, middle, large) matching Ant Design tokens
 * - Support for array-based asymmetric gaps
 * - Built-in split separator support
 * - Native wrapping behavior
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Space } from '@rottay/design-system';
 *
 * // Ant Design styling with preset sizes
 * <Space engine="titan" size="middle" direction="vertical">
 *   <Input placeholder="Field 1" />
 *   <Input placeholder="Field 2" />
 * </Space>
 * ```
 *
 * @see {@link Space} - The main engine-aware component
 * @module Space/Engines/Titan
 * @category Layout
 * @package @rottay/design-system
 */
import React from 'react';
import { Space as AntSpace } from 'antd';
import type { SpaceProps } from '../../types';
import { SPACE_DEFAULTS } from '../../types';

export const Space = React.forwardRef<HTMLDivElement, SpaceProps>(
  (props, ref) => {
    const {
      size = SPACE_DEFAULTS.size,
      direction = SPACE_DEFAULTS.direction,
      wrap = SPACE_DEFAULTS.wrap,
      align = SPACE_DEFAULTS.align,
      split,
      children,
      className,
      style,
      ...rest
    } = props;

    const computedSize =
      typeof size === 'string'
        ? size
        : Array.isArray(size)
          ? size
          : size;

    return (
      <AntSpace
        ref={ref}
        size={computedSize}
        direction={direction}
        wrap={wrap}
        align={align}
        split={split}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </AntSpace>
    );
  }
);

Space.displayName = 'Space.Titan';

export default Space;
