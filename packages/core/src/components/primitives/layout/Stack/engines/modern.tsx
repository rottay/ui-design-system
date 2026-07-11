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
import type { StackProps, StackSpacingPreset, StackDirection } from '../Stack.types';
import { STACK_DEFAULTS, SPACING_MAP } from '../Stack.types';
import { isResponsiveValue, generateResponsiveCSS } from '../../shared/responsive-props';
import {
  scalarOrDefault,
  collectStackResponsiveEntries,
  renderStackChildren,
  buildStackStyles,
} from '../../shared/responsive-helpers.js';

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
    align: _align,
    justify: _justify,
    wrap: _wrap,
    reverse: _reverse,
    fullWidth: _fullWidth,
    fullHeight: _fullHeight,
    style: _style,
    engine: _engine,
    // StackProps extends HTMLAttributes: the remaining keys are real DOM
    // attributes (data-*, aria-*, id, handlers) and must reach the element.
    ...htmlAttributes
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
          ...htmlAttributes,
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
