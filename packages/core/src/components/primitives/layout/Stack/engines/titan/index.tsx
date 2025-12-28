/**
 * @fileoverview Stack Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Stack component.
 * Provides full-featured Stack using Ant Design styling conventions.
 *
 * @remarks
 * The Titan engine implementation uses Ant Design's design system principles
 * while maintaining full compatibility with the Stack API. It applies the
 * `rottay-stack--titan` class for engine-specific styling hooks.
 *
 * CSS Classes Applied:
 * - `rottay-stack`: Base class for all Stack components
 * - `rottay-stack--titan`: Engine-specific class for Titan styling
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Automatically uses Titan if default engine
 * <Stack spacing="md" direction="vertical">
 *   <Item>First</Item>
 *   <Item>Second</Item>
 * </Stack>
 *
 * // Or explicitly specify engine
 * <Stack engine="titan" spacing="lg" align="center">
 *   Ant Design styled stack
 * </Stack>
 * ```
 *
 * @see {@link Stack} - The main engine-aware component
 * @see {@link HermesStack} - Tailwind implementation
 * @see {@link ApolloStack} - Pure HTML/CSS implementation
 * @module Stack/Engines/Titan
 * @category Layout
 * @package @rottay/design-system
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
