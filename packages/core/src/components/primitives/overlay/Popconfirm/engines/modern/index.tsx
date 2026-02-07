'use client';

/**
 * @fileoverview Popconfirm Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Popconfirm component.
 * Uses DaisyUI card and button components with Tailwind utility classes.
 *
 * @remarks
 * The Modern engine provides:
 * - DaisyUI card component for the confirmation panel
 * - DaisyUI button styling (btn-primary, btn-error, btn-ghost)
 * - Loading spinner via DaisyUI loading component
 * - Click-outside dismissal via event listeners
 * - Async onConfirm support with automatic loading state
 *
 * Implementation details:
 * - Uses controlled/uncontrolled pattern for open state
 * - Placement mapped to Tailwind positioning classes
 * - Internal loading state tracks async onConfirm execution
 * - Button types mapped to DaisyUI button variants
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Popconfirm, Button } from '@rottay/design-system';
 *
 * <Popconfirm
 *   engine="modern"
 *   title="Remove item?"
 *   okText="Remove"
 *   okType="danger"
 *   onConfirm={async () => await removeItem()}
 * >
 *   <Button>Remove</Button>
 * </Popconfirm>
 * ```
 *
 * @see {@link Popconfirm} - The main engine-aware component
 * @module Popconfirm/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PopconfirmProps } from '../../types';
import { POPCONFIRM_DEFAULTS } from '../../types';

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

    const handleTriggerClick = () => {
      if (disabled) return;
      handleOpenChange(true);
    };

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

    const getPlacementClasses = () => {
      if (placement?.includes('top')) return 'bottom-full mb-2';
      if (placement?.includes('bottom')) return 'top-full mt-2';
      if (placement?.includes('left')) return 'right-full mr-2';
      if (placement?.includes('right')) return 'left-full ml-2';
      return 'bottom-full mb-2';
    };

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
