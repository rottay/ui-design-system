/**
 * Apollo Popover Engine
 *
 * Native HTML + Tailwind CSS popover implementation.
 * Zero external dependencies, minimal bundle size with CSS-based popover.
 */

'use client';

import { useState, useRef, useEffect, cloneElement } from 'react';
import type { PopoverProps } from '../../../../types/components/popover';
import { cn } from '../../../../utils/cn';

// Placement to CSS class mapping for positioning
const placementClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  topLeft: 'bottom-full left-0 mb-2',
  topRight: 'bottom-full right-0 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  bottomLeft: 'top-full left-0 mt-2',
  bottomRight: 'top-full right-0 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  leftTop: 'right-full top-0 mr-2',
  leftBottom: 'right-full bottom-0 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  rightTop: 'left-full top-0 ml-2',
  rightBottom: 'left-full bottom-0 ml-2',
};

// Arrow positioning based on placement
const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
  topLeft: 'top-full left-2 border-l-transparent border-r-transparent border-b-transparent',
  topRight: 'top-full right-2 border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
  bottomLeft: 'bottom-full left-2 border-l-transparent border-r-transparent border-t-transparent',
  bottomRight: 'bottom-full right-2 border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
  leftTop: 'left-full top-2 border-t-transparent border-b-transparent border-r-transparent',
  leftBottom: 'left-full bottom-2 border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  rightTop: 'right-full top-2 border-t-transparent border-b-transparent border-l-transparent',
  rightBottom: 'right-full bottom-2 border-t-transparent border-b-transparent border-l-transparent',
};

/**
 * Apollo Popover - Native HTML + Tailwind implementation
 */
function ApolloPopover({
  title,
  content,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  trigger = 'hover',
  className,
  style,
  'aria-label': ariaLabel,
  placement = 'top',
  overlayClassName,
  overlayStyle,
  overlayInnerStyle,
  arrow = true,
  zIndex = 1000,
  mouseEnterDelay = 0,
  mouseLeaveDelay = 100,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle clicks outside to close popover
  useEffect(() => {
    if (!isOpen || trigger !== 'click') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        updateOpenState(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, trigger]);

  const updateOpenState = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleShow = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateOpenState(true);
    }, mouseEnterDelay);
  };

  const handleHide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateOpenState(false);
    }, mouseLeaveDelay);
  };

  const handleClick = () => {
    if (trigger === 'click') {
      updateOpenState(!isOpen);
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      handleShow();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      handleHide();
    }
  };

  // Add event handlers to child element
  const childWithHandlers = cloneElement(children, {
    onMouseEnter: trigger === 'hover' ? handleShow : undefined,
    onMouseLeave: trigger === 'hover' ? handleHide : undefined,
    onClick: trigger === 'click' ? handleClick : children.props.onClick,
    onFocus: trigger === 'focus' ? handleFocus : children.props.onFocus,
    onBlur: trigger === 'focus' ? handleBlur : children.props.onBlur,
  });

  // Don't show popover if there's no content
  if (!content && !title) {
    return children;
  }

  // Determine if arrow should be shown
  const showArrow = typeof arrow === 'boolean' ? arrow : true;

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block', className)}
      style={style}
    >
      {childWithHandlers}

      {/* Popover overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={ariaLabel}
          className={cn(
            'absolute min-w-[200px] max-w-[400px]',
            'bg-white border border-gray-200 rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            placementClasses[placement],
            overlayClassName
          )}
          style={{
            zIndex,
            ...overlayStyle,
          }}
        >
          {/* Popover content wrapper */}
          <div className="relative" style={overlayInnerStyle}>
            {/* Title */}
            {title && (
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="font-semibold text-gray-900">{title}</div>
              </div>
            )}

            {/* Content */}
            {content && (
              <div className="px-4 py-3 text-sm text-gray-700">
                {content}
              </div>
            )}

            {/* Arrow */}
            {showArrow && (
              <div
                className={cn(
                  'absolute w-0 h-0',
                  'border-[6px] border-white',
                  arrowClasses[placement]
                )}
                style={{
                  filter: 'drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.1))',
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ApolloPopover.displayName = 'ApolloPopover';

export default ApolloPopover;
