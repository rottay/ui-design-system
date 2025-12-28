/**
 * Popover - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import type { PopoverProps, PopoverPlacement } from '../types';
import { POPOVER_DEFAULTS } from '../types';

/**
 * Calculate position for popover
 */
function calculatePosition(
  triggerRect: DOMRect,
  popoverRect: DOMRect,
  placement: PopoverPlacement
): { top: number; left: number; arrowPosition: { top?: number; left?: number; bottom?: number; right?: number } } {
  const gap = 8;
  let top = 0;
  let left = 0;
  let arrowPosition: { top?: number; left?: number; bottom?: number; right?: number } = {};

  switch (placement) {
    case 'top':
      top = triggerRect.top - popoverRect.height - gap;
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      arrowPosition = { bottom: -4, left: popoverRect.width / 2 - 4 };
      break;
    case 'topLeft':
      top = triggerRect.top - popoverRect.height - gap;
      left = triggerRect.left;
      arrowPosition = { bottom: -4, left: 16 };
      break;
    case 'topRight':
      top = triggerRect.top - popoverRect.height - gap;
      left = triggerRect.right - popoverRect.width;
      arrowPosition = { bottom: -4, right: 16 };
      break;
    case 'bottom':
      top = triggerRect.bottom + gap;
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      arrowPosition = { top: -4, left: popoverRect.width / 2 - 4 };
      break;
    case 'bottomLeft':
      top = triggerRect.bottom + gap;
      left = triggerRect.left;
      arrowPosition = { top: -4, left: 16 };
      break;
    case 'bottomRight':
      top = triggerRect.bottom + gap;
      left = triggerRect.right - popoverRect.width;
      arrowPosition = { top: -4, right: 16 };
      break;
    case 'left':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      left = triggerRect.left - popoverRect.width - gap;
      arrowPosition = { right: -4, top: popoverRect.height / 2 - 4 };
      break;
    case 'leftTop':
      top = triggerRect.top;
      left = triggerRect.left - popoverRect.width - gap;
      arrowPosition = { right: -4, top: 16 };
      break;
    case 'leftBottom':
      top = triggerRect.bottom - popoverRect.height;
      left = triggerRect.left - popoverRect.width - gap;
      arrowPosition = { right: -4, bottom: 16 };
      break;
    case 'right':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      left = triggerRect.right + gap;
      arrowPosition = { left: -4, top: popoverRect.height / 2 - 4 };
      break;
    case 'rightTop':
      top = triggerRect.top;
      left = triggerRect.right + gap;
      arrowPosition = { left: -4, top: 16 };
      break;
    case 'rightBottom':
      top = triggerRect.bottom - popoverRect.height;
      left = triggerRect.right + gap;
      arrowPosition = { left: -4, bottom: 16 };
      break;
  }

  return {
    top: top + window.scrollY,
    left: left + window.scrollX,
    arrowPosition,
  };
}

/**
 * Base Popover component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BasePopover = forwardRef<HTMLDivElement, PopoverProps>(
  (props, ref) => {
    const {
      content,
      title,
      trigger = POPOVER_DEFAULTS.trigger!,
      placement = POPOVER_DEFAULTS.placement!,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      arrow = POPOVER_DEFAULTS.arrow,
      children,
      mouseEnterDelay = POPOVER_DEFAULTS.mouseEnterDelay!,
      mouseLeaveDelay = POPOVER_DEFAULTS.mouseLeaveDelay!,
      destroyTooltipOnHide = POPOVER_DEFAULTS.destroyTooltipOnHide,
      className = '',
      style = {},
      overlayClassName = '',
      overlayStyle = {},
      zIndex = POPOVER_DEFAULTS.zIndex!,
    } = props;

    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [position, setPosition] = useState({
      top: 0,
      left: 0,
      arrowPosition: {} as { top?: number; left?: number; bottom?: number; right?: number },
    });
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const triggers = Array.isArray(trigger) ? trigger : [trigger];

    const updateOpen = useCallback(
      (newOpen: boolean) => {
        if (controlledOpen === undefined) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [controlledOpen, onOpenChange]
    );

    // Update position when open
    useEffect(() => {
      if (isOpen && triggerRef.current && popoverRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const pos = calculatePosition(triggerRect, popoverRect, placement);
        setPosition(pos);
      }
    }, [isOpen, placement]);

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node) &&
          popoverRef.current &&
          !popoverRef.current.contains(e.target as Node)
        ) {
          updateOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, updateOpen]);

    // Clear timeouts on unmount
    useEffect(() => {
      return () => {
        if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      };
    }, []);

    // Handle trigger events
    const handleClick = () => {
      if (triggers.includes('click')) {
        updateOpen(!isOpen);
      }
    };

    const handleMouseEnter = () => {
      if (triggers.includes('hover')) {
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        enterTimeoutRef.current = setTimeout(() => updateOpen(true), mouseEnterDelay);
      }
    };

    const handleMouseLeave = () => {
      if (triggers.includes('hover')) {
        if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
        leaveTimeoutRef.current = setTimeout(() => updateOpen(false), mouseLeaveDelay);
      }
    };

    const handleFocus = () => {
      if (triggers.includes('focus')) {
        updateOpen(true);
      }
    };

    const handleBlur = () => {
      if (triggers.includes('focus')) {
        updateOpen(false);
      }
    };

    // CSS variables for popover
    const popoverVars = useMemo<React.CSSProperties>(
      () =>
        ({
          '--ds-popover-bg': 'var(--ds-color-bg-elevated, #fff)',
          '--ds-popover-border-radius': 'var(--ds-radius-lg, 8px)',
          '--ds-popover-shadow': 'var(--ds-shadow-lg)',
          '--ds-popover-padding': 'var(--ds-spacing-3, 12px)',
          '--ds-popover-min-width': '180px',
          '--ds-popover-max-width': '350px',
          '--ds-popover-title-font-size': '0.875rem',
          '--ds-popover-title-font-weight': '600',
          '--ds-popover-title-color': 'var(--ds-color-text-primary)',
          '--ds-popover-title-margin-bottom': 'var(--ds-spacing-2, 8px)',
          '--ds-popover-content-font-size': '0.875rem',
          '--ds-popover-content-color': 'var(--ds-color-text-secondary)',
          '--ds-popover-arrow-size': '8px',
        }) as React.CSSProperties,
      []
    );

    // Render popover
    const renderPopover = () => {
      if (!isOpen && destroyTooltipOnHide) return null;

      const popoverElement = (
        <div
          ref={popoverRef}
          className={`rottay-popover ${overlayClassName}`}
          style={{
            ...popoverVars,
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex,
            minWidth: 'var(--ds-popover-min-width)',
            maxWidth: 'var(--ds-popover-max-width)',
            padding: 'var(--ds-popover-padding)',
            backgroundColor: 'var(--ds-popover-bg)',
            borderRadius: 'var(--ds-popover-border-radius)',
            boxShadow: 'var(--ds-popover-shadow)',
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transition: 'opacity 0.2s, visibility 0.2s',
            ...overlayStyle,
          }}
          role="tooltip"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {arrow && (
            <div
              className="rottay-popover__arrow"
              style={{
                position: 'absolute',
                width: 'var(--ds-popover-arrow-size)',
                height: 'var(--ds-popover-arrow-size)',
                backgroundColor: 'var(--ds-popover-bg)',
                transform: 'rotate(45deg)',
                ...position.arrowPosition,
              }}
            />
          )}
          {title && (
            <div
              className="rottay-popover__title"
              style={{
                fontSize: 'var(--ds-popover-title-font-size)',
                fontWeight: 'var(--ds-popover-title-font-weight)' as any,
                color: 'var(--ds-popover-title-color)',
                marginBottom: 'var(--ds-popover-title-margin-bottom)',
              }}
            >
              {title}
            </div>
          )}
          <div
            className="rottay-popover__content"
            style={{
              fontSize: 'var(--ds-popover-content-font-size)',
              color: 'var(--ds-popover-content-color)',
            }}
          >
            {content}
          </div>
        </div>
      );

      if (typeof document !== 'undefined') {
        return createPortal(popoverElement, document.body);
      }
      return null;
    };

    return (
      <div
        ref={ref}
        className={`rottay-popover-wrapper ${className}`}
        style={{ display: 'inline-block', ...style }}
      >
        <div
          ref={triggerRef}
          className="rottay-popover__trigger"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {children}
        </div>
        {renderPopover()}
      </div>
    );
  }
);

BasePopover.displayName = 'BasePopover';
