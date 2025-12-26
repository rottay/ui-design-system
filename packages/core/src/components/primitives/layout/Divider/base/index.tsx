/**
 * Divider - Base Component
 * Uses CSS variables from design tokens for consistent styling.
 * This component provides the core rendering logic that can be extended by engine implementations.
 */

'use client';

import React, { forwardRef } from 'react';
import type { DividerProps, DividerVariant, DividerTextPosition } from '../types';
import {
  DIVIDER_DEFAULTS,
  SPACING_MAP,
  getThicknessValue,
  DEFAULT_COLORS,
} from '../types';

/**
 * Build CSS class names for the divider.
 */
function buildClassNames(
  orientation: 'horizontal' | 'vertical',
  variant: DividerVariant,
  textPosition: DividerTextPosition | undefined,
  hasChildren: boolean,
  plain: boolean,
  className?: string
): string {
  const classes = [
    'rottay-divider',
    `rottay-divider--${orientation}`,
    `rottay-divider--${variant}`,
  ];

  if (hasChildren) {
    classes.push('rottay-divider--with-text');
    classes.push(`rottay-divider--text-${textPosition || 'center'}`);
    if (plain) {
      classes.push('rottay-divider--plain');
    }
  }

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
}

/**
 * Base Divider component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseDivider = forwardRef<HTMLDivElement, DividerProps>(
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
    const textPosition = textPositionProp || orientationMargin || DIVIDER_DEFAULTS.textPosition!;
    const spacing = spacingProp || margin || DIVIDER_DEFAULTS.spacing!;

    const isHorizontal = orientation === 'horizontal';
    const hasChildren = !!children && isHorizontal; // Only show children for horizontal dividers

    // Calculate line thickness
    const lineThickness = getThicknessValue(thickness);
    const lineColor = color || DEFAULT_COLORS.apollo;
    const spacingValue = SPACING_MAP[spacing];

    // Build CSS variables for theming
    const dividerVars: React.CSSProperties = {
      '--divider-color': lineColor,
      '--divider-thickness': lineThickness,
      '--divider-spacing': spacingValue,
      '--divider-variant': variant,
    } as React.CSSProperties;

    // Container style
    const containerStyle: React.CSSProperties = {
      ...dividerVars,
      display: isHorizontal ? 'flex' : 'inline-flex',
      alignItems: 'center',
      justifyContent: textPosition === 'left' ? 'flex-start' :
                     textPosition === 'right' ? 'flex-end' : 'center',
      width: isHorizontal ? '100%' : 'auto',
      height: isHorizontal ? 'auto' : '100%',
      minHeight: isHorizontal ? undefined : '1em',
      margin: isHorizontal
        ? `${spacingValue} 0`
        : `0 ${spacingValue}`,
      ...style,
    };

    // Line style
    const lineStyle: React.CSSProperties = {
      flex: hasChildren ? undefined : 1,
      borderTop: isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
      borderLeft: !isHorizontal ? `${lineThickness} ${variant} ${lineColor}` : 'none',
      height: isHorizontal ? '0' : '100%',
      width: isHorizontal ? '100%' : '0',
    };

    // Line before text (flex behavior)
    const lineBeforeStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? '0 0 5%' :
            textPosition === 'right' ? 1 : 1,
      minWidth: '5%',
    };

    // Line after text (flex behavior)
    const lineAfterStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? 1 :
            textPosition === 'right' ? '0 0 5%' : 1,
      minWidth: '5%',
    };

    // Text style
    const textStyle: React.CSSProperties = {
      padding: '0 1rem',
      whiteSpace: 'nowrap',
      fontSize: plain ? 'inherit' : '0.875rem',
      fontWeight: plain ? 'inherit' : 500,
      color: plain ? 'inherit' : '#666',
    };

    const classNames = buildClassNames(
      orientation,
      variant,
      hasChildren ? textPosition : undefined,
      hasChildren,
      plain!,
      className
    );

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
          <div
            className="rottay-divider__line rottay-divider__line--before"
            style={lineBeforeStyle}
            aria-hidden="true"
          />
          <span
            className="rottay-divider__text"
            style={textStyle}
          >
            {children}
          </span>
          <div
            className="rottay-divider__line rottay-divider__line--after"
            style={lineAfterStyle}
            aria-hidden="true"
          />
        </div>
      );
    }

    // Render simple line
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

BaseDivider.displayName = 'BaseDivider';
