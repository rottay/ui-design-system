'use client';

/**
 * @fileoverview Drawer Modern Engine - Rottay Design System
 * @description Premium slide-in drawer panel with backdrop blur, directional
 * slide animation, and polished header/body/footer layout. Uses DS tokens for
 * surfaces, elevation, motion, and radii. Mobile-responsive (full-width < 640px).
 *
 * Wave 2B: Unified overlay family visual language -- shared backdrop, surface,
 * border, and motion tokens with Modal and Sheet modern engines.
 *
 * @module Drawer/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useEffect, useCallback } from 'react';
import type { DrawerProps, DrawerSize } from '../Drawer.types';
import { DRAWER_DEFAULTS } from '../Drawer.types';
import { usePresence } from '../../../../../motion/hooks/use-presence';

// ============================================================================
// Constants
// ============================================================================

/** Shared overlay motion tokens. */
const MOTION_DURATION = 'var(--ds-motion-normal)';
const MOTION_EASING = 'var(--ds-motion-ease-out)';

/** Enter animation name lookup by placement. Keyframes ship in the modern Drawer skin. */
const SLIDE_ANIMATION: Record<string, string> = {
  left: 'rottay-drawer-slide-left-modern',
  right: 'rottay-drawer-slide-right-modern',
  top: 'rottay-drawer-slide-top-modern',
  bottom: 'rottay-drawer-slide-bottom-modern',
};

/** Exit animation name lookup by placement -- mirrors SLIDE_ANIMATION. */
const SLIDE_OUT_ANIMATION: Record<string, string> = {
  left: 'rottay-drawer-slide-out-left-modern',
  right: 'rottay-drawer-slide-out-right-modern',
  top: 'rottay-drawer-slide-out-top-modern',
  bottom: 'rottay-drawer-slide-out-bottom-modern',
};

/** Premium size presets shared with the public Drawer contract. */
const SIZE_MAP: Record<DrawerSize, string> = {
  sm: '256px',
  md: '378px',
  lg: '520px',
  xl: '736px',
  full: '100%',
};

// ============================================================================
// Close Button (shared visual with Modal/Sheet)
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

export default function ModernDrawer(props: DrawerProps): React.ReactElement {
  const {
    open,
    placement = DRAWER_DEFAULTS.placement,
    size = DRAWER_DEFAULTS.size as DrawerSize,
    width,
    height,
    title,
    children,
    footer,
    hideFooter,
    onClose,
    onOpenChange,
    closable = DRAWER_DEFAULTS.closable,
    closeOnOverlayClick = DRAWER_DEFAULTS.closeOnOverlayClick,
    closeOnEscape = DRAWER_DEFAULTS.closeOnEscape,
    mask = DRAWER_DEFAULTS.mask,
    className = '',
    style,
  } = props;

  // -- handlers ---------------------------------------------------------------

  const handleClose = useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  // Presence: `open` flipping false keeps the drawer mounted (dataState
  // 'closed') until its own slide-out animation finishes, instead of
  // vanishing the instant `open` changes.
  const { shouldRender, dataState, ref: presenceRef } = usePresence(open ?? false);

  // -- escape key -------------------------------------------------------------

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEscape, handleClose]);

  // -- body scroll lock -------------------------------------------------------

  useEffect(() => {
    // Gated on shouldRender (not `open`) so the page behind stays locked
    // through the exit animation rather than unlocking while the drawer is
    // still visibly sliding out.
    if (shouldRender) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [shouldRender]);

  // -- early return -----------------------------------------------------------

  if (!shouldRender) return <></>;

  // -- size calculations ------------------------------------------------------

  const drawerSize = size as DrawerSize;
  const isHorizontal = placement === 'left' || placement === 'right';
  const resolvedWidth = width || (isHorizontal ? SIZE_MAP[drawerSize] : '100%');
  const resolvedHeight = height || (!isHorizontal ? SIZE_MAP[drawerSize] : '100%');
  const animationName =
    (dataState === 'open' ? SLIDE_ANIMATION[placement as string] : SLIDE_OUT_ANIMATION[placement as string]) ||
    (dataState === 'open' ? SLIDE_ANIMATION.right : SLIDE_OUT_ANIMATION.right);

  // -- position styles --------------------------------------------------------

  // Surface paint (fill, the four border longhands, elevation, the per-placement
  // radius, and the zeroed flush edge) is keyed on `data-placement` in the modern
  // Drawer skin. Only geometry is assembled here.
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      // Tokenized overlay stack (spec section 9): the panel sits one tier
      // above the backdrop via the drawer/overlay pair, not a `zBase + 1`
      // magic-number offset.
      zIndex: 'var(--ds-z-drawer)',
      display: 'flex',
      flexDirection: 'column',
      animation: `${animationName} ${MOTION_DURATION} ${MOTION_EASING} both`,
      overflow: 'hidden',
      ...style,
    };

    switch (placement) {
      case 'left':
        return {
          ...base,
          top: 0,
          left: 0,
          width: resolvedWidth,
          height: '100vh',
          maxWidth: '100vw',
        };
      case 'right':
        return {
          ...base,
          top: 0,
          right: 0,
          width: resolvedWidth,
          height: '100vh',
          maxWidth: '100vw',
        };
      case 'top':
        return {
          ...base,
          top: 0,
          left: 0,
          width: '100vw',
          height: resolvedHeight,
          maxHeight: '100vh',
        };
      case 'bottom':
        return {
          ...base,
          bottom: 0,
          left: 0,
          width: '100vw',
          height: resolvedHeight,
          maxHeight: '100vh',
        };
      default:
        return base;
    }
  };

  // -- render -----------------------------------------------------------------

  return (
    <>
      {/* Backdrop overlay with blur. Scrim + glass layer (spec section 5) are
          painted by the modern Drawer skin; the skin's unlayered backdrop-filter
          is what keeps personality.css's `.rottay-drawer-overlay` blur(4px)
          override off this engine, exactly as the inline filter used to. */}
      {mask && (
        <div
          data-part="backdrop"
          className="rottay-drawer-overlay rottay-drawer-backdrop--modern"
          onClick={closeOnOverlayClick && closable !== false ? handleClose : undefined}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--ds-z-overlay)',
            animation: `${dataState === 'open' ? 'rottay-drawer-backdrop-fade-modern' : 'rottay-drawer-backdrop-fade-out-modern'} ${MOTION_DURATION} ${MOTION_EASING} both`,
          }}
        />
      )}

      {/* Drawer panel */}
      <div
        ref={presenceRef}
        data-part="surface"
        data-placement={placement}
        data-open={dataState === 'open' ? 'true' : 'false'}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`rottay-drawer rottay-drawer-${placement} rottay-drawer--modern ${className}`.trim()}
        style={getPositionStyles()}
      >
        {/* ---- Header ---- */}
        {(title || closable) && (
          <div
            data-part="header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '16px 24px',
              flexShrink: 0,
            }}
          >
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              {title && (
                <div
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
            </div>
            {closable && <CloseButton onClick={handleClose} />}
          </div>
        )}

        {/* ---- Body ---- */}
        <div
          data-part="body"
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {children}
        </div>

        {/* ---- Footer ---- */}
        {!hideFooter && footer && (
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
    </>
  );
}
