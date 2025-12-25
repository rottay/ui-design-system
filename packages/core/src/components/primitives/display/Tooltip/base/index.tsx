'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import type { TooltipProps } from '../types';

/**
 * Base Tooltip component with positioning.
 *
 * Features:
 * - Multiple placements
 * - Multiple trigger types
 * - Controlled and uncontrolled
 * - Open/close delays
 * - Arrow support
 */
export const BaseTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      placement = 'top',
      trigger = 'hover',
      arrow = true,
      openDelay = 200,
      closeDelay = 0,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      maxWidth = 300,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const triggerRef = useRef<HTMLElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const openTimerRef = useRef<NodeJS.Timeout>();
    const closeTimerRef = useRef<NodeJS.Timeout>();

    const triggers = Array.isArray(trigger) ? trigger : [trigger];

    const setOpen = (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    };

    const handleOpen = () => {
      if (disabled) return;

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }

      if (openDelay > 0) {
        openTimerRef.current = setTimeout(() => setOpen(true), openDelay);
      } else {
        setOpen(true);
      }
    };

    const handleClose = () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }

      if (closeDelay > 0) {
        closeTimerRef.current = setTimeout(() => setOpen(false), closeDelay);
      } else {
        setOpen(false);
      }
    };

    const handleToggle = () => {
      if (disabled) return;
      setOpen(!isOpen);
    };

    useEffect(() => {
      return () => {
        if (openTimerRef.current) clearTimeout(openTimerRef.current);
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      };
    }, []);

    const placementStyles: Record<string, React.CSSProperties> = {
      top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)' },
      'top-start': { bottom: '100%', left: '0' },
      'top-end': { bottom: '100%', right: '0' },
      bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)' },
      'bottom-start': { top: '100%', left: '0' },
      'bottom-end': { top: '100%', right: '0' },
      left: { right: '100%', top: '50%', transform: 'translateY(-50%)' },
      'left-start': { right: '100%', top: '0' },
      'left-end': { right: '100%', bottom: '0' },
      right: { left: '100%', top: '50%', transform: 'translateY(-50%)' },
      'right-start': { left: '100%', top: '0' },
      'right-end': { left: '100%', bottom: '0' },
    };

    const tooltipStyles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      padding: '0.5rem 0.75rem',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      fontSize: '0.875rem',
      borderRadius: '0.375rem',
      maxWidth,
      pointerEvents: 'none',
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? 'visible' : 'hidden',
      transition: 'opacity 0.2s ease, visibility 0.2s ease',
      marginTop: placement.startsWith('top') ? '-0.5rem' : undefined,
      marginBottom: placement.startsWith('bottom') ? '-0.5rem' : undefined,
      marginLeft: placement.startsWith('left') ? '-0.5rem' : undefined,
      marginRight: placement.startsWith('right') ? '-0.5rem' : undefined,
      ...placementStyles[placement],
      ...style,
    };

    const triggerProps: Record<string, any> = {};

    if (triggers.includes('hover')) {
      triggerProps.onMouseEnter = handleOpen;
      triggerProps.onMouseLeave = handleClose;
    }

    if (triggers.includes('click')) {
      triggerProps.onClick = handleToggle;
    }

    if (triggers.includes('focus')) {
      triggerProps.onFocus = handleOpen;
      triggerProps.onBlur = handleClose;
    }

    const childrenWithProps = React.cloneElement(children, {
      ref: triggerRef,
      ...triggerProps,
    });

    return (
      <div
        ref={ref}
        className={`rottay-tooltip-wrapper ${className || ''}`}
        style={{ position: 'relative', display: 'inline-block' }}
        {...props}
      >
        {childrenWithProps}
        <div
          ref={tooltipRef}
          className="rottay-tooltip"
          style={tooltipStyles}
          role="tooltip"
        >
          {content}
        </div>
      </div>
    );
  }
);

BaseTooltip.displayName = 'BaseTooltip';
