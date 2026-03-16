/**
 * @fileoverview Stack Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Stack component.
 * Provides full-featured Stack using Ant Design styling conventions.
 *
 * @remarks
 * The Titan engine implementation uses Ant Design's design system principles
 * while maintaining full compatibility with the Stack API. It applies the
 * `rottay-stack--classic` class for engine-specific styling hooks.
 *
 * CSS Classes Applied:
 * - `rottay-stack`: Base class for all Stack components
 * - `rottay-stack--classic`: Engine-specific class for Classic styling
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Automatically uses Classic if default engine
 * <Stack spacing="md" direction="vertical">
 *   <Item>First</Item>
 *   <Item>Second</Item>
 * </Stack>
 *
 * // Or explicitly specify engine
 * <Stack engine="classic" spacing="lg" align="center">
 *   Ant Design styled stack
 * </Stack>
 * ```
 *
 * @see {@link Stack} - The main engine-aware component
 * @see {@link HermesStack} - Tailwind implementation
 * @see {@link ApolloStack} - Pure HTML/CSS implementation
 * @module Stack/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type CSSProperties, type ElementType, type ReactNode, type Ref } from 'react';
import type { StackProps, StackDirection, StackSpacing, StackSpacingPreset } from '../Stack.types';
import { STACK_DEFAULTS, SPACING_MAP, ALIGN_MAP, JUSTIFY_MAP } from '../Stack.types';

/**
 * Converts a spacing value to its CSS equivalent.
 * Handles presets via SPACING_MAP, raw numbers as pixels, and undefined/none as zero.
 *
 * @param value - A preset name ('xs'..'4xl'), a pixel number, or undefined
 * @returns A CSS-compatible string value (e.g. '1rem', '24px', '0')
 */
function resolveSpacing(value: StackSpacing | undefined): string {
  if (value === undefined || value === 'none') return '0';
  if (typeof value === 'number') return `${value}px`;
  return SPACING_MAP[value as StackSpacingPreset] || '0';
}

/**
 * Assembles a complete inline flexbox CSSProperties object from Stack props.
 * The `gap` prop takes precedence over `spacing` (they are aliases), and both
 * fall back to STACK_DEFAULTS.spacing when omitted. The `reverse` flag flips
 * the flex-direction suffix rather than reordering children in the DOM, which
 * preserves tab order and accessibility.
 *
 * @param props - The full StackProps to derive styles from
 * @returns A CSSProperties object ready for inline application
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

  // `gap` alias takes priority over `spacing` for CSS gap consistency
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
 * Interleaves divider elements between children when a divider is provided.
 * Clones React elements to inject stable keys and aria-hidden for accessibility;
 * wraps non-element dividers (strings, numbers) in a span.
 *
 * @param children - The child nodes to separate
 * @param divider - The separator element or node to insert
 * @param direction - Stack direction (reserved for future orientation-aware dividers)
 * @returns The original children with dividers inserted between them
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
    // Clone valid React elements to add a stable key; wrap primitives in a span
    const dividerElement = React.isValidElement(divider)
      ? React.cloneElement(divider as React.ReactElement<Record<string, unknown>>, {
          key: `divider-${index}`,
          'aria-hidden': true,
        })
      : <span key={`divider-${index}`} aria-hidden="true">{divider}</span>;

    return [...acc, dividerElement, child];
  }, []);
}

/**
 * Classic (Titan) engine implementation of the Stack component.
 * Renders a flex container with the `rottay-stack--classic` CSS class hook
 * for Ant Design-aligned styling. All layout logic is handled via inline
 * flexbox styles built by `buildStackStyles`, while the BEM-style class
 * names enable external theme overrides.
 *
 * @param props - Stack configuration (direction, spacing, align, justify, divider, etc.)
 * @returns A polymorphic element (default `div`) with flexbox layout
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

  // BEM-style class names allow engine-specific CSS overrides without
  // conflicting with other engine implementations
  const classNames = [
    'rottay-stack',
    'rottay-stack--classic',
    className,
  ].filter(Boolean).join(' ');

  // Use createElement instead of JSX to support the polymorphic `as` prop,
  // which can be any valid HTML tag or React component type
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

TitanStack.displayName = 'ClassicStack';

export default TitanStack;
