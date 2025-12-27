/**
 * Popconfirm - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import type { PopconfirmProps, PopconfirmPlacement } from '../types';
import { POPCONFIRM_DEFAULTS } from '../types';

/**
 * Calculate position for popconfirm
 */
function calculatePosition(
  triggerRect: DOMRect,
  popoverRect: DOMRect,
  placement: PopconfirmPlacement
): { top: number; left: number; arrowPosition: { top?: number; left?: number; bottom?: number; right?: number } } {
  const gap = 8;
  let top = 0;
  let left = 0;
  let arrowPosition: { top?: number; left?: number; bottom?: number; right?: number } = {};

  switch (placement) {
    case 'top':
      top = triggerRect.top - popoverRect.height - gap;
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      arrowPosition = { bottom: -4, left: popoverRect.width / 2 - 4 };
      break;
    case 'topLeft':
      top = triggerRect.top - popoverRect.height - gap;
      left = triggerRect.left;
      arrowPosition = { bottom: -4, left: 16 };
      break;
    case 'topRight':
      top = triggerRect.top - popoverRect.height - gap;
      left = triggerRect.right - popoverRect.width;
      arrowPosition = { bottom: -4, right: 16 };
      break;
    case 'bottom':
      top = triggerRect.bottom + gap;
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      arrowPosition = { top: -4, left: popoverRect.width / 2 - 4 };
      break;
    case 'bottomLeft':
      top = triggerRect.bottom + gap;
      left = triggerRect.left;
      arrowPosition = { top: -4, left: 16 };
      break;
    case 'bottomRight':
      top = triggerRect.bottom + gap;
      left = triggerRect.right - popoverRect.width;
      arrowPosition = { top: -4, right: 16 };
      break;
    case 'left':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      left = triggerRect.left - popoverRect.width - gap;
      arrowPosition = { right: -4, top: popoverRect.height / 2 - 4 };
      break;
    case 'leftTop':
      top = triggerRect.top;
      left = triggerRect.left - popoverRect.width - gap;
      arrowPosition = { right: -4, top: 16 };
      break;
    case 'leftBottom':
      top = triggerRect.bottom - popoverRect.height;
      left = triggerRect.left - popoverRect.width - gap;
      arrowPosition = { right: -4, bottom: 16 };
      break;
    case 'right':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      left = triggerRect.right + gap;
      arrowPosition = { left: -4, top: popoverRect.height / 2 - 4 };
      break;
    case 'rightTop':
      top = triggerRect.top;
      left = triggerRect.right + gap;
      arrowPosition = { left: -4, top: 16 };
      break;
    case 'rightBottom':
      top = triggerRect.bottom - popoverRect.height;
      left = triggerRect.right + gap;
      arrowPosition = { left: -4, bottom: 16 };
      break;
  }

  return {
    top: top + window.scrollY,
    left: left + window.scrollX,
    arrowPosition,
  };
}

/**
 * Default warning icon
 */
const WarningIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
    style={style}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" />
  </svg>
);

/**
 * Base Popconfirm component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BasePopconfirm = forwardRef<HTMLDivElement, PopconfirmProps>(
  (props, ref) => {
    const {
      title,
      description,
      onConfirm,
      onCancel,
      okText = POPCONFIRM_DEFAULTS.okText!,
      cancelText = POPCONFIRM_DEFAULTS.cancelText!,
      okType = POPCONFIRM_DEFAULTS.okType!,
      icon,
      open: controlledOpen,
      onOpenChange,
      disabled = POPCONFIRM_DEFAULTS.disabled,
      children,
      placement = POPCONFIRM_DEFAULTS.placement!,
      showArrow = POPCONFIRM_DEFAULTS.showArrow,
      okButtonLoading = POPCONFIRM_DEFAULTS.okButtonLoading,
      className = '',
      style = {},
      overlayClassName = '',
      overlayStyle = {},
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(okButtonLoading);
    const [position, setPosition] = useState({
      top: 0,
      left: 0,
      arrowPosition: {} as { top?: number; left?: number; bottom?: number; right?: number },
    });
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const updateOpen = useCallback(
      (newOpen: boolean) => {
        if (disabled) return;
        if (controlledOpen === undefined) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [controlledOpen, onOpenChange, disabled]
    );

    // Update position when open
    useEffect(() => {
      if (isOpen && triggerRef.current && popoverRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const pos = calculatePosition(triggerRect, popoverRect, placement);
        setPosition(pos);
      }
    }, [isOpen, placement]);

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node) &&
          popoverRef.current &&
          !popoverRef.current.contains(e.target as Node)
        ) {
          updateOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, updateOpen]);

    // Sync loading state with prop
    useEffect(() => {
      setLoading(okButtonLoading);
    }, [okButtonLoading]);

    const handleClick = () => {
      updateOpen(!isOpen);
    };

    const handleCancel = () => {
      onCancel?.();
      updateOpen(false);
    };

    const handleConfirm = async () => {
      if (onConfirm) {
        const result = onConfirm();
        if (result instanceof Promise) {
          setLoading(true);
          try {
            await result;
          } finally {
            setLoading(false);
          }
        }
      }
      updateOpen(false);
    };

    // CSS variables for popconfirm
    const popconfirmVars = useMemo<React.CSSProperties>(
      () =>
        ({
          '--popconfirm-bg': 'var(--color-bg-elevated, #fff)',
          '--popconfirm-border-radius': 'var(--radius-lg, 8px)',
          '--popconfirm-shadow': 'var(--shadow-lg)',
          '--popconfirm-padding': 'var(--spacing-3, 12px)',
          '--popconfirm-min-width': '200px',
          '--popconfirm-max-width': '350px',
          '--popconfirm-icon-color': 'var(--color-warning)',
          '--popconfirm-icon-size': '16px',
          '--popconfirm-title-font-size': '0.875rem',
          '--popconfirm-title-font-weight': '500',
          '--popconfirm-title-color': 'var(--color-text-primary)',
          '--popconfirm-description-font-size': '0.813rem',
          '--popconfirm-description-color': 'var(--color-text-secondary)',
          '--popconfirm-arrow-size': '8px',
          '--popconfirm-button-gap': 'var(--spacing-2, 8px)',
        }) as React.CSSProperties,
      []
    );

    // Button styles based on okType
    const getOkButtonStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        padding: '4px 12px',
        fontSize: '0.813rem',
        borderRadius: 'var(--radius-sm, 4px)',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'background-color 0.2s, opacity 0.2s',
      };

      switch (okType) {
        case 'danger':
          return {
            ...baseStyle,
            backgroundColor: 'var(--color-error)',
            color: '#fff',
          };
        case 'default':
          return {
            ...baseStyle,
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          };
        case 'primary':
        default:
          return {
            ...baseStyle,
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
          };
      }
    };

    // Render popconfirm
    const renderPopconfirm = () => {
      if (!isOpen) return null;

      const popconfirmElement = (
        <div
          ref={popoverRef}
          className={`rottay-popconfirm ${overlayClassName}`}
          style={{
            ...popconfirmVars,
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 1050,
            minWidth: 'var(--popconfirm-min-width)',
            maxWidth: 'var(--popconfirm-max-width)',
            padding: 'var(--popconfirm-padding)',
            backgroundColor: 'var(--popconfirm-bg)',
            borderRadius: 'var(--popconfirm-border-radius)',
            boxShadow: 'var(--popconfirm-shadow)',
            ...overlayStyle,
          }}
          role="alertdialog"
          aria-labelledby="popconfirm-title"
        >
          {showArrow && (
            <div
              className="rottay-popconfirm__arrow"
              style={{
                position: 'absolute',
                width: 'var(--popconfirm-arrow-size)',
                height: 'var(--popconfirm-arrow-size)',
                backgroundColor: 'var(--popconfirm-bg)',
                transform: 'rotate(45deg)',
                ...position.arrowPosition,
              }}
            />
          )}
          <div
            className="rottay-popconfirm__content"
            style={{ display: 'flex', gap: 'var(--spacing-2, 8px)' }}
          >
            <div
              className="rottay-popconfirm__icon"
              style={{ color: 'var(--popconfirm-icon-color)', flexShrink: 0 }}
            >
              {icon !== undefined ? (
                icon
              ) : (
                <WarningIcon
                  style={{ width: 'var(--popconfirm-icon-size)', height: 'var(--popconfirm-icon-size)' }}
                />
              )}
            </div>
            <div className="rottay-popconfirm__message" style={{ flex: 1 }}>
              <div
                id="popconfirm-title"
                className="rottay-popconfirm__title"
                style={{
                  fontSize: 'var(--popconfirm-title-font-size)',
                  fontWeight: 'var(--popconfirm-title-font-weight)' as any,
                  color: 'var(--popconfirm-title-color)',
                }}
              >
                {title}
              </div>
              {description && (
                <div
                  className="rottay-popconfirm__description"
                  style={{
                    fontSize: 'var(--popconfirm-description-font-size)',
                    color: 'var(--popconfirm-description-color)',
                    marginTop: 'var(--spacing-1, 4px)',
                  }}
                >
                  {description}
                </div>
              )}
            </div>
          </div>
          <div
            className="rottay-popconfirm__buttons"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--popconfirm-button-gap)',
              marginTop: 'var(--spacing-3, 12px)',
            }}
          >
            <button
              type="button"
              className="rottay-popconfirm__cancel-btn"
              onClick={handleCancel}
              style={{
                padding: '4px 12px',
                fontSize: '0.813rem',
                borderRadius: 'var(--radius-sm, 4px)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="rottay-popconfirm__ok-btn"
              onClick={handleConfirm}
              disabled={loading}
              style={getOkButtonStyle()}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  {okText}
                </span>
              ) : (
                okText
              )}
            </button>
          </div>
        </div>
      );

      if (typeof document !== 'undefined') {
        return createPortal(popconfirmElement, document.body);
      }
      return null;
    };

    return (
      <div
        ref={ref}
        className={`rottay-popconfirm-wrapper ${className}`}
        style={{ display: 'inline-block', ...style }}
      >
        <div
          ref={triggerRef}
          className="rottay-popconfirm__trigger"
          onClick={handleClick}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {children}
        </div>
        {renderPopconfirm()}
      </div>
    );
  }
);

BasePopconfirm.displayName = 'BasePopconfirm';
