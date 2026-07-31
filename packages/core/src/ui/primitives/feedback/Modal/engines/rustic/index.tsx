'use client';

/**
 * @fileoverview Modal Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Modal component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Rustic is the headless, zero-dependency engine that uses only vanilla
 * HTML, CSS, and React. It provides the smallest bundle size and maximum
 * control over styling and behavior.
 *
 * **Key Features:**
 * - Zero external dependencies (no UI library)
 * - Maximum accessibility control
 * - Smallest bundle footprint
 * - Full CSS custom property support
 * - Semantic HTML structure
 *
 * **When to Use Rustic:**
 * - When bundle size is critical
 * - For accessibility-focused applications
 * - When full styling control is needed
 * - For custom design systems built on Rottay
 * - When avoiding third-party UI libraries
 *
 * **Multi-Tenant Theming:**
 * Rustic heavily uses CSS custom properties for theming:
 * - `--ds-color-bg-elevated`: Modal background
 * - `--ds-color-border`: Border color
 * - `--ds-radius-lg`: Border radius
 *
 * **Size Styles:**
 * | Size | Max Width |
 * |------|-----------|
 * | xs | 320px |
 * | sm | 416px |
 * | md | 520px |
 * | lg | 720px |
 * | xl | 900px |
 * | full | 90vw |
 *
 * @example Basic Usage
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * <Modal engine="rustic" open={open} onClose={onClose}>
 *   <p>Vanilla-styled modal</p>
 * </Modal>
 * ```
 *
 * @example With Custom CSS Variables
 * ```tsx
 * <div style={{
 *   '--ds-color-bg-elevated': '#1a1a2e',
 *   '--ds-color-border': '#333',
 *   '--ds-radius-lg': '16px'
 * }}>
 *   <Modal engine="rustic" open={open} onClose={onClose}>
 *     Dark themed modal
 *   </Modal>
 * </div>
 * ```
 *
 * @see {@link ModalProps} - Component props interface
 * @see {@link ClassicModal} - Ant Design alternative
 * @see {@link ModernModal} - Rottay native-dialog alternative
 * @module Modal/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useCallback, useEffect, useId } from 'react';
import type { ModalProps, ModalSize } from '../../contracts';
import { MODAL_DEFAULTS } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { FocusTrap } from '../../../../runtime/overlay/focus-management/focus-trap';
import { useModalInertSiblings } from '../../../../runtime/overlay/focus-management/inert-siblings';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size style mappings for Rustic engine.
 * Uses maxWidth for responsive behavior.
 *
 * @internal
 */
const SIZE_STYLES: Record<ModalSize, { maxWidth: string; width?: string }> = {
  /** Extra small - 320px */
  xs: { maxWidth: '320px' },
  /** Small - 416px */
  sm: { maxWidth: '416px' },
  /** Medium - 520px (default) */
  md: { maxWidth: '520px' },
  /** Large - 720px */
  lg: { maxWidth: '720px' },
  /** Extra large - 900px */
  xl: { maxWidth: '900px' },
  /** 2X large - 960px */
  '2xl': { maxWidth: '960px' },
  /** 3X large - 1120px */
  '3xl': { maxWidth: '1120px' },
  /** 4X large - 1280px */
  '4xl': { maxWidth: '1280px' },
  /** 5X large - 1440px */
  '5xl': { maxWidth: '1440px' },
  /** Full width with constraint */
  full: { maxWidth: '90vw', width: '100%' },
};

const MAX_HEIGHT_STYLES: Record<ModalSize, string> = {
  xs: 'var(--ds-modal-xs-max-height, 70vh)',
  sm: 'var(--ds-modal-sm-max-height, 75vh)',
  md: 'var(--ds-modal-md-max-height, 80vh)',
  lg: 'var(--ds-modal-lg-max-height, 85vh)',
  xl: 'var(--ds-modal-xl-max-height, 90vh)',
  '2xl': 'var(--ds-modal-2xl-max-height, 90vh)',
  '3xl': 'var(--ds-modal-3xl-max-height, 90vh)',
  '4xl': 'var(--ds-modal-4xl-max-height, 90vh)',
  '5xl': 'var(--ds-modal-5xl-max-height, 90vh)',
  full: 'var(--ds-modal-full-max-height, 100vh)',
};

const PADDING_STYLES = {
  none: '0',
  sm: 'var(--ds-modal-padding-sm, 12px)',
  md: 'var(--ds-modal-padding-md, 16px)',
  lg: 'var(--ds-modal-padding-lg, 24px)',
} as const;

const RADIUS_STYLES = {
  none: '0',
  sm: 'var(--ds-modal-radius-sm, var(--ds-radius-sm))',
  md: 'var(--ds-modal-radius-md, var(--ds-radius-md))',
  lg: 'var(--ds-modal-radius-lg, var(--ds-radius-lg))',
  xl: 'var(--ds-modal-radius-xl, var(--ds-radius-xl))',
} as const;

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic Engine implementation of the Modal component.
 *
 * @description
 * Pure vanilla implementation using only HTML, CSS, and React.
 * Provides complete control over styling through CSS custom properties
 * and inline styles.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses flexbox for centering
 * - Implements body scroll lock when open
 * - Custom keyboard handling for Escape key
 * - CSS custom properties for theming
 * - Semantic HTML with ARIA attributes
 *
 * **Accessibility Features:**
 * - `role="dialog"` on modal container
 * - `aria-modal="true"` for modal behavior
 * - Close button with proper semantics
 * - Focus management via native browser behavior
 *
 * **CSS Custom Properties:**
 * | Property | Default | Description |
 * |----------|---------|-------------|
 * | `--ds-color-bg-elevated` | #fff | Modal background |
 * | `--ds-color-border` | #f0f0f0 | Border color |
 * | `--ds-radius-lg` | 8px | Border radius |
 *
 * @param props - {@link ModalProps}
 * @returns The rendered vanilla Modal or empty fragment when closed
 *
 * @example
 * ```tsx
 * <RusticModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   size="lg"
 *   title="Accessibility Settings"
 *   centered
 * >
 *   <AccessibilityForm />
 * </RusticModal>
 * ```
 */
export default function RusticModal(props: ModalProps): React.ReactElement {
  const { t } = useTranslation('components');
  const { isMobile } = useBreakpoints();
  const overlayMotion = useMotionRecipePresentation('overlay.modal');

  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Visibility
    open,

    // Layout
    size = MODAL_DEFAULTS.size as ModalSize,
    centered = MODAL_DEFAULTS.centered,
    zIndex = MODAL_DEFAULTS.zIndex,

    // Content
    title,
    header,
    children,
    footer,
    hideFooter,

    // Behavior
    onClose,
    onOpen,
    onOpenChange,
    closable = MODAL_DEFAULTS.closable,
    closeOnOverlayClick = MODAL_DEFAULTS.closeOnOverlayClick,
    closeOnBackdropClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape,
    preventScroll = MODAL_DEFAULTS.preventScroll,

    // Overlay
    overlayOpacity = MODAL_DEFAULTS.overlayOpacity,
    showBackdrop = MODAL_DEFAULTS.showBackdrop,
    blurBackdrop = MODAL_DEFAULTS.blurBackdrop,

    // Presentation
    placement = MODAL_DEFAULTS.placement,
    fullScreen = false,
    adaptiveFullscreen = MODAL_DEFAULTS.adaptiveFullscreen,
    radius = MODAL_DEFAULTS.radius,
    shadow = MODAL_DEFAULTS.shadow,
    padding = MODAL_DEFAULTS.padding,
    divider = MODAL_DEFAULTS.divider,
    disableAnimation = MODAL_DEFAULTS.disableAnimation,

    // Confirmation
    okText = 'OK',
    cancelText = 'Cancel',
    onOk,
    onCancel,
    confirmLoading,

    // Styling
    className = '',
    style,
    id,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    description,
  } = props;

  const isOpen = Boolean(open);
  const generatedId = useId();
  const titleId = `${id ?? generatedId}-title`;
  const descriptionId = `${id ?? generatedId}-description`;
  const effectiveBackdropClose = closeOnBackdropClick ?? closeOnOverlayClick;
  const adaptive = !fullScreen && adaptiveFullscreen && isMobile;
  const effectiveFullscreen = fullScreen || adaptive;
  const motionIsFinal = overlayMotion.recipe.state === 'final';

  useModalInertSiblings(isOpen);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle cancel/close action.
   * Called when X button clicked, overlay clicked, or Escape pressed.
   */
  const handleCancel = useCallback(() => {
    onClose?.();
    onCancel?.();
    onOpenChange?.(false);
  }, [onClose, onCancel, onOpenChange]);

  /**
   * Handle OK/confirm action.
   * Called when OK button is clicked.
   */
  const handleOk = useCallback(() => {
    onOk?.();
  }, [onOk]);

  // ---------------------------------------------------------------------------
  // Keyboard Handling
  // ---------------------------------------------------------------------------

  /**
   * Effect: Handle Escape key press to close modal.
   * Only active when modal is open and closeOnEscape is true.
   */
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, handleCancel]);

  useEffect(() => {
    if (isOpen) {
      onOpen?.();
      onOpenChange?.(true);
    } else {
      onOpenChange?.(false);
    }
  }, [isOpen, onOpen, onOpenChange]);

  // ---------------------------------------------------------------------------
  // Body Scroll Lock
  // ---------------------------------------------------------------------------

  /**
   * Effect: Lock body scroll when modal is open.
   * Prevents background content from scrolling while modal is visible.
   */
  useEffect(() => {
    if (!isOpen || !preventScroll) return;

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
  }, [isOpen, preventScroll]);

  // ---------------------------------------------------------------------------
  // Early Return
  // ---------------------------------------------------------------------------

  // Don't render anything when closed
  if (!isOpen) return <></>;

  // ---------------------------------------------------------------------------
  // Size Styles
  // ---------------------------------------------------------------------------

  const modalSize = size as ModalSize;

  // ---------------------------------------------------------------------------
  // Style Definitions
  // ---------------------------------------------------------------------------

  // Overlay uses fixed positioning to cover the entire viewport.
  // overflowY: 'auto' allows scrolling tall modals when content exceeds
  // viewport height. The centered prop switches between vertical centering
  // (dialogs) and top-aligned (long form modals that need scroll room).
  // overlayOpacity is configurable per instance for different visual weights.
  const resolvedPlacement =
    placement === 'center' && centered === false ? 'top' : placement;
  const placementStyle: React.CSSProperties = adaptive
    ? { alignItems: 'stretch' }
    : resolvedPlacement === 'top'
      ? { alignItems: 'flex-start', paddingTop: '10vh' }
      : resolvedPlacement === 'bottom'
        ? { alignItems: 'flex-end', paddingBottom: '10vh' }
        : { alignItems: 'center' };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Scrim alpha is per-instance, so it rides a hatch the skin composes into
    // the rgba() the overlay paints.
    '--ds-modal-scrim-opacity': overlayOpacity,
    display: 'flex',
    justifyContent: 'center',
    padding: adaptive ? 0 : '20px',
    zIndex,
    overflowY: 'auto',
    ...placementStyle,
  } as React.CSSProperties;

  // Surface paint lives in the unlayered rustic Modal skin; the three-level CSS
  // variable fallback chain (component token -> semantic token -> literal) moved
  // with it verbatim. Consumer `style` still wins as an inline declaration.
  const modalStyle: React.CSSProperties = {
    position: adaptive ? 'fixed' : 'relative',
    inset: adaptive ? 0 : undefined,
    display: 'flex',
    flexDirection: 'column',
    width: effectiveFullscreen ? '100vw' : '100%',
    height: adaptive ? '100dvh' : undefined,
    ...(effectiveFullscreen ? { maxWidth: 'none', maxHeight: 'none' } : SIZE_STYLES[modalSize]),
    maxHeight: effectiveFullscreen ? 'none' : MAX_HEIGHT_STYLES[modalSize],
    overflow: 'hidden',
    ['--ds-overlay-modal-radius' as any]: effectiveFullscreen
      ? '0'
      : RADIUS_STYLES[radius ?? 'lg'],
    ...overlayMotion.variables,
    transition:
      adaptive || disableAnimation || motionIsFinal
        ? 'none'
        : 'transform var(--ds-recipe-enter, 0.3s) var(--ds-recipe-curve, cubic-bezier(0.16, 1, 0.3, 1)), opacity var(--ds-recipe-enter, 0.3s) var(--ds-recipe-curve, cubic-bezier(0.16, 1, 0.3, 1))',
    ...style,
  } as React.CSSProperties;

  /**
   * Header section styles.
   */
  const headerStyle: React.CSSProperties = {
    padding: PADDING_STYLES[padding ?? 'lg'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  /**
   * Footer section styles.
   */
  const footerStyle: React.CSSProperties = {
    padding: PADDING_STYLES[padding ?? 'lg'],
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--ds-modal-footer-gap, 12px)',
  };

  /**
   * Cancel button styles.
   */
  const cancelButtonStyle: React.CSSProperties = {
    padding: 'var(--ds-modal-btn-padding, 4px 15px)',
    fontSize: 'var(--ds-modal-btn-font-size, 14px)',
    cursor: 'pointer',
  };

  /**
   * OK/primary button styles.
   */
  const okButtonStyle: React.CSSProperties = {
    padding: 'var(--ds-modal-btn-padding, 4px 15px)',
    fontSize: 'var(--ds-modal-btn-font-size, 14px)',
    cursor: 'pointer',
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Portal>
      <div
        data-part="root"
        data-backdrop={showBackdrop ? 'true' : 'false'}
        data-blur={blurBackdrop ? 'true' : 'false'}
        className={`rottay-overlay rottay-modal-overlay rottay-modal-root--rustic ${className}`}
        style={overlayStyle}
        onClick={effectiveBackdropClose ? handleCancel : undefined}
      >
        {/* stopPropagation prevents overlay click handler from firing when
          user clicks inside the modal content. role="dialog" + aria-modal="true"
          informs assistive technologies this is a modal context, enabling
          proper focus trapping behavior in screen readers. */}
        <FocusTrap active={isOpen} autoFocus restoreFocus>
          <div
            data-part="surface"
            data-open="true"
            data-fullscreen={effectiveFullscreen ? 'true' : 'false'}
            data-adaptive-fullscreen={adaptive ? 'true' : 'false'}
            data-shadow={shadow ? 'true' : 'false'}
            {...overlayMotion.attributes}
            className={`rottay-modal rottay-modal--rustic rottay-modal--${modalSize} rottay-overlay-modal-shell--rustic`}
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            id={id}
            data-testid={dataTestId}
            aria-label={ariaLabel}
            aria-labelledby={!ariaLabel && title && !header ? titleId : undefined}
            aria-describedby={ariaDescribedBy ?? (description ? descriptionId : undefined)}
          >
            {(title || header || closable) && (
              <div data-part="header" data-divider={divider ? 'true' : 'false'} style={headerStyle}>
                {(header || title) && (
                  <div data-part="title" style={{ flex: 1 }}>
                    {header ?? (
                      <h3
                        id={titleId}
                        style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}
                      >
                        {title}
                      </h3>
                    )}
                  </div>
                )}
                {closable && (
                  <button
                    type="button"
                    data-part="close-button"
                    style={{ cursor: 'pointer' }}
                    onClick={handleCancel}
                    aria-label={t('modal.close')}
                  >
                    <ActionCloseIcon decorative size={18} />
                  </button>
                )}
              </div>
            )}

            <div
              data-part="body"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: PADDING_STYLES[padding ?? 'lg'],
              }}
            >
              {description && (
                <p id={descriptionId} data-part="description">
                  {description}
                </p>
              )}
              {children}
            </div>

            {!hideFooter && (footer || onCancel || onOk) && (
              <div data-part="footer" data-divider={divider ? 'true' : 'false'} style={footerStyle}>
                {footer || (
                  <>
                    {onCancel && (
                      <button type="button" data-part="action" data-action="cancel" style={cancelButtonStyle} onClick={handleCancel}>
                        {cancelText}
                      </button>
                    )}
                    {onOk && (
                      <button
                        type="button"
                        data-part="action"
                        data-action="ok"
                        style={okButtonStyle}
                        onClick={handleOk}
                        disabled={confirmLoading}
                      >
                        {confirmLoading ? t('modal.loading') : okText}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </FocusTrap>
      </div>
    </Portal>
  );
}
