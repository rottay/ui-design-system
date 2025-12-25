/**
 * Apollo Popconfirm Engine
 *
 * Native HTML + Tailwind CSS popconfirm implementation.
 * Zero external dependencies, minimal bundle size with custom popover.
 */

'use client';

import { useState, useRef, useEffect, cloneElement } from 'react';
import type { PopconfirmProps } from '../../../../types/components/popconfirm';
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

/**
 * Apollo Popconfirm - Native HTML + Tailwind implementation
 */
function ApolloPopconfirm({
  title,
  description,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  onConfirm,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  okType = 'primary',
  okButtonProps,
  cancelButtonProps,
  icon,
  showCancel = true,
  placement = 'top',
  trigger = 'click',
  disabled = false,
  className,
  style,
  overlayClassName,
  overlayStyle,
  zIndex = 1050,
  'aria-label': ariaLabel,
}: PopconfirmProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        updateOpenState(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const updateOpenState = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    if (trigger === 'click') {
      updateOpenState(!isOpen);
    }
  };

  const handleTriggerHover = () => {
    if (disabled) return;
    if (trigger === 'hover') {
      updateOpenState(true);
    }
  };

  const handleTriggerLeave = () => {
    if (disabled) return;
    if (trigger === 'hover') {
      updateOpenState(false);
    }
  };

  const handleTriggerFocus = () => {
    if (disabled) return;
    if (trigger === 'focus') {
      updateOpenState(true);
    }
  };

  const handleTriggerBlur = () => {
    if (disabled) return;
    if (trigger === 'focus') {
      updateOpenState(false);
    }
  };

  const handleTriggerContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    if (trigger === 'contextMenu') {
      e.preventDefault();
      updateOpenState(!isOpen);
    }
  };

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onConfirm?.(e);
      updateOpenState(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    onCancel?.(e);
    updateOpenState(false);
  };

  // Add event handlers to child element
  const childWithHandlers = cloneElement(children, {
    onClick: trigger === 'click' ? handleTriggerClick : children.props.onClick,
    onMouseEnter: trigger === 'hover' ? handleTriggerHover : children.props.onMouseEnter,
    onMouseLeave: trigger === 'hover' ? handleTriggerLeave : children.props.onMouseLeave,
    onFocus: trigger === 'focus' ? handleTriggerFocus : children.props.onFocus,
    onBlur: trigger === 'focus' ? handleTriggerBlur : children.props.onBlur,
    onContextMenu: trigger === 'contextMenu' ? handleTriggerContextMenu : children.props.onContextMenu,
  });

  // Get button classes based on type
  const getButtonClasses = (buttonType: string, isDanger?: boolean) => {
    const baseClasses = 'px-3 py-1.5 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    if (isDanger || buttonType === 'primary') {
      return cn(
        baseClasses,
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        isLoading && 'opacity-50 cursor-not-allowed'
      );
    }

    if (buttonType === 'text' || buttonType === 'link') {
      return cn(
        baseClasses,
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        isLoading && 'opacity-50 cursor-not-allowed'
      );
    }

    return cn(
      baseClasses,
      'bg-white border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-blue-500',
      isLoading && 'opacity-50 cursor-not-allowed'
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block', className)}
      style={style}
    >
      {childWithHandlers}

      {/* Popconfirm overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={ariaLabel ?? 'Confirmation dialog'}
          className={cn(
            'absolute w-72 bg-white rounded-lg shadow-lg border border-gray-200',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            placementClasses[placement],
            overlayClassName
          )}
          style={{
            zIndex,
            ...overlayStyle,
          }}
        >
          {/* Content */}
          <div className="p-4">
            <div className="flex gap-3">
              {/* Icon */}
              {icon && (
                <div className="flex-shrink-0 text-yellow-500">
                  {icon}
                </div>
              )}

              {/* Text content */}
              <div className="flex-1">
                {/* Title */}
                <div className="text-base font-medium text-gray-900 mb-1">
                  {title}
                </div>

                {/* Description */}
                {description && (
                  <div className="text-sm text-gray-600">
                    {description}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-4">
              {showCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={getButtonClasses('default')}
                  {...cancelButtonProps}
                >
                  {cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className={getButtonClasses(okType ?? 'primary')}
                {...okButtonProps}
              >
                {isLoading ? 'Loading...' : okText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ApolloPopconfirm.displayName = 'ApolloPopconfirm';

export default ApolloPopconfirm;
