'use client';

/**
 * @fileoverview Popover Hermes Engine - Rottay Design System
 * @description Hermes (DaisyUI/Tailwind) implementation of the Popover component.
 * Uses Tailwind CSS utilities with DaisyUI styling conventions.
 *
 * @remarks
 * The Hermes engine provides:
 * - DaisyUI tooltip/card component base classes
 * - Tailwind utility classes for layout and styling
 * - Custom trigger handling for click, hover, and focus
 * - Click-outside dismissal via event listeners
 * - Delay support for hover triggers
 *
 * Implementation details:
 * - Uses controlled/uncontrolled pattern for open state
 * - Placement mapped to DaisyUI tooltip position classes
 * - Timeout refs for enter/leave delay management
 * - Arrow styling with rotated div element
 *
 * @example Using Hermes Engine
 * ```tsx
 * import { Popover, Button } from '@rottay/design-system';
 *
 * <Popover
 *   engine="modern"
 *   content="Tailwind styled content"
 *   title="Hermes Popover"
 *   trigger="hover"
 * >
 *   <Button>Hover me</Button>
 * </Popover>
 * ```
 *
 * @see {@link Popover} - The main engine-aware component
 * @module Popover/Engines/Hermes
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PopoverProps } from '../../types';
import { POPOVER_DEFAULTS } from '../../types';

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (props, ref) => {
    const {
      content,
      title,
      trigger = POPOVER_DEFAULTS.trigger,
      placement = POPOVER_DEFAULTS.placement,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      arrow = POPOVER_DEFAULTS.arrow,
      children,
      mouseEnterDelay = POPOVER_DEFAULTS.mouseEnterDelay,
      mouseLeaveDelay = POPOVER_DEFAULTS.mouseLeaveDelay,
      className,
      overlayClassName,
      overlayStyle,
    } = props;

    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);
    const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    useEffect(() => {
      return () => {
        if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      };
    }, []);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          handleOpenChange(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, handleOpenChange]);

    const triggerArray = Array.isArray(trigger) ? trigger : [trigger];

    const getPlacementClasses = () => {
      const classes: string[] = [];
      if (placement?.includes('top')) classes.push('tooltip-top');
      if (placement?.includes('bottom')) classes.push('tooltip-bottom');
      if (placement?.includes('left') || placement?.includes('Left')) classes.push('tooltip-left');
      if (placement?.includes('right') || placement?.includes('Right')) classes.push('tooltip-right');
      return classes.join(' ') || 'tooltip-top';
    };

    const handleClick = () => {
      if (triggerArray.includes('click')) {
        handleOpenChange(!isOpen);
      }
    };

    const handleMouseEnter = () => {
      if (triggerArray.includes('hover')) {
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        enterTimeoutRef.current = setTimeout(() => {
          handleOpenChange(true);
        }, mouseEnterDelay);
      }
    };

    const handleMouseLeave = () => {
      if (triggerArray.includes('hover')) {
        if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
        leaveTimeoutRef.current = setTimeout(() => {
          handleOpenChange(false);
        }, mouseLeaveDelay);
      }
    };

    const handleFocus = () => {
      if (triggerArray.includes('focus')) {
        handleOpenChange(true);
      }
    };

    const handleBlur = () => {
      if (triggerArray.includes('focus')) {
        handleOpenChange(false);
      }
    };

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`tooltip ${getPlacementClasses()} ${isOpen ? 'tooltip-open' : ''} ${className || ''}`}
        data-tip=""
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
        {isOpen && (
          <div
            className={`absolute z-50 bg-base-100 shadow-lg rounded-lg p-3 ${overlayClassName || ''}`}
            style={{
              minWidth: '150px',
              ...overlayStyle,
            }}
          >
            {title && (
              <div className="font-semibold mb-2 pb-2 border-b border-base-300">
                {title}
              </div>
            )}
            <div>{content}</div>
            {arrow && (
              <div className="absolute w-3 h-3 bg-base-100 rotate-45 -z-10" />
            )}
          </div>
        )}
      </div>
    );
  }
);

Popover.displayName = 'Popover.Hermes';

export default Popover;
