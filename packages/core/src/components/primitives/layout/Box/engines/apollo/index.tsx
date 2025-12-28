/**
 * @fileoverview Box Apollo Engine - Rottay Design System
 * @description Apollo (Pure HTML/CSS) implementation of the Box component.
 * Provides a dependency-free Box using inline styles for maximum compatibility.
 *
 * @remarks
 * The Apollo engine uses pure inline CSS styles without any external CSS framework
 * dependencies. This makes it ideal for:
 * - Server-side rendering without CSS extraction
 * - Embedding in third-party applications
 * - Maximum browser compatibility
 * - Accessibility-focused implementations
 *
 * All styles are computed and applied inline, ensuring consistent rendering
 * regardless of the host application's CSS setup.
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Box } from '@rottay/design-system';
 *
 * // Use Apollo for dependency-free styling
 * <Box engine="apollo" p="md" shadow="sm">
 *   Pure inline CSS, no framework dependencies
 * </Box>
 *
 * // Ideal for embedded widgets
 * <EngineProvider engine="apollo">
 *   <Box p="lg" bg="white" rounded="md">
 *     Self-contained styling
 *   </Box>
 * </EngineProvider>
 * ```
 *
 * @see {@link Box} - The main engine-aware component
 * @see {@link TitanBox} - Ant Design implementation
 * @see {@link HermesBox} - Tailwind implementation
 * @module Box/Engines/Apollo
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type ElementType, type Ref } from 'react';
import type { BoxProps } from '../../types';
import { BOX_DEFAULTS } from '../../types';
import { buildBoxStyles, filterBoxProps } from '../../base';

/**
 * Apollo Box component.
 * Uses pure HTML and inline CSS styles for maximum compatibility
 * and accessibility without external dependencies.
 */
const ApolloBox = forwardRef<HTMLElement, BoxProps>((props, ref) => {
  const {
    as: Component = BOX_DEFAULTS.as,
    className = '',
    children,
  } = props;

  const computedStyle = buildBoxStyles(props);
  const filteredProps = filterBoxProps(props);

  // Build class names with Apollo-specific prefixes
  const classNames = [
    'rottay-box',
    'rottay-box--apollo',
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
    children
  );
});

ApolloBox.displayName = 'ApolloBox';

export default ApolloBox;
