/**
 * @fileoverview Stack Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Stack component.
 *
 * @module Stack/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId, type ElementType, type Ref } from 'react';
import type { StackProps, StackDirection } from '../Stack.types';
import { STACK_DEFAULTS } from '../Stack.types';
import { generateResponsiveCSS } from '../../shared/responsive-props';
import {
  scalarOrDefault,
  collectStackResponsiveEntries,
  renderStackChildren,
  buildStackStyles,
} from '../../shared/responsive-helpers.js';

/**
 * Rustic (Apollo) engine implementation of the Stack component.
 */
const ApolloStack = forwardRef<HTMLElement, StackProps>((props, ref) => {
  const {
    as: Component = STACK_DEFAULTS.as,
    direction,
    divider,
    className = '',
    children,
    spacing: _spacing,
    gap: _gap,
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
  const computedStyle = buildStackStyles(props);
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
    'rottay-stack--rustic',
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

ApolloStack.displayName = 'RusticStack';

export default ApolloStack;
