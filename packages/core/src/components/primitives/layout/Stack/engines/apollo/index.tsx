/**
 * Stack - Apollo Engine (Pure HTML/CSS)
 * Provides Stack component using vanilla HTML and CSS
 */

'use client';

import React, { forwardRef, type ElementType, type Ref } from 'react';
import type { StackProps } from '../../types';
import { STACK_DEFAULTS } from '../../types';
import { buildStackStyles, filterStackProps, renderStackChildren } from '../../base';

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
  const filteredProps = filterStackProps(props);
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
      ...filteredProps,
    },
    renderedChildren
  );
});

ApolloStack.displayName = 'ApolloStack';

export default ApolloStack;
