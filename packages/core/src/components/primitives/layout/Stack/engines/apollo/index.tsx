/**
 * @fileoverview Stack Apollo Engine - Rottay Design System
 * @description Apollo (Pure HTML/CSS) implementation of the Stack component.
 * Provides a dependency-free Stack using inline flexbox styles.
 *
 * @remarks
 * The Apollo engine uses pure inline CSS styles without any external CSS framework
 * dependencies. All flexbox properties are computed and applied inline:
 * - `display: flex`
 * - `flexDirection`: column/row (with -reverse variants)
 * - `gap`: Resolved spacing value
 * - `alignItems`, `justifyContent`: Alignment values
 *
 * This makes it ideal for:
 * - Server-side rendering without CSS extraction
 * - Embedding in third-party applications
 * - Maximum browser compatibility
 * - Accessibility-focused implementations
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Use Apollo for dependency-free styling
 * <Stack engine="apollo" direction="vertical" spacing="md">
 *   Pure inline CSS flexbox, no framework dependencies
 * </Stack>
 *
 * // Ideal for embedded widgets
 * <EngineProvider engine="apollo">
 *   <Stack spacing="lg" align="center">
 *     Self-contained flexbox styling
 *   </Stack>
 * </EngineProvider>
 * ```
 *
 * @see {@link Stack} - The main engine-aware component
 * @see {@link TitanStack} - Ant Design implementation
 * @see {@link HermesStack} - Tailwind implementation
 * @module Stack/Engines/Apollo
 * @category Layout
 * @package @rottay/design-system
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
