/**
 * @fileoverview Box Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Box component.
 * Provides full-featured Box using Ant Design styling conventions.
 *
 * @remarks
 * The Titan engine implementation uses Ant Design's design system principles
 * while maintaining full compatibility with the Box API. It applies the
 * `rottay-box--titan` class for engine-specific styling hooks.
 *
 * CSS Custom Properties:
 * - `--box-padding`: Resolved from spacing tokens
 * - `--box-margin`: Resolved from spacing tokens
 * - `--box-shadow`: Resolved from shadow tokens
 * - `--box-radius`: Resolved from border-radius tokens
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Box } from '@rottay/design-system';
 *
 * // Automatically uses Titan if default engine
 * <Box p="md" shadow="sm">Titan-styled Box</Box>
 *
 * // Or explicitly specify engine
 * <Box engine="titan" p="lg" rounded="md">
 *   Ant Design styled container
 * </Box>
 * ```
 *
 * @see {@link Box} - The main engine-aware component
 * @see {@link HermesBox} - Tailwind implementation
 * @see {@link ApolloBox} - Pure HTML/CSS implementation
 * @module Box/Engines/Titan
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type ElementType, type Ref } from 'react';
import type { BoxProps } from '../../types';
import { BOX_DEFAULTS } from '../../types';
import { buildBoxStyles, filterBoxProps } from '../../base';

/**
 * Titan Box component.
 * Uses Ant Design's styling conventions while maintaining
 * compatibility with the Box API.
 */
const TitanBox = forwardRef<HTMLElement, BoxProps>((props, ref) => {
  const {
    as: Component = BOX_DEFAULTS.as,
    className = '',
    children,
  } = props;

  const computedStyle = buildBoxStyles(props);
  const filteredProps = filterBoxProps(props);

  // Build class names with Titan-specific prefixes
  const classNames = [
    'rottay-box',
    'rottay-box--titan',
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

TitanBox.displayName = 'TitanBox';

export default TitanBox;
