/**
 * @fileoverview Divider Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Divider component.
 * Uses Ant Design styling conventions with `ant-divider` class structure.
 *
 * @remarks
 * The Classic engine provides Ant Design-compatible styling:
 * - Class names follow Ant Design conventions (`ant-divider`, `ant-divider-horizontal`, etc.)
 * - Text styling matches Ant Design's typography
 * - Default colors use Ant Design's border color palette
 *
 * CSS Classes Applied:
 * - `ant-divider`: Base class
 * - `ant-divider-horizontal` / `ant-divider-vertical`: Orientation
 * - `ant-divider-with-text`: When text content is present
 * - `ant-divider-with-text-left/center/right`: Text positioning
 * - `ant-divider-dashed` / `ant-divider-dotted`: Line variants
 * - `ant-divider-plain`: Plain text without styling
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Divider } from '@rottay/design-system';
 *
 * // Ant Design styled divider
 * <Divider engine="classic" dashed>Section</Divider>
 * ```
 *
 * @see {@link Divider} - The main engine-aware component
 * @module Divider/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { DividerProps, DividerVariant, DividerTextPosition } from '../../types';
import {
  DIVIDER_DEFAULTS,
  SPACING_MAP,
  getThicknessValue,
  DEFAULT_COLORS,
} from '../../types';

/**
 * Classic Divider component.
 * Styled to match Ant Design conventions.
 */
const ClassicDivider = forwardRef<HTMLDivElement, DividerProps>(
  (props, ref) => {
    const {
      orientation: orientationProp,
      type,
      variant: variantProp,
      dashed = DIVIDER_DEFAULTS.dashed,
      children,
      textPosition: textPositionProp,
      orientationMargin,
      plain = DIVIDER_DEFAULTS.plain!,
      color,
      thickness = DIVIDER_DEFAULTS.thickness,
      spacing: spacingProp,
      margin,
      className = '',
      style = {},
      'data-testid': testId,
      ...rest
    } = props;

    // Resolve prop aliases
    const orientation = orientationProp || type || DIVIDER_DEFAULTS.orientation!;
    const variant: DividerVariant = dashed ? 'dashed' : (variantProp || DIVIDER_DEFAULTS.variant!);
    const textPosition: DividerTextPosition = textPositionProp || orientationMargin || DIVIDER_DEFAULTS.textPosition!;
    const spacing = spacingProp || margin || DIVIDER_DEFAULTS.spacing!;

    const isHorizontal = orientation === 'horizontal';
    const hasChildren = !!children && isHorizontal;

    // Calculate values
    const lineThickness = getThicknessValue(thickness);
    const lineColor = color || DEFAULT_COLORS.classic;
    const spacingValue = SPACING_MAP[spacing];

    // Build class names (Ant Design style)
    const classNames = [
      'ant-divider',
      `ant-divider-${orientation}`,
      hasChildren ? 'ant-divider-with-text' : '',
      hasChildren ? `ant-divider-with-text-${textPosition}` : '',
      plain && hasChildren ? 'ant-divider-plain' : '',
      variant === 'dashed' ? 'ant-divider-dashed' : '',
      variant === 'dotted' ? 'ant-divider-dotted' : '',
      className,
    ].filter(Boolean).join(' ');

    // Container style
    const containerStyle: React.CSSProperties = {
      display: isHorizontal ? 'flex' : 'inline-flex',
      alignItems: 'center',
      width: isHorizontal ? '100%' : 'auto',
      height: isHorizontal ? 'auto' : '100%',
      minHeight: isHorizontal ? undefined : '0.9em',
      margin: isHorizontal
        ? `${spacingValue} 0`
        : `0 ${spacingValue}`,
      clear: 'both',
      ...style,
    };

    // Line style
    const lineStyle: React.CSSProperties = {
      flex: 1,
      borderTop: isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
      borderLeft: !isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
      height: isHorizontal ? '0' : '100%',
      width: isHorizontal ? '100%' : '0',
    };

    // Line before text
    const lineBeforeStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? '0 0 5%' :
            textPosition === 'right' ? 1 : 1,
      minWidth: textPosition === 'left' ? '5%' : undefined,
    };

    // Line after text
    const lineAfterStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? 1 :
            textPosition === 'right' ? '0 0 5%' : 1,
      minWidth: textPosition === 'right' ? '5%' : undefined,
    };

    // Text style (Ant Design style)
    const textStyle: React.CSSProperties = {
      padding: '0 1em',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      fontSize: plain ? 'inherit' : '16px',
      fontWeight: plain ? 'inherit' : 500,
      color: plain ? 'inherit' : 'rgba(0, 0, 0, 0.85)',
    };

    // Render with text
    if (hasChildren) {
      return (
        <div
          ref={ref}
          className={classNames}
          style={containerStyle}
          role="separator"
          aria-orientation={orientation}
          data-testid={testId}
          {...rest}
        >
          <span className="ant-divider-inner-text-before" style={lineBeforeStyle} />
          <span className="ant-divider-inner-text" style={textStyle}>
            {children}
          </span>
          <span className="ant-divider-inner-text-after" style={lineAfterStyle} />
        </div>
      );
    }

    // Simple divider without text
    return (
      <div
        ref={ref}
        className={classNames}
        style={{ ...containerStyle, ...lineStyle }}
        role="separator"
        aria-orientation={orientation}
        data-testid={testId}
        {...rest}
      />
    );
  }
);

ClassicDivider.displayName = 'ClassicDivider';

export default ClassicDivider;
