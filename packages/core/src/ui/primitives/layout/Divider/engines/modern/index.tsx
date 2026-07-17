/**
 * @fileoverview Divider Modern Engine - Rottay Design System.
 * DaisyUI/Tailwind implementation using `divider` / `divider-start` /
 * `divider-end` class conventions. Text is styled with uppercase and
 * letter-spacing for visual emphasis consistent with DaisyUI themes.
 *
 * @example
 * ```tsx
 * <ModernDivider textPosition="left">CHAPTER ONE</ModernDivider>
 * ```
 *
 * @module Divider/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { DividerProps, DividerVariant, DividerTextPosition } from '../../contracts';
import {
  DIVIDER_DEFAULTS,
  SPACING_MAP,
  getThicknessValue,
  DEFAULT_COLORS,
} from '../../contracts';

/**
 * Modern (DaisyUI/Tailwind) Divider component.
 *
 * Maps text positioning to DaisyUI classes (`divider-start`, `divider-end`)
 * and uses flexbox with a 1rem gap for consistent spacing between the line
 * and inline text. Text is styled with uppercase and letter-spacing when
 * `plain` is false, matching the DaisyUI visual language.
 *
 * @param props - {@link DividerProps} with orientation, variant, text, and styling options.
 * @returns A separator element with `role="separator"` and DaisyUI classes.
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

    // Resolve prop aliases for backward compatibility with Ant Design API
    const orientation = orientationProp || type || DIVIDER_DEFAULTS.orientation!;
    const variant: DividerVariant = dashed ? 'dashed' : (variantProp || DIVIDER_DEFAULTS.variant!);
    const textPosition: DividerTextPosition = textPositionProp || orientationMargin || DIVIDER_DEFAULTS.textPosition!;
    const spacing = spacingProp || margin || DIVIDER_DEFAULTS.spacing!;

    const isHorizontal = orientation === 'horizontal';
    // Inline text is only supported in horizontal orientation
    const hasChildren = !!children && isHorizontal;

    const lineThickness = getThicknessValue(thickness);
    const lineColor = color || DEFAULT_COLORS.modern;
    const spacingValue = SPACING_MAP[spacing];

    // DaisyUI maps text position to divider-start/divider-end;
    // center (default) does not need an additional class
    const classNames = [
      'rottay-divider',
      'rottay-divider--modern',
      'divider',
      isHorizontal ? 'divider-horizontal' : 'divider-vertical',
      hasChildren && textPosition === 'left' ? 'divider-start' : '',
      hasChildren && textPosition === 'right' ? 'divider-end' : '',
      className,
    ].filter(Boolean).join(' ');

    // Flex container with alignSelf: stretch so vertical dividers fill
    // the height of their parent flex container
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      alignSelf: 'stretch',
      flexDirection: isHorizontal ? 'row' : 'column',
      width: isHorizontal ? '100%' : 'auto',
      height: isHorizontal ? 'auto' : '100%',
      gap: 'var(--ds-spacing-4, 1rem)',
      margin: isHorizontal
        ? `${spacingValue} 0`
        : `0 ${spacingValue}`,
      ...style,
    };

    // Line uses border (not a pseudo-element) for inline style portability.
    // `color`/`thickness` are caller-overridable free-form props (see
    // Divider.types.ts), so the resolved value can't be enumerated into a
    // finite data-* lookup -- it rides `--ds-divider-line` instead, read via
    // `var()` by engines/modern/skin/divider.css and gated on
    // `data-orientation` there to land on border-top vs border-left.
    const lineStyle: React.CSSProperties = {
      flex: 1,
      height: isHorizontal ? '0' : '100%',
      width: isHorizontal ? '100%' : '0',
      '--ds-divider-line': `${lineThickness} ${variant} ${lineColor}`,
    } as React.CSSProperties;

    // flexGrow/flexBasis control asymmetric line lengths around the text
    const lineBeforeStyle: React.CSSProperties = {
      ...lineStyle,
      flexGrow: textPosition === 'left' ? 0 : 1,
      flexBasis: textPosition === 'left' ? '5%' : undefined,
      minWidth: '5%',
    };

    const lineAfterStyle: React.CSSProperties = {
      ...lineStyle,
      flexGrow: textPosition === 'right' ? 0 : 1,
      flexBasis: textPosition === 'right' ? '5%' : undefined,
      minWidth: '5%',
    };

    // DaisyUI text convention: uppercase + letter-spacing for visual emphasis.
    // `plain`'s color branch rides `--ds-divider-plain-color` since this
    // engine stamps no `data-plain` signal (rustic's skin keys off its own
    // existing `divider--plain` class instead).
    const textStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      fontSize: plain ? 'inherit' : '0.875rem',
      fontWeight: plain ? 'inherit' : 600,
      '--ds-divider-plain-color': plain ? 'inherit' : undefined,
      textTransform: plain ? 'none' : 'uppercase',
      letterSpacing: plain ? 'normal' : '0.05em',
    } as React.CSSProperties;

    // Two render paths: with inline text or simple line
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
          <span className="divider-line divider-line-before" data-part="line-before" style={lineBeforeStyle} />
          <span className="divider-content" data-part="text" style={textStyle}>
            {children}
          </span>
          <span className="divider-line divider-line-after" data-part="line-after" style={lineAfterStyle} />
        </div>
      );
    }

    // Simple divider: merge container and line styles into one element
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

ModernDivider.displayName = 'ModernDivider';

export default ModernDivider;
