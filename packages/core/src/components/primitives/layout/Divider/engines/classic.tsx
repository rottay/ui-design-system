/**
 * @fileoverview Divider Classic Engine - Rottay Design System.
 * Ant Design compatible divider using `ant-divider-*` class conventions.
 * Renders as a flexbox row (horizontal) or inline-flex column (vertical)
 * with optional inline text positioned at left/center/right.
 *
 * @example
 * ```tsx
 * <ClassicDivider dashed>Section Title</ClassicDivider>
 * ```
 *
 * @module Divider/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { DividerProps, DividerVariant, DividerTextPosition } from '../Divider.types';
import {
  DIVIDER_DEFAULTS,
  SPACING_MAP,
  getThicknessValue,
  DEFAULT_COLORS,
} from '../Divider.types';

/**
 * Classic Divider component styled to match Ant Design conventions.
 *
 * Supports horizontal and vertical orientations, optional inline text with
 * left/center/right positioning, and solid/dashed/dotted line variants.
 * The `dashed` boolean prop takes priority over `variant` for backward
 * compatibility with the Ant Design API.
 *
 * @param props - {@link DividerProps} with orientation, variant, text, and styling options.
 * @returns A separator element with `role="separator"` and `aria-orientation`.
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

    // Resolve prop aliases: `type` is the legacy name for `orientation`,
    // `orientationMargin` is the Ant Design alias for `textPosition`,
    // and `margin` is the legacy alias for `spacing`
    const orientation = orientationProp || type || DIVIDER_DEFAULTS.orientation!;
    const variant: DividerVariant = dashed ? 'dashed' : (variantProp || DIVIDER_DEFAULTS.variant!);
    const textPosition: DividerTextPosition = textPositionProp || orientationMargin || DIVIDER_DEFAULTS.textPosition!;
    const spacing = spacingProp || margin || DIVIDER_DEFAULTS.spacing!;

    const isHorizontal = orientation === 'horizontal';
    // Text is only rendered inside horizontal dividers
    const hasChildren = !!children && isHorizontal;

    const lineThickness = getThicknessValue(thickness);
    const lineColor = color || DEFAULT_COLORS.classic;
    const spacingValue = SPACING_MAP[spacing];

    // Build Ant Design class names for external CSS overrides
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

    // Flexbox container: row for horizontal, inline-flex for vertical.
    // `clear: both` ensures the divider breaks past floated elements.
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

    // Base line style using border-top (horizontal) or border-left (vertical)
    const lineStyle: React.CSSProperties = {
      flex: 1,
      borderTop: isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
      borderLeft: !isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
      height: isHorizontal ? '0' : '100%',
      width: isHorizontal ? '100%' : '0',
    };

    // When text is left-aligned, the line before it is short (5%)
    // and the line after it fills the remaining space
    const lineBeforeStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? '0 0 5%' :
            textPosition === 'right' ? 1 : 1,
      minWidth: textPosition === 'left' ? '5%' : undefined,
    };

    // Mirror logic for right-aligned text
    const lineAfterStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? 1 :
            textPosition === 'right' ? '0 0 5%' : 1,
      minWidth: textPosition === 'right' ? '5%' : undefined,
    };

    // Text styling follows Ant Design conventions: 16px/500 weight when
    // not plain, with a three-level CSS variable fallback chain for color
    const textStyle: React.CSSProperties = {
      padding: '0 1em',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      fontSize: plain ? 'inherit' : '16px',
      fontWeight: plain ? 'inherit' : 500,
      color:
        plain
          ? 'inherit'
          : 'var(--ds-divider-text-color, var(--ds-color-text-primary, var(--ds-color-neutral-900, rgba(0, 0, 0, 0.85))))',
    };

    // Two render paths: with inline text (three spans) or simple line (single div)
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

    // Simple divider: container and line styles are merged into one element
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
