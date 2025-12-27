/**
 * Stack - Titan Engine (Ant Design)
 * Provides Stack component using Ant Design styling conventions
 */

'use client';

import React, { forwardRef, type ElementType, type Ref } from 'react';
import type { StackProps } from '../../types';
import { STACK_DEFAULTS } from '../../types';
import { buildStackStyles, filterStackProps, renderStackChildren } from '../../base';

/**
 * Titan Stack component.
 * Uses Ant Design's styling conventions while maintaining
 * compatibility with the Stack API.
 */
const TitanStack = forwardRef<HTMLElement, StackProps>((props, ref) => {
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

  // Build class names with Titan-specific prefixes
  const classNames = [
    'rottay-stack',
    'rottay-stack--titan',
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

TitanStack.displayName = 'TitanStack';

export default TitanStack;
