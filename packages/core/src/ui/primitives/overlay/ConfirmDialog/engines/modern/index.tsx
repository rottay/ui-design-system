/**
 * @fileoverview Modern (Token-driven/Tailwind) engine for the ConfirmDialog overlay component.
 * Renders a native `<dialog>` promoted to the browser top layer via `showModal()`,
 * portaled through the shared overlay runtime so tenant scope, focus trapping,
 * background inertness, scroll-lock, Escape routing and focus restore are owned
 * by the shared substrate instead of ad-hoc per-engine code.
 *
 * @example
 * ```tsx
 * <ModernConfirmDialog
 *   open={show}
 *   title="Archive project?"
 *   variant="info"
 *   onConfirm={archive}
 *   onCancel={close}
 * />
 * ```
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { ConfirmDialogProps } from '../../contracts';
import { CONFIRM_DIALOG_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Portal } from '../../../../runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../../runtime/overlay/portal-scope';
import { TopLayerHostProvider } from '../../../../runtime/overlay/top-layer-host';
import { useModalInertSiblings } from '../../../../runtime/overlay/focus-management/inert-siblings';
import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';

/** Maps each variant to an inline SVG so the component stays icon-library-free. */
const VARIANT_ICON_MAP: Record<string, React.ReactNode> = {
  info: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  danger: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

/**
 * ConfirmDialog implementation on the shared overlay substrate.
 *
 * Same substrate as the modern AlertDialog: `<Portal>` + `<PortalScope>` for
 * tenant-safe rendering, native `<dialog>` + `showModal()` for the top layer
 * and focus trap, `useModalInertSiblings` for background inertness, and
 * `useOverlayLayer` for the canonical z band (replacing the ad-hoc
 * `var(--ds-z-modal)`), Escape routing, scroll-lock and focus restore.
 * Escape and backdrop clicks dismiss via `onCancel` (engine parity with
 * rustic, which already closed on Escape).
 *
 * @param props - {@link ConfirmDialogProps} shared across all engines.
 * @returns The portaled modal element (plus an inline scope anchor), or just
 * the anchor when `open` is false.
 */
export default function ModernConfirmDialog(props: ConfirmDialogProps): React.ReactElement {
  // Optional channel with an English floor: the dialog renders standalone
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
    open,
    title,
    description,
    confirmLabel: confirmLabelProp,
    cancelLabel: cancelLabelProp,
    onConfirm,
    onCancel,
    variant = CONFIRM_DIALOG_DEFAULTS.variant,
    icon,
    loading = CONFIRM_DIALOG_DEFAULTS.loading,
    className = '',
    style,
    'data-testid': dataTestId,
  } = props;

  const confirmLabel = confirmLabelProp ?? tOr('confirmDialog.confirm', CONFIRM_DIALOG_DEFAULTS.confirmLabel);
  const cancelLabel = cancelLabelProp ?? tOr('confirmDialog.cancel', CONFIRM_DIALOG_DEFAULTS.cancelLabel);

  // Allow consumers to override the default variant icon
  const displayIcon = icon || VARIANT_ICON_MAP[variant];

  // Inline anchor: the component's DOM position carries the tenant/locale
  // lineage that PortalScope re-stamps onto the portaled dialog.
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);
  const portalScope = usePortalScope(anchorEl);
  // State (not a ref): the Portal mounts the dialog one commit later, and the
  // promotion effect below must re-run when the element actually appears.
  const [dialogEl, setDialogEl] = useState<HTMLDialogElement | null>(null);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  useModalInertSiblings(open);

  // Shared stack: canonical modal z band, single Escape router (top-most
  // blocking layer only), scroll-lock refcount and LIFO focus restore.
  // Escape dismisses via onCancel (parity with the rustic engine).
  const { layerProps } = useOverlayLayer({
    kind: 'modal',
    active: open,
    modal: true,
    lockScroll: true,
    restoreFocus: true,
    onEscape: handleCancel,
  });

  // Promote to the native top layer while open. Unmounting on close releases
  // it; the layer-stack restores focus to the previously focused element.
  useEffect(() => {
    if (!dialogEl) return;
    if (open && !dialogEl.open) {
      dialogEl.showModal();
    }
  }, [open, dialogEl]);

  // `showModal()` puts this dialog in the browser TOP LAYER, which paints
  // above every normal-flow node regardless of z-index. A descendant overlay
  // portaling to the shared `#rottay-portal-root` would land there as a
  // SIBLING of this dialog and be occluded. Publishing a host INSIDE the
  // dialog keeps those overlays in the same top-layer subtree; `display:
  // contents` keeps it out of the dialog's flex layout so it adds no box.
  const [topLayerHost, setTopLayerHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!open || !dialogEl) {
      setTopLayerHost(null);
      return;
    }
    const host = document.createElement('div');
    host.setAttribute('data-rottay-toplayer-host', 'true');
    host.style.display = 'contents';
    dialogEl.appendChild(host);
    setTopLayerHost(host);
    return () => {
      host.remove();
      setTopLayerHost(null);
    };
  }, [open, dialogEl]);

  // The dialog box spans the viewport; clicks landing on the dialog element
  // itself are backdrop clicks and dismiss via onCancel (always allowed,
  // unlike AlertDialog).
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      onCancel?.();
    }
  };

  // Native close (e.g. UA-driven) routes through the same cancel contract.
  const handleDialogClose = () => {
    if (open) onCancel?.();
  };

  return (
    <>
      <span ref={setAnchorEl} data-part="anchor" style={{ display: 'contents' }} />
      {open ? (
        <Portal>
          <PortalScope snapshot={portalScope}>
            <TopLayerHostProvider host={topLayerHost}>
            <dialog
              ref={setDialogEl}
              {...layerProps}
              data-part="backdrop"
              className={`rottay-confirm-dialog--modern ${className}`}
              style={{
                /* Reset native dialog styling: full-viewport flex container */
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                maxWidth: '100vw',
                maxHeight: '100vh',
                margin: 0,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...layerProps.style,
                ...style,
              }}
              data-testid={dataTestId}
              onClick={handleBackdropClick}
              onClose={handleDialogClose}
            >
              {/* Backdrop delegates dismiss to onCancel (always allowed, unlike AlertDialog) */}
              <div
                data-part="scrim"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              />
              <div
                data-part="surface"
                data-open="true"
                data-variant={variant}
                role="alertdialog"
                aria-modal="true"
                style={{ position: 'relative' }}
              >
                <div className="flex gap-3">
                  {displayIcon && (
                    <div data-part="icon" className="flex-shrink-0 mt-0.5">
                      {displayIcon}
                    </div>
                  )}
                  <div className="flex-1">
                    {title && (
                      <h3 data-part="title">{title}</h3>
                    )}
                    {description && (
                      <p data-part="description">{description}</p>
                    )}
                  </div>
                </div>
                {/* Action row: alignment, rhythm and all button paint are
                    skin-owned (confirm-dialog.css). */}
                <div data-part="footer">
                  <button
                    type="button"
                    data-part="action"
                    data-action="cancel"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    data-part="action"
                    data-action="confirm"
                    data-loading={loading ? 'true' : 'false'}
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading && <span data-part="spinner" />}
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </dialog>
          </TopLayerHostProvider>
          </PortalScope>
        </Portal>
      ) : null}
    </>
  );
}

ModernConfirmDialog.displayName = 'ModernConfirmDialog';
