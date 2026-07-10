'use client';

/**
 * @fileoverview Space Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Space component.
 * Wraps Ant Design's Space component with full feature parity.
 *
 * @remarks
 * The Classic engine provides:
 * - Direct passthrough to Ant Design Space component
 * - Preset sizes (small, middle, large) matching Ant Design tokens
 * - Support for array-based asymmetric gaps
 * - Built-in split separator support
 * - Native wrapping behavior
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Space } from '@rottay/design-system';
 *
 * // Ant Design styling with preset sizes
 * <Space engine="classic" size="middle" direction="vertical">
 *   <Input placeholder="Field 1" />
 *   <Input placeholder="Field 2" />
 * </Space>
 * ```
 *
 * @see {@link Space} - The main engine-aware component
 * @module Space/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */
import React from 'react';
import { Space as AntSpace } from 'antd';
import type { SpaceProps } from '../Space.types';
import { SPACE_DEFAULTS } from '../Space.types';
import { toLegacySize } from '../../../../../contracts/common';

/**
 * Classic engine implementation of the Space component.
 * Delegates entirely to Ant Design's Space, preserving its native behavior
 * for preset sizes, array-based asymmetric gaps, and split separators.
 *
 * @param props - Space configuration forwarded to AntSpace
 * @returns An Ant Design Space element wrapped with forwardRef
 */
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

    // Normalize size to a value Ant Design accepts: Ant Design's Space size prop
    // recognizes the legacy 'small' | 'middle' | 'large' spelling, a number, or a
    // [horizontal, vertical] tuple -- not the canonical 'sm' | 'md' | 'lg' spelling, so a
    // string value is resolved to its legacy spelling before reaching AntSpace.
    const computedSize =
      typeof size === 'string'
        ? toLegacySize(size)
        : Array.isArray(size)
          ? size
          : size;

    // Ant Design's Space handles all layout, alignment, and separator logic internally,
    // so this engine acts as a thin passthrough with consistent prop defaults.
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

Space.displayName = 'Space.Classic';

export default Space;
