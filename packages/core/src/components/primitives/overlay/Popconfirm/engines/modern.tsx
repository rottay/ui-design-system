'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the Popconfirm overlay component.
 * Uses a DaisyUI card for the confirmation panel with async-aware confirm handling
 * (auto-loading state), click-outside dismissal, and Tailwind placement classes.
 *
 * @example
 * ```tsx
 * <Popconfirm engine="modern" title="Remove item?" okType="danger"
 *   onConfirm={async () => await removeItem()}>
 *   <Button>Remove</Button>
 * </Popconfirm>
 * ```
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PopconfirmProps } from '../Popconfirm.types';
import { POPCONFIRM_DEFAULTS } from '../Popconfirm.types';

/**
 * Popconfirm implementation using DaisyUI card and button classes.
 *
 * The component tracks an internal loading state that activates automatically
 * when `onConfirm` returns a Promise, disabling both buttons until the promise
 * settles. Supports controlled/uncontrolled open state and maps the unified
 * `okType` prop to DaisyUI button variants (btn-primary, btn-error, btn-ghost).
 *
 * @param props - {@link PopconfirmProps} shared across all engines.
 * @returns A ref-forwarded relatively-positioned container with an absolutely-placed card.
 */
export const Popconfirm = React.forwardRef<HTMLDivElement, PopconfirmProps>(
  (props, ref) => {
    const {
      title,
      description,
      onConfirm,
      onCancel,
      okText = POPCONFIRM_DEFAULTS.okText,
      cancelText = POPCONFIRM_DEFAULTS.cancelText,
      okType = POPCONFIRM_DEFAULTS.okType,
      icon,
      open: controlledOpen,
      onOpenChange,
      disabled,
      children,
      placement = POPCONFIRM_DEFAULTS.placement,
      okButtonLoading,
      className,
      overlayClassName,
      overlayStyle,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Dismiss the popconfirm when clicking anywhere outside the container
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

    const handleTriggerClick = () => {
      if (disabled) return;
      handleOpenChange(true);
    };

    // Async-aware: wraps onConfirm in try/finally to track loading state
    // automatically when the callback returns a Promise
    const handleConfirm = async () => {
      if (onConfirm) {
        setLoading(true);
        try {
          await onConfirm();
        } finally {
          setLoading(false);
        }
      }
      handleOpenChange(false);
    };

    const handleCancel = () => {
      onCancel?.();
      handleOpenChange(false);
    };

    // Translate the engine-agnostic placement prop into Tailwind positioning classes
    const getPlacementClasses = () => {
      if (placement?.includes('top')) return 'bottom-full mb-2';
      if (placement?.includes('bottom')) return 'top-full mt-2';
      if (placement?.includes('left')) return 'right-full mr-2';
      if (placement?.includes('right')) return 'left-full ml-2';
      return 'bottom-full mb-2';
    };

    // Map unified okType to the corresponding DaisyUI button variant class
    const getButtonClass = () => {
      switch (okType) {
        case 'danger':
          return 'btn-error';
        case 'primary':
          return 'btn-primary';
        default:
          return 'btn-ghost';
      }
    };

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`relative inline-block ${className || ''}`}
      >
        <div onClick={handleTriggerClick}>{children}</div>

        {isOpen && (
          <div
            className={`absolute z-50 ${getPlacementClasses()} ${overlayClassName || ''}`}
            style={overlayStyle}
          >
            <div className="card bg-base-100 shadow-xl p-4 min-w-[200px]">
              <div className="flex items-start gap-2">
                {icon && <span className="text-warning mt-0.5">{icon}</span>}
                <div className="flex-1">
                  <div className="font-medium">{title}</div>
                  {description && (
                    <div className="text-sm text-base-content/70 mt-1">
                      {description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={handleCancel}
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${getButtonClass()}`}
                  onClick={handleConfirm}
                  disabled={loading || okButtonLoading}
                >
                  {(loading || okButtonLoading) && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  {okText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Popconfirm.displayName = 'Popconfirm.Modern';

export default Popconfirm;
