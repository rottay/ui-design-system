'use client';

/**
 * @fileoverview Sheet Rustic (Apollo) Engine - Rottay Design System.
 * Pure inline-CSS implementation of a slide-in panel overlay that renders via
 * createPortal into document.body. Zero external CSS dependencies, making it
 * suitable for embedded or SSR contexts with no framework stylesheet.
 *
 * @example
 * ```tsx
 * <Sheet engine="rustic" open={open} onOpenChange={setOpen} side="left" title="Navigation">
 *   <NavMenu />
 * </Sheet>
 * ```
 *
 * @module Sheet/Engines/Rustic
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useEffect, useCallback, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import type { SheetProps } from '../../contracts';
import { SHEET_DEFAULTS } from '../../contracts';
import { FocusTrap } from '../../../../runtime/overlay/focus-management/focus-trap';
import { useSheetOverlayRuntime } from '../../runtime/overlay-stack';

/**
 * Rustic engine implementation of Sheet using vanilla HTML/CSS and createPortal.
 *
 * Builds positioning, animations, and theming from token-backed style objects
 * by CSS custom properties (--ds-*). Supports bottom, left, and right sides
 * with distinct border-radius patterns and size constraints.
 *
 * @param props - Sheet configuration props
 * @returns Slide-in panel portaled to document.body, or empty fragment when closed
 */
export default function RusticSheet(props: SheetProps): React.ReactElement {
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

  const panelRef = useRef<HTMLDivElement>(null);
  const generatedTitleId = useId();
  const titleId = `${id || generatedTitleId}-title`;
  const { isTopmost } = useSheetOverlayRuntime(open);
  const isBottom = side === 'bottom';

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

  // Bail early when closed or during SSR where document is unavailable
  if (!open || typeof document === 'undefined') return <></>;

  /**
   * Builds panel positioning styles based on the chosen side.
   * Each side variant differs in which edges are pinned, fixed dimensions,
   * and which corners receive border-radius to create a rounded opening edge.
   */
  const getPanelStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 'var(--ds-z-drawer, 1400)',
      fontFamily: 'var(--ds-font-family-base, inherit)',
      display: 'flex',
      flexDirection: 'column',
      // The transition is inert: `transform` is never assigned on any branch and
      // the panel unmounts synchronously on close, so no slide ever plays.
      transition: 'transform var(--ds-modal-animation-duration, 200ms) var(--ds-modal-animation-timing, cubic-bezier(0.32, 0.72, 0, 1)), box-shadow var(--ds-modal-animation-duration, 200ms) var(--ds-modal-animation-timing, cubic-bezier(0.32, 0.72, 0, 1))',
    };

    switch (side) {
      case 'bottom':
        return {
          ...base,
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight:
            'var(--ds-sheet-max-height, var(--ds-sheet-viewport-max-height, 85vh))',
          minHeight: 'var(--ds-sheet-min-height, 30vh)',
        };
      case 'left':
        return {
          ...base,
          top: 0,
          left: 0,
          bottom: 0,
          width: 380,
          maxWidth: '90vw',
        };
      case 'right':
        return {
          ...base,
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          maxWidth: '90vw',
        };
      default:
        return base;
    }
  };

  return createPortal(
    <div
      data-part="root"
      className={`rottay-sheet--rustic ${className || ''} ${rootClassName || ''}`}
      style={{ ...style, ...rootStyle }}
    >
      {/* Overlay sits one z-index below the panel so clicks land on it for dismissal */}
      {showOverlay && (
        <div
          data-part="backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--ds-z-overlay, 1300)',
            transition: 'opacity var(--ds-modal-animation-duration, 200ms) var(--ds-modal-animation-timing, cubic-bezier(0.32, 0.72, 0, 1))',
          }}
          onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        />
      )}
      <div
        ref={panelRef}
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
        className={surfaceClassName || panelClassName}
        style={{ ...getPanelStyle(), ...panelStyle, ...surfaceStyle }}
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
        {/* Drag handle indicator for bottom sheets -- visual affordance for swipe-to-close */}
        {isBottom && showHandle && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 12,
              paddingBottom: 4,
              cursor: 'grab',
            }}
          >
            <div
              data-part="handle"
              style={{
                width: 40,
                height: 4,
              }}
            />
          </div>
        )}
        {title && (
          <div
            data-part="header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
            }}
          >
            <span id={titleId} data-part="title" style={{ fontSize: 'var(--ds-modal-title-font-size, 18px)', fontWeight: 'var(--ds-modal-title-font-weight, 600)' }}>{title}</span>
            <button
              type="button"
              data-part="close-button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              style={{
                fontSize: 20,
                cursor: 'pointer',
                padding: '4px 8px',
                // The transition is inert: this engine declares no hover state.
                transition: 'background-color var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease), color var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease)',
              }}
            >
              x
            </button>
          </div>
        )}
        <div
          data-part="body"
          className={bodyClassName}
          style={{
            padding: 'var(--ds-spacing-4, 16px)',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
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
    </div>,
    document.body
  );
}

RusticSheet.displayName = 'Sheet.Rustic';
