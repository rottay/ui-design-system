'use client';

/**
 * @fileoverview Sheet Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Sheet component.
 * Uses portal + slide animation + drag-to-close handle.
 *
 * @module Sheet/Engines/Rustic
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { SheetProps } from '../../types';
import { SHEET_DEFAULTS } from '../../types';

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

  if (!open || typeof document === 'undefined') return <></>;

  const getPanelStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1060,
      backgroundColor: 'var(--ds-color-bg-elevated, #fff)',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.12)',
      fontFamily: 'var(--ds-font-family-base, inherit)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
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
      {showOverlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1059,
            transition: 'opacity 0.3s',
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
              borderBottom: '1px solid var(--ds-color-neutral-200, #e5e7eb)',
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 600 }}>{title}</span>
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
                color: 'var(--ds-color-text-secondary, #6b7280)',
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
