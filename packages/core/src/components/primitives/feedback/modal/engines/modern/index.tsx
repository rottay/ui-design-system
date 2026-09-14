/**
 * @fileoverview Canonical Modal Modern Engine - Rottay Design System.
 * The native `<dialog>` promoted with `showModal()` owns top-layer stacking and
 * focus trapping. The engine stamps anatomy, presence and the resolved posture;
 * the modern modal skin paints every section from the family channels.
 *
 * @module Modal/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect, useState, useCallback, useRef, useId, useMemo } from 'react';
import type { ModalProps } from '../../contracts';
import { MODAL_DEFAULTS } from '../../contracts';
import {
  OVERLAY_ADAPTATION_DEFAULTS,
  type ResolvedOverlayAdaptation,
} from '../../../../../../foundation/contracts/kernel/adaptation';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import { Portal } from '../../../../runtime/overlay/portal';
import { usePortalScope } from '../../../../runtime/overlay/portal-scope';
import { TopLayerHostProvider, useTopLayerDialog } from '../../../../runtime/overlay/top-layer-host';
import { useModalInertSiblings } from '../../../../runtime/overlay/focus-management/inert-siblings';
import { useFieldOverlay } from '../../../../runtime/overlay/field-overlay';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { usePresence } from '@/graphics/motion/react/runtime';
import { useMotionRecipePresentation } from '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';

const FLOATING: ResolvedOverlayAdaptation = { presentation: 'floating' };
const FULLSCREEN: ResolvedOverlayAdaptation = { presentation: 'fullscreen' };

/** A modal button whose hover, press and focus ring the interaction kernel decides. */
function ModalButton({
  part,
  disabled,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { part: 'close-button' | 'action' }) {
  const interaction = useInteractionState({ disabled });
  return (
    <button type="button" disabled={disabled} {...rest} {...partAttributes(part, interaction.state)} {...interaction.handlers}>
      {children}
    </button>
  );
}

/**
 * Caller style may repaint the panel but never strands its geometry: `position`
 * always belongs to the engine, and the fullscreen pin owns `top`/`left` too.
 */
function callerPanelStyle(style: React.CSSProperties, fullscreen: boolean): React.CSSProperties {
  const { position: _position, ...rest } = style;
  if (!fullscreen) return rest;
  const { top: _top, left: _left, ...unpinned } = rest;
  return unpinned;
}

/**
 * Modern engine implementation of Modal using the native <dialog> API.
 * Leverages showModal()/close() for built-in top-layer stacking and browser
 * focus trapping.
 */
export default function ModernModal(props: ModalProps): React.ReactElement | null {
  // Optional channel with an English floor: the modal renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const i18nCommon = useOptionalTranslation('common');

  const {
    open = false,
    onClose,
    onOpenChange,
    onOpen,
    onCancel,
    onOk,
    children,
    size = MODAL_DEFAULTS.size ?? 'md',
    title,
    description,
    header,
    footer,
    hideFooter = false,
    okText,
    cancelText,
    confirmLoading = false,
    closeOnOverlayClick = MODAL_DEFAULTS.closeOnOverlayClick,
    closeOnBackdropClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape ?? true,
    closable = MODAL_DEFAULTS.closable ?? true,
    showBackdrop = MODAL_DEFAULTS.showBackdrop ?? true,
    overlayOpacity,
    blurBackdrop = MODAL_DEFAULTS.blurBackdrop ?? false,
    centered = MODAL_DEFAULTS.centered ?? true,
    placement = 'center',
    fullScreen = false,
    adaptiveFullscreen = MODAL_DEFAULTS.adaptiveFullscreen ?? true,
    adapt,
    preventScroll = MODAL_DEFAULTS.preventScroll ?? true,
    radius = MODAL_DEFAULTS.radius ?? 'lg',
    shadow = MODAL_DEFAULTS.shadow ?? true,
    padding = MODAL_DEFAULTS.padding ?? 'lg',
    divider = MODAL_DEFAULTS.divider ?? false,
    zIndex,
    disableAnimation = MODAL_DEFAULTS.disableAnimation ?? false,
    className = '',
    style = {},
    id,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = props;
  const generatedLabelId = useId();
  const titleId = `${id || generatedLabelId}-title`;
  const descriptionId = `${id || generatedLabelId}-description`;
  const backdropClosable = closeOnBackdropClick ?? closeOnOverlayClick ?? true;
  // A custom `header` replaces the description block too, so describedby must
  // not point at an id nothing renders.
  const rendersDescription = Boolean(description) && !header;
  // Merge, never replace: a caller's form-level description must not silence
  // the modal's own (the Checkbox describedby-merge contract).
  const describedBy =
    Array.from(
      new Set(
        [rendersDescription ? descriptionId : undefined, ariaDescribedBy]
          .filter((token): token is string => Boolean(token))
          .flatMap((token) => token.split(/\s+/))
          .filter(Boolean),
      ),
    ).join(' ') || undefined;
  const effectivePlacement = placement === 'center' && !centered ? 'top' : placement;
  const resolvedOkText = okText ?? i18nCommon?.tOr('ok', 'OK') ?? 'OK';
  const resolvedCancelText = cancelText ?? i18nCommon?.tOr('cancel', 'Cancel') ?? 'Cancel';

  // Inline anchor: the component's DOM position carries the tenant/locale/
  // density lineage that `usePortalScope` snapshots and re-stamps directly on
  // the portaled <dialog>, without adding a node above it (the top-layer
  // nesting contract pins `dialog.parentElement` to the shared portal root).
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);
  const portalScope = usePortalScope(anchorEl);

  const { adaptation, postureAttribute } = useAdaptation(adapt, {
    base: fullScreen ? FULLSCREEN : FLOATING,
    defaults: adaptiveFullscreen && !fullScreen ? OVERLAY_ADAPTATION_DEFAULTS : undefined,
  });
  const fullscreen = adaptation.presentation === 'fullscreen';

  // overlay.modal recipe (motion canon): the skin plays the panel and backdrop
  // keyframes on the recipe's timing, and declares none when it resolves final.
  const overlayMotion = useMotionRecipePresentation('overlay.modal');
  const motionIsFinal = disableAnimation || overlayMotion.recipe.state === 'final';
  const motionChannels = useMemo(
    () =>
      ({
        '--ds-modal-enter-duration': overlayMotion.variables['--ds-recipe-enter'],
        '--ds-modal-exit-duration': overlayMotion.variables['--ds-recipe-exit'],
        '--ds-modal-enter-curve': overlayMotion.variables['--ds-recipe-curve'],
        '--ds-modal-enter-y': overlayMotion.variables['--ds-recipe-y'],
        '--ds-modal-enter-scale': overlayMotion.variables['--ds-recipe-scale-from'],
      }) as React.CSSProperties,
    [overlayMotion.variables],
  );

  const handleCancel = useCallback(() => {
    onClose?.();
    onCancel?.();
    onOpenChange?.(false);
  }, [onClose, onCancel, onOpenChange]);

  const dialogRef = useRef<HTMLDialogElement>(null);

  // The <dialog> mounts inside <Portal>, which renders null until its own
  // mount effect resolves a container, so the element does not exist on the
  // commit where `open` first becomes true. A callback ref turns "the element
  // attached" into a render-visible signal the effects below depend on.
  const [dialogEl, setDialogEl] = useState<HTMLDialogElement | null>(null);
  // React nulls `dialogRef` before passive cleanups run, so the teardown cannot
  // read it; `lastDialogRef` records only a real node and survives detachment.
  const lastDialogRef = useRef<HTMLDialogElement | null>(null);
  const attachDialog = useCallback((node: HTMLDialogElement | null) => {
    dialogRef.current = node;
    if (node) lastDialogRef.current = node;
    setDialogEl(node);
  }, []);
  /** The element that was focused when this modal was promoted to the top layer. */
  const restoreTargetRef = useRef<HTMLElement | null>(null);

  // Presence: `open` flipping false keeps the dialog mounted and open in the
  // native top layer until the panel's own exit animation finishes; only then
  // does the dialog actually leave the top layer.
  const { shouldRender, dataState, ref: presenceRef } = usePresence(open, {
    onExitComplete: () => {
      if (dialogRef.current?.open) dialogRef.current.close();
    },
  });

  useModalInertSiblings(shouldRender);

  // Shared overlay contract. `modal: false` because a native <dialog> promoted
  // with showModal() receives Escape as its own `cancel` event. The scroll lock
  // IS the kernel's: it is ref-counted, so a lower drawer stays locked when
  // this modal closes. An explicit `zIndex` prop still wins over the band.
  const overlayLayer = useFieldOverlay({
    kind: 'modal',
    open: shouldRender,
    surface: 'viewport',
    modal: false,
    lockScroll: preventScroll,
    restoreFocus: false,
  });
  const layer = zIndex === undefined ? overlayLayer.zIndex : String(zIndex);

  // Promotion is keyed on the attached element, which arrives a commit after
  // `open` flips; the host is withdrawn as soon as the modal stops being the
  // active top layer, even while its exit animation plays.
  const rememberInvoker = useCallback(() => {
    restoreTargetRef.current = document.activeElement as HTMLElement | null;
  }, []);
  const topLayerHost = useTopLayerDialog(dialogEl, {
    open,
    hosted: open && shouldRender,
    beforePromote: rememberInvoker,
    onPromote: onOpen,
  });

  // Unmounting an open dialog skips the close steps, so the browser never
  // restores focus. Guarded on `dialog.open` so it cannot fight a real close().
  useEffect(() => () => {
    const dialog = lastDialogRef.current;
    const target = restoreTargetRef.current;
    restoreTargetRef.current = null;
    if (!dialog?.open || !target?.isConnected) return;
    const active = document.activeElement as HTMLElement | null;
    const stranded = !active || active === document.body || dialog.contains(active);
    if (stranded) target.focus();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget && backdropClosable) {
      handleCancel();
    }
  };

  const handleDialogClose = () => {
    if (open) handleCancel();
  };

  const resolvedFooter = hideFooter
    ? null
    : footer ?? ((onOk || onCancel) ? (
      <>
        {onCancel && (
          <ModalButton part="action" data-action="cancel" onClick={handleCancel}>
            {resolvedCancelText}
          </ModalButton>
        )}
        {onOk && (
          <ModalButton
            part="action"
            data-action="ok"
            data-loading={confirmLoading ? 'true' : 'false'}
            disabled={confirmLoading}
            aria-busy={confirmLoading || undefined}
            onClick={onOk}
          >
            {confirmLoading && <span data-part="spinner" aria-hidden="true" />}
            <span data-part="action-label">{resolvedOkText}</span>
          </ModalButton>
        )}
      </>
    ) : null);

  const scrim =
    overlayOpacity == null
      ? undefined
      : ({ '--ds-modal-overlay-strength': `${Math.min(Math.max(overlayOpacity, 0), 1) * 100}%` } as React.CSSProperties);

  // The anchor must render even while closed: it is the component's own DOM
  // position, the lineage source the portal scope snapshot reads from.
  return (
    <>
      <span ref={setAnchorEl} data-part="anchor" />
      {!shouldRender ? null : (
        <Portal>
          <TopLayerHostProvider host={topLayerHost}>
            <dialog
              ref={attachDialog}
              id={id}
              data-testid={dataTestId}
              data-part="root"
              data-portal-scope="true"
              {...portalScope.scope}
              dir={portalScope.direction}
              lang={portalScope.language}
              data-presentation={adaptation.presentation}
              data-posture={postureAttribute}
              data-placement={effectivePlacement}
              data-motion={motionIsFinal ? 'final' : 'animated'}
              className="ds-modal ds-modal--modern"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-labelledby={!ariaLabel && (header || title) ? titleId : undefined}
              aria-describedby={describedBy}
              {...overlayMotion.attributes}
              style={{
                ...portalScope.variables,
                ...motionChannels,
                '--ds-modal-layer': layer,
              } as React.CSSProperties}
              onClick={handleBackdropClick}
              onCancel={(event) => {
                event.preventDefault();
                if (closeOnEscape) handleCancel();
              }}
              onClose={handleDialogClose}
            >
              {showBackdrop && (
                <div
                  data-part="backdrop"
                  data-open={dataState === 'open' ? 'true' : 'false'}
                  data-blur={blurBackdrop !== false ? 'true' : 'false'}
                  data-scrim={scrim ? 'custom' : undefined}
                  style={scrim}
                />
              )}

              <div
                ref={presenceRef}
                data-part="surface"
                data-open={dataState === 'open' ? 'true' : 'false'}
                data-size={size}
                data-radius={radius}
                data-padding={padding}
                data-shadow={shadow ? 'true' : 'false'}
                data-divider={divider ? 'true' : 'false'}
                data-has-header={Boolean(title || description || header || closable) ? 'true' : 'false'}
                data-has-footer={resolvedFooter ? 'true' : 'false'}
                role="document"
                onClick={(e) => e.stopPropagation()}
                className={className || undefined}
                style={callerPanelStyle(style, fullscreen)}
              >
                {(title || description || header || closable) && (
                  <div data-part="header">
                    <div data-part="heading-group" id={header ? titleId : undefined}>
                      {header || (
                        <>
                          {title && (
                            <div id={titleId} data-part="title">
                              {title}
                            </div>
                          )}
                          {description && (
                            <div id={descriptionId} data-part="description">
                              {description}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {closable && (
                      <ModalButton
                        part="close-button"
                        onClick={handleCancel}
                        aria-label={i18n?.tOr('modal.close', 'Close') ?? 'Close'}
                      >
                        <ActionCloseIcon decorative size={16} />
                      </ModalButton>
                    )}
                  </div>
                )}

                <div data-part="body">{children}</div>

                {resolvedFooter && <div data-part="footer">{resolvedFooter}</div>}
              </div>
            </dialog>
          </TopLayerHostProvider>
        </Portal>
      )}
    </>
  );
}

ModernModal.displayName = 'ModernModal';
