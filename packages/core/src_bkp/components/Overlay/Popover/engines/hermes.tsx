/**
 * Hermes Popover Engine
 *
 * DaisyUI popover implementation with unified PopoverProps.
 * Uses DaisyUI dropdown component as a base for popover behavior.
 */

'use client';

import { useState, useRef, useEffect, cloneElement } from 'react';
import type { PopoverProps } from '../../../../types/components/popover';
import { cn } from '../../../../utils/cn';

// Map unified placement to DaisyUI dropdown position classes
const placementClasses = {
  top: 'dropdown-top',
  topLeft: 'dropdown-top dropdown-start',
  topRight: 'dropdown-top dropdown-end',
  bottom: 'dropdown-bottom',
  bottomLeft: 'dropdown-bottom dropdown-start',
  bottomRight: 'dropdown-bottom dropdown-end',
  left: 'dropdown-left',
  leftTop: 'dropdown-left dropdown-start',
  leftBottom: 'dropdown-left dropdown-end',
  right: 'dropdown-right',
  rightTop: 'dropdown-right dropdown-start',
  rightBottom: 'dropdown-right dropdown-end',
};

/**
 * Hermes Popover - DaisyUI implementation with unified PopoverProps
 */
function HermesPopover({
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
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleClick = () => {
    if (trigger === 'click') {
      updateOpenState(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      updateOpenState(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      updateOpenState(false);
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      updateOpenState(true);
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      updateOpenState(false);
    }
  };

  // Don't show popover if there's no content
  if (!content && !title) {
    return children;
  }

  // Add event handlers to child element
  const childWithHandlers = cloneElement(children, {
    onMouseEnter: trigger === 'hover' ? handleMouseEnter : undefined,
    onMouseLeave: trigger === 'hover' ? handleMouseLeave : undefined,
    onClick: trigger === 'click' ? handleClick : children.props.onClick,
    onFocus: trigger === 'focus' ? handleFocus : children.props.onFocus,
    onBlur: trigger === 'focus' ? handleBlur : children.props.onBlur,
    tabIndex: trigger === 'focus' ? 0 : children.props.tabIndex,
  });

  const placementClass = placementClasses[placement] ?? placementClasses.top;

  // Build dropdown classes
  const dropdownClasses = cn(
    'dropdown',
    placementClass,
    // Force open state if controlled or internal state is open
    isOpen && 'dropdown-open',
    className
  );

  return (
    <div
      ref={containerRef}
      className={dropdownClasses}
      style={style}
      onMouseEnter={trigger === 'hover' ? handleMouseEnter : undefined}
      onMouseLeave={trigger === 'hover' ? handleMouseLeave : undefined}
    >
      {/* Trigger element */}
      {childWithHandlers}

      {/* Popover content */}
      <div
        role="dialog"
        aria-label={ariaLabel}
        className={cn(
          'dropdown-content z-[1] card card-compact bg-base-100 shadow-xl',
          'min-w-[200px] max-w-[400px]',
          overlayClassName
        )}
        style={overlayStyle}
      >
        <div className="card-body">
          {/* Title */}
          {title && (
            <h3 className="card-title text-base font-semibold">{title}</h3>
          )}

          {/* Content */}
          {content && (
            <div className="text-sm">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
}

HermesPopover.displayName = 'HermesPopover';

export default HermesPopover;
