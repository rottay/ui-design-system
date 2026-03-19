/**
 * @fileoverview Stack Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Stack component.
 *
 * @module Stack/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId, type ElementType, type Ref } from 'react';
import type { StackProps, StackSpacingPreset, StackAlign, StackJustify, StackDirection } from '../Stack.types';
import { STACK_DEFAULTS } from '../Stack.types';
import { isResponsiveValue, generateResponsiveCSS } from '../../shared/responsive-props';
import {
  scalarOrDefault,
  collectStackResponsiveEntries,
  renderStackChildren,
  buildStackStyles,
} from '../../shared/responsive-helpers.js';

/** Maps spacing presets to Tailwind gap utility classes. */
const GAP_CLASS_MAP: Record<StackSpacingPreset, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-10',
  '3xl': 'gap-12',
  '4xl': 'gap-16',
};

const ALIGN_CLASS_MAP: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const JUSTIFY_CLASS_MAP: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
};

/**
 * Builds Tailwind utility classes. Only scalar (non-responsive) values are mapped.
 */
function buildTailwindClasses(props: StackProps): string[] {
  const classes: string[] = ['flex'];
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
  } = props;

  // Direction - only Tailwind class for scalar
  if (!isResponsiveValue(direction)) {
    const scalarDirection = scalarOrDefault<StackDirection>(direction, 'vertical');
    if (scalarDirection === 'vertical') {
      classes.push(reverse ? 'flex-col-reverse' : 'flex-col');
    } else {
      classes.push(reverse ? 'flex-row-reverse' : 'flex-row');
    }
  }

  // Spacing - only preset strings to Tailwind classes
  const spacingValue = gap ?? spacing ?? STACK_DEFAULTS.spacing;
  if (!isResponsiveValue(spacingValue)) {
    if (typeof spacingValue === 'string' && spacingValue in GAP_CLASS_MAP) {
      classes.push(GAP_CLASS_MAP[spacingValue as StackSpacingPreset]);
    }
  }

  if (!isResponsiveValue(align)) {
    const scalarAlign = scalarOrDefault<StackAlign>(align, 'stretch');
    classes.push(ALIGN_CLASS_MAP[scalarAlign]);
  }

  if (!isResponsiveValue(justify)) {
    const scalarJustify = scalarOrDefault<StackJustify>(justify, 'start');
    classes.push(JUSTIFY_CLASS_MAP[scalarJustify]);
  }

  if (!isResponsiveValue(wrap)) {
    const scalarWrap = scalarOrDefault<boolean>(wrap, false);
    classes.push(scalarWrap ? 'flex-wrap' : 'flex-nowrap');
  }

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
 */
const HermesStack = forwardRef<HTMLElement, StackProps>((props, ref) => {
  const {
    as: Component = STACK_DEFAULTS.as,
    direction,
    spacing,
    gap,
    divider,
    className = '',
    children,
  } = props;

  const scalarDirection = scalarOrDefault<StackDirection>(direction, 'vertical');

  // Determine whether inline styles or Tailwind classes should drive the gap
  const spacingValue = gap ?? spacing ?? STACK_DEFAULTS.spacing;
  const needsInlineGap = !isResponsiveValue(spacingValue) && typeof spacingValue === 'number';

  const computedStyle = needsInlineGap ? buildStackStyles(props) : props.style;
  const tailwindClasses = buildTailwindClasses(props);
  const renderedChildren = renderStackChildren(children, divider, scalarDirection);

  // Responsive CSS generation
  const reactId = useId();
  const responsiveEntries = collectStackResponsiveEntries(props);
  const needsResponsiveCSS = responsiveEntries.length > 0;

  const elementId = needsResponsiveCSS ? `stack-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const classNames = [
    'rottay-stack',
    'rottay-stack--modern',
    ...(needsInlineGap ? [] : tailwindClasses),
    className,
  ].filter(Boolean).join(' ');

  const ElementType = Component as ElementType;

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      {React.createElement(
        ElementType,
        {
          ref: ref as Ref<HTMLElement>,
          className: classNames,
          style: computedStyle,
          ...(responsive ? responsive.attrs : {}),
        },
        renderedChildren
      )}
    </>
  );
});

HermesStack.displayName = 'ModernStack';

export default HermesStack;
