'use client';

/**
 * Popover - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { PopoverProps, PopoverPlacement } from '../../types';
import { POPOVER_DEFAULTS } from '../../types';

const getPositionStyles = (
  placement: PopoverPlacement,
  triggerRect: DOMRect
): React.CSSProperties => {
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

    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [position, setPosition] = useState<React.CSSProperties>({});
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const enterTimeoutRef = useRef<NodeJS.Timeout>();
    const leaveTimeoutRef = useRef<NodeJS.Timeout>();

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Update position
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

    // Click outside handler
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

    const popoverContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={popoverRef}
          role="tooltip"
          className={overlayClassName}
          style={{
            position: 'fixed',
            zIndex,
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '12px 16px',
            minWidth: '150px',
            maxWidth: '350px',
            ...position,
            ...overlayStyle,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {title && (
            <div
              style={{
                fontWeight: 600,
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e5e7eb',
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
                width: '10px',
                height: '10px',
                backgroundColor: '#fff',
                transform: 'rotate(45deg)',
                boxShadow: '-2px -2px 4px rgba(0, 0, 0, 0.05)',
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
