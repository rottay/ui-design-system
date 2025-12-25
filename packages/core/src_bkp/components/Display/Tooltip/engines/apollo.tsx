/**
 * Apollo Tooltip Engine
 *
 * Native HTML + Tailwind CSS tooltip implementation.
 * Zero external dependencies, minimal bundle size with CSS positioning.
 */

'use client';

import { useState, useRef, useEffect, cloneElement } from 'react';
import type { TooltipProps } from '../../../../types/components/tooltip';
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
 * Apollo Tooltip - Native HTML + Tailwind implementation
 */
function ApolloTooltip({
  title,
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
  arrow = true,
  zIndex = 1000,
  mouseEnterDelay = 0,
  mouseLeaveDelay = 100,
  onMouseEnter,
  onMouseLeave,
}: TooltipProps) {
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
      onMouseEnter?.();
    }, mouseEnterDelay);
  };

  const handleHide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateOpenState(false);
      onMouseLeave?.();
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

  const handleContextMenu = (e: React.MouseEvent) => {
    if (trigger === 'contextMenu') {
      e.preventDefault();
      updateOpenState(!isOpen);
    }
  };

  // Add event handlers to child element
  const childWithHandlers = cloneElement(children, {
    onMouseEnter: trigger === 'hover' ? handleShow : undefined,
    onMouseLeave: trigger === 'hover' ? handleHide : undefined,
    onClick: trigger === 'click' ? handleClick : children.props.onClick,
    onFocus: trigger === 'focus' ? handleFocus : children.props.onFocus,
    onBlur: trigger === 'focus' ? handleBlur : children.props.onBlur,
    onContextMenu: trigger === 'contextMenu' ? handleContextMenu : children.props.onContextMenu,
  });

  // Don't show tooltip if there's no title
  if (!title) {
    return children;
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block', className)}
      style={style}
    >
      {childWithHandlers}

      {/* Tooltip overlay */}
      {isOpen && (
        <div
          role="tooltip"
          aria-label={ariaLabel}
          className={cn(
            'absolute px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg',
            'whitespace-nowrap pointer-events-none',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            placementClasses[placement],
            overlayClassName
          )}
          style={{
            zIndex,
            ...overlayStyle,
          }}
        >
          {title}

          {/* Arrow */}
          {arrow && (
            <div
              className={cn(
                'absolute w-0 h-0',
                'border-4 border-gray-900',
                arrowClasses[placement]
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

ApolloTooltip.displayName = 'ApolloTooltip';

export default ApolloTooltip;
