'use client';

/**
 * @fileoverview Popover Apollo Engine - Rottay Design System
 * @description Apollo (Pure HTML/CSS) implementation of the Popover component.
 * Uses inline CSS styles with portal rendering for proper z-index stacking.
 *
 * @remarks
 * The Apollo engine provides:
 * - Pure inline CSS with no external dependencies
 * - Portal rendering to document.body via createPortal
 * - Full 12-position placement support with precise positioning
 * - Custom trigger handling for click, hover, and focus
 * - Click-outside dismissal via event listeners
 *
 * Implementation details:
 * - getPositionStyles calculates absolute positioning for each placement
 * - Uses window scroll offsets for scroll-aware positioning
 * - Timeout refs for enter/leave delay management
 * - Arrow element with CSS rotation and shadow
 *
 * This implementation is ideal for:
 * - Embedded applications without CSS framework dependencies
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility scenarios
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Popover, Button } from '@rottay/design-system';
 *
 * <Popover
 *   engine="rustic"
 *   content="Pure CSS styled content"
 *   title="Apollo Popover"
 *   placement="right"
 *   zIndex={2000}
 * >
 *   <Button>Trigger</Button>
 * </Popover>
 * ```
 *
 * @see {@link Popover} - The main engine-aware component
 * @module Popover/Engines/Apollo
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { PopoverProps, PopoverPlacement } from '../Popover.types';
import { POPOVER_DEFAULTS } from '../Popover.types';

/**
 * Computes fixed-position CSS for the popover content relative to the trigger
 * element's bounding rect. Accounts for scroll offsets so the popover tracks
 * correctly in scrollable containers.
 *
 * @param placement - One of 12 placement positions
 * @param triggerRect - DOMRect of the trigger element
 * @returns Inline styles for absolute positioning of the popover
 */
const getPositionStyles = (
  placement: PopoverPlacement,
  triggerRect: DOMRect
): React.CSSProperties => {
  // 8px gap between trigger edge and popover content prevents visual collision
  const gap = 8;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const positions: Record<PopoverPlacement, React.CSSProperties> = {
    top: {
      bottom: window.innerHeight - triggerRect.top + gap,
      left: triggerRect.left + triggerRect.width / 2 + scrollX,
      transform: 'translateX(-50%)',
    },
    topLeft: {
      bottom: window.innerHeight - triggerRect.top + gap,
      left: triggerRect.left + scrollX,
    },
    topRight: {
      bottom: window.innerHeight - triggerRect.top + gap,
      right: window.innerWidth - triggerRect.right + scrollX,
    },
    bottom: {
      top: triggerRect.bottom + gap + scrollY,
      left: triggerRect.left + triggerRect.width / 2 + scrollX,
      transform: 'translateX(-50%)',
    },
    bottomLeft: {
      top: triggerRect.bottom + gap + scrollY,
      left: triggerRect.left + scrollX,
    },
    bottomRight: {
      top: triggerRect.bottom + gap + scrollY,
      right: window.innerWidth - triggerRect.right + scrollX,
    },
    left: {
      top: triggerRect.top + triggerRect.height / 2 + scrollY,
      right: window.innerWidth - triggerRect.left + gap,
      transform: 'translateY(-50%)',
    },
    leftTop: {
      top: triggerRect.top + scrollY,
      right: window.innerWidth - triggerRect.left + gap,
    },
    leftBottom: {
      bottom: window.innerHeight - triggerRect.bottom,
      right: window.innerWidth - triggerRect.left + gap,
    },
    right: {
      top: triggerRect.top + triggerRect.height / 2 + scrollY,
      left: triggerRect.right + gap + scrollX,
      transform: 'translateY(-50%)',
    },
    rightTop: {
      top: triggerRect.top + scrollY,
      left: triggerRect.right + gap + scrollX,
    },
    rightBottom: {
      bottom: window.innerHeight - triggerRect.bottom,
      left: triggerRect.right + gap + scrollX,
    },
  };

  return positions[placement] || positions.top;
};

/**
 * Rustic (Apollo) engine implementation of Popover using pure inline CSS.
 *
 * Renders the popover content via createPortal into document.body for proper
 * z-index stacking that escapes overflow:hidden ancestors. Position is
 * recalculated from the trigger's bounding rect each time the popover opens.
 *
 * @param props - Popover configuration props
 * @param ref - Forwarded ref merged with the internal trigger ref
 * @returns Trigger element plus a portaled popover overlay
 */
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
      style,
      overlayClassName,
      overlayStyle,
      zIndex = POPOVER_DEFAULTS.zIndex,
    } = props;

    // Controlled/uncontrolled pattern: external `open` prop takes precedence
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [position, setPosition] = useState<React.CSSProperties>({});
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Recalculate popover position from trigger rect whenever visibility or placement changes
    useEffect(() => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition(getPositionStyles(placement!, rect));
      }
    }, [isOpen, placement]);

    // Cleanup timeouts
    useEffect(() => {
      return () => {
        if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      };
    }, []);

    // Dismiss on click outside both the trigger AND the popover content, since the
    // content is portaled to document.body and not a DOM child of the trigger.
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          popoverRef.current &&
          !popoverRef.current.contains(target)
        ) {
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

    // Portal the popover to document.body so it escapes overflow:hidden ancestors
    // and participates in the global z-index stacking context.
    const popoverContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={popoverRef}
          role="tooltip"
          className={overlayClassName}
          style={{
            position: 'fixed',
            zIndex,
            backgroundColor: 'var(--ds-popover-bg, var(--ds-color-bg-elevated, #fff))',
            borderRadius: 'var(--ds-popover-radius, var(--ds-radius-lg, 12px))',
            boxShadow: 'var(--ds-popover-shadow, var(--ds-shadow-lg))',
            padding: 'var(--ds-popover-padding, 12px 16px)',
            minWidth: 'var(--ds-popover-min-width, 150px)',
            maxWidth: 'var(--ds-popover-max-width, 350px)',
            border: '1px solid var(--ds-popover-border-color, var(--ds-color-neutral-200, #e5e7eb))',
            backdropFilter: 'var(--ds-modal-overlay-backdrop, blur(4px))',
            ...position,
            ...overlayStyle,
          }}
          /* Re-bind hover handlers on the popover itself so moving the cursor
             from trigger to content does not trigger a premature close. */
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {title && (
            <div
              style={{
                fontWeight: 600,
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--ds-popover-title-border, var(--ds-color-neutral-200, #e5e7eb))',
                color: 'var(--ds-popover-title-color, inherit)',
              }}
            >
              {title}
            </div>
          )}
          <div>{content}</div>
          {arrow && (
            <div
              style={{
                position: 'absolute',
                width: 'var(--ds-popover-arrow-size, 10px)',
                height: 'var(--ds-popover-arrow-size, 10px)',
                backgroundColor: 'var(--ds-popover-bg, var(--ds-color-bg-elevated, #fff))',
                transform: 'rotate(45deg)',
                boxShadow: 'var(--ds-popover-arrow-shadow, -2px -2px 4px rgba(0, 0, 0, 0.05))',
              }}
            />
          )}
        </div>,
        document.body
      )
    ) : null;

    return (
      <>
        <div
          ref={(node) => {
            (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className={className}
          style={{ display: 'inline-block', ...style }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {children}
        </div>
        {popoverContent}
      </>
    );
  }
);

Popover.displayName = 'Popover.Apollo';

export default Popover;
