'use client';

/**
 * @fileoverview Modern (Token-driven/Tailwind) engine for the Popconfirm overlay component.
 * Uses DS token inline styles for the confirmation panel with async-aware confirm handling
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
 * Popconfirm implementation using DS token inline styles for card and buttons.
 *
 * The component tracks an internal loading state that activates automatically
 * when `onConfirm` returns a Promise, disabling both buttons until the promise
 * settles. Supports controlled/uncontrolled open state and maps the unified
 * `okType` prop to DS token inline styles (primary, error, ghost backgrounds).
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

    // Map unified okType to DS token inline styles for the confirm button
    const getOkButtonStyle = (): React.CSSProperties => {
      switch (okType) {
        case 'danger':
          return { background: 'var(--ds-color-error)', color: 'var(--ds-color-text-on-primary)' };
        case 'primary':
          return { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' };
        default:
          return { background: 'transparent', color: 'var(--ds-color-text-primary)' };
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
            <div style={{ padding: 16, minWidth: 200, background: 'var(--ds-surface-card)', borderRadius: 'var(--ds-radius-lg)', border: '1px solid var(--ds-color-border-subtle)', boxShadow: 'var(--ds-elevation-3)' }}>
              <div className="flex items-start gap-2">
                {icon && <span className="mt-0.5" style={{ color: 'var(--ds-color-warning)' }}>{icon}</span>}
                <div className="flex-1">
                  <div className="font-medium">{title}</div>
                  {description && (
                    <div className="text-sm mt-1" style={{ color: 'var(--ds-color-text-secondary)' }}>
                      {description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    height: 32,
                    padding: '0 12px',
                    fontSize: 13,
                    borderRadius: 'var(--ds-radius-md)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--ds-color-text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading || okButtonLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 32,
                    padding: '0 12px',
                    fontSize: 13,
                    borderRadius: 'var(--ds-radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    ...getOkButtonStyle(),
                  }}
                >
                  {(loading || okButtonLoading) && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        border: '2px solid currentColor',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'ds-spin 0.6s linear infinite',
                      }}
                    />
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
