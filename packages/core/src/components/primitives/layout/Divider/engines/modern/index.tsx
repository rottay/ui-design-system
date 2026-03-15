/**
 * @fileoverview Divider Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Divider component.
 * Uses DaisyUI's divider classes with Tailwind utilities.
 *
 * @remarks
 * The Modern engine provides DaisyUI-compatible styling:
 * - Uses DaisyUI's `divider` class structure
 * - Text styling uses uppercase and letter-spacing for emphasis
 * - Colors use DaisyUI's `oklch` color variables
 *
 * CSS Classes Applied:
 * - `divider`: Base DaisyUI class
 * - `divider-horizontal` / `divider-vertical`: Orientation
 * - `divider-start` / `divider-end`: Text positioning
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Divider } from '@rottay/design-system';
 *
 * // DaisyUI styled divider
 * <Divider engine="modern" textPosition="left">
 *   CHAPTER ONE
 * </Divider>
 * ```
 *
 * @see {@link Divider} - The main engine-aware component
 * @module Divider/Engines/Modern
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
 * Modern Divider component.
 * Styled to match DaisyUI conventions.
 */
const ModernDivider = forwardRef<HTMLDivElement, DividerProps>(
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
    const lineColor = color || DEFAULT_COLORS.modern;
    const spacingValue = SPACING_MAP[spacing];

    // Build class names (DaisyUI style)
    const classNames = [
      'divider',
      isHorizontal ? 'divider-horizontal' : 'divider-vertical',
      hasChildren && textPosition === 'left' ? 'divider-start' : '',
      hasChildren && textPosition === 'right' ? 'divider-end' : '',
      className,
    ].filter(Boolean).join(' ');

    // Container style
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      alignSelf: 'stretch',
      flexDirection: isHorizontal ? 'row' : 'column',
      width: isHorizontal ? '100%' : 'auto',
      height: isHorizontal ? 'auto' : '100%',
      gap: '1rem',
      margin: isHorizontal
        ? `${spacingValue} 0`
        : `0 ${spacingValue}`,
      ...style,
    };

    // Line style for DaisyUI (uses pseudo-element approach)
    const lineStyle: React.CSSProperties = {
      flex: 1,
      height: isHorizontal ? '0' : '100%',
      width: isHorizontal ? '100%' : '0',
      borderTop: isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
      borderLeft: !isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
    };

    // Line before text
    const lineBeforeStyle: React.CSSProperties = {
      ...lineStyle,
      flexGrow: textPosition === 'left' ? 0 : 1,
      flexBasis: textPosition === 'left' ? '5%' : undefined,
      minWidth: '5%',
    };

    // Line after text
    const lineAfterStyle: React.CSSProperties = {
      ...lineStyle,
      flexGrow: textPosition === 'right' ? 0 : 1,
      flexBasis: textPosition === 'right' ? '5%' : undefined,
      minWidth: '5%',
    };

    // Text style (DaisyUI style)
    const textStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      fontSize: plain ? 'inherit' : '0.875rem',
      fontWeight: plain ? 'inherit' : 600,
      color: plain ? 'inherit' : 'var(--ds-color-text-secondary, rgba(0, 0, 0, 0.65))',
      textTransform: plain ? 'none' : 'uppercase',
      letterSpacing: plain ? 'normal' : '0.05em',
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
          <span className="divider-line divider-line-before" style={lineBeforeStyle} />
          <span className="divider-content" style={textStyle}>
            {children}
          </span>
          <span className="divider-line divider-line-after" style={lineAfterStyle} />
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

ModernDivider.displayName = 'ModernDivider';

export default ModernDivider;
