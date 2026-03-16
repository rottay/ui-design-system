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
import type { StackProps, StackSpacingPreset, StackAlign, StackJustify, StackDirection, StackSpacing } from '../Stack.types';
import { STACK_DEFAULTS, SPACING_MAP, ALIGN_MAP, JUSTIFY_MAP } from '../Stack.types';

/**
 * Converts a spacing value to its CSS equivalent.
 * Used as a fallback when numeric spacing forces inline styles instead of
 * Tailwind gap classes.
 *
 * @param value - A preset name, pixel number, or undefined
 * @returns A CSS-compatible string value
 */
function resolveSpacing(value: StackSpacing | undefined): string {
  if (value === undefined || value === 'none') return '0';
  if (typeof value === 'number') return `${value}px`;
  return SPACING_MAP[value as StackSpacingPreset] || '0';
}

/**
 * Assembles a complete inline flexbox CSSProperties object from Stack props.
 * Only used when the spacing value is numeric, since Tailwind gap-* classes
 * cannot represent arbitrary pixel values. For preset spacing, Tailwind
 * classes are preferred (see buildTailwindClasses).
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
 * Clones React elements with stable keys; wraps primitives in a span with
 * aria-hidden to keep dividers out of the accessibility tree.
 *
 * @param children - The child nodes to separate
 * @param divider - The separator element to insert between children
 * @param direction - Stack direction (reserved for orientation-aware dividers)
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
 * Maps spacing presets to Tailwind gap utility classes.
 * Only preset string values are mapped; numeric values fall back to inline styles.
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

/** Maps StackAlign values to their Tailwind items-* class equivalents. */
const ALIGN_CLASS_MAP: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

/** Maps StackJustify values to their Tailwind justify-* class equivalents. */
const JUSTIFY_CLASS_MAP: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
};

/**
 * Builds an array of Tailwind utility classes representing the Stack layout.
 * Numeric spacing values are excluded because Tailwind's gap-* utilities only
 * accept predefined scale values -- numeric gaps are handled via inline styles
 * in `buildStackStyles` instead.
 *
 * @param props - The full StackProps to derive Tailwind classes from
 * @returns An array of Tailwind class name strings
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

  // Direction with optional reverse suffix
  if (direction === 'vertical') {
    classes.push(reverse ? 'flex-col-reverse' : 'flex-col');
  } else {
    classes.push(reverse ? 'flex-row-reverse' : 'flex-row');
  }

  // Only map preset spacing to Tailwind classes; numeric values are skipped
  // and will be handled via inline styles in the component render
  const spacingValue = gap ?? spacing ?? STACK_DEFAULTS.spacing;
  if (typeof spacingValue === 'string' && spacingValue in GAP_CLASS_MAP) {
    classes.push(GAP_CLASS_MAP[spacingValue as StackSpacingPreset]);
  }

  classes.push(ALIGN_CLASS_MAP[align]);
  classes.push(JUSTIFY_CLASS_MAP[justify]);
  classes.push(wrap ? 'flex-wrap' : 'flex-nowrap');

  if (fullWidth) {
    classes.push('w-full');
  }
  if (fullHeight) {
    classes.push('h-full');
  }

  return classes;
}

/**
 * Modern (Hermes) engine implementation of the Stack component.
 * Uses Tailwind utility classes for preset spacing values and falls back to
 * inline flexbox styles for numeric pixel values. This dual strategy avoids
 * generating arbitrary Tailwind classes at runtime while still supporting
 * custom gap sizes.
 *
 * When `needsInlineGap` is true (numeric spacing), all layout properties are
 * expressed via inline styles and Tailwind classes are omitted to prevent
 * conflicts between class-based and inline gap declarations.
 *
 * @param props - Stack configuration (direction, spacing, align, justify, divider, etc.)
 * @returns A polymorphic element with Tailwind classes or inline flexbox styles
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

  // Determine whether inline styles or Tailwind classes should drive the gap.
  // Numeric values require inline styles; presets use Tailwind gap-* classes.
  const spacingValue = gap ?? spacing ?? STACK_DEFAULTS.spacing;
  const needsInlineGap = typeof spacingValue === 'number';

  // When numeric gap is needed, buildStackStyles provides ALL layout properties
  // inline, making the Tailwind classes redundant (and potentially conflicting).
  const computedStyle = needsInlineGap ? buildStackStyles(props) : props.style;
  const tailwindClasses = buildTailwindClasses(props);
  const renderedChildren = renderStackChildren(children, divider, direction);

  // Exclude Tailwind layout classes when inline styles are in control to avoid
  // specificity conflicts between Tailwind's gap-* and the inline gap property.
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
