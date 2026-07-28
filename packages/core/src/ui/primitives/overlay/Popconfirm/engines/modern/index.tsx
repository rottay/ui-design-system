'use client';

/**
 * @fileoverview Modern (Token-driven/Tailwind) engine for the Popconfirm overlay component.
 * Stamps `data-part` anatomy and owns behavior (async-aware confirm handling
 * with auto-loading state, click-outside dismissal, shared overlay
 * positioning); all paint lives in the `popconfirm.css` modern skin.
 *
 * @remarks
 * **Positioning:**
 * - `useOverlayPosition` resolves the strategy per instance: `anchor-css`
 *   promotes the panel to the top layer (popover + CSS anchor positioning)
 *   in place; `js` pins it at a measured fixed position. Both branches keep
 *   the panel in-tree as a child of the trigger wrapper -- this engine never
 *   portals (checkpoint contract P4, `OverlayBatch.contract.test.tsx`); only
 *   the rustic engine portals.
 * - The trigger wrapper is the anchor; the panel stamps
 *   `data-ds-position-strategy` for e2e/debug observability.
 *
 * @example
 * ```tsx
 * <Popconfirm engine="modern" title="Remove item?" okType="danger"
 *   onConfirm={async () => await removeItem()}>
 *   <Button>Remove</Button>
 * </Popconfirm>
 * ```
 */
import React, { useState, useCallback, useEffect } from 'react';
import type { PopconfirmProps } from '../../contracts';
import { POPCONFIRM_DEFAULTS, POPCONFIRM_TO_OVERLAY_PLACEMENT } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { useOverlayPosition } from '../../../../runtime/overlay/positioning';

/**
 * Popconfirm implementation that stamps the panel anatomy; card and button
 * paint lives in the `popconfirm.css` modern skin.
 *
 * The component tracks an internal loading state that activates automatically
 * when `onConfirm` returns a Promise, disabling both buttons until the promise
 * settles. Supports controlled/uncontrolled open state and maps the unified
 * `okType` prop to `data-ok-type`, which the skin resolves to semantic token
 * fills (primary, error, ghost backgrounds).
 *
 * @param props - {@link PopconfirmProps} shared across all engines.
 * @returns A ref-forwarded relatively-positioned container with an in-tree, positioned panel.
 */
export const Popconfirm = React.forwardRef<HTMLDivElement, PopconfirmProps>(
  (props, ref) => {
    // Optional channel with an English floor: the panel renders standalone
    // (no I18nProvider) without crashing, and never echoes a raw key.
    const i18n = useOptionalTranslation('components');
    /**
     * Localized label with an English floor: when the catalogue entry has not
     * landed yet the provider echoes the full key, which must never reach the
     * UI.
     */
    const tOr = (key: string, fallback: string): string => {
      const resolved = i18n?.t(key);
      if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
      return resolved;
    };

    const {
      title,
      description,
      onConfirm,
      onCancel,
      okText: okTextProp,
      cancelText: cancelTextProp,
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

    const okText = okTextProp ?? tOr('popconfirm.ok', POPCONFIRM_DEFAULTS.okText ?? 'Yes');
    const cancelText = cancelTextProp ?? tOr('popconfirm.cancel', POPCONFIRM_DEFAULTS.cancelText ?? 'No');

    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);
    // The panel renders only after mount: `overlayCapabilities` resolves
    // false/false server-side (no CSS/HTMLElement), so a capable client's
    // first hydration pass would otherwise disagree with the server output
    // for an initially-open, controlled Popconfirm.
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Dismiss the popconfirm when clicking anywhere outside the trigger. The
    // panel renders in-tree as a descendant of the anchor, so one containment
    // check covers both.
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (anchorEl && !anchorEl.contains(event.target as Node)) {
          handleOpenChange(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, anchorEl, handleOpenChange]);

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

    // Single-panel overlay: the trigger wrapper is the anchor, the panel is
    // the positioned overlay. `overlay` is null while closed (the ref
    // callback below only attaches while the panel is mounted).
    const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
      anchor: anchorEl,
      overlay: surfaceEl,
      placement: POPCONFIRM_TO_OVERLAY_PLACEMENT[placement ?? 'top'],
      flip: true,
    });

    // Chrome (padding, min-width) is skin-owned (popconfirm.css); only the
    // z-index token channel, consumer overrides and measured positioning stay
    // inline. overlayStyle still wins over the skin via the inline cascade.
    // Positioning keys come last so they win over any caller-supplied
    // overlayStyle.
    const surfaceStyle: React.CSSProperties = {
      zIndex: 'var(--ds-z-popover)',
      ...overlayStyle,
      ...positionStyle,
    };

    return (
      <div
        ref={(node) => {
          setAnchorEl(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-part="trigger"
        data-open={isOpen ? 'true' : 'false'}
        className={`relative inline-block rottay-popconfirm--modern ${className || ''}`}
        {...anchorAttrs}
      >
        <div onClick={handleTriggerClick}>{children}</div>

        {isOpen && mounted && (
          <div
            ref={setSurfaceEl}
            data-part="surface"
            data-open="true"
            data-ds-position-strategy={strategy}
            className={overlayClassName || undefined}
            style={surfaceStyle}
          >
            <div className="flex items-start gap-2">
              {icon && <span data-part="icon">{icon}</span>}
              <div className="flex-1">
                <div data-part="title">{title}</div>
                {description && (
                  <div data-part="description">
                    {description}
                  </div>
                )}
              </div>
            </div>
            {/* Action row: alignment, rhythm and all button paint are
                skin-owned (popconfirm.css). */}
            <div data-part="footer">
              <button
                type="button"
                data-part="action"
                data-action="cancel"
                onClick={handleCancel}
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
              >
                {(loading || okButtonLoading) && <span data-part="spinner" />}
                {okText}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Popconfirm.displayName = 'Popconfirm.Modern';

export default Popconfirm;
