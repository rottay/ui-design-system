'use client';

/**
 * @fileoverview Drawer Modern Engine - Rottay Design System
 * @description Premium slide-in drawer panel with backdrop blur, directional
 * slide animation, and polished header/body/footer layout. Uses DS tokens for
 * surfaces, elevation, motion, and radii. Narrow viewports are served by the
 * inline `maxWidth: 100vw` / `maxHeight: 100vh` clamp: a size preset that does
 * not fit the viewport degrades to full-bleed instead of overflowing (never a
 * squeezed panel with horizontal scroll).
 *
 * Wave 2B: Unified overlay family visual language -- shared backdrop, surface,
 * border, and motion tokens with Modal and Sheet modern engines.
 *
 * @module Drawer/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useEffect, useCallback, useId } from 'react';
import type { DrawerProps, DrawerSize } from '../../contracts';
import { DRAWER_DEFAULTS } from '../../contracts';
import { usePresence } from '@/graphics/motion/react/runtime';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';
import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';
import { FocusTrap } from '../../../../runtime/overlay/focus-management/focus-trap';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { LayoutSidebarStartIcon } from '@/graphics/icons/presentation/semantic/generated/roles/layout-sidebar-start';

// ============================================================================
// Constants
// ============================================================================

/** Shared overlay motion tokens. */
const MOTION_DURATION = 'var(--ds-motion-normal)';
const MOTION_EASING = 'var(--ds-motion-ease-out)';

/** Enter animation name lookup by placement. Keyframes ship in the modern Drawer skin. */
const SLIDE_ANIMATION: Record<string, string> = {
  left: 'ds-drawer-slide-left-modern',
  right: 'ds-drawer-slide-right-modern',
  top: 'ds-drawer-slide-top-modern',
  bottom: 'ds-drawer-slide-bottom-modern',
};

/** Exit animation name lookup by placement -- mirrors SLIDE_ANIMATION. */
const SLIDE_OUT_ANIMATION: Record<string, string> = {
  left: 'ds-drawer-slide-out-left-modern',
  right: 'ds-drawer-slide-out-right-modern',
  top: 'ds-drawer-slide-out-top-modern',
  bottom: 'ds-drawer-slide-out-bottom-modern',
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
 * Width of the viewport scrollbar, used to compensate the body scroll lock so
 * the page behind does not reflow when the drawer opens (Modal engine idiom).
 */
function getScrollbarWidth(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

// ============================================================================
// Close Button (shared visual with Modal/Sheet)
// ============================================================================

function CloseButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      data-part="close-button"
      onClick={onClick}
      aria-label={label}
    >
      <ActionCloseIcon decorative size={16} />
    </button>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function ModernDrawer(props: DrawerProps): React.ReactElement {
  // Optional channel: the drawer keeps its standalone rendering contract and
  // falls back to the English accessibility floor when no I18nProvider is
  // mounted (never a hard useTranslation crash). The close label lives at
  // components.drawer.close (shipped for en/es/ar), the same key the Sheet
  // modern engine consumes.
  const i18n = useOptionalTranslation('components');
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
    maskOpacity,
    className = '',
    style,
    id,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = props;
  const generatedTitleId = useId();
  const titleId = `${id || generatedTitleId}-title`;

  // -- handlers ---------------------------------------------------------------

  const handleClose = useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  // Presence: `open` flipping false keeps the drawer mounted (dataState
  // 'closed') until its own slide-out animation finishes, instead of
  // vanishing the instant `open` changes.
  const { shouldRender, dataState, ref: presenceRef } = usePresence(open ?? false);

  // Overlay stack participation for canonical z-index + nested stacking (static
  // zIndex seam only; this engine keeps its own Escape and scroll-lock). The
  // resolved value equals `--ds-z-drawer` for a lone drawer and offsets when
  // several overlays stack.
  const overlayLayer = useOverlayLayer({
    kind: 'drawer',
    active: open ?? false,
    modal: false,
    lockScroll: false,
    restoreFocus: false,
  });

  // overlay.sheet recipe (motion canon): a drawer is a side panel, so its
  // enter/exit timing resolves from the sheet recipe's stamped `--ds-recipe-*`
  // variables. The slide travel stays the skin's anatomical 100%. Under
  // reduced motion the resolver returns the settled state, no animation is
  // declared, and usePresence unmounts immediately on close.
  const overlayMotion = useMotionRecipePresentation('overlay.sheet');
  const motionIsFinal = overlayMotion.recipe.state === 'final';

  // -- escape key -------------------------------------------------------------

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEscape, handleClose]);

  // -- body scroll lock (with scrollbar-width compensation) -------------------

  useEffect(() => {
    // Gated on shouldRender (not `open`) so the page behind stays locked
    // through the exit animation rather than unlocking while the drawer is
    // still visibly sliding out.
    if (!shouldRender) return;
    const scrollbarWidth = getScrollbarWidth();
    const originalOverflow = document.body.style.overflow;
    const originalPaddingInlineEnd = document.body.style.paddingInlineEnd;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      // Logical property (Modal idiom): the scrollbar sits on the inline-END
      // edge in both LTR and RTL documents, so the compensation follows
      // direction instead of hardcoding the physical right side.
      document.body.style.paddingInlineEnd = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingInlineEnd = originalPaddingInlineEnd;
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
      // magic-number offset. The layer manager supplies the canonical drawer
      // band (equal to --ds-z-drawer for a lone drawer) plus a stack offset.
      zIndex: overlayLayer.zIndex,
      display: 'flex',
      flexDirection: 'column',
      ...overlayMotion.variables,
      animation: motionIsFinal
        ? undefined
        : dataState === 'open'
          ? `${animationName} var(--ds-recipe-enter, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`
          : `${animationName} var(--ds-recipe-exit, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`,
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
            // maskOpacity rides the same --ds-drawer-overlay-opacity hatch the
            // rustic engine stamps; the modern skin's scrim consumes it with
            // the pre-existing 0.8 fill as its default (unset = unchanged).
            ...(maskOpacity != null
              ? ({ '--ds-drawer-overlay-opacity': maskOpacity } as React.CSSProperties)
              : null),
            ...overlayMotion.variables,
            animation: motionIsFinal
              ? undefined
              : dataState === 'open'
                ? `ds-drawer-backdrop-fade-modern var(--ds-recipe-enter, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`
                : `ds-drawer-backdrop-fade-out-modern var(--ds-recipe-exit, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`,
          }}
        />
      )}

      {/* Drawer panel. The shared FocusTrap owns the modal focus contract the
          layer stack deliberately delegates (initial focus into the panel,
          Tab/Shift+Tab cycling, restore to the trigger on deactivate — the
          layer's own restoreFocus stays off to avoid a double restore). The
          wrapper is display:contents so it adds no layout box. */}
      <FocusTrap
        active={dataState === 'open'}
        autoFocus
        restoreFocus
        style={{ display: 'contents' }}
      >
      <div
        ref={presenceRef}
        id={id}
        data-testid={dataTestId}
        data-part="surface"
        {...overlayMotion.attributes}
        data-placement={placement}
        data-size={drawerSize}
        data-has-title={title ? 'true' : 'false'}
        data-has-footer={!hideFooter && footer ? 'true' : 'false'}
        data-open={dataState === 'open' ? 'true' : 'false'}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={!ariaLabel && title ? titleId : undefined}
        aria-describedby={ariaDescribedBy}
        className={`rottay-drawer rottay-drawer-${placement} rottay-drawer--modern ${className}`.trim()}
        style={getPositionStyles()}
      >
        {/* ---- Header ---- */}
        {(title || closable) && (
          <div data-part="header">
            <div data-part="heading-group">
              {title && (
                <>
                  <span data-part="header-icon" aria-hidden="true">
                    <LayoutSidebarStartIcon decorative size={18} />
                  </span>
                  <div id={titleId} data-part="title">
                    {title}
                  </div>
                </>
              )}
            </div>
            {closable && <CloseButton onClick={handleClose} label={i18n?.tOr('drawer.close', 'Close') ?? 'Close'} />}
          </div>
        )}

        {/* ---- Body ---- */}
        <div data-part="body">
          {children}
        </div>

        {/* ---- Footer ---- */}
        {!hideFooter && footer && (
          <div data-part="footer">
            {footer}
          </div>
        )}
      </div>
      </FocusTrap>
    </>
  );
}
