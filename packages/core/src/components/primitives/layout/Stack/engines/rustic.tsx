/**
 * @fileoverview Stack Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Stack component.
 * Provides a dependency-free Stack using inline flexbox styles.
 *
 * @remarks
 * The Rustic engine uses pure inline CSS styles without any external CSS framework
 * dependencies. All flexbox properties are computed and applied inline:
 * - `display: flex`
 * - `flexDirection`: column/row (with -reverse variants)
 * - `gap`: Resolved spacing value
 * - `alignItems`, `justifyContent`: Alignment values
 *
 * This makes it ideal for:
 * - Server-side rendering without CSS extraction
 * - Embedding in third-party applications
 * - Maximum browser compatibility
 * - Accessibility-focused implementations
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Use Rustic for dependency-free styling
 * <Stack engine="rustic" direction="vertical" spacing="md">
 *   Pure inline CSS flexbox, no framework dependencies
 * </Stack>
 *
 * // Ideal for embedded widgets
 * <EngineProvider engine="rustic">
 *   <Stack spacing="lg" align="center">
 *     Self-contained flexbox styling
 *   </Stack>
 * </EngineProvider>
 * ```
 *
 * @see {@link Stack} - The main engine-aware component
 * @see {@link TitanStack} - Ant Design implementation
 * @see {@link HermesStack} - Tailwind implementation
 * @module Stack/Engines/Rustic
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
 * All layout properties are expressed inline, making this engine completely
 * independent of any CSS framework. The `gap` prop takes precedence over
 * `spacing` (they are aliases), with both falling back to STACK_DEFAULTS.spacing.
 *
 * @param props - The full StackProps to derive styles from
 * @returns A CSSProperties object with all flexbox layout properties
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
 * Clones React elements with stable keys and aria-hidden for accessibility;
 * wraps non-element dividers (strings, numbers) in a span.
 *
 * @param children - The child nodes to separate
 * @param divider - The separator element to insert between children
 * @param direction - Stack direction (reserved for future orientation-aware dividers)
 * @returns Children with dividers interleaved, or unmodified children if no divider
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
 * Rustic (Apollo) engine implementation of the Stack component.
 * Relies entirely on inline flexbox styles with no CSS framework dependency,
 * making it suitable for embedded widgets, SSR without CSS extraction, and
 * environments where Ant Design or Tailwind are unavailable. The
 * `rottay-stack--rustic` class is applied purely as a styling hook for
 * consumers who want to add external CSS overrides.
 *
 * @param props - Stack configuration (direction, spacing, align, justify, divider, etc.)
 * @returns A polymorphic element (default `div`) with pure inline flexbox styles
 */
const ApolloStack = forwardRef<HTMLElement, StackProps>((props, ref) => {
  const {
    as: Component = STACK_DEFAULTS.as,
    direction = STACK_DEFAULTS.direction,
    divider,
    className = '',
    children,
  } = props;

  const computedStyle = buildStackStyles(props);
  const renderedChildren = renderStackChildren(children, divider, direction);

  // BEM-style class names for optional external CSS targeting,
  // though Rustic intentionally relies on inline styles for layout
  const classNames = [
    'rottay-stack',
    'rottay-stack--rustic',
    className,
  ].filter(Boolean).join(' ');

  // Use createElement for polymorphic `as` prop support
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

ApolloStack.displayName = 'RusticStack';

export default ApolloStack;
