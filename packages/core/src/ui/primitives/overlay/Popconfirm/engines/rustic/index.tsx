'use client';

/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the Popconfirm overlay component.
 * Portals the panel through the shared portal root and positions it via the
 * shared overlay positioning runtime (`runtime/overlay/positioning`): this
 * engine's existing portal posture (checkpoint contract P4: Popconfirm rustic
 * always portals) is preserved in BOTH branches -- top-layer promotion
 * (anchor-css branch) is DOM-position-agnostic, so portaling ahead of it
 * costs nothing. Async-aware confirm handling and full ARIA dialog
 * attributes are unchanged.
 *
 * @example
 * ```tsx
 * <Popconfirm engine="rustic" title="Confirm deletion?" okType="danger"
 *   onConfirm={handleDelete}>
 *   <Button>Delete</Button>
 * </Popconfirm>
 * ```
 */
import React, { useState, useEffect, useCallback } from 'react';
import type { PopconfirmProps } from '../../contracts';
import { POPCONFIRM_DEFAULTS, POPCONFIRM_TO_OVERLAY_PLACEMENT } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
} from '../../../../runtime/overlay/positioning';

/**
 * Popconfirm implementation using pure inline CSS, portaled through the
 * shared portal root and positioned by the shared overlay runtime.
 *
 * The confirm handler is async-aware: if it returns a Promise, the button
 * enters a loading state automatically. Button colours are resolved from DS
 * semantic tokens (--ds-popconfirm-*).
 *
 * @param props - {@link PopconfirmProps} shared across all engines.
 * @returns A ref-forwarded inline-block trigger plus a portal-rendered, positioned panel.
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
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Dismiss when clicking outside both the anchor and the portaled panel.
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          anchorEl &&
          !anchorEl.contains(target) &&
          (!surfaceEl || !surfaceEl.contains(target))
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
    }, [isOpen, anchorEl, surfaceEl, handleOpenChange]);

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

    // The trigger is the anchor; the portaled panel is the positioned
    // overlay. The panel only mounts while open, so element presence drives
    // the positioning lifecycle.
    const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
      anchor: anchorEl,
      overlay: surfaceEl,
      placement: POPCONFIRM_TO_OVERLAY_PLACEMENT[placement ?? 'top'],
      flip: true,
    });

    // Confirm-button chrome per okType lives in the skin, keyed on `data-ok-type`.
    const okButtonStyle: React.CSSProperties = {
      padding: 'var(--ds-popconfirm-button-padding, 6px 16px)',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: 'var(--ds-popconfirm-button-font-size, 14px)',
    };

    const panelContent = isOpen ? (
      <Portal>
        <OverlayPortalBoundary>
          <div
            ref={setSurfaceEl}
            role="dialog"
            aria-modal="true"
            data-part="surface"
            data-open="true"
            data-placement={placement}
            data-ds-position-strategy={strategy}
            className={`rottay-popconfirm--rustic ${overlayClassName || ''}`}
            style={{
              zIndex: 'var(--ds-popconfirm-z-index, 1050)' as unknown as number,
              padding: 'var(--ds-popconfirm-padding, 16px)',
              minWidth: 'var(--ds-popconfirm-min-width, 220px)',
              maxWidth: 'var(--ds-popconfirm-max-width, 350px)',
              ...overlayStyle,
              // Positioning keys come from the shared overlay runtime and
              // spread last so they win over a caller's overlayStyle.
              ...positionStyle,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              {icon && (
                <span data-part="icon" style={{ marginTop: '2px' }}>
                  {icon}
                </span>
              )}
              <div style={{ flex: 1 }}>
                <div data-part="title" style={{ fontWeight: 500 }}>{title}</div>
                {description && (
                  <div data-part="description" style={{ fontSize: '14px', marginTop: '4px' }}>
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
                  ...okButtonStyle,
                  opacity: loading || okButtonLoading ? 0.7 : 1,
                }}
              >
                {okText}
              </button>
            </div>
          </div>
        </OverlayPortalBoundary>
      </Portal>
    ) : null;

    return (
      <>
        <div
          ref={(node) => {
            setAnchorEl(node);
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          data-part="trigger"
          data-open={isOpen ? 'true' : 'false'}
          className={className}
          style={{ display: 'inline-block', ...style }}
          onClick={handleTriggerClick}
          {...anchorAttrs}
        >
          {children}
        </div>
        {panelContent}
      </>
    );
  }
);

Popconfirm.displayName = 'Popconfirm.Rustic';

export default Popconfirm;
