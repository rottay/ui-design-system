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

// ============================================================================
// Constants
// ============================================================================

/** Shared overlay motion tokens. */
const MOTION_DURATION = 'var(--ds-motion-normal)';
const MOTION_EASING = 'var(--ds-motion-ease-out)';

/** Keyframe animations for all four placement directions + backdrop fade. */
const DRAWER_STYLES = `
@keyframes rottay-drawer-backdrop-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes rottay-drawer-slide-left {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
@keyframes rottay-drawer-slide-right {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes rottay-drawer-slide-top {
  from { transform: translateY(-100%); }
  to   { transform: translateY(0); }
}
@keyframes rottay-drawer-slide-bottom {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
`;

/** Animation name lookup by placement. */
const SLIDE_ANIMATION: Record<string, string> = {
  left: 'rottay-drawer-slide-left',
  right: 'rottay-drawer-slide-right',
  top: 'rottay-drawer-slide-top',
  bottom: 'rottay-drawer-slide-bottom',
};

/** Premium size presets shared with the public Drawer contract. */
const SIZE_MAP: Record<DrawerSize, string> = {
  sm: '256px',
  md: '378px',
  lg: '520px',
  xl: '736px',
  full: '100%',
};

/**
 * Border-radius per placement -- rounded on the inward-facing edge only.
 * The sliding edge gets no radius to sit flush against the viewport.
 */
const RADIUS_BY_PLACEMENT: Record<string, string> = {
  left: '0 var(--ds-radius-lg) var(--ds-radius-lg) 0',
  right: 'var(--ds-radius-lg) 0 0 var(--ds-radius-lg)',
  top: '0 0 var(--ds-radius-lg) var(--ds-radius-lg)',
  bottom: 'var(--ds-radius-lg) var(--ds-radius-lg) 0 0',
};

// ============================================================================
// Close Button (shared visual with Modal/Sheet)
// ============================================================================

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: 'none',
        borderRadius: 'var(--ds-radius-md)',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        color: 'var(--ds-color-text-secondary)',
        flexShrink: 0,
        transition: `background-color var(--ds-motion-fast) ${MOTION_EASING}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          'var(--ds-surface-highlight)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
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
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // -- early return -----------------------------------------------------------

  if (!open) return <></>;

  // -- size calculations ------------------------------------------------------

  const drawerSize = size as DrawerSize;
  const isHorizontal = placement === 'left' || placement === 'right';
  const resolvedWidth = width || (isHorizontal ? SIZE_MAP[drawerSize] : '100%');
  const resolvedHeight = height || (!isHorizontal ? SIZE_MAP[drawerSize] : '100%');
  const animationName = SLIDE_ANIMATION[placement as string] || SLIDE_ANIMATION.right;
  const borderRadius = RADIUS_BY_PLACEMENT[placement as string] || RADIUS_BY_PLACEMENT.right;
  const zBase = DRAWER_DEFAULTS.zIndex || 1000;

  // -- position styles --------------------------------------------------------

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: zBase + 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--ds-surface-card)',
      borderTopWidth: '1px',
      borderRightWidth: '1px',
      borderBottomWidth: '1px',
      borderLeftWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--ds-color-border-subtle)',
      boxShadow: 'var(--ds-elevation-3)',
      borderRadius,
      animation: `${animationName} ${MOTION_DURATION} ${MOTION_EASING} both`,
      overflow: 'hidden',
      ...style,
    };

    // Remove border on the edge that sits flush against the viewport
    switch (placement) {
      case 'left':
        return {
          ...base,
          top: 0,
          left: 0,
          width: resolvedWidth,
          height: '100vh',
          maxWidth: '100vw',
          borderLeftWidth: 0,
        };
      case 'right':
        return {
          ...base,
          top: 0,
          right: 0,
          width: resolvedWidth,
          height: '100vh',
          maxWidth: '100vw',
          borderRightWidth: 0,
        };
      case 'top':
        return {
          ...base,
          top: 0,
          left: 0,
          width: '100vw',
          height: resolvedHeight,
          maxHeight: '100vh',
          borderTopWidth: 0,
        };
      case 'bottom':
        return {
          ...base,
          bottom: 0,
          left: 0,
          width: '100vw',
          height: resolvedHeight,
          maxHeight: '100vh',
          borderBottomWidth: 0,
        };
      default:
        return base;
    }
  };

  // -- render -----------------------------------------------------------------

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DRAWER_STYLES }} />

      {/* Backdrop overlay with blur */}
      {mask && (
        <div
          className="rottay-drawer-overlay"
          onClick={closeOnOverlayClick && closable !== false ? handleClose : undefined}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: zBase,
            // Scrim (kept) + glass layer (spec section 5): frost tint + backdrop blur
            // scale with --ds-effect-intensity, collapsing to a plain scrim at 0.
            // Glass is sanctioned on overlay backdrops only.
            backgroundColor: 'color-mix(in srgb, var(--ds-color-bg-primary) 80%, transparent)',
            backgroundImage: 'linear-gradient(var(--ds-glass-scrim-tint), var(--ds-glass-scrim-tint))',
            backdropFilter: 'var(--ds-glass-backdrop-filter)',
            WebkitBackdropFilter: 'var(--ds-glass-backdrop-filter)',
            animation: `rottay-drawer-backdrop-fade ${MOTION_DURATION} ${MOTION_EASING}`,
          }}
        />
      )}

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`rottay-drawer rottay-drawer-${placement} ${className}`.trim()}
        style={getPositionStyles()}
      >
        {/* ---- Header ---- */}
        {(title || closable) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '16px 24px',
              borderBottom: '1px solid var(--ds-color-border-subtle)',
              flexShrink: 0,
            }}
          >
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              {title && (
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: 'var(--ds-color-text-primary)',
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
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              padding: '16px 24px',
              borderTop: '1px solid var(--ds-color-border-subtle)',
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
