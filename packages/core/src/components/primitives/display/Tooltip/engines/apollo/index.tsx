/**
 * Tooltip - Apollo Engine Implementation
 * Uses vanilla HTML/CSS for maximum accessibility and customization.
 *
 * @module Tooltip/engines/apollo
 * @description Apollo engine implementation using vanilla HTML and CSS.
 * Provides a headless implementation with maximum accessibility and customization options.
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
