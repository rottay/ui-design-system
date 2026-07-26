/**
 * @fileoverview Modern engine for the AlertDialog overlay component.
 * Renders a native `<dialog>` promoted to the browser top layer via `showModal()`,
 * portaled through the shared overlay runtime so tenant scope, focus trapping,
 * background inertness, scroll-lock, Escape routing and focus restore are owned
 * by the shared substrate instead of ad-hoc per-engine code.
 *
 * @example
 * ```tsx
 * <ModernAlertDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Revoke access?"
 *   description="All sessions will be terminated."
 *   action={<Button variant="danger" onClick={revoke}>Revoke</Button>}
 * />
 * ```
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { AlertDialogProps } from '../../contracts';
import { ALERT_DIALOG_DEFAULTS } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../../runtime/overlay/portal-scope';
import { TopLayerHostProvider } from '../../../../runtime/overlay/top-layer-host';
import { useModalInertSiblings } from '../../../../runtime/overlay/focus-management/inert-siblings';
import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';

/**
 * AlertDialog implementation on the shared overlay substrate.
 *
 * - `<Portal>` moves the dialog into `#rottay-portal-root`; `<PortalScope>`
 *   re-stamps the tenant/locale/DS-variable context of the inline anchor so
 *   white-labelled shells keep their theme inside the dialog.
 * - The native `<dialog>` + `showModal()` owns the top layer and the browser
 *   focus trap; `useModalInertSiblings` hides the page behind it.
 * - `useOverlayLayer` owns the canonical z band, the single Escape router,
 *   the scroll-lock refcount and LIFO focus restore.
 *
 * @param props - {@link AlertDialogProps} shared across all engines.
 * @returns The portaled modal element (plus an inline scope anchor), or just
 * the anchor when `open` is false.
 */
export default function ModernAlertDialog(props: AlertDialogProps): React.ReactElement {
  const {
    open,
    onOpenChange,
    title,
    description,
    action,
    cancelLabel = ALERT_DIALOG_DEFAULTS.cancelLabel,
    closeOnBackdropClick = ALERT_DIALOG_DEFAULTS.closeOnBackdropClick,
    className = '',
    style,
    'data-testid': dataTestId,
  } = props;

  // Inline anchor: the component's DOM position carries the tenant/locale
  // lineage that PortalScope re-stamps onto the portaled dialog.
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);
  const portalScope = usePortalScope(anchorEl);
  // State (not a ref): the Portal mounts the dialog one commit later, and the
  // promotion effect below must re-run when the element actually appears.
  const [dialogEl, setDialogEl] = useState<HTMLDialogElement | null>(null);

  const handleCancel = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  useModalInertSiblings(open);

  // Shared stack: canonical modal z band, single Escape router (top-most
  // blocking layer only), scroll-lock refcount and LIFO focus restore. Escape
  // always closes, matching the engine's previous behaviour.
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
  // itself are backdrop clicks. Guarded by closeOnBackdropClick (default false).
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onOpenChange?.(false);
    }
  };

  // Native close (e.g. UA-driven) routes through the same open-state contract.
  const handleDialogClose = () => {
    if (open) onOpenChange?.(false);
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
              data-part="root"
              className={`rottay-alert-dialog rottay-alert-dialog--modern ${className}`}
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
              <div
                data-part="backdrop"
                style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
              />
              <div
                data-part="surface"
                data-open="true"
                className="max-w-sm"
                role="alertdialog"
                aria-modal="true"
                style={{
                  position: 'relative',
                  padding: 'var(--ds-modal-padding, 1.5rem)',
                }}
              >
                <div className="flex gap-3 items-start">
                  {/* Error-tinted circle with inline SVG warning triangle */}
                  <div data-part="icon" className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    {title && (
                      <h3 data-part="title" className="font-bold text-lg mb-2">{title}</h3>
                    )}
                    {description && (
                      <p data-part="description" className="text-sm">{description}</p>
                    )}
                  </div>
                </div>
                {/* Footer alignment and rhythm are skin-owned (data-part='footer') */}
                <div data-part="footer">
                  <button
                    type="button"
                    data-part="action"
                    data-action="cancel"
                    style={{
                      height: 'var(--ds-control-height-sm, 36px)',
                      padding: '0 var(--ds-spacing-md, 16px)',
                      fontSize: 'var(--ds-font-size-sm, 14px)',
                      cursor: 'pointer',
                    }}
                    onClick={handleCancel}
                  >
                    {cancelLabel}
                  </button>
                  {action}
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

ModernAlertDialog.displayName = 'ModernAlertDialog';
