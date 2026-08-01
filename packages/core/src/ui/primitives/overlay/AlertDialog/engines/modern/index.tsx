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

import React, { useCallback, useEffect, useId, useState } from 'react';
import type { AlertDialogProps } from '../../contracts';
import { ALERT_DIALOG_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { ModernButton as Button } from '../../../../facade';
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
    onOpenChange,
    title,
    description,
    action,
    cancelLabel: cancelLabelProp,
    closeOnBackdropClick = ALERT_DIALOG_DEFAULTS.closeOnBackdropClick,
    className = '',
    style,
    'data-testid': dataTestId,
  } = props;

  const cancelLabel = cancelLabelProp ?? tOr('alertDialog.cancel', ALERT_DIALOG_DEFAULTS.cancelLabel);
  // APG alertdialog REQUIRES an accessible name even when the consumer omits
  // `title` (aria-labelledby stays undefined then) -- a localized floor keeps
  // the role valid instead of shipping an unnamed alert dialog.
  const untitledLabel = title ? undefined : tOr('alertDialog.untitled', 'Alert');

  // APG alertdialog: the surface's accessible name/description are the visible
  // title/description, wired by id (the consumer never wires these by hand).
  const dialogTextId = useId();
  const titleId = title ? `${dialogTextId}-title` : undefined;
  const descriptionId = description ? `${dialogTextId}-description` : undefined;

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
      {/* Unified portal anchor (P2): the lane-wide
          `[data-part='anchor']:not([class])` rule owns `display: contents`,
          so no inline style is declared here. */}
      <span ref={setAnchorEl} data-part="anchor" />
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
              {/* Geometry (fixed full-viewport box, no pointer events) lives
                  in the skin's backdrop rule next to the scrim paint. */}
              <div data-part="backdrop" />
              <div
                data-part="surface"
                data-open="true"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                aria-label={untitledLabel}
              >
                {/* Content row + copy column: layout is skin-owned (drained
                    from the former `flex gap-3 items-start` / `flex-1`
                    utilities; the ConfirmDialog content/copy grammar). */}
                <div data-part="content">
                  {/* Warning-tinted circle with the governed semantic status
                      icon (the family's shared supplier: Toast/Result); the
                      tint and geometry are skin-owned. */}
                  <div data-part="icon">
                    <StatusWarningIcon decorative size={20} />
                  </div>
                  <div data-part="copy">
                    {title && (
                      <h3 id={titleId} data-part="title">{title}</h3>
                    )}
                    {description && (
                      <p id={descriptionId} data-part="description">{description}</p>
                    )}
                  </div>
                </div>
                {/* Footer alignment and rhythm are skin-owned (data-part='footer').
                    The cancel action composes the Button primitive (ghost) — it
                    owns its chrome, states, coarse floor and forced-colors; the
                    skin only owns the footer layout. DOM order keeps the least
                    destructive control first, so the native dialog's initial
                    focus lands on it. */}
                <div data-part="footer">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-part="action"
                    data-action="cancel"
                    onClick={handleCancel}
                  >
                    {cancelLabel}
                  </Button>
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
