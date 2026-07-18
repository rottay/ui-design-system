/**
 * @fileoverview Modal Rustic (Apollo) Engine - Rottay Design System.
 * Pure inline-CSS implementation that composes Portal, Overlay, and FocusTrap
 * utilities for accessible modal behavior with zero external CSS dependencies.
 * All visual theming is driven by CSS custom properties (--ds-*).
 *
 * @example
 * ```tsx
 * <Modal engine="rustic" open={open} onClose={close} title="Settings" size="lg">
 *   <SettingsPanel />
 * </Modal>
 * ```
 *
 * Wave 4: Adaptive fullscreen on mobile -- modals automatically expand to
 * fill the viewport on screens < 640px for a native app-like experience.
 * Controlled via the `adaptiveFullscreen` prop (default: true).
 *
 * @module Modal/Engines/Rustic
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect, useCallback, useId } from 'react';
import type { ModalProps } from '../../contracts';
import { MODAL_DEFAULTS, SIZE_MAP, MAX_HEIGHT_MAP, PADDING_MAP, RADIUS_MAP } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { Overlay } from '../../../../runtime/overlay/backdrop';
import { FocusTrap } from '../../../../runtime/overlay/focus-management/focus-trap';
import { useModalInertSiblings } from '../../../../runtime/overlay/focus-management/inert-siblings';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';

/**
 * Rustic engine implementation of Modal using vanilla HTML/CSS.
 *
 * Composes three internal utilities -- Portal (DOM insertion), Overlay
 * (backdrop + blur), and FocusTrap (keyboard loop) -- to achieve accessible
 * modal behavior without any UI library. Supports scrollbar compensation,
 * scale/opacity entrance animation via inline transition, and lifecycle
 * callbacks (onOpen, onOpenChange).
 *
 * @param props - Modal configuration props
 * @returns Portaled modal dialog with focus trap and overlay, or null when closed
 */
export default function RusticModal(props: ModalProps): React.ReactElement | null {
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
    onOpen,
    onOpenChange,
    preventScroll = MODAL_DEFAULTS.preventScroll,
    radius = MODAL_DEFAULTS.radius,
    shadow = MODAL_DEFAULTS.shadow,
    padding = MODAL_DEFAULTS.padding,
    divider = MODAL_DEFAULTS.divider,
    zIndex = MODAL_DEFAULTS.zIndex,
    disableAnimation = MODAL_DEFAULTS.disableAnimation,
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

  // overlay.modal recipe (motion canon): the surface transition's timing
  // resolves from the stamped `--ds-recipe-*` variables; under reduced motion
  // the resolver returns the settled state and the transition is dropped.
  const overlayMotion = useMotionRecipePresentation('overlay.modal');
  const motionIsFinal = overlayMotion.recipe.state === 'final';

  useModalInertSiblings(open);

  /** Whether the panel should behave as fullscreen (explicit or adaptive). */
  const effectiveFullscreen = fullScreen || isAdaptiveFullscreen;

  // Handle ESC key
  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && open) {
        onClose();
      }
    },
    [closeOnEscape, open, onClose]
  );

  // Lock body scroll and compensate for disappearing scrollbar to prevent layout shift
  useEffect(() => {
    if (!preventScroll) return;

    if (open) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [open, preventScroll]);

  // Handle ESC key listener
  useEffect(() => {
    if (open && closeOnEscape) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [open, closeOnEscape, handleEscKey]);

  // Notify consumers of open/close transitions for side-effect coordination
  useEffect(() => {
    if (open) {
      onOpen?.();
      onOpenChange?.(true);
    } else {
      onOpenChange?.(false);
    }
  }, [open, onOpen, onOpenChange]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  // Placement affects vertical alignment within the full-screen flex container
  const getPlacementStyles = (): React.CSSProperties => {
    if (isAdaptiveFullscreen) {
      return { alignItems: 'stretch' };
    }
    switch (placement) {
      case 'top':
        return { alignItems: 'flex-start', paddingTop: '10vh' };
      case 'bottom':
        return { alignItems: 'flex-end', paddingBottom: '10vh' };
      case 'center':
      default:
        return { alignItems: 'center' };
    }
  };

  // Modal container styles
  const modalContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: isAdaptiveFullscreen ? 'stretch' : 'center',
    width: '100%',
    height: '100%',
    ...(isAdaptiveFullscreen
      ? { padding: 0 }
      : {
          paddingTop: '20px',
          paddingRight: '20px',
          paddingBottom: '20px',
          paddingLeft: '20px',
        }),
    boxSizing: 'border-box',
    ...getPlacementStyles(),
  };

  // Entrance animation: scale(0.95)->scale(1) + opacity(0)->opacity(1) driven by CSS transition
  const modalStyle: React.CSSProperties = {
    position: isAdaptiveFullscreen ? 'fixed' : 'relative',
    ...(isAdaptiveFullscreen ? { top: 0, left: 0 } : {}),
    display: 'flex',
    flexDirection: 'column',
    width: effectiveFullscreen ? '100vw' : SIZE_MAP[size] || SIZE_MAP.md,
    height: isAdaptiveFullscreen ? '100dvh' : undefined,
    maxWidth: effectiveFullscreen ? 'none' : '90vw',
    maxHeight: effectiveFullscreen ? 'none' : MAX_HEIGHT_MAP[size] || MAX_HEIGHT_MAP.md,
    // The radius folds a size enum (RADIUS_MAP) and the fullscreen override into
    // one value; the skin reads it (not a paint key).
    ['--ds-overlay-modal-radius' as any]: effectiveFullscreen ? '0' : RADIUS_MAP[radius] || RADIUS_MAP.lg,
    overflow: 'hidden',
    cursor: 'default',
    opacity: isAdaptiveFullscreen ? 1 : open ? 1 : 0,
    ...overlayMotion.variables,
    transition: isAdaptiveFullscreen || disableAnimation || motionIsFinal
      ? 'none'
      : 'transform var(--ds-recipe-enter, 0.3s) var(--ds-recipe-curve, cubic-bezier(0.16, 1, 0.3, 1)), opacity var(--ds-recipe-enter, 0.3s) var(--ds-recipe-curve, cubic-bezier(0.16, 1, 0.3, 1))',
    ...style,
  };

  // Header styles
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: PADDING_MAP[padding] || PADDING_MAP.lg,
    flexShrink: 0,
  };

  // Title styles
  const titleStyle: React.CSSProperties = {
    flex: 1,
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: 1.4,
  };

  // Body styles
  const bodyStyle: React.CSSProperties = {
    flex: 1,
    padding: PADDING_MAP[padding] || PADDING_MAP.lg,
    overflowY: 'auto',
    overflowX: 'hidden',
    fontSize: '14px',
    lineHeight: 1.6,
  };

  // Footer styles
  const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: PADDING_MAP[padding] || PADDING_MAP.lg,
    flexShrink: 0,
  };

  // Close button styles
  const closeButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    flexShrink: 0,
  };

  // Don't render if not open
  if (!open) return null;

  return (
    <Portal>
      <Overlay
        visible={open && showBackdrop}
        onClick={handleBackdropClick}
        clickable={closeOnBackdropClick}
        blur={blurBackdrop !== false}
        blurAmount={blurBackdrop ? 8 : 4}
        zIndex={zIndex}
        disableAnimation={disableAnimation}
      >
        <div style={modalContainerStyle}>
          <FocusTrap active={open} autoFocus restoreFocus>
            <div
              id={id}
              data-testid={dataTestId}
              data-part="surface"
              data-open="true"
              {...overlayMotion.attributes}
              data-fullscreen={effectiveFullscreen ? 'true' : 'false'}
              data-adaptive-fullscreen={isAdaptiveFullscreen ? 'true' : 'false'}
              data-shadow={shadow ? 'true' : 'false'}
              className={`rottay-modal rottay-modal--rustic rottay-modal--${size} rottay-overlay-modal-shell--rustic ${className}`}
              style={modalStyle}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-labelledby={!ariaLabel && title && !header ? titleId : undefined}
              aria-describedby={ariaDescribedBy || (description ? descriptionId : undefined)}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || header || closable) && (
                <div data-part="header" data-divider={divider ? 'true' : 'false'} style={headerStyle}>
                  <div data-part="title" style={titleStyle}>
                    {header || (
                      title && <span id={titleId}>{title}</span>
                    )}
                  </div>
                  {closable && (
                    <button
                      type="button"
                      data-part="close-button"
                      style={closeButtonStyle}
                      onClick={onClose}
                      aria-label={t('modal.close')}
                    >
                      <svg
                        width={18}
                        height={18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div data-part="body" style={bodyStyle}>
                {description && (
                  <p
                    id={descriptionId}
                    data-part="description"
                    style={{
                      marginTop: 0,
                    }}
                  >
                    {description}
                  </p>
                )}
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div data-part="footer" data-divider={divider ? 'true' : 'false'} style={footerStyle}>
                  {footer}
                </div>
              )}
            </div>
          </FocusTrap>
        </div>
      </Overlay>
    </Portal>
  );
}

RusticModal.displayName = 'RusticModal';
