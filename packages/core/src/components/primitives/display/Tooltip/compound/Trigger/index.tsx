/**
 * Tooltip.Trigger - Trigger Compound Component
 * Wraps the element that triggers the tooltip display.
 *
 * @module Tooltip/compound/Trigger
 * @description The trigger component for the Tooltip compound pattern.
 * This component wraps or clones the child element to attach tooltip trigger behavior.
 */

'use client';

import React, { forwardRef } from 'react';
import type { TooltipTriggerProps } from '../../types';

/**
 * Tooltip trigger component for manual trigger control.
 *
 * Wraps the element that triggers the tooltip display.
 * When `asChild` is true, clones the child element with trigger props
 * instead of wrapping it in a span.
 *
 * @example
 * ```tsx
 * // Wrapped in span (default)
 * <Tooltip.Trigger>
 *   <Button>Hover me</Button>
 * </Tooltip.Trigger>
 *
 * // Cloned to child (asChild)
 * <Tooltip.Trigger asChild>
 *   <Button>Hover me</Button>
 * </Tooltip.Trigger>
 * ```
 */
export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  (props, ref) => {
    const {
      children,
      asChild = false,
      className = '',
      style,
      ...restProps
    } = props;

    // When asChild is true, clone the child element with additional props
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref,
        className: `${(children.props as any).className || ''} ${className}`.trim() || undefined,
        style: { ...(children.props as any).style, ...style },
        ...restProps,
      });
    }

    // Default: wrap in a span element
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={`rottay-tooltip-trigger ${className}`.trim()}
        style={style}
        {...restProps}
      >
        {children}
      </span>
    );
  }
);

TooltipTrigger.displayName = 'TooltipTrigger';
