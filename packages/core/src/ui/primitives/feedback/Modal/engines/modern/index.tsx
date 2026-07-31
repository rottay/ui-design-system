/**
 * @fileoverview Canonical Modal Modern Engine - Rottay Design System.
 * Premium overlay modal using the native HTML <dialog> element for built-in
 * top-layer stacking and browser focus trapping. Features backdrop blur,
 * scale+opacity entrance animation, scrollbar-width compensation, and
 * polished header/body/footer sections with DS token-driven styling.
 *
 * Wave 2B: Unified overlay family visual language -- shared backdrop, surface,
 * border, and motion tokens with Drawer and Sheet modern engines.
 *
 * Wave 4: Adaptive fullscreen on mobile -- modals automatically expand to
 * fill the viewport on screens < 640px for a native app-like experience.
 * Controlled via the `adaptiveFullscreen` prop (default: true).
 *
 * @module Modal/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect, useState, useCallback, useRef, useId } from 'react';
import type { ModalProps } from '../../contracts';
import { MODAL_DEFAULTS, PADDING_MAP } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { TopLayerHostProvider } from '../../../../runtime/overlay/top-layer-host';
import { useModalInertSiblings } from '../../../../runtime/overlay/focus-management/inert-siblings';
import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { usePhoneBreakpoint } from '@/infrastructure/runtime/responsive/composition/react/provider/phone-state';
import { usePresence } from '@/graphics/motion/react/runtime';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';

// ============================================================================
// Constants
// ============================================================================

/** Shared overlay motion duration. */
const MOTION_DURATION = 'var(--ds-motion-normal)';
const MOTION_EASING = 'var(--ds-motion-ease-out)';

const RADIUS_MAP = {
  none: '0',
  sm: 'var(--ds-radius-sm)',
  md: 'var(--ds-radius-md)',
  lg: 'var(--ds-radius-lg)',
  xl: 'var(--ds-radius-xl)',
} as const;

function getOverlayBackground(overlayOpacity: number): string {
  const clampedPercent = Math.min(Math.max(overlayOpacity, 0), 1) * 100;
  return `color-mix(in srgb, var(--ds-color-black) ${clampedPercent}%, transparent)`;
}

/**
 * Calculate scrollbar width for body padding compensation.
 */
function getScrollbarWidth(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

// ============================================================================
// Close Button (shared visual)
// ============================================================================

function CloseButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      data-part="close-button"
      onClick={onClick}
      aria-label={label}
    >
      <ActionCloseIcon decorative size={16} />
    </button>
  );
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modern engine implementation of Modal using the native <dialog> API.
 * Leverages showModal()/close() for built-in top-layer stacking and browser
 * focus trapping. Compensates for scrollbar layout shift.
 */
export default function ModernModal(props: ModalProps): React.ReactElement | null {
  // Optional channel with an English floor: the modal renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');

  const isMobile = usePhoneBreakpoint();

  const {
    open = false,
    onClose,
    onOpenChange,
    onCancel,
    onOk,
    children,
    size = MODAL_DEFAULTS.size ?? 'md',
    title,
    description,
    header,
    footer,
    hideFooter = false,
    okText,
    cancelText,
    confirmLoading = false,
    closeOnOverlayClick = MODAL_DEFAULTS.closeOnOverlayClick,
    closeOnBackdropClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape ?? true,
    closable = MODAL_DEFAULTS.closable ?? true,
    showBackdrop = MODAL_DEFAULTS.showBackdrop ?? true,
    overlayOpacity,
    blurBackdrop = MODAL_DEFAULTS.blurBackdrop ?? false,
    centered = MODAL_DEFAULTS.centered ?? true,
    placement = 'center',
    fullScreen = false,
    adaptiveFullscreen = MODAL_DEFAULTS.adaptiveFullscreen ?? true,
    preventScroll = MODAL_DEFAULTS.preventScroll ?? true,
    radius = MODAL_DEFAULTS.radius ?? 'lg',
    shadow = MODAL_DEFAULTS.shadow ?? true,
    padding = MODAL_DEFAULTS.padding ?? 'lg',
    divider = MODAL_DEFAULTS.divider ?? false,
    zIndex,
    disableAnimation = MODAL_DEFAULTS.disableAnimation ?? false,
    className = '',
    style = {},
    id,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = props;
  const generatedLabelId = useId();
  const titleId = `${id || generatedLabelId}-title`;
  const descriptionId = `${id || generatedLabelId}-description`;
  const backdropClosable = closeOnBackdropClick ?? closeOnOverlayClick ?? true;
  const effectivePlacement = placement === 'center' && !centered ? 'top' : placement;
  const resolvedOkText = okText ?? i18n?.tOr('ok', 'OK') ?? 'OK';
  const resolvedCancelText = cancelText ?? i18n?.tOr('cancel', 'Cancel') ?? 'Cancel';

  /** Whether the modal should render as fullscreen on the current viewport. */
  const isAdaptiveFullscreen = !fullScreen && adaptiveFullscreen && isMobile;

  // overlay.modal recipe (motion canon): durations/geometry for the panel and
  // backdrop keyframes resolve from the stamped `--ds-recipe-*` variables.
  // Under reduced motion the resolver returns the settled state and this
  // engine declares NO animation at all, so usePresence unmounts immediately.
  const overlayMotion = useMotionRecipePresentation('overlay.modal');
  const motionIsFinal = disableAnimation || overlayMotion.recipe.state === 'final';

  const handleCancel = useCallback(() => {
    onClose?.();
    onCancel?.();
    onOpenChange?.(false);
  }, [onClose, onCancel, onOpenChange]);

  const dialogRef = useRef<HTMLDialogElement>(null);

  // The <dialog> mounts inside <Portal>, which renders null until its own
  // mount effect resolves a container, so the element does not exist on the
  // commit where `open` first becomes true. A plain ref cannot express that:
  // it would still be null when an `[open]`-keyed effect runs, and nothing
  // afterwards would retrigger it. A callback ref turns "the element
  // attached" into a render-visible signal that the effects below can depend
  // on. `dialogRef` stays as the imperative handle for callbacks that read
  // the element outside render (usePresence's onExitComplete).
  const [dialogEl, setDialogEl] = useState<HTMLDialogElement | null>(null);
  const attachDialog = useCallback((node: HTMLDialogElement | null) => {
    dialogRef.current = node;
    setDialogEl(node);
  }, []);

  // Presence: `open` flipping false keeps the dialog mounted and open in the
  // native top layer until the PANEL's own exit animation (ref'd below)
  // finishes; only then does the dialog actually leave the top layer (see
  // onExitComplete). This is what lets the panel/backdrop fade+scale out
  // instead of the native <dialog> disappearing the instant `open` changes.
  const { shouldRender, dataState, ref: presenceRef } = usePresence(open, {
    onExitComplete: () => {
      if (dialogRef.current?.open) dialogRef.current.close();
    },
  });

  useModalInertSiblings(shouldRender);

  // Overlay stack participation for canonical z-index + nested stacking. This
  // is the static-zIndex seam only (modal: false) -- this engine keeps its own
  // Escape and scroll-lock handling; the manager just supplies the z band and
  // stack offset. An explicit `zIndex` prop still wins. MODAL_DEFAULTS.zIndex
  // stays exported for API stability.
  const overlayLayer = useOverlayLayer({
    kind: 'modal',
    active: open,
    modal: false,
    lockScroll: false,
    restoreFocus: false,
  });
  const resolvedZIndex = zIndex ?? overlayLayer.zIndex;

  // Open the native <dialog> when `open` becomes true. Keyed on `dialogEl`,
  // not on `open` alone: the element arrives a commit after `open` flips, so
  // an `[open]`-only effect would run against a null ref and never fire again
  // -- the dialog would stay out of the top layer for its whole lifetime.
  // The `!dialog.open` guard keeps promotion single: showModal() on an
  // already-open dialog throws InvalidStateError, and re-opening during the
  // exit animation must not re-promote a dialog that never left.
  // Closing is deliberately NOT symmetric here -- see the usePresence
  // onExitComplete above, which calls dialog.close() only after the CSS exit
  // animation finishes, not synchronously with `open` flipping false.
  useEffect(() => {
    const dialog = dialogEl;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    }
  }, [open, dialogEl]);

  // `showModal()` promotes this dialog into the browser TOP LAYER, which
  // paints above every normal-flow node regardless of z-index. A descendant
  // overlay portaling to the shared `#rottay-portal-root` would land there as
  // a SIBLING of this dialog and be occluded. Publishing a host INSIDE the
  // dialog keeps those overlays in the same top-layer subtree; `display:
  // contents` keeps the host out of the dialog's flex layout so it adds no
  // box. Descendants resolve it through React context, so no component needs
  // to plumb an anchor.
  const [topLayerHost, setTopLayerHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // Gated on `shouldRender` as well as `open`: usePresence keeps the dialog
    // mounted through the exit animation, so the host must be withdrawn as
    // soon as the modal stops being the active top layer.
    const dialog = dialogEl;
    if (!open || !shouldRender || !dialog) {
      setTopLayerHost(null);
      return;
    }
    const host = document.createElement('div');
    host.setAttribute('data-rottay-toplayer-host', 'true');
    host.style.display = 'contents';
    dialog.appendChild(host);
    setTopLayerHost(host);
    return () => {
      host.remove();
      setTopLayerHost(null);
    };
  }, [open, shouldRender, dialogEl]);

  // -- scroll lock with scrollbar compensation --------------------------------

  useEffect(() => {
    if (!preventScroll) return;
    // Gated on shouldRender (not `open`) so the page behind stays locked
    // through the exit animation instead of becoming scrollable while the
    // modal is still visibly fading out.
    if (shouldRender) {
      const scrollbarWidth = getScrollbarWidth();
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [shouldRender, preventScroll]);

  // -- backdrop click ---------------------------------------------------------

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget && backdropClosable) {
      handleCancel();
    }
  };

  const handleDialogClose = () => {
    if (open) handleCancel();
  };

  // -- derived values ---------------------------------------------------------

  /** Whether the panel should behave as fullscreen (explicit or adaptive). */
  const effectiveFullscreen = fullScreen || isAdaptiveFullscreen;

  const panelRadius = effectiveFullscreen
    ? '0'
    : RADIUS_MAP[radius] || 'var(--ds-radius-lg)';

  const contentPadding = PADDING_MAP[padding] || PADDING_MAP.lg;
  const resolvedFooter = hideFooter
    ? null
    : footer ?? ((onOk || onCancel) ? (
      <>
        {onCancel && (
          <button
            type="button"
            data-part="action"
            data-action="cancel"
            onClick={handleCancel}
          >
            {resolvedCancelText}
          </button>
        )}
        {onOk && (
          <button
            type="button"
            data-part="action"
            data-action="ok"
            disabled={confirmLoading}
            onClick={onOk}
          >
            {resolvedOkText}
          </button>
        )}
      </>
    ) : null);

  // Stays mounted while the exit animation plays (usePresence); only unmounts
  // once dataState has been 'closed' long enough for that animation to finish.
  if (!shouldRender) return null;

  return (
    <Portal>
      {/* Inside <Portal> on purpose: the dialog's own portal must NOT resolve
          into a host that lives inside itself. Descendants still see it. */}
      <TopLayerHostProvider host={topLayerHost}>
      <dialog
        ref={attachDialog}
        id={id}
        data-testid={dataTestId}
        data-part="root"
        data-fullscreen={effectiveFullscreen ? 'true' : 'false'}
        data-adaptive-fullscreen={isAdaptiveFullscreen ? 'true' : 'false'}
        className="rottay-modal-root--modern rottay-modal rottay-modal--modern rottay-overlay-modal-shell--modern"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={!ariaLabel && title && !header ? titleId : undefined}
        aria-describedby={ariaDescribedBy || (description ? descriptionId : undefined)}
        {...overlayMotion.attributes}
        style={{
          ...overlayMotion.variables,
          /* Reset native dialog styling */
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: isAdaptiveFullscreen
            ? 'stretch'
            : effectivePlacement === 'top' ? 'flex-start' : effectivePlacement === 'bottom' ? 'flex-end' : 'center',
          justifyContent: isAdaptiveFullscreen ? 'stretch' : 'center',
          paddingTop: isAdaptiveFullscreen ? undefined : effectivePlacement === 'top' ? '10vh' : undefined,
          paddingBottom: isAdaptiveFullscreen ? undefined : effectivePlacement === 'bottom' ? '10vh' : undefined,
          zIndex: resolvedZIndex,
          // Compatibility channel retained on the semantic dialog root while
          // the canonical skin consumes `--ds-overlay-modal-radius` from the
          // surface below.
          ['--ds-modal-surface-radius' as any]: panelRadius,
        }}
        onClick={handleBackdropClick}
        onCancel={(event) => {
          event.preventDefault();
          if (closeOnEscape) handleCancel();
        }}
        onClose={handleDialogClose}
      >
        {/* ---- Backdrop ---- */}
        {showBackdrop && (
          <div
            data-part="backdrop"
            data-blur={blurBackdrop !== false ? 'true' : 'false'}
            style={{
              position: 'fixed',
              inset: 0,
              ['--ds-modal-instance-overlay-bg' as any]: overlayOpacity == null
                ? undefined
                : getOverlayBackground(overlayOpacity),
              animation: motionIsFinal
                ? undefined
                : dataState === 'open'
                  ? `ds-overlay-modal-backdrop-enter-modern var(--ds-recipe-enter, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`
                  : `ds-overlay-modal-backdrop-exit-modern var(--ds-recipe-exit, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* ---- Panel ---- */}
        <div
          ref={presenceRef}
          data-part="surface"
          data-open={dataState === 'open' ? 'true' : 'false'}
          data-size={size}
          data-fullscreen={effectiveFullscreen ? 'true' : 'false'}
          data-adaptive-fullscreen={isAdaptiveFullscreen ? 'true' : 'false'}
          data-shadow={shadow ? 'true' : 'false'}
          data-divider={divider ? 'true' : 'false'}
          data-has-header={Boolean(title || description || header || closable) ? 'true' : 'false'}
          data-has-footer={resolvedFooter ? 'true' : 'false'}
          role="document"
          onClick={(e) => e.stopPropagation()}
          className={className}
          style={{
            position: isAdaptiveFullscreen ? 'fixed' : 'relative',
            ...(isAdaptiveFullscreen ? { top: 0, left: 0 } : {}),
            display: 'flex',
            flexDirection: 'column',
            // The radius folds a size enum (RADIUS_MAP) and the fullscreen
            // override into one value; the skin reads it (not a paint key).
            ['--ds-overlay-modal-radius' as any]: panelRadius,
            ['--ds-modal-section-border' as any]: divider
              ? '1px solid var(--ds-modal-border-color, var(--ds-color-border-subtle))'
              : 'none',
            animation: isAdaptiveFullscreen || motionIsFinal
              ? undefined
              : dataState === 'open'
                ? `ds-overlay-modal-enter-modern var(--ds-recipe-enter, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`
                : `ds-overlay-modal-exit-modern var(--ds-recipe-exit, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`,
            overflow: 'hidden',
            ...style,
          }}
        >
          {/* ---- Header ----. Layout AND paint live in the modern skin
              (overlay-modal.css); the engine stamps parts only. */}
          {(title || description || header || closable) && (
            <div data-part="header">
              <div data-part="heading-group">
                {header || (
                  <>
                    {title && (
                      <div
                        id={titleId}
                        data-part="title"
                      >
                        {title}
                      </div>
                    )}
                    {description && (
                      <div
                        id={descriptionId}
                        data-part="description"
                      >
                        {description}
                      </div>
                    )}
                  </>
                )}
              </div>
              {closable && (
                <CloseButton onClick={handleCancel} label={i18n?.tOr('modal.close', 'Close') ?? 'Close'} />
              )}
            </div>
          )}

          {/* ---- Body ---- */}
          <div
            data-part="body"
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              padding: contentPadding,
            }}
          >
            {children}
          </div>

          {/* ---- Footer ----. Layout lives in the skin. */}
          {resolvedFooter && (
            <div data-part="footer">
              {resolvedFooter}
            </div>
          )}
        </div>
      </dialog>
      </TopLayerHostProvider>
    </Portal>
  );
}

ModernModal.displayName = 'ModernModal';
