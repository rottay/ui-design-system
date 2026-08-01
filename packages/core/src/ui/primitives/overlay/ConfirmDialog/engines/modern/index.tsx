/**
 * @fileoverview Modern (token-driven) engine for the ConfirmDialog overlay component.
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

import React, { useCallback, useEffect, useId, useState } from 'react';
import type { ConfirmDialogProps, ConfirmDialogVariant } from '../../contracts';
import { CONFIRM_DIALOG_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { ModernButton as Button } from '../../../../facade';
import { Portal } from '../../../../runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../../runtime/overlay/portal-scope';
import { TopLayerHostProvider } from '../../../../runtime/overlay/top-layer-host';
import { useModalInertSiblings } from '../../../../runtime/overlay/focus-management/inert-siblings';
import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';

/**
 * Maps each variant to its governed semantic status role (the icon facade
 * owns sizing/stroke, tenant icon treatment and telemetry). Decorative: the
 * variant tone is reinforcement; the title carries the accessible name.
 * The former component-local inline SVG roots are retired from the local-SVG
 * queue -- these three roles are their exact semantic equivalents.
 */
const VARIANT_ICON_MAP: Record<ConfirmDialogVariant, React.ReactNode> = {
  info: <StatusInfoIcon decorative size={24} />,
  warning: <StatusWarningIcon decorative size={24} />,
  danger: <StatusErrorIcon decorative size={24} />,
};

/**
 * Maps each variant to the composed Button's tone (AlertDialog's composition
 * grammar): the confirm action IS the Button primitive, so the semantic
 * fills, hover/press/focus states, the width-stable pending posture and the
 * forced-colors contract all come from the primitive's own skin instead of a
 * hand-built copy here.
 */
const VARIANT_BUTTON_MAP: Record<ConfirmDialogVariant, 'primary' | 'warning' | 'danger'> = {
  info: 'primary',
  warning: 'warning',
  danger: 'danger',
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

  // APG alertdialog labelling: the title/description own the accessible name
  // and description of the surface (ids are stamped only when rendered).
  const labelledById = useId();
  const titleId = title ? `${labelledById}-title` : undefined;
  const descriptionId = description ? `${labelledById}-description` : undefined;

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
      <span ref={setAnchorEl} data-part="anchor" />
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
              {/* Backdrop delegates dismiss to onCancel (always allowed, unlike
                  AlertDialog). Geometry drained to the skin (Pass-2 P0, the
                  AlertDialog drain's parity): full-viewport absolute, click-transparent. */}
              <div data-part="scrim" />
              <div
                data-part="surface"
                data-open="true"
                data-variant={variant}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
              >
                <div data-part="content">
                  {displayIcon && (
                    <div data-part="icon">
                      {displayIcon}
                    </div>
                  )}
                  <div data-part="copy">
                    {title && (
                      <h3 id={titleId} data-part="title">{title}</h3>
                    )}
                    {description && (
                      <p id={descriptionId} data-part="description">{description}</p>
                    )}
                  </div>
                </div>
                {/* Action row: alignment, rhythm and narrow stacking are
                    skin-owned (confirm-dialog.css). Both actions compose the
                    Button primitive (AlertDialog's grammar) — chrome, states,
                    the coarse floor, forced-colors and the width-stable
                    pending posture (disabled + aria-busy + spinner, label
                    preserved as the accessible name) are the primitive's own.
                    DOM order keeps the least destructive control first, so
                    the native dialog's initial focus lands on it. */}
                <div data-part="footer">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-part="action"
                    data-action="cancel"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    variant={VARIANT_BUTTON_MAP[variant]}
                    size="sm"
                    data-part="action"
                    data-action="confirm"
                    data-loading={loading ? 'true' : 'false'}
                    pending={loading}
                    onClick={handleConfirm}
                  >
                    {confirmLabel}
                  </Button>
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
