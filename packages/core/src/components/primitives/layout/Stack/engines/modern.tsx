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
import { STACK_DEFAULTS, SPACING_MAP } from '../Stack.types';
import { isResponsiveValue, generateResponsiveCSS } from '../../shared/responsive-props';
import {
  scalarOrDefault,
  collectStackResponsiveEntries,
  renderStackChildren,
  buildStackStyles,
} from '../../shared/responsive-helpers.js';

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

  // Spacing — resolved via inline style in buildStackInlineStyles below.
  // Gap is no longer a Tailwind class so DS tokens flow through.

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

  // Gap is always resolved via inline style using DS CSS custom properties.
  // This ensures tenant token overrides (--ds-spacing-*) flow through.
  const spacingValue = gap ?? spacing ?? STACK_DEFAULTS.spacing;
  const baseStyle = buildStackStyles(props);
  if (!isResponsiveValue(spacingValue)) {
    if (typeof spacingValue === 'string' && spacingValue in SPACING_MAP) {
      baseStyle.gap = SPACING_MAP[spacingValue as StackSpacingPreset];
    } else if (typeof spacingValue === 'number') {
      baseStyle.gap = spacingValue;
    }
  }
  const computedStyle = baseStyle;
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
    ...tailwindClasses,
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
