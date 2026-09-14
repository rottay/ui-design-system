'use client';

/**
 * @fileoverview Sheet Modern Engine - Rottay Design System.
 * Bottom or side sheet on the shared overlay contract, with a drag handle
 * indicator and recipe-driven slide motion (presence keeps the panel mounted
 * through its exit). The engine stamps anatomy, placement, presence and the
 * resolved posture; the modern sheet skin paints every part from the family
 * channels.
 *
 * @module Sheet/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useCallback, useId, useMemo } from 'react';
import type { SheetProps } from '../../contracts';
import { SHEET_DEFAULTS } from '../../contracts';
import {
  OVERLAY_ADAPTATION_DEFAULTS,
  type ResolvedOverlayAdaptation,
} from '../../../../../../foundation/contracts/kernel/adaptation';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import { Portal } from '../../../../runtime/overlay/portal';
import { FocusTrap } from '../../../../runtime/overlay/focus-management/focus-trap';
import { useFieldOverlay } from '../../../../runtime/overlay/field-overlay';
import { usePresence } from '@/graphics/motion/react/runtime';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';

const FLOATING: ResolvedOverlayAdaptation = { presentation: 'floating' };

function CloseButton({ onClick, label }: { onClick: () => void; label: string }) {
  const interaction = useInteractionState();
  return (
    <button
      type="button"
      {...partAttributes('close-button', interaction.state)}
      {...interaction.handlers}
      onClick={onClick}
      aria-label={label}
    >
      <ActionCloseIcon decorative size={16} />
    </button>
  );
}

/**
 * Modern engine implementation of Sheet.
 *
 * Locks body scroll while open (and through the exit animation), routes Escape
 * through the shared layer stack, and returns an empty fragment once presence
 * reports the exit finished so no DOM nodes remain in the tree.
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
    adapt,
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

  // Presence: `open` flipping false keeps the sheet mounted until its own
  // slide-out animation finishes.
  const { shouldRender, dataState, ref: presenceRef } = usePresence(open);

  // overlay.sheet recipe (motion canon): the skin plays the slide on the
  // recipe's timing and declares no animation when it resolves final.
  const overlayMotion = useMotionRecipePresentation('overlay.sheet');
  const motionIsFinal = overlayMotion.recipe.state === 'final';

  const { adaptation, postureAttribute } = useAdaptation(adapt, {
    base: FLOATING,
    defaults: side === 'bottom' ? undefined : OVERLAY_ADAPTATION_DEFAULTS,
  });

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Shared overlay contract: the sheet's layer band with a stack offset, the
  // single Escape router and the ref-counted body scroll lock, held through
  // the slide-out. `restoreFocus` is off because the FocusTrap below restores.
  const overlay = useFieldOverlay({
    kind: 'sheet',
    open: shouldRender,
    surface: 'viewport',
    modal: true,
    lockScroll: true,
    restoreFocus: false,
    ...(closeOnEscape ? { onDismiss: handleClose } : {}),
  });

  const rootChannels = useMemo(
    () =>
      ({
        '--ds-sheet-layer': overlay.zIndex,
        '--ds-sheet-enter-duration': overlayMotion.variables['--ds-recipe-enter'],
        '--ds-sheet-exit-duration': overlayMotion.variables['--ds-recipe-exit'],
        '--ds-sheet-enter-curve': overlayMotion.variables['--ds-recipe-curve'],
        ...style,
        ...rootStyle,
      }) as React.CSSProperties,
    [overlay.zIndex, overlayMotion.variables, style, rootStyle],
  );

  if (!shouldRender) return <></>;

  const isBottom = side === 'bottom';
  const surfaceOverrides = panelStyle || surfaceStyle ? { ...panelStyle, ...surfaceStyle } : undefined;

  return (
    <Portal>
      <div
        data-part="root"
        {...overlayMotion.attributes}
        data-motion={motionIsFinal ? 'final' : 'animated'}
        className={`ds-sheet ds-sheet--modern ${className || ''} ${rootClassName || ''}`.trim()}
        style={rootChannels}
      >
        {showOverlay && (
          <div
            data-part="backdrop"
            data-open={dataState === 'open' ? 'true' : 'false'}
            onClick={closeOnOverlayClick ? handleClose : undefined}
          />
        )}

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
          data-presentation={adaptation.presentation}
          data-posture={postureAttribute}
          className={surfaceClassName || panelClassName || undefined}
          style={surfaceOverrides}
        >
          <FocusTrap
            active={open}
            autoFocus={autoFocus}
            restoreFocus={restoreFocus}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className="ds-sheet-focus-scope"
          >
            {isBottom && showHandle && (
              <div data-part="handle-area">
                <div data-part="handle" />
              </div>
            )}

            {/* The header always renders: Sheet has no closable=false, so the
                panel always exposes a visible dismiss control. */}
            <div data-part="header">
              {title ? (
                <div id={titleId} data-part="title" title={typeof title === 'string' ? title : undefined}>
                  {title}
                </div>
              ) : null}
              <CloseButton onClick={handleClose} label={i18n?.tOr('drawer.close', 'Close') ?? 'Close'} />
            </div>

            <div data-part="body" className={bodyClassName} style={bodyStyle}>
              {children}
            </div>

            {footer != null && (
              <div data-part="footer" className={footerClassName} style={footerStyle}>
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
