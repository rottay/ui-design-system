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

import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { SheetProps } from '../Sheet.types';
import { SHEET_DEFAULTS } from '../Sheet.types';

/**
 * Rustic engine implementation of Sheet using vanilla HTML/CSS and createPortal.
 *
 * Builds all positioning, animations, and theming from inline styles backed
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
    showHandle = SHEET_DEFAULTS.showHandle,
    showOverlay = SHEET_DEFAULTS.showOverlay,
    closeOnEscape = SHEET_DEFAULTS.closeOnEscape,
    closeOnOverlayClick = SHEET_DEFAULTS.closeOnOverlayClick,
    className,
    style,
    panelClassName,
    panelStyle,
  } = props;

  const panelRef = useRef<HTMLDivElement>(null);
  const isBottom = side === 'bottom';

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
      onOpenChange(false);
    }
  }, [closeOnEscape, onOpenChange]);

  // Lock body scroll and bind Escape handler while open; cleanup restores both
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
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
      zIndex: 1060,
      backgroundColor: 'var(--ds-drawer-bg, var(--ds-modal-bg, var(--ds-color-bg-elevated, #fff)))',
      color: 'var(--ds-modal-color, var(--ds-color-text-primary, #1a1a1a))',
      boxShadow: 'var(--ds-modal-shadow, var(--ds-shadow-xl))',
      fontFamily: 'var(--ds-font-family-base, inherit)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform var(--ds-modal-animation-duration, 200ms) var(--ds-modal-animation-timing, cubic-bezier(0.32, 0.72, 0, 1)), box-shadow var(--ds-modal-animation-duration, 200ms) var(--ds-modal-animation-timing, cubic-bezier(0.32, 0.72, 0, 1))',
      border: '1px solid var(--ds-modal-border, var(--ds-color-neutral-200, #e5e7eb))',
    };

    switch (side) {
      case 'bottom':
        return {
          ...base,
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '85vh',
          minHeight: '30vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        };
      case 'left':
        return {
          ...base,
          top: 0,
          left: 0,
          bottom: 0,
          width: 380,
          maxWidth: '90vw',
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
        };
      case 'right':
        return {
          ...base,
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          maxWidth: '90vw',
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        };
      default:
        return base;
    }
  };

  return createPortal(
    <div className={className} style={style}>
      {/* Overlay sits one z-index below the panel so clicks land on it for dismissal */}
      {showOverlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--ds-overlay-bg, var(--ds-modal-overlay-bg, var(--ds-color-alpha-black-50, rgba(0, 0, 0, 0.5))))',
            zIndex: 1059,
            transition: 'opacity var(--ds-modal-animation-duration, 200ms) var(--ds-modal-animation-timing, cubic-bezier(0.32, 0.72, 0, 1))',
            backdropFilter: 'var(--ds-modal-overlay-backdrop, blur(4px))',
          }}
          onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        />
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={panelClassName}
        style={{ ...getPanelStyle(), ...panelStyle }}
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
              style={{
                width: 40,
                height: 4,
                backgroundColor: 'var(--ds-color-neutral-300, #d1d5db)',
                borderRadius: 2,
              }}
            />
          </div>
        )}
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--ds-modal-header-border, var(--ds-color-neutral-200, #e5e7eb))',
            }}
          >
            <span style={{ fontSize: 'var(--ds-modal-title-font-size, 18px)', fontWeight: 'var(--ds-modal-title-font-weight, 600)', color: 'var(--ds-modal-title-color, inherit)' }}>{title}</span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 20,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4,
                color: 'var(--ds-modal-subtitle-color, var(--ds-color-text-secondary, #6b7280))',
                transition: 'background-color var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease), color var(--ds-personality-animation-entrance-duration, 180ms) var(--ds-input-transition-timing, ease)',
              }}
            >
              x
            </button>
          </div>
        )}
        <div
          style={{
            padding: 16,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

RusticSheet.displayName = 'Sheet.Rustic';
