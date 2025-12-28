/**
 * @fileoverview Tooltip Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS tooltip implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free tooltip using only
 * CSS variables and semantic HTML elements.
 *
 * **Implementation Details:**
 * - Extends BaseTooltip for all functionality
 * - Uses CSS variables for all visual properties
 * - Adds Apollo-specific class for styling hooks
 * - Full keyboard and screen reader support
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full CSS variable customization
 * - Maximum accessibility compliance
 *
 * **CSS Custom Properties:**
 * - `--tooltip-bg` - Background color
 * - `--tooltip-color` - Text color
 * - `--tooltip-radius` - Border radius
 * - `--tooltip-padding` - Content padding
 * - `--tooltip-shadow` - Box shadow
 * - `--tooltip-arrow-size` - Arrow dimensions
 *
 * @example Basic Usage
 * ```tsx
 * import { Tooltip } from '@rottay/design-system';
 *
 * <Tooltip engine="apollo" content="Lightweight tooltip" placement="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 *
 * @see {@link Tooltip} for the main component
 * @see {@link BaseTooltip} for CSS variable implementation
 * @module Tooltip/engines/apollo
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import { BaseTooltip } from '../../base';
import type { TooltipProps } from '../../types';

/**
 * Apollo (Vanilla HTML/CSS) implementation of the Tooltip component.
 *
 * Features:
 * - Zero external dependencies
 * - Maximum accessibility compliance
 * - Full CSS variable customization
 * - Semantic HTML structure
 * - ARIA attributes for screen readers
 *
 * @example
 * ```tsx
 * <ApolloTooltip content="Helpful tip" placement="top">
 *   <Button>Hover me</Button>
 * </ApolloTooltip>
 * ```
 */
const ApolloTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (props, ref) => {
    const { className = '', ...restProps } = props;

    // Add Apollo-specific class for styling hooks
    const apolloClasses = [
      'rottay-tooltip--apollo',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <BaseTooltip
        ref={ref}
        className={apolloClasses}
        {...restProps}
      />
    );
  }
);

ApolloTooltip.displayName = 'ApolloTooltip';

export default ApolloTooltip;
