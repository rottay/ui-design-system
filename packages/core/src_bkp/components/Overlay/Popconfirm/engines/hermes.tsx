/**
 * Hermes Popconfirm Engine
 *
 * DaisyUI popconfirm implementation using modal component.
 */

'use client';

import { useState, cloneElement } from 'react';
import type { PopconfirmProps } from '../../../../types/components/popconfirm';

/**
 * Hermes Popconfirm - DaisyUI implementation with modal
 */
function HermesPopconfirm({
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
  icon,
  showCancel = true,
  trigger = 'click',
  disabled = false,
  className = '',
  style,
  'aria-label': ariaLabel,
}: PopconfirmProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [isLoading, setIsLoading] = useState(false);

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

  // Map okType to DaisyUI button classes
  const getOkButtonClass = () => {
    if (okType === 'primary') return 'btn-error';
    if (okType === 'default') return 'btn-neutral';
    if (okType === 'text' || okType === 'link') return 'btn-ghost';
    return 'btn-error';
  };

  return (
    <>
      <div className={className} style={style}>
        {childWithHandlers}
      </div>

      {/* DaisyUI Modal */}
      {isOpen && (
        <dialog
          className="modal modal-open"
          role="dialog"
          aria-label={ariaLabel ?? 'Confirmation dialog'}
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              updateOpenState(false);
            }
          }}
        >
          <div className="modal-box">
            {/* Icon and Title */}
            <div className="flex gap-3 mb-4">
              {icon && (
                <div className="flex-shrink-0 text-warning text-2xl">
                  {icon}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{title}</h3>
                {description && (
                  <p className="py-2 text-sm opacity-70">{description}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="modal-action">
              {showCancel && (
                <button
                  type="button"
                  className="btn"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {cancelText}
                </button>
              )}
              <button
                type="button"
                className={`btn ${getOkButtonClass()}`}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Loading...
                  </>
                ) : (
                  okText
                )}
              </button>
            </div>
          </div>

          {/* Backdrop */}
          <div className="modal-backdrop"></div>
        </dialog>
      )}
    </>
  );
}

HermesPopconfirm.displayName = 'HermesPopconfirm';

export default HermesPopconfirm;
