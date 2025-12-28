/**
 * @fileoverview Stack Base Component - Rottay Design System
 * @description Core implementation of the Stack layout primitive using flexbox.
 * This base component is extended by engine-specific implementations.
 *
 * @remarks
 * The base component handles all flexbox style computation, prop filtering,
 * and child rendering (including divider insertion). It provides a foundation
 * for Titan, Hermes, and Apollo engine implementations.
 *
 * Key utilities exported:
 * - `buildStackStyles`: Converts Stack props to CSS flexbox properties
 * - `filterStackProps`: Removes Stack-specific props before DOM passthrough
 * - `renderStackChildren`: Handles divider insertion between children
 * - `BaseStack`: The foundational component with full Stack API support
 *
 * @example Using Utility Functions
 * ```tsx
 * import { buildStackStyles, renderStackChildren } from '@rottay/design-system';
 *
 * // Build flexbox styles from props
 * const styles = buildStackStyles({
 *   direction: 'horizontal',
 *   spacing: 'md',
 *   align: 'center'
 * });
 * // Result: { display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }
 *
 * // Render children with dividers
 * const renderedChildren = renderStackChildren(children, <Divider />, 'vertical');
 * ```
 *
 * @see {@link Stack} - The main engine-aware component
 * @module Stack/Base
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type CSSProperties, type ElementType, type Ref, type ReactNode } from 'react';
import type { StackProps, StackDirection } from '../types';
import { STACK_DEFAULTS, ALIGN_MAP, JUSTIFY_MAP, resolveSpacing } from '../types';

/**
 * Build flexbox styles from Stack props
 */
export function buildStackStyles(props: StackProps): CSSProperties {
  const {
    direction = STACK_DEFAULTS.direction,
    spacing,
    gap,
    align = STACK_DEFAULTS.align,
    justify = STACK_DEFAULTS.justify,
    wrap = STACK_DEFAULTS.wrap,
    reverse = STACK_DEFAULTS.reverse,
    fullWidth = STACK_DEFAULTS.fullWidth,
    fullHeight = STACK_DEFAULTS.fullHeight,
    style,
  } = props;

  // Use gap if provided, otherwise use spacing
  const spacingValue = gap ?? spacing ?? STACK_DEFAULTS.spacing;

  // Determine flex direction based on direction and reverse props
  let flexDirection: CSSProperties['flexDirection'] = direction === 'vertical' ? 'column' : 'row';
  if (reverse) {
    flexDirection = direction === 'vertical' ? 'column-reverse' : 'row-reverse';
  }

  const computedStyles: CSSProperties = {
    display: 'flex',
    flexDirection,
    alignItems: ALIGN_MAP[align],
    justifyContent: JUSTIFY_MAP[justify],
    gap: resolveSpacing(spacingValue),
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...(fullWidth && { width: '100%' }),
    ...(fullHeight && { height: '100%' }),
    ...style,
  };

  return computedStyles;
}

/**
 * Filter out Stack-specific props from being passed to the DOM element
 */
export function filterStackProps(props: StackProps): Record<string, unknown> {
  const {
    // Remove Stack-specific props
    as: _as,
    engine: _engine,
    direction: _direction,
    spacing: _spacing,
    gap: _gap,
    align: _align,
    justify: _justify,
    wrap: _wrap,
    divider: _divider,
    reverse: _reverse,
    fullWidth: _fullWidth,
    fullHeight: _fullHeight,
    className: _className,
    style: _style,
    children: _children,
    ...rest
  } = props;

  return rest;
}

/**
 * Renders children with optional dividers between them
 */
export function renderStackChildren(
  children: ReactNode,
  divider: ReactNode | undefined,
  direction: StackDirection
): ReactNode {
  if (!divider) {
    return children;
  }

  const childArray = React.Children.toArray(children).filter(Boolean);

  if (childArray.length <= 1) {
    return children;
  }

  const result: ReactNode[] = [];

  childArray.forEach((child, index) => {
    result.push(
      <React.Fragment key={`child-${index}`}>
        {child}
      </React.Fragment>
    );

    if (index < childArray.length - 1) {
      // If divider is true/truthy but not a ReactNode, render default divider
      const dividerElement = divider === true ? (
        <DefaultDivider direction={direction} />
      ) : (
        divider
      );

      result.push(
        <React.Fragment key={`divider-${index}`}>
          {dividerElement}
        </React.Fragment>
      );
    }
  });

  return result;
}

/**
 * Default divider component
 */
interface DefaultDividerProps {
  direction: StackDirection;
}

function DefaultDivider({ direction }: DefaultDividerProps) {
  const isVertical = direction === 'vertical';

  return (
    <div
      className="rottay-stack-divider"
      style={{
        width: isVertical ? '100%' : '1px',
        height: isVertical ? '1px' : '100%',
        backgroundColor: 'var(--ds-stack-divider-color, #e5e7eb)',
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Base Stack component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseStack = forwardRef<HTMLElement, StackProps>(
  (props, ref) => {
    const {
      as: Component = STACK_DEFAULTS.as,
      direction = STACK_DEFAULTS.direction,
      divider,
      className = '',
      children,
    } = props;

    const computedStyle = buildStackStyles(props);
    const filteredProps = filterStackProps(props);
    const renderedChildren = renderStackChildren(children, divider, direction);

    // Cast Component to ElementType for createElement
    const ElementType = Component as ElementType;

    return React.createElement(
      ElementType,
      {
        ref: ref as Ref<HTMLElement>,
        className: `rottay-stack ${className}`.trim(),
        style: computedStyle,
        ...filteredProps,
      },
      renderedChildren
    );
  }
);

BaseStack.displayName = 'BaseStack';
