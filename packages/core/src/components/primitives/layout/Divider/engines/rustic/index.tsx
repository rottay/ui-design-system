/**
 * @fileoverview Divider Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Divider component.
 * Uses vanilla HTML with inline CSS for maximum compatibility and accessibility.
 *
 * @remarks
 * The Rustic engine provides:
 * - Pure inline CSS styling without external dependencies
 * - Full ARIA accessibility (`role="separator"`, `aria-orientation`, `aria-hidden`)
 * - BEM-style class names (`divider`, `divider--horizontal`, `divider__text`)
 * - Complete box-sizing control for consistent rendering
 *
 * This implementation is ideal for:
 * - Embedded widgets in third-party applications
 * - Server-side rendering without CSS extraction
 * - Accessibility-focused implementations
 * - Maximum browser compatibility
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Divider } from '@rottay/design-system';
 *
 * // Pure HTML/CSS divider with accessibility
 * <Divider engine="rustic" variant="dashed">
 *   Section Break
 * </Divider>
 * ```
 *
 * @see {@link Divider} - The main engine-aware component
 * @module Divider/Engines/Rustic
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
 * Rustic Divider component.
 * Pure HTML/CSS implementation with accessibility focus.
 */
const RusticDivider = forwardRef<HTMLDivElement, DividerProps>(
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
    const lineColor = color || DEFAULT_COLORS.rustic;
    const spacingValue = SPACING_MAP[spacing];

    // Build class names
    const classNames = [
      'divider',
      `divider--${orientation}`,
      `divider--${variant}`,
      hasChildren ? 'divider--with-text' : '',
      hasChildren ? `divider--text-${textPosition}` : '',
      plain && hasChildren ? 'divider--plain' : '',
      className,
    ].filter(Boolean).join(' ');

    // Container style
    const containerStyle: React.CSSProperties = {
      display: isHorizontal ? 'flex' : 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      width: isHorizontal ? '100%' : 'auto',
      height: isHorizontal ? 'auto' : '100%',
      minHeight: isHorizontal ? undefined : '1em',
      margin: isHorizontal
        ? `${spacingValue} 0`
        : `0 ${spacingValue}`,
      padding: 0,
      ...style,
    };

    // Line style
    const lineStyle: React.CSSProperties = {
      flex: 1,
      boxSizing: 'border-box',
      height: isHorizontal ? '0' : '100%',
      width: isHorizontal ? '100%' : '0',
      borderTop: isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
      borderLeft: !isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
      borderRight: 'none',
      borderBottom: 'none',
    };

    // Line before text
    const lineBeforeStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? '0 0 5%' :
            textPosition === 'right' ? 1 : 1,
      minWidth: '5%',
    };

    // Line after text
    const lineAfterStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? 1 :
            textPosition === 'right' ? '0 0 5%' : 1,
      minWidth: '5%',
    };

    // Text style
    const textStyle: React.CSSProperties = {
      display: 'inline-block',
      padding: 'var(--ds-divider-text-padding, 0 1rem)',
      whiteSpace: 'nowrap',
      fontSize: plain ? 'inherit' : 'var(--ds-divider-text-size, 0.875rem)',
      fontWeight: plain ? 'inherit' : 500,
      color: plain ? 'inherit' : 'var(--ds-divider-text-color, var(--ds-color-neutral-600, #555))',
      lineHeight: 1.5,
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
          <span
            className="divider__line divider__line--before"
            style={lineBeforeStyle}
            aria-hidden="true"
          />
          <span className="divider__text" style={textStyle}>
            {children}
          </span>
          <span
            className="divider__line divider__line--after"
            style={lineAfterStyle}
            aria-hidden="true"
          />
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

RusticDivider.displayName = 'RusticDivider';

export default RusticDivider;
