/**
 * @fileoverview Shared responsive helper functions for layout and input primitives
 * @description Contains generic utility functions used across multiple engine
 * implementations (classic, modern, rustic) to avoid code duplication.
 *
 * Functions in this module are pure, stateless utilities that resolve responsive
 * prop values into their scalar counterparts or CSS strings. They are consumed
 * by Box, Flex, Stack, Button, and Card engines.
 *
 * @module Layout/Shared/ResponsiveHelpers
 * @category Layout
 * @package @rottay/design-system
 */

import { isResponsiveValue, type ResponsivePropEntry } from './responsive-props';
import type { ResponsiveValue } from './types';

// ---------------------------------------------------------------------------
// Generic scalar extractors
// ---------------------------------------------------------------------------

/**
 * Extracts the scalar value from a prop that may be a ResponsiveValue.
 * Returns `undefined` if the prop is a responsive object (or nullish).
 *
 * Used by Box, Button, and Card engines to determine whether a prop should
 * be applied as an inline style (scalar) or deferred to generated CSS
 * (responsive object).
 */
export function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/**
 * Extracts the scalar value from a prop that may be a ResponsiveValue,
 * falling back to a provided default when the value is `undefined` or a
 * responsive object.
 *
 * Used by Flex and Stack engines where every prop needs a concrete default
 * for inline style / class generation even when the responsive variant will
 * override it via CSS media queries.
 */
export function scalarOrDefault<T>(value: ResponsiveValue<T> | undefined, def: T): T {
  if (value === undefined) return def;
  if (isResponsiveValue(value)) return def;
  return value as T;
}

// ---------------------------------------------------------------------------
// Box-specific helpers
// ---------------------------------------------------------------------------

import type { BoxProps, BoxSpacing } from '../Box/Box.types';
import { SPACING_MAP } from '../Box/Box.types';

/**
 * Resolves a BoxSpacing token to its CSS value string.
 * Returns '0' for 'none' or unknown tokens.
 */
export function resolveBoxSpacing(value: BoxSpacing): string {
  if (value === 'none') return '0';
  return SPACING_MAP[value] || '0';
}

/**
 * Collects all responsive prop entries from Box props into an array suitable
 * for `generateResponsiveCSS()`. Handles padding (p/px/py), margin (m/mx/my),
 * display, and dimension (width/minWidth/maxWidth) props.
 */
export function collectBoxResponsiveEntries(props: BoxProps): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];
  const spacingResolver = (v: BoxSpacing) => resolveBoxSpacing(v);
  const cssValueResolver = (v: any) => typeof v === 'number' ? `${v}px` : String(v);

  // Padding
  const pVal = props.padding ?? props.p;
  if (isResponsiveValue(pVal)) {
    entries.push({ cssProperty: 'padding', value: pVal, resolve: spacingResolver });
  }
  const pxVal = props.paddingX ?? props.px;
  if (isResponsiveValue(pxVal)) {
    entries.push({ cssProperty: 'padding-left', value: pxVal, resolve: spacingResolver });
    entries.push({ cssProperty: 'padding-right', value: pxVal, resolve: spacingResolver });
  }
  const pyVal = props.paddingY ?? props.py;
  if (isResponsiveValue(pyVal)) {
    entries.push({ cssProperty: 'padding-top', value: pyVal, resolve: spacingResolver });
    entries.push({ cssProperty: 'padding-bottom', value: pyVal, resolve: spacingResolver });
  }

  // Margin
  const mVal = props.margin ?? props.m;
  if (isResponsiveValue(mVal)) {
    entries.push({ cssProperty: 'margin', value: mVal, resolve: spacingResolver });
  }
  const mxVal = props.marginX ?? props.mx;
  if (isResponsiveValue(mxVal)) {
    entries.push({ cssProperty: 'margin-left', value: mxVal, resolve: spacingResolver });
    entries.push({ cssProperty: 'margin-right', value: mxVal, resolve: spacingResolver });
  }
  const myVal = props.marginY ?? props.my;
  if (isResponsiveValue(myVal)) {
    entries.push({ cssProperty: 'margin-top', value: myVal, resolve: spacingResolver });
    entries.push({ cssProperty: 'margin-bottom', value: myVal, resolve: spacingResolver });
  }

  // Display
  if (isResponsiveValue(props.display)) {
    entries.push({ cssProperty: 'display', value: props.display });
  }

  // Dimensions
  const wVal = props.width ?? props.w;
  if (isResponsiveValue(wVal)) {
    entries.push({ cssProperty: 'width', value: wVal, resolve: cssValueResolver });
  }
  const minWVal = props.minWidth ?? props.minW;
  if (isResponsiveValue(minWVal)) {
    entries.push({ cssProperty: 'min-width', value: minWVal, resolve: cssValueResolver });
  }
  const maxWVal = props.maxWidth ?? props.maxW;
  if (isResponsiveValue(maxWVal)) {
    entries.push({ cssProperty: 'max-width', value: maxWVal, resolve: cssValueResolver });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Flex-specific helpers
// ---------------------------------------------------------------------------

import type { FlexProps, FlexJustify, FlexAlign } from '../Flex/Flex.types';
import { FLEX_JUSTIFY_MAP, FLEX_ALIGN_MAP } from '../Flex/Flex.types';

/**
 * Resolves a gap value (number or [column, row] tuple) to a CSS gap string.
 */
export function resolveFlexGap(gap: number | [number, number]): string {
  if (Array.isArray(gap)) {
    return `${gap[0]}px ${gap[1]}px`;
  }
  return `${gap}px`;
}

/**
 * Collects responsive CSS entries from Flex props for direction, gap, wrap,
 * justify-content, and align-items.
 */
export function collectFlexResponsiveEntries(props: FlexProps): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];

  if (isResponsiveValue(props.direction)) {
    entries.push({ cssProperty: 'flex-direction', value: props.direction });
  }
  if (isResponsiveValue(props.gap)) {
    entries.push({
      cssProperty: 'gap',
      value: props.gap,
      resolve: resolveFlexGap,
    });
  }
  if (isResponsiveValue(props.wrap)) {
    entries.push({ cssProperty: 'flex-wrap', value: props.wrap });
  }
  if (isResponsiveValue(props.justify)) {
    entries.push({
      cssProperty: 'justify-content',
      value: props.justify,
      resolve: (v: FlexJustify) => FLEX_JUSTIFY_MAP[v],
    });
  }
  if (isResponsiveValue(props.align)) {
    entries.push({
      cssProperty: 'align-items',
      value: props.align,
      resolve: (v: FlexAlign) => FLEX_ALIGN_MAP[v],
    });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Stack-specific helpers
// ---------------------------------------------------------------------------

import React, { type ReactNode } from 'react';
import type { StackProps, StackDirection, StackSpacing, StackSpacingPreset, StackAlign, StackJustify } from '../Stack/Stack.types';
import { STACK_DEFAULTS, SPACING_MAP as STACK_SPACING_MAP, ALIGN_MAP, JUSTIFY_MAP } from '../Stack/Stack.types';

/**
 * Converts a Stack spacing value (preset string or number) to its CSS equivalent.
 */
export function resolveStackSpacing(value: StackSpacing | undefined): string {
  if (value === undefined || value === 'none') return '0';
  if (typeof value === 'number') return `${value}px`;
  return STACK_SPACING_MAP[value as StackSpacingPreset] || '0';
}

/**
 * Resolves a StackDirection to CSS flex-direction, accounting for the
 * `reverse` flag.
 */
export function resolveStackDirection(
  direction: StackDirection,
  reverse: boolean
): 'column' | 'column-reverse' | 'row' | 'row-reverse' {
  if (direction === 'vertical') {
    return reverse ? 'column-reverse' : 'column';
  }
  return reverse ? 'row-reverse' : 'row';
}

/**
 * Collects responsive CSS entries from Stack props for direction, gap,
 * align-items, justify-content, and flex-wrap.
 */
export function collectStackResponsiveEntries(props: StackProps): ResponsivePropEntry<any>[] {
  const entries: ResponsivePropEntry<any>[] = [];
  const reverse = props.reverse ?? STACK_DEFAULTS.reverse;

  if (isResponsiveValue(props.direction)) {
    entries.push({
      cssProperty: 'flex-direction',
      value: props.direction,
      resolve: (v: StackDirection) => resolveStackDirection(v, reverse),
    });
  }

  const spacingVal = props.gap ?? props.spacing;
  if (isResponsiveValue(spacingVal)) {
    entries.push({
      cssProperty: 'gap',
      value: spacingVal,
      resolve: resolveStackSpacing,
    });
  }

  if (isResponsiveValue(props.align)) {
    entries.push({
      cssProperty: 'align-items',
      value: props.align,
      resolve: (v: StackAlign) => ALIGN_MAP[v],
    });
  }

  if (isResponsiveValue(props.justify)) {
    entries.push({
      cssProperty: 'justify-content',
      value: props.justify,
      resolve: (v: StackJustify) => JUSTIFY_MAP[v],
    });
  }

  if (isResponsiveValue(props.wrap)) {
    entries.push({
      cssProperty: 'flex-wrap',
      value: props.wrap,
      resolve: (v: boolean) => v ? 'wrap' : 'nowrap',
    });
  }

  return entries;
}

/**
 * Interleaves divider elements between children when a divider is provided.
 * Returns children unchanged when no divider is set.
 */
export function renderStackChildren(
  children: ReactNode,
  divider: ReactNode | undefined,
  direction: StackDirection
): ReactNode {
  const childArray = React.Children.toArray(children).filter(Boolean);
  if (!divider || childArray.length <= 1) return childArray;

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
 * Assembles a complete inline flexbox CSSProperties object from Stack props.
 * Responsive props are excluded from inline styles (they are handled via
 * generated CSS media queries).
 */
export function buildStackStyles(props: StackProps): React.CSSProperties {
  const {
    direction,
    spacing,
    gap,
    align,
    justify,
    wrap,
    reverse = STACK_DEFAULTS.reverse,
    fullWidth = STACK_DEFAULTS.fullWidth,
    fullHeight = STACK_DEFAULTS.fullHeight,
    style,
  } = props;

  const sDirection = scalarOrDefault<StackDirection>(direction, 'vertical');
  const sAlign = scalarOrDefault<StackAlign>(align, 'stretch');
  const sJustify = scalarOrDefault<StackJustify>(justify, 'start');
  const sWrap = scalarOrDefault<boolean>(wrap, false);

  const rawSpacing = gap ?? spacing;
  const sSpacing: StackSpacing | undefined = (rawSpacing === undefined)
    ? 'md' as StackSpacing
    : isResponsiveValue(rawSpacing) ? undefined : rawSpacing as StackSpacing;

  const baseStyles: React.CSSProperties = {
    display: 'flex',
    ...(!isResponsiveValue(direction) && {
      flexDirection: resolveStackDirection(sDirection, reverse),
    }),
    ...(sSpacing !== undefined && {
      gap: resolveStackSpacing(sSpacing),
    }),
    ...(!isResponsiveValue(align) && {
      alignItems: ALIGN_MAP[sAlign],
    }),
    ...(!isResponsiveValue(justify) && {
      justifyContent: JUSTIFY_MAP[sJustify],
    }),
    ...(!isResponsiveValue(wrap) && {
      flexWrap: sWrap ? 'wrap' : 'nowrap',
    }),
    ...(fullWidth && { width: '100%' }),
    ...(fullHeight && { height: '100%' }),
    ...style,
  };

  return baseStyles;
}
