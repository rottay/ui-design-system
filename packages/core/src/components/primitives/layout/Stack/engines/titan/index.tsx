/**
 * @fileoverview Stack Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Stack component.
 * Provides full-featured Stack using Ant Design styling conventions.
 *
 * @remarks
 * The Titan engine implementation uses Ant Design's design system principles
 * while maintaining full compatibility with the Stack API. It applies the
 * `rottay-stack--titan` class for engine-specific styling hooks.
 *
 * CSS Classes Applied:
 * - `rottay-stack`: Base class for all Stack components
 * - `rottay-stack--titan`: Engine-specific class for Titan styling
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Automatically uses Titan if default engine
 * <Stack spacing="md" direction="vertical">
 *   <Item>First</Item>
 *   <Item>Second</Item>
 * </Stack>
 *
 * // Or explicitly specify engine
 * <Stack engine="titan" spacing="lg" align="center">
 *   Ant Design styled stack
 * </Stack>
 * ```
 *
 * @see {@link Stack} - The main engine-aware component
 * @see {@link HermesStack} - Tailwind implementation
 * @see {@link ApolloStack} - Pure HTML/CSS implementation
 * @module Stack/Engines/Titan
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type CSSProperties, type ElementType, type ReactNode, type Ref } from 'react';
import type { StackProps, StackDirection, StackSpacing, StackSpacingPreset } from '../../types';
import { STACK_DEFAULTS, SPACING_MAP, ALIGN_MAP, JUSTIFY_MAP } from '../../types';

/**
 * Converts a spacing value to its CSS equivalent.
 */
function resolveSpacing(value: StackSpacing | undefined): string {
  if (value === undefined || value === 'none') return '0';
  if (typeof value === 'number') return `${value}px`;
  return SPACING_MAP[value as StackSpacingPreset] || '0';
}

/**
 * Build flexbox styles from Stack props
 */
function buildStackStyles(props: StackProps): CSSProperties {
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

  const spacingValue = gap ?? spacing ?? STACK_DEFAULTS.spacing;

  const baseStyles: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical'
      ? (reverse ? 'column-reverse' : 'column')
      : (reverse ? 'row-reverse' : 'row'),
    gap: resolveSpacing(spacingValue),
    alignItems: ALIGN_MAP[align],
    justifyContent: JUSTIFY_MAP[justify],
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...(fullWidth && { width: '100%' }),
    ...(fullHeight && { height: '100%' }),
    ...style,
  };

  return baseStyles;
}

/**
 * Renders children with optional dividers between them
 */
function renderStackChildren(
  children: ReactNode,
  divider: ReactNode | undefined,
  direction: StackDirection
): ReactNode {
  if (!divider) return children;

  const childArray = React.Children.toArray(children).filter(Boolean);
  if (childArray.length <= 1) return children;

  return childArray.reduce<ReactNode[]>((acc, child, index) => {
    if (index === 0) {
      return [child];
    }
    const dividerElement = React.isValidElement(divider)
      ? React.cloneElement(divider as React.ReactElement, {
          key: `divider-${index}`,
          'aria-hidden': true,
        })
      : <span key={`divider-${index}`} aria-hidden="true">{divider}</span>;

    return [...acc, dividerElement, child];
  }, []);
}

/**
 * Titan Stack component.
 * Uses Ant Design's styling conventions while maintaining
 * compatibility with the Stack API.
 */
const TitanStack = forwardRef<HTMLElement, StackProps>((props, ref) => {
  const {
    as: Component = STACK_DEFAULTS.as,
    direction = STACK_DEFAULTS.direction,
    divider,
    className = '',
    children,
  } = props;

  const computedStyle = buildStackStyles(props);
  const renderedChildren = renderStackChildren(children, divider, direction);

  // Build class names with Titan-specific prefixes
  const classNames = [
    'rottay-stack',
    'rottay-stack--titan',
    className,
  ].filter(Boolean).join(' ');

  const ElementType = Component as ElementType;

  return React.createElement(
    ElementType,
    {
      ref: ref as Ref<HTMLElement>,
      className: classNames,
      style: computedStyle,
    },
    renderedChildren
  );
});

TitanStack.displayName = 'TitanStack';

export default TitanStack;
