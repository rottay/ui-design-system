'use client';

/**
 * @fileoverview Sheet Modern (Hermes) Engine - Rottay Design System.
 * Bottom sheet on mobile, side panel on desktop. Features a drag handle
 * indicator, backdrop blur, and recipe-driven slide-in/slide-out animations
 * (presence keeps the panel mounted through its exit, Drawer's idiom). The
 * engine stamps parts and dynamic channels only: static geometry (fixed
 * placement, per-side insets, flex/scroll anatomy) is skin-owned in
 * sheet.css, keyed on data-part/data-placement. Inline survives solely where
 * it is genuinely dynamic -- the tokenized z-index tiers, the recipe-driven
 * enter/exit animation (pinned by the motion-recipe contract) and consumer
 * style overrides. No DaisyUI or Tailwind class dependencies.
 *
 * Wave 2B: Unified overlay family visual language -- shared backdrop, surface,
 * border, and motion tokens with Modal and Drawer modern engines.
 *
 * @module Sheet/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useEffect, useCallback, useId } from 'react';
import type { SheetProps } from '../../contracts';
import { SHEET_DEFAULTS } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { FocusTrap } from '../../../../runtime/overlay/focus-management/focus-trap';
import { useSheetOverlayRuntime } from '../../runtime/overlay-stack';
import { usePresence } from '@/graphics/motion/react/runtime';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

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

/** Exit lookup by side (Drawer's idiom): the panel leaves toward the same
 *  edge it entered from, on the recipe's `--ds-recipe-exit` cadence. */
const SLIDE_OUT_ANIMATION: Record<string, string> = {
  bottom: 'ds-sheet-slide-out-bottom-modern',
  left: 'ds-sheet-slide-out-left-modern',
  right: 'ds-sheet-slide-out-right-modern',
};

// ============================================================================
// Close Button (shared visual with Modal/Drawer)
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

/**
 * Modern engine implementation of Sheet using pure DS token inline styles.
 *
 * - Bottom sheet on mobile (full-width, slides up from bottom)
 * - Side panel on desktop (left or right)
 * - Handle bar indicator at top for bottom sheets
 * - Title area below handle
 *
 * Locks body scroll while open (and through the exit animation), listens
 * for Escape key, and returns an empty fragment once presence reports the
 * exit finished so no DOM nodes remain in the tree.
 */
export default function ModernSheet(props: SheetProps): React.ReactElement {
  // Optional channel with an English floor: the sheet renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
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

  // Presence (Drawer's idiom, composed): `open` flipping false keeps the
  // sheet mounted (dataState 'closed') until its own slide-out animation
  // finishes, instead of vanishing the instant `open` changes. Under reduced
  // motion the recipe declares no animation and presence unmounts
  // immediately.
  const { shouldRender, dataState, ref: presenceRef } = usePresence(open);

  // Stack registration and the body scroll lock stay held through the exit
  // animation (gated on shouldRender, Drawer's posture) — the page behind
  // must not reflow while the panel is still visibly sliding out.
  const { isTopmost } = useSheetOverlayRuntime(shouldRender);

  // overlay.sheet recipe (motion canon): entrance timing/easing resolve from
  // the stamped `--ds-recipe-*` variables. The slide TRAVEL stays the skin's
  // anatomical 100% (the panel enters from its own edge), so the recipe's
  // distance dials are not what moves it; under reduced motion the resolver
  // returns the settled state and this engine declares no animation at all.
  const overlayMotion = useMotionRecipePresentation('overlay.sheet');
  const motionIsFinal = overlayMotion.recipe.state === 'final';

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

  // Bail early when closed AND the exit finished -- no DOM footprint remains
  if (!shouldRender) return <></>;

  const isBottom = side === 'bottom';
  const animationName =
    (dataState === 'open' ? SLIDE_ANIMATION[side] : SLIDE_OUT_ANIMATION[side]) ||
    (dataState === 'open' ? SLIDE_ANIMATION.bottom : SLIDE_OUT_ANIMATION.bottom);

  // -- panel style ------------------------------------------------------------
  // Static geometry (fixed placement, per-side insets, flex anatomy, scroll
  // regions) is SKIN-OWNED, keyed on data-part/data-placement in sheet.css.
  // Inline stays only for the genuinely dynamic channels: the tokenized stack
  // tier (zIndex is the overlay-stack datum, sibling-pinned idiom), the
  // recipe-driven enter/exit animation (pinned inline by the motion-recipe
  // contract), and the consumer's panelStyle/surfaceStyle overrides, which
  // still spread last and win over the skin.
  const panelStyleResolved: React.CSSProperties = {
    // Tokenized overlay stack (spec section 9): panel sits at the drawer
    // tier, above the wrapper's overlay tier, instead of a magic 51.
    zIndex: 'var(--ds-z-drawer)',
    animation: motionIsFinal
      ? undefined
      : dataState === 'open'
        ? `${animationName} var(--ds-recipe-enter, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`
        : `${animationName} var(--ds-recipe-exit, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING}) both`,
    ...panelStyle,
    ...surfaceStyle,
  };

  return (
    <Portal>
      {/* ---- Wrapper ---- */}
      <div
        data-part="root"
        {...overlayMotion.attributes}
        className={`rottay-sheet--modern ${className || ''} ${rootClassName || ''}`}
        style={{
          ...overlayMotion.variables,
          // Tokenized overlay stack (spec section 9), matching Drawer's
          // backdrop/panel pair instead of a magic 50. The fixed inset lives
          // in the skin.
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
              animation: motionIsFinal
                ? undefined
                : dataState === 'open'
                  ? `ds-sheet-backdrop-fade-modern var(--ds-recipe-enter, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING})`
                  : `ds-sheet-backdrop-fade-out-modern var(--ds-recipe-exit, ${MOTION_DURATION}) var(--ds-recipe-curve, ${MOTION_EASING})`,
            }}
          />
        )}

        {/* ---- Panel ---- */}
        <div
          ref={presenceRef}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={!ariaLabel && title ? titleId : undefined}
          aria-describedby={ariaDescribedBy}
          data-testid={dataTestId}
          data-part="surface"
          data-open={dataState === 'open' ? 'true' : 'false'}
          data-placement={side}
          className={surfaceClassName || panelClassName || undefined}
          style={panelStyleResolved}
        >
          <FocusTrap
            active={open}
            autoFocus={autoFocus}
            restoreFocus={restoreFocus}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className="rottay-sheet__focus-scope"
          >
          {/* Handle bar -- bottom sheet only. Geometry lives in the skin;
              the engine stamps parts only. */}
          {isBottom && showHandle && (
            <div data-part="handle-area">
              <div data-part="handle" />
            </div>
          )}

          {/* Header always renders (Drawer's `title || closable` rule —
              Sheet's contract has no closable=false, so the panel must
              always expose a visible dismiss control; a title-less sheet
              previously trapped keyboard/AT users with no drawn close).
              Layout and typography live in the modern Sheet skin; the engine
              stamps parts only. A string title gets the native tooltip
              affordance for the skin's ellipsis truncation. */}
          <div data-part="header">
            {title ? (
              <div
                id={titleId}
                data-part="title"
                title={typeof title === 'string' ? title : undefined}
              >
                {title}
              </div>
            ) : null}
            <CloseButton onClick={handleClose} label={i18n?.tOr('drawer.close', 'Close') ?? 'Close'} />
          </div>

          {/* Scrollable content area. Flex/scroll anatomy lives in the skin;
              a caller's bodyStyle still wins inline. */}
          <div
            data-part="body"
            className={bodyClassName}
            style={bodyStyle}
          >
            {children}
          </div>

          {footer != null && (
            <div
              data-part="footer"
              className={footerClassName}
              style={footerStyle}
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
