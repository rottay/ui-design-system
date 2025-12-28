'use client';

/**
 * @fileoverview Popconfirm Apollo Engine - Rottay Design System
 * @description Apollo (Pure HTML/CSS) implementation of the Popconfirm component.
 * Uses inline CSS styles with portal rendering for proper z-index stacking.
 *
 * @remarks
 * The Apollo engine provides:
 * - Pure inline CSS with no external dependencies
 * - Portal rendering to document.body via createPortal
 * - Click-outside dismissal via event listeners
 * - Async onConfirm support with loading state tracking
 * - Accessible dialog with proper ARIA attributes
 *
 * Implementation details:
 * - Position calculated based on trigger getBoundingClientRect()
 * - Button colors based on okType (danger=#ef4444, primary=#3b82f6)
 * - Loading state disables confirm button and reduces opacity
 * - Uses scroll offsets for scroll-aware positioning
 *
 * This implementation is ideal for:
 * - Embedded applications without CSS framework dependencies
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility scenarios
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Popconfirm, Button } from '@rottay/design-system';
 *
 * <Popconfirm
 *   engine="apollo"
 *   title="Confirm deletion?"
 *   description="This cannot be reversed."
 *   okText="Yes, delete"
 *   okType="danger"
 *   onConfirm={handleDelete}
 * >
 *   <Button>Delete</Button>
 * </Popconfirm>
 * ```
 *
 * @see {@link Popconfirm} - The main engine-aware component
 * @module Popconfirm/Engines/Apollo
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

    // Calculate position
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

    const getOkButtonStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        padding: '6px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '14px',
      };

      switch (okType) {
        case 'danger':
          return { ...baseStyle, backgroundColor: '#ef4444', color: '#fff' };
        case 'primary':
          return { ...baseStyle, backgroundColor: '#3b82f6', color: '#fff' };
        default:
          return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
      }
    };

    const popoverContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          className={overlayClassName}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            transform: placement?.includes('bottom') ? 'translateX(-50%)' : 'translate(-50%, -100%)',
            zIndex: 1050,
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            minWidth: '220px',
            maxWidth: '350px',
            ...overlayStyle,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            {icon && (
              <span style={{ color: '#f59e0b', marginTop: '2px' }}>
                {icon}
              </span>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: '#111827' }}>{title}</div>
              {description && (
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
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
              onClick={handleCancel}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
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

Popconfirm.displayName = 'Popconfirm.Apollo';

export default Popconfirm;
