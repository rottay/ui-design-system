/**
 * @fileoverview Stack Apollo Engine - Rottay Design System
 * @description Apollo (Pure HTML/CSS) implementation of the Stack component.
 * Provides a dependency-free Stack using inline flexbox styles.
 *
 * @remarks
 * The Apollo engine uses pure inline CSS styles without any external CSS framework
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
 * @example Using Apollo Engine
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Use Apollo for dependency-free styling
 * <Stack engine="apollo" direction="vertical" spacing="md">
 *   Pure inline CSS flexbox, no framework dependencies
 * </Stack>
 *
 * // Ideal for embedded widgets
 * <EngineProvider engine="apollo">
 *   <Stack spacing="lg" align="center">
 *     Self-contained flexbox styling
 *   </Stack>
 * </EngineProvider>
 * ```
 *
 * @see {@link Stack} - The main engine-aware component
 * @see {@link TitanStack} - Ant Design implementation
 * @see {@link HermesStack} - Tailwind implementation
 * @module Stack/Engines/Apollo
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
      ? React.cloneElement(divider as React.ReactElement<Record<string, unknown>>, {
          key: `divider-${index}`,
          'aria-hidden': true,
        })
      : <span key={`divider-${index}`} aria-hidden="true">{divider}</span>;

    return [...acc, dividerElement, child];
  }, []);
}

/**
 * Apollo Stack component.
 * Uses pure HTML and inline CSS styles for maximum compatibility
 * and accessibility without external dependencies.
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

  // Build class names with Apollo-specific prefixes
  const classNames = [
    'rottay-stack',
    'rottay-stack--apollo',
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

ApolloStack.displayName = 'ApolloStack';

export default ApolloStack;
