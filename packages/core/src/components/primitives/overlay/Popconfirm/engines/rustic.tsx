'use client';

/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the Popconfirm overlay component.
 * Uses inline CSS with portal rendering (createPortal to document.body) for proper
 * z-index stacking, getBoundingClientRect-based placement, async-aware confirm
 * handling, and full ARIA dialog attributes.
 *
 * @example
 * ```tsx
 * <Popconfirm engine="rustic" title="Confirm deletion?" okType="danger"
 *   onConfirm={handleDelete}>
 *   <Button>Delete</Button>
 * </Popconfirm>
 * ```
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { PopconfirmProps } from '../Popconfirm.types';
import { POPCONFIRM_DEFAULTS } from '../Popconfirm.types';

/**
 * Popconfirm implementation using pure inline CSS and React portals.
 *
 * The popover is portalled to `document.body` and positioned absolutely using
 * the trigger's bounding rect plus scroll offsets. Placement is translated via
 * CSS `transform` for centring. The confirm handler is async-aware: if it
 * returns a Promise, the button enters a loading state automatically.
 * Button colours are resolved from DS semantic tokens (--ds-popconfirm-*).
 *
 * @param props - {@link PopconfirmProps} shared across all engines.
 * @returns A ref-forwarded inline-block trigger plus a portal-rendered popover.
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
      style,
      overlayClassName,
      overlayStyle,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Recalculate popover position from the trigger's bounding rect
    useEffect(() => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let top = rect.top + window.scrollY;
        let left = rect.left + window.scrollX;

        if (placement?.includes('bottom')) {
          top = rect.bottom + window.scrollY + 8;
        } else {
          top = rect.top + window.scrollY - 8;
        }

        if (placement?.includes('Right')) {
          left = rect.right + window.scrollX;
        } else if (placement?.includes('Left')) {
          left = rect.left + window.scrollX;
        } else {
          left = rect.left + rect.width / 2 + window.scrollX;
        }

        setPosition({ top, left });
      }
    }, [isOpen, placement]);

    // Dismiss when clicking outside both the trigger and the popover portal
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

    const handleTriggerClick = () => {
      if (disabled) return;
      handleOpenChange(true);
    };

    // Async-aware: wraps onConfirm in try/finally so the button shows a
    // loading state automatically when the callback returns a Promise
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

    // Resolve confirm-button colours from DS semantic tokens per okType variant
    const getOkButtonStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        padding: 'var(--ds-popconfirm-button-padding, 6px 16px)',
        borderRadius: 'var(--ds-popconfirm-button-radius, 6px)',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: 'var(--ds-popconfirm-button-font-size, 14px)',
      };

      switch (okType) {
        case 'danger':
          return { ...baseStyle, backgroundColor: 'var(--ds-popconfirm-danger-bg, var(--ds-color-error-500, #ef4444))', color: 'var(--ds-popconfirm-danger-color, #fff)' };
        case 'primary':
          return { ...baseStyle, backgroundColor: 'var(--ds-popconfirm-primary-bg, var(--ds-color-primary-500, #3b82f6))', color: 'var(--ds-popconfirm-primary-color, #fff)' };
        default:
          return { ...baseStyle, backgroundColor: 'var(--ds-popconfirm-default-bg, var(--ds-color-neutral-100, #f3f4f6))', color: 'var(--ds-popconfirm-default-color, var(--ds-color-neutral-700, #374151))' };
      }
    };

    const popoverContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          data-part="surface"
          data-open="true"
          className={`rottay-popconfirm--rustic ${overlayClassName || ''}`}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            transform: placement?.includes('bottom') ? 'translateX(-50%)' : 'translate(-50%, -100%)',
            zIndex: 'var(--ds-popconfirm-z-index, 1050)' as unknown as number,
            backgroundColor: 'var(--ds-popconfirm-bg, var(--ds-color-bg-elevated, #fff))',
            borderRadius: 'var(--ds-popconfirm-radius, var(--ds-radius-lg, 12px))',
            boxShadow: 'var(--ds-popconfirm-shadow, var(--ds-shadow-lg))',
            padding: 'var(--ds-popconfirm-padding, 16px)',
            minWidth: 'var(--ds-popconfirm-min-width, 220px)',
            maxWidth: 'var(--ds-popconfirm-max-width, 350px)',
            border: '1px solid var(--ds-popconfirm-border-color, var(--ds-color-neutral-200, #e5e7eb))',
            backdropFilter: 'var(--ds-modal-overlay-backdrop, blur(4px))',
            ...overlayStyle,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            {icon && (
              <span data-part="icon" style={{ color: 'var(--ds-popconfirm-icon-color, var(--ds-color-warning-500, #f59e0b))', marginTop: '2px' }}>
                {icon}
              </span>
            )}
            <div style={{ flex: 1 }}>
              <div data-part="title" style={{ fontWeight: 500, color: 'var(--ds-popconfirm-title-color, var(--ds-color-neutral-900, #111827))' }}>{title}</div>
              {description && (
                <div data-part="description" style={{ fontSize: '14px', color: 'var(--ds-popconfirm-description-color, var(--ds-color-neutral-500, #6b7280))', marginTop: '4px' }}>
                  {description}
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            <button
              type="button"
              data-part="action"
              data-action="cancel"
              onClick={handleCancel}
              style={{
                padding: 'var(--ds-popconfirm-button-padding, 6px 16px)',
                borderRadius: 'var(--ds-popconfirm-button-radius, 6px)',
                border: '1px solid var(--ds-popconfirm-cancel-border, var(--ds-color-neutral-300, #d1d5db))',
                backgroundColor: 'var(--ds-popconfirm-cancel-bg, var(--ds-color-bg-primary, #fff))',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 'var(--ds-popconfirm-button-font-size, 14px)',
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              data-part="action"
              data-action="confirm"
              data-ok-type={okType}
              data-loading={(loading || okButtonLoading) ? 'true' : 'false'}
              onClick={handleConfirm}
              disabled={loading || okButtonLoading}
              style={{
                ...getOkButtonStyle(),
                opacity: loading || okButtonLoading ? 0.7 : 1,
              }}
            >
              {okText}
            </button>
          </div>
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
          data-part="trigger"
          data-open={isOpen ? 'true' : 'false'}
          className={className}
          style={{ display: 'inline-block', ...style }}
          onClick={handleTriggerClick}
        >
          {children}
        </div>
        {popoverContent}
      </>
    );
  }
);

Popconfirm.displayName = 'Popconfirm.Rustic';

export default Popconfirm;
