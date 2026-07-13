/**
 * @fileoverview Divider Rustic Engine - Rottay Design System.
 * Pure inline CSS divider with full ARIA accessibility (`role="separator"`,
 * `aria-orientation`, `aria-hidden` on decorative lines). Uses BEM-style
 * class names and CSS custom properties for tenant theming. Zero external
 * dependencies -- ideal for embedded widgets and SSR.
 *
 * @example
 * ```tsx
 * <RusticDivider variant="dashed">Section Break</RusticDivider>
 * ```
 *
 * @module Divider/Engines/Rustic
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
 * Rustic (vanilla CSS) Divider with full ARIA accessibility.
 *
 * Uses BEM-style class names (`divider`, `divider--horizontal`, `divider__text`)
 * and CSS custom properties (`--ds-divider-text-*`, `--ds-color-neutral-*`) for
 * tenant theming. Decorative line spans include `aria-hidden="true"` so screen
 * readers only announce the text content.
 *
 * @param props - {@link DividerProps} with orientation, variant, text, and styling options.
 * @returns A fully accessible separator element with inline styles.
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

    // Resolve prop aliases for backward compatibility
    const orientation = orientationProp || type || DIVIDER_DEFAULTS.orientation!;
    const variant: DividerVariant = dashed ? 'dashed' : (variantProp || DIVIDER_DEFAULTS.variant!);
    const textPosition: DividerTextPosition = textPositionProp || orientationMargin || DIVIDER_DEFAULTS.textPosition!;
    const spacing = spacingProp || margin || DIVIDER_DEFAULTS.spacing!;

    const isHorizontal = orientation === 'horizontal';
    // Text is only supported in horizontal orientation
    const hasChildren = !!children && isHorizontal;

    const lineThickness = getThicknessValue(thickness);
    const lineColor = color || DEFAULT_COLORS.rustic;
    const spacingValue = SPACING_MAP[spacing];

    // BEM class names allow external CSS overrides without specificity wars
    const classNames = [
      'divider',
      `divider--${orientation}`,
      `divider--${variant}`,
      hasChildren ? 'divider--with-text' : '',
      hasChildren ? `divider--ds-text-${textPosition}` : '',
      plain && hasChildren ? 'divider--plain' : '',
      className,
    ].filter(Boolean).join(' ');

    // Explicit box-sizing ensures padding/border is included in dimensions.
    // Vertical dividers use inline-flex so they flow alongside content.
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

    // Base line style: only the relevant border direction is set, and
    // borderRight/Bottom are explicitly none to prevent style bleeding
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

    // Asymmetric flex values create the left/center/right text positioning
    const lineBeforeStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? '0 0 5%' :
            textPosition === 'right' ? 1 : 1,
      minWidth: '5%',
    };

    const lineAfterStyle: React.CSSProperties = {
      ...lineStyle,
      flex: textPosition === 'left' ? 1 :
            textPosition === 'right' ? '0 0 5%' : 1,
      minWidth: '5%',
    };

    // Text uses CSS custom property fallbacks for tenant-level overrides
    const textStyle: React.CSSProperties = {
      display: 'inline-block',
      padding: 'var(--ds-divider-text-padding, 0 1rem)',
      whiteSpace: 'nowrap',
      fontSize: plain ? 'inherit' : 'var(--ds-divider-text-size, 0.875rem)',
      fontWeight: plain ? 'inherit' : 500,
      color: plain ? 'inherit' : 'var(--ds-divider-text-color, var(--ds-color-neutral-600, #555))',
      lineHeight: 1.5,
    };

    // With-text render path: line spans are aria-hidden for accessibility
    if (hasChildren) {
      return (
        <div
          ref={ref}
          className={classNames}
          style={containerStyle}
          role="separator"
          aria-orientation={orientation}
          data-testid={testId}
          data-part="root"
          data-orientation={orientation}
          data-with-text="true"
          {...rest}
        >
          <span
            className="divider__line divider__line--before"
            data-part="line-before"
            style={lineBeforeStyle}
            aria-hidden="true"
          />
          <span className="divider__text" data-part="text" style={textStyle}>
            {children}
          </span>
          <span
            className="divider__line divider__line--after"
            data-part="line-after"
            style={lineAfterStyle}
            aria-hidden="true"
          />
        </div>
      );
    }

    // Simple divider: merge container and line styles into a single element
    return (
      <div
        ref={ref}
        className={classNames}
        style={{ ...containerStyle, ...lineStyle }}
        role="separator"
        aria-orientation={orientation}
        data-testid={testId}
        data-part="root"
        data-orientation={orientation}
        data-with-text="false"
        {...rest}
      />
    );
  }
);

RusticDivider.displayName = 'RusticDivider';

export default RusticDivider;
