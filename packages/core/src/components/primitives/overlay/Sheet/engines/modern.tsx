'use client';

/**
 * @fileoverview Sheet Modern (Hermes) Engine - Rottay Design System.
 * Implements a slide-in panel overlay using DaisyUI classes and Tailwind
 * utilities. Manages body scroll lock and Escape key dismissal internally
 * so no external modal manager is needed.
 *
 * @example
 * ```tsx
 * <Sheet engine="modern" open={open} onOpenChange={setOpen} side="bottom" title="Filters">
 *   <FilterForm />
 * </Sheet>
 * ```
 *
 * @module Sheet/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useEffect, useCallback } from 'react';
import type { SheetProps } from '../Sheet.types';
import { SHEET_DEFAULTS } from '../Sheet.types';

/**
 * Tailwind class presets for each side variant. `panel` controls fixed
 * positioning and border radius, `translate` provides the off-screen
 * transform used for slide-in/slide-out animation.
 */
const SIDE_CLASSES: Record<string, { panel: string; translate: string }> = {
  bottom: {
    panel: 'inset-x-0 bottom-0 rounded-t-2xl',
    translate: 'translate-y-full',
  },
  left: {
    panel: 'inset-y-0 left-0 rounded-r-2xl',
    translate: '-translate-x-full',
  },
  right: {
    panel: 'inset-y-0 right-0 rounded-l-2xl',
    translate: 'translate-x-full',
  },
};

/**
 * Modern engine implementation of Sheet using DaisyUI/Tailwind.
 *
 * Locks body scroll while open, listens for Escape key, and returns an
 * empty fragment when closed so no DOM nodes remain in the tree.
 *
 * @param props - Sheet configuration props
 * @returns Slide-in panel rendered with Tailwind utility classes
 */
export default function ModernSheet(props: SheetProps): React.ReactElement {
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
    panelClassName,
    panelStyle,
  } = props;

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

  // Bail early when closed -- no DOM footprint remains
  if (!open) return <></>;

  const sideConfig = SIDE_CLASSES[side] || SIDE_CLASSES.bottom;
  const isBottom = side === 'bottom';

  return (
    <div className={`fixed inset-0 z-50 ${className || ''}`}>
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        />
      )}
      <div
        className={`fixed ${sideConfig.panel} bg-base-100 shadow-2xl transition-transform duration-300 ${panelClassName || ''}`}
        style={{
          ...(isBottom ? { maxHeight: '85vh', minHeight: '30vh' } : { width: 380 }),
          ...panelStyle,
        }}
        role="dialog"
        aria-modal="true"
      >
        {isBottom && showHandle && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-base-300" />
          </div>
        )}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
            <span className="text-lg font-semibold">{title}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              x
            </button>
          </div>
        )}
        {/* Scrollable content area - bottom sheets need explicit max-height accounting for header */}
        <div className="p-4 overflow-y-auto" style={isBottom ? { maxHeight: 'calc(85vh - 80px)' } : { height: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

ModernSheet.displayName = 'Sheet.Modern';
