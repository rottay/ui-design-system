'use client';

/**
 * @fileoverview Drawer Modern Engine - Rottay Design System
 * @description Slide-in panel on the shared overlay contract. The engine stamps
 * anatomy, presence, placement and the resolved posture; the modern drawer
 * skin paints the scrim, the panel, its sections and its motion from the
 * family channels.
 *
 * @module Drawer/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useCallback, useId, useMemo } from 'react';
import type { DrawerProps, DrawerSize } from '../../contracts';
import { DRAWER_DEFAULTS } from '../../contracts';
import {
  OVERLAY_ADAPTATION_DEFAULTS,
  type ResolvedOverlayAdaptation,
} from '../../../../../../foundation/contracts/kernel/adaptation/composition/families/overlay';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import { usePresence } from '@/graphics/motion/react/runtime';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';
import { useFieldOverlay } from '../../../../runtime/overlay/field-overlay';
import { FocusTrap } from '../../../../runtime/overlay/focus-management/focus-trap';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { LayoutSidebarStartIcon } from '@/graphics/icons/semantic/generated/roles/layout-sidebar-start';

const FLOATING: ResolvedOverlayAdaptation = { presentation: 'floating' };

/** A numeric extent is px; a string passes through as authored. */
function extent(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Caller style may repaint the panel but never strands it: the fixed position,
 * the viewport edges and the layer band belong to the engine.
 */
function callerPanelStyle(style: React.CSSProperties | undefined): React.CSSProperties | undefined {
  if (!style) return undefined;
  const { position: _position, zIndex: _zIndex, top: _top, right: _right, bottom: _bottom, left: _left, inset: _inset, ...rest } = style;
  return rest;
}

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

export default function ModernDrawer(props: DrawerProps): React.ReactElement {
  // Optional channel: the drawer renders standalone and falls back to the
  // English accessibility floor when no I18nProvider is mounted.
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
    adapt,
    className = '',
    style,
    id,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = props;
  const generatedTitleId = useId();
  const titleId = `${id || generatedTitleId}-title`;

  const handleClose = useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  // Presence: `open` flipping false keeps the drawer mounted until its own
  // slide-out animation finishes.
  const { shouldRender, dataState, ref: presenceRef } = usePresence(open ?? false);

  // Shared overlay contract: the drawer band with a stack offset, the single
  // Escape router and the ref-counted scroll lock, registered through the
  // slide-out so the page behind stays locked until the panel has left.
  const overlayLayer = useFieldOverlay({
    kind: 'drawer',
    open: shouldRender,
    surface: 'viewport',
    modal: true,
    lockScroll: true,
    restoreFocus: false,
    ...(closeOnEscape ? { onDismiss: handleClose } : {}),
  });

  const { adaptation, postureAttribute } = useAdaptation(adapt, {
    base: FLOATING,
    defaults: OVERLAY_ADAPTATION_DEFAULTS,
  });

  // overlay.sheet recipe: a drawer is a side panel, so its enter/exit timing
  // resolves from the sheet recipe; the skin declares no animation when final.
  const overlayMotion = useMotionRecipePresentation('overlay.sheet');
  const motionIsFinal = overlayMotion.recipe.state === 'final';

  const panelChannels = useMemo(
    () =>
      ({
        '--ds-drawer-layer': overlayLayer.zIndex,
        '--ds-drawer-enter-duration': overlayMotion.variables['--ds-recipe-enter'],
        '--ds-drawer-exit-duration': overlayMotion.variables['--ds-recipe-exit'],
        '--ds-drawer-enter-curve': overlayMotion.variables['--ds-recipe-curve'],
        ...(width === undefined ? null : { '--ds-drawer-width': extent(width) }),
        ...(height === undefined ? null : { '--ds-drawer-height': extent(height) }),
        ...callerPanelStyle(style),
      }) as React.CSSProperties,
    [overlayLayer.zIndex, overlayMotion.variables, width, height, style],
  );

  const scrimChannels = useMemo(
    () =>
      ({
        '--ds-drawer-layer': overlayLayer.zIndex,
        '--ds-drawer-enter-duration': overlayMotion.variables['--ds-recipe-enter'],
        '--ds-drawer-exit-duration': overlayMotion.variables['--ds-recipe-exit'],
        '--ds-drawer-enter-curve': overlayMotion.variables['--ds-recipe-curve'],
        ...(maskOpacity == null ? null : { '--ds-drawer-overlay-opacity': maskOpacity }),
      }) as React.CSSProperties,
    [overlayLayer.zIndex, overlayMotion.variables, maskOpacity],
  );

  if (!shouldRender) return <></>;

  const motion = motionIsFinal ? 'final' : 'animated';

  return (
    <>
      {mask && (
        <div
          data-part="backdrop"
          data-open={dataState === 'open' ? 'true' : 'false'}
          data-motion={motion}
          className="ds-drawer-backdrop"
          onClick={closeOnOverlayClick && closable !== false ? handleClose : undefined}
          style={scrimChannels}
        />
      )}

      {/* The shared FocusTrap owns initial focus, Tab cycling and the restore
          to the trigger; its wrapper adds no layout box. */}
      <FocusTrap active={dataState === 'open'} autoFocus restoreFocus className="ds-drawer-trap">
        <div
          ref={presenceRef}
          id={id}
          data-testid={dataTestId}
          data-part="surface"
          {...overlayMotion.attributes}
          data-placement={placement}
          data-size={size}
          data-custom-width={width === undefined ? undefined : 'true'}
          data-custom-height={height === undefined ? undefined : 'true'}
          data-presentation={adaptation.presentation}
          data-posture={postureAttribute}
          data-motion={motion}
          data-has-title={title ? 'true' : 'false'}
          data-has-footer={!hideFooter && footer ? 'true' : 'false'}
          data-open={dataState === 'open' ? 'true' : 'false'}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={!ariaLabel && title ? titleId : undefined}
          aria-describedby={ariaDescribedBy}
          className={`ds-drawer ds-drawer--modern ${className}`.trim()}
          style={panelChannels}
        >
          {(title || closable) && (
            <div data-part="header">
              <div data-part="heading-group">
                {title && (
                  <>
                    <span data-part="header-icon" aria-hidden="true">
                      <LayoutSidebarStartIcon decorative size={18} />
                    </span>
                    <div id={titleId} data-part="title" role="heading" aria-level={2}>
                      {title}
                    </div>
                  </>
                )}
              </div>
              {closable && <CloseButton onClick={handleClose} label={i18n?.tOr('drawer.close', 'Close') ?? 'Close'} />}
            </div>
          )}

          <div data-part="body">{children}</div>

          {!hideFooter && footer && <div data-part="footer">{footer}</div>}
        </div>
      </FocusTrap>
    </>
  );
}
