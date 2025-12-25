'use client';

import React, { forwardRef } from 'react';
import type { TooltipTriggerProps } from '../../types';

/**
 * Tooltip.Trigger component for manual trigger control.
 *
 * Wraps the element that triggers the tooltip.
 */
export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ children, asChild = false, className, style, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(children, {
        ref,
        className: `${children.props.className || ''} ${className || ''}`.trim(),
        style: { ...children.props.style, ...style },
        ...props,
      });
    }

    return (
      <span
        ref={ref as any}
        className={`rottay-tooltip-trigger ${className || ''}`}
        style={style}
        {...props}
      >
        {children}
      </span>
    );
  }
);

TooltipTrigger.displayName = 'TooltipTrigger';
