/**
 * @fileoverview Modal Modern (Hermes) Engine - Rottay Design System.
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
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect, useCallback, useRef, useId } from 'react';
import type { ModalProps } from '../../contracts';
import { MODAL_DEFAULTS, SIZE_MAP, RADIUS_MAP, PADDING_MAP } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { useModalInertSiblings } from '../../../../runtime/overlay/focus-management/inert-siblings';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { usePresence } from '@/graphics/motion/react/runtime';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';

// ============================================================================
// Constants
// ============================================================================

/** Premium size widths that override the generic SIZE_MAP for this engine. */
const PREMIUM_SIZE_MAP: Record<string, string> = {
  xs: '360px',
  sm: '440px',
  md: '560px',
  lg: '720px',
  xl: '900px',
  '2xl': '960px',
  '3xl': '1120px',
  '4xl': '1280px',
  '5xl': '1440px',
  full: '95vw',
};

/** Shared overlay motion duration. */
const MOTION_DURATION = 'var(--ds-motion-normal)';
const MOTION_EASING = 'var(--ds-motion-ease-out)';

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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        flexShrink: 0,
        transition: `background-color var(--ds-motion-fast) ${MOTION_EASING}`,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
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
  const { t } = useTranslation('components');

  const { isMobile } = useBreakpoints();

  const {
    open,
    onClose,
    children,
    size = MODAL_DEFAULTS.size,
    title,
    description,
    header,
    footer,
    closeOnBackdropClick = MODAL_DEFAULTS.closeOnBackdropClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape,
    closable = MODAL_DEFAULTS.closable,
    showBackdrop = MODAL_DEFAULTS.showBackdrop,
    blurBackdrop = MODAL_DEFAULTS.blurBackdrop,
    placement = MODAL_DEFAULTS.placement,
    fullScreen = false,
    adaptiveFullscreen = MODAL_DEFAULTS.adaptiveFullscreen,
    preventScroll = MODAL_DEFAULTS.preventScroll,
    radius = MODAL_DEFAULTS.radius,
    shadow = MODAL_DEFAULTS.shadow,
    padding = MODAL_DEFAULTS.padding,
    // This engine's header border is unconditional: both branches of its
    // `divider` ternary resolved to the same value, so the prop paints nothing.
    divider: _divider = MODAL_DEFAULTS.divider,
    zIndex = MODAL_DEFAULTS.zIndex,
    disableAnimation: _disableAnimation = MODAL_DEFAULTS.disableAnimation,
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

  /** Whether the modal should render as fullscreen on the current viewport. */
  const isAdaptiveFullscreen = !fullScreen && adaptiveFullscreen && isMobile;

  // overlay.modal recipe (motion canon): durations/geometry for the panel and
  // backdrop keyframes resolve from the stamped `--ds-recipe-*` variables.
  // Under reduced motion the resolver returns the settled state and this
  // engine declares NO animation at all, so usePresence unmounts immediately.
  const overlayMotion = useMotionRecipePresentation('overlay.modal');
  const motionIsFinal = overlayMotion.recipe.state === 'final';

  const dialogRef = useRef<HTMLDialogElement>(null);

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

  // -- ESC key ----------------------------------------------------------------

  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && open) {
        e.preventDefault();
        onClose();
      }
    },
    [closeOnEscape, open, onClose],
  );

  // Open the native <dialog> when `open` becomes true. Closing it is
  // deliberately NOT symmetric here -- see the usePresence onExitComplete
  // above, which calls dialog.close() only after the CSS exit animation
  // finishes, not synchronously with `open` flipping false.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    }
  }, [open]);

  useEffect(() => {
    if (open && closeOnEscape) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [open, closeOnEscape, handleEscKey]);

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
    if (e.target === e.currentTarget && closeOnBackdropClick && closable !== false) {
      onClose();
    }
  };

  const handleDialogClose = () => {
    if (open) onClose();
  };

  // -- derived values ---------------------------------------------------------

  /** Whether the panel should behave as fullscreen (explicit or adaptive). */
  const effectiveFullscreen = fullScreen || isAdaptiveFullscreen;

  const panelWidth = effectiveFullscreen
    ? '100vw'
    : PREMIUM_SIZE_MAP[size] || SIZE_MAP[size] || PREMIUM_SIZE_MAP.md;

  const panelRadius = effectiveFullscreen
    ? '0'
    : RADIUS_MAP[radius] || 'var(--ds-radius-lg)';

  const contentPadding = PADDING_MAP[padding] || PADDING_MAP.lg;

  // Stays mounted while the exit animation plays (usePresence); only unmounts
  // once dataState has been 'closed' long enough for that animation to finish.
  if (!shouldRender) return null;

  return (
    <Portal>
      <dialog
        ref={dialogRef}
        id={id}
        data-testid={dataTestId}
        data-part="root"
        className={`rottay-modal rottay-modal--modern rottay-overlay-modal-shell--modern ${className}`}
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
            : placement === 'top' ? 'flex-start' : placement === 'bottom' ? 'flex-end' : 'center',
          justifyContent: isAdaptiveFullscreen ? 'stretch' : 'center',
          paddingTop: isAdaptiveFullscreen ? undefined : placement === 'top' ? '10vh' : undefined,
          paddingBottom: isAdaptiveFullscreen ? undefined : placement === 'bottom' ? '10vh' : undefined,
          zIndex,
        }}
        onClick={handleBackdropClick}
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
          data-fullscreen={effectiveFullscreen ? 'true' : 'false'}
          data-adaptive-fullscreen={isAdaptiveFullscreen ? 'true' : 'false'}
          data-shadow={shadow ? 'true' : 'false'}
          role="document"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: isAdaptiveFullscreen ? 'fixed' : 'relative',
            ...(isAdaptiveFullscreen ? { top: 0, left: 0 } : {}),
            width: panelWidth,
            height: isAdaptiveFullscreen ? '100dvh' : undefined,
            maxWidth: effectiveFullscreen ? 'none' : '90vw',
            maxHeight: effectiveFullscreen ? 'none' : '85vh',
            display: 'flex',
            flexDirection: 'column',
            // The radius folds a size enum (RADIUS_MAP) and the fullscreen
            // override into one value; the skin reads it (not a paint key).
            ['--ds-overlay-modal-radius' as any]: panelRadius,
            animation: isAdaptiveFullscreen || motionIsFinal
              ? undefined
              : dataState === 'open'
                ? `ds-overlay-modal-enter-modern var(--ds-recipe-enter, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`
                : `ds-overlay-modal-exit-modern var(--ds-recipe-exit, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`,
            overflow: 'hidden',
            ...style,
          }}
        >
          {/* ---- Header ---- */}
          {(title || description || header || closable) && (
            <div
              data-part="header"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 24px',
                flexShrink: 0,
              }}
            >
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                {header || (
                  <>
                    {title && (
                      <div
                        id={titleId}
                        data-part="title"
                        style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: '24px',
                        }}
                      >
                        {title}
                      </div>
                    )}
                    {description && (
                      <div
                        id={descriptionId}
                        data-part="description"
                        style={{
                          fontSize: '13px',
                          lineHeight: '18px',
                          marginTop: title ? '2px' : undefined,
                        }}
                      >
                        {description}
                      </div>
                    )}
                  </>
                )}
              </div>
              {closable && (
                <CloseButton onClick={onClose} label={t('modal.close')} />
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

          {/* ---- Footer ---- */}
          {footer && (
            <div
              data-part="footer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                padding: '16px 24px',
                flexShrink: 0,
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </dialog>
    </Portal>
  );
}

ModernModal.displayName = 'ModernModal';
