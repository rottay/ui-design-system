'use client';

/**
 * @fileoverview Sheet Modern (Hermes) Engine - Rottay Design System.
 * Bottom sheet on mobile, side panel on desktop. Features a drag handle
 * indicator, backdrop blur, and slide-in animation. Uses pure DS token
 * inline styles -- no DaisyUI or Tailwind class dependencies.
 *
 * Wave 2B: Unified overlay family visual language -- shared backdrop, surface,
 * border, and motion tokens with Modal and Drawer modern engines.
 *
 * @module Sheet/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useEffect, useCallback, useId } from 'react';
import type { SheetProps } from '../Sheet.types';
import { SHEET_DEFAULTS } from '../Sheet.types';
import { Portal } from '../../Modal/utils/Portal';
import { FocusTrap } from '../../Modal/utils/FocusTrap';
import { useSheetOverlayRuntime } from '../utils/overlay-runtime';

// ============================================================================
// Constants
// ============================================================================

/** Shared overlay motion tokens. */
const MOTION_DURATION = 'var(--ds-motion-normal)';
const MOTION_EASING = 'var(--ds-motion-ease-out)';

/** Animation name lookup by side. The keyframes live in the engine skin. */
const SLIDE_ANIMATION: Record<string, string> = {
  bottom: 'ds-sheet-slide-bottom-modern',
  left: 'ds-sheet-slide-left-modern',
  right: 'ds-sheet-slide-right-modern',
};

/** Default side-panel width for left/right. */
const SIDE_PANEL_WIDTH = '380px';

// ============================================================================
// Close Button (shared visual with Modal/Drawer)
// ============================================================================

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      data-part="close-button"
      onClick={onClick}
      aria-label="Close"
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
 * Modern engine implementation of Sheet using pure DS token inline styles.
 *
 * - Bottom sheet on mobile (full-width, slides up from bottom)
 * - Side panel on desktop (left or right)
 * - Handle bar indicator at top for bottom sheets
 * - Title area below handle
 *
 * Locks body scroll while open, listens for Escape key, and returns an
 * empty fragment when closed so no DOM nodes remain in the tree.
 */
export default function ModernSheet(props: SheetProps): React.ReactElement {
  const {
    open,
    onOpenChange,
    side = SHEET_DEFAULTS.side,
    children,
    title,
    footer,
    showHandle = SHEET_DEFAULTS.showHandle,
    showOverlay = SHEET_DEFAULTS.showOverlay,
    closeOnEscape = SHEET_DEFAULTS.closeOnEscape,
    closeOnOverlayClick = SHEET_DEFAULTS.closeOnOverlayClick,
    className,
    style,
    rootClassName,
    rootStyle,
    panelClassName,
    panelStyle,
    surfaceClassName,
    surfaceStyle,
    bodyClassName,
    bodyStyle,
    footerClassName,
    footerStyle,
    id,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    autoFocus = SHEET_DEFAULTS.autoFocus,
    restoreFocus = SHEET_DEFAULTS.restoreFocus,
    initialFocus,
    finalFocus,
  } = props;
  const generatedTitleId = useId();
  const titleId = `${id || generatedTitleId}-title`;
  const { isTopmost } = useSheetOverlayRuntime(open);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape' && isTopmost()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      onOpenChange(false);
    }
  }, [closeOnEscape, isTopmost, onOpenChange]);

  // Stack-aware Escape handling; the shared runtime owns body scroll locking.
  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleEscape]);

  // Bail early when closed -- no DOM footprint remains
  if (!open) return <></>;

  const isBottom = side === 'bottom';
  const animationName = SLIDE_ANIMATION[side] || SLIDE_ANIMATION.bottom;

  // -- panel position styles --------------------------------------------------

  const getPanelPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      // Tokenized overlay stack (spec section 9): panel sits at the drawer
      // tier, above the wrapper's overlay tier, instead of a magic 51.
      zIndex: 'var(--ds-z-drawer)',
      display: 'flex',
      flexDirection: 'column',
      animation: `${animationName} ${MOTION_DURATION} ${MOTION_EASING} both`,
      overflow: 'hidden',
    };

    if (isBottom) {
      return {
        ...base,
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight:
          'var(--ds-sheet-max-height, var(--ds-sheet-viewport-max-height, 85vh))',
        minHeight: 'var(--ds-sheet-min-height, 30vh)',
        ...panelStyle,
        ...surfaceStyle,
      };
    }

    if (side === 'left') {
      return {
        ...base,
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDE_PANEL_WIDTH,
        maxWidth: '100vw',
        ...panelStyle,
        ...surfaceStyle,
      };
    }

    // right (default for non-bottom)
    return {
      ...base,
      top: 0,
      right: 0,
      bottom: 0,
      width: SIDE_PANEL_WIDTH,
      maxWidth: '100vw',
      ...panelStyle,
      ...surfaceStyle,
    };
  };

  return (
    <Portal>
      {/* ---- Wrapper ---- */}
      <div
        data-part="root"
        className={`rottay-sheet--modern ${className || ''} ${rootClassName || ''}`}
        style={{
          position: 'fixed',
          inset: 0,
          // Tokenized overlay stack (spec section 9), matching Drawer's
          // backdrop/panel pair instead of a magic 50.
          zIndex: 'var(--ds-z-overlay)',
          ...style,
          ...rootStyle,
        }}
      >
        {/* ---- Backdrop overlay ---- */}
        {showOverlay && (
          <div
            data-part="backdrop"
            onClick={closeOnOverlayClick ? handleClose : undefined}
            style={{
              position: 'fixed',
              inset: 0,
              animation: `ds-sheet-backdrop-fade-modern ${MOTION_DURATION} ${MOTION_EASING}`,
            }}
          />
        )}

        {/* ---- Panel ---- */}
        <div
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={!ariaLabel && title ? titleId : undefined}
          aria-describedby={ariaDescribedBy}
          data-testid={dataTestId}
          data-part="surface"
          data-open="true"
          data-placement={side}
          className={surfaceClassName || panelClassName || undefined}
          style={getPanelPositionStyles()}
        >
          <FocusTrap
            active={open}
            autoFocus={autoFocus}
            restoreFocus={restoreFocus}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className="rottay-sheet__focus-scope"
            style={{
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
          {/* Handle bar -- bottom sheet only */}
          {isBottom && showHandle && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '12px',
                paddingBottom: '4px',
                flexShrink: 0,
              }}
            >
              <div
                data-part="handle"
                style={{
                  width: '40px',
                  height: '4px',
                }}
              />
            </div>
          )}

          {/* Title area */}
          {title && (
            <div
              data-part="header"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                flexShrink: 0,
              }}
            >
              <div
                id={titleId}
                data-part="title"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: '24px',
                  flex: '1 1 auto',
                  minWidth: 0,
                }}
              >
                {title}
              </div>
              <CloseButton onClick={handleClose} />
            </div>
          )}

          {/* Scrollable content area */}
          <div
            data-part="body"
            className={bodyClassName}
            style={{
              flex: '1 1 auto',
              minHeight: 0,
              overflowY: 'auto',
              padding: '16px',
              ...bodyStyle,
            }}
          >
            {children}
          </div>

          {footer != null && (
            <div
              data-part="footer"
              className={footerClassName}
              style={{
                flexShrink: 0,
                ...footerStyle,
              }}
            >
              {footer}
            </div>
          )}
          </FocusTrap>
        </div>
      </div>
    </Portal>
  );
}

ModernSheet.displayName = 'Sheet.Modern';
