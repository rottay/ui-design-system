/**
 * @fileoverview Stack Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Stack component.
 * Provides utility-first Stack using Tailwind CSS flexbox classes.
 *
 * @remarks
 * The Modern engine leverages Tailwind CSS utility classes for flexbox layouts,
 * making it ideal for projects using the utility-first paradigm.
 *
 * Tailwind Class Mappings:
 * - Direction: `flex-col` / `flex-row` (with `-reverse` variants)
 * - Spacing: `gap-1` (xs) through `gap-16` (4xl)
 * - Alignment: `items-start`, `items-center`, `items-end`, etc.
 * - Justification: `justify-start`, `justify-between`, `justify-evenly`, etc.
 * - Sizing: `w-full`, `h-full` for fullWidth/fullHeight
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Use Modern engine for Tailwind classes
 * <Stack engine="modern" direction="horizontal" spacing="md" align="center">
 *   Outputs: class="flex flex-row gap-4 items-center"
 * </Stack>
 *
 * // Combine with global EngineProvider
 * <EngineProvider engine="modern">
 *   <Stack spacing="lg" justify="space-between">
 *     Tailwind flexbox classes applied
 *   </Stack>
 * </EngineProvider>
 * ```
 *
 * @see {@link Stack} - The main engine-aware component
 * @see {@link TitanStack} - Ant Design implementation
 * @see {@link ApolloStack} - Pure HTML/CSS implementation
 * @module Stack/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type CSSProperties, type ElementType, type ReactNode, type Ref } from 'react';
import type { StackProps, StackSpacingPreset, StackAlign, StackJustify, StackDirection, StackSpacing } from '../../Stack.types';
import { STACK_DEFAULTS, SPACING_MAP, ALIGN_MAP, JUSTIFY_MAP } from '../../Stack.types';

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
 * Maps spacing values to Tailwind gap classes
 */
const GAP_CLASS_MAP: Record<StackSpacingPreset, string> = {
  none: 'gap-0',
  xs: 'gap-1',    // 0.25rem
  sm: 'gap-2',    // 0.5rem
  md: 'gap-4',    // 1rem
  lg: 'gap-6',    // 1.5rem
  xl: 'gap-8',    // 2rem
  '2xl': 'gap-10', // 2.5rem
  '3xl': 'gap-12', // 3rem
  '4xl': 'gap-16', // 4rem
};

/**
 * Maps alignment values to Tailwind classes
 */
const ALIGN_CLASS_MAP: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

/**
 * Maps justify values to Tailwind classes
 */
const JUSTIFY_CLASS_MAP: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
};

/**
 * Build Tailwind classes from Stack props
 */
function buildTailwindClasses(props: StackProps): string[] {
  const classes: string[] = ['flex'];
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
  } = props;

  // Direction classes
  if (direction === 'vertical') {
    classes.push(reverse ? 'flex-col-reverse' : 'flex-col');
  } else {
    classes.push(reverse ? 'flex-row-reverse' : 'flex-row');
  }

  // Gap classes (only for preset values, not numeric)
  const spacingValue = gap ?? spacing ?? STACK_DEFAULTS.spacing;
  if (typeof spacingValue === 'string' && spacingValue in GAP_CLASS_MAP) {
    classes.push(GAP_CLASS_MAP[spacingValue as StackSpacingPreset]);
  }

  // Alignment classes
  classes.push(ALIGN_CLASS_MAP[align]);

  // Justify classes
  classes.push(JUSTIFY_CLASS_MAP[justify]);

  // Wrap classes
  classes.push(wrap ? 'flex-wrap' : 'flex-nowrap');

  // Size classes
  if (fullWidth) {
    classes.push('w-full');
  }
  if (fullHeight) {
    classes.push('h-full');
  }

  return classes;
}

/**
 * Modern Stack component.
 * Uses DaisyUI/Tailwind styling conventions while maintaining
 * compatibility with the Stack API.
 */
const HermesStack = forwardRef<HTMLElement, StackProps>((props, ref) => {
  const {
    as: Component = STACK_DEFAULTS.as,
    direction = STACK_DEFAULTS.direction,
    spacing,
    gap,
    divider,
    className = '',
    children,
  } = props;

  // For numeric spacing values, use inline styles
  const spacingValue = gap ?? spacing ?? STACK_DEFAULTS.spacing;
  const needsInlineGap = typeof spacingValue === 'number';

  // Use base styles for numeric gap, otherwise let Tailwind handle it
  const computedStyle = needsInlineGap ? buildStackStyles(props) : props.style;
  const tailwindClasses = buildTailwindClasses(props);
  const renderedChildren = renderStackChildren(children, divider, direction);

  // Build class names with Modern-specific prefixes and Tailwind classes
  const classNames = [
    'rottay-stack',
    'rottay-stack--modern',
    ...(needsInlineGap ? [] : tailwindClasses),
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

HermesStack.displayName = 'ModernStack';

export default HermesStack;
