/**
 * @fileoverview Tooltip.Trigger Compound - Rottay Design System
 * @description Wrapper for tooltip trigger elements with event handling.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The TooltipTrigger component wraps or clones the element that triggers
 * tooltip display. Supports two rendering modes for flexibility.
 *
 * **Rendering Modes:**
 * - **Default**: Wraps child in a `<span>` element
 * - **asChild**: Clones props directly onto the child element
 *
 * **Use Cases:**
 * - Wrap buttons, icons, or interactive elements
 * - Preserve original element type with `asChild`
 * - Attach tooltip trigger events to custom components
 *
 * @example Default Wrapper
 * ```tsx
 * <Tooltip.Trigger>
 *   <Button>Hover me</Button>
 * </Tooltip.Trigger>
 * ```
 *
 * @example Clone to Child
 * ```tsx
 * <Tooltip.Trigger asChild>
 *   <IconButton aria-label="Help">?</IconButton>
 * </Tooltip.Trigger>
 * ```
 *
 * @see {@link Tooltip} for the main component
 * @see {@link TooltipContent} for content component
 * @module Tooltip/compound/Trigger
 * @category Display
 * @package @rottay/design-system
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
