'use client';

/**
 * @fileoverview Modern engine for the HoverCard overlay component. Positions
 * the card via the shared overlay positioning runtime
 * (`runtime/overlay/positioning`): the card renders in-tree, directly beside
 * the trigger, in BOTH branches -- top-layer promotion (anchor-css branch)
 * is DOM-position-agnostic, so it needs no portal escape hatch, and the
 * measured (js) branch keeps this engine's existing non-portaled posture
 * (checkpoint contract P4: HoverCard modern never portals). It applies NO
 * DaisyUI class and no utility-framework class of any kind: the trigger's
 * positioning context and the card's chrome come from this engine's own
 * skin, keyed on `ds-hover-card--modern` (K4-A drained the last inline
 * `padding`/`width` geometry and the `relative inline-block` utilities).
 * `align: start/end` is LOGICAL along the inline axis and mirrors under
 * `dir="rtl"`.
 *
 * @example
 * ```tsx
 * <ModernHoverCard
 *   content={<UserProfileCard />}
 *   trigger={<a href="/users/42">@username</a>}
 *   side="bottom"
 * />
 * ```
 *
 * The trigger MUST be a focusable element (link/button) for the card to be
 * keyboard-reachable: the engine wires focus/blur parity and clones
 * aria-controls/aria-expanded onto the trigger ELEMENT, but it never
 * fabricates interactivity on a non-interactive child (a plain <span>
 * receives no tabIndex -- a focusable-but-actionless trigger is a worse
 * accessibility outcome than a documented contract). Enforcing an
 * interactive trigger at the type level is registered contract debt.
 *
 * TOUCH (P2): coarse pointers get no reliable `mouseleave`, so a tapped-open
 * card also dismisses on an outside pointerdown (Popover's idiom); hover
 * intent, debounces and the presence-driven exit are unchanged.
 */

import React, { useState, useRef, useCallback, useEffect, useId, isValidElement, cloneElement } from 'react';
import type { HoverCardProps } from '../../contracts';
import { HOVERCARD_DEFAULTS, resolveOverlayPlacement } from '../../contracts';
import { useFieldOverlay } from '../../../../runtime/overlay/field-overlay';
import { toPhysicalPlacementAttribute } from '../../../../runtime/overlay/positioning';
import { useReadingDirectionIsRtl } from '@/infrastructure/runtime/i18n';
import { usePresence } from '@/graphics/motion/react/runtime';

/**
 * HoverCard implementation positioned by the shared overlay runtime.
 *
 * Uses a debounced open/close pattern: entering the trigger starts an open timer,
 * leaving starts a close timer, and entering the card itself cancels the close timer
 * so the user can interact with the card content. Disabled state short-circuits
 * visibility regardless of controlled open value.
 *
 * @param props - {@link HoverCardProps} shared across all engines.
 * @returns A relatively-positioned inline-block container with the positioned card.
 */
export default function ModernHoverCard(props: HoverCardProps): React.ReactElement {
  const {
    content,
    trigger,
    openDelay = HOVERCARD_DEFAULTS.openDelay,
    closeDelay = HOVERCARD_DEFAULTS.closeDelay,
    side = HOVERCARD_DEFAULTS.side,
    align = HOVERCARD_DEFAULTS.align,
    disabled = HOVERCARD_DEFAULTS.disabled,
    open: controlledOpen,
    onOpenChange,
    className,
    overlayClassName,
    overlayStyle,
  } = props;

  // The reading direction comes from the shared i18n authority; this family
  // measures nothing of its own.
  const directionIsRtl = useReadingDirectionIsRtl();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  // Disabled always wins: forces card hidden even if controlled open is true
  const isOpen = disabled ? false : (isControlled ? controlledOpen : internalOpen);

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);
  // Presence owns WHEN React stops rendering the card: on close the node
  // stays mounted with dataState='closed' until its own CSS exit animation
  // ends (the skin owns both visuals), so the card no longer pops out
  // instantly the way the old `isOpen &&` gate did.
  const { shouldRender, dataState, ref: presenceRef } = usePresence(isOpen);
  // The card never portals, so it must not join server markup:
  // `overlayCapabilities` resolves against `CSS`/`HTMLElement`, which differ
  // between the SSR probe (always false) and a capable browser, and
  // rendering the anchor-css branch's popover-attributed node on the first
  // client render would mismatch SSR's js-branch-shaped output.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The surface's ref fans out to the positioning runtime (measurement) and
  // to presence (its animationend gates unmount).
  const setSurfaceRef = useCallback(
    (node: HTMLDivElement | null) => {
      setSurfaceEl(node);
      presenceRef(node);
    },
    [presenceRef],
  );

  // Timer refs allow cancellation of pending open/close when the cursor
  // moves between the trigger and the card within the delay window
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleOpen = useCallback((value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  }, [isControlled, onOpenChange]);

  // Cancel any pending close before scheduling open -- prevents flicker
  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    clearTimeout(closeTimerRef.current);
    openTimerRef.current = setTimeout(() => handleOpen(true), openDelay);
  }, [disabled, openDelay, handleOpen]);

  // Cancel any pending open before scheduling close -- prevents premature show
  const handleMouseLeave = useCallback(() => {
    clearTimeout(openTimerRef.current);
    closeTimerRef.current = setTimeout(() => handleOpen(false), closeDelay);
  }, [closeDelay, handleOpen]);

  // Keyboard parity: the card is rich content (not a tooltip), so focus must
  // reach it without a pointer. Focus on the trigger opens with the same
  // debounce; blur closes only when focus leaves BOTH trigger and surface
  // (the surface renders in-tree, inside this wrapper). Escape closes and
  // returns focus to the trigger's focusable child (Dropdown precedent).
  const handleFocus = handleMouseEnter;

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && event.currentTarget.contains(next)) return;
      handleMouseLeave();
    },
    [handleMouseLeave],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Escape' || !isOpen) return;
      event.stopPropagation();
      clearTimeout(openTimerRef.current);
      clearTimeout(closeTimerRef.current);
      handleOpen(false);
      anchorEl
        ?.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus();
    },
    [isOpen, handleOpen, anchorEl],
  );

  // Touch parity: coarse pointers synthesize mouseenter on tap but produce no
  // reliable mouseleave, so without an outside dismiss a tapped-open card
  // stayed stuck until Escape. The kernel's shared outside-pointer watcher
  // supplies it; this handler only cancels the pending open/close debounce.
  // Mouse users are unaffected: moving the pointer to the tap target already
  // started the close debounce.
  const dismissOutside = useCallback(() => {
    clearTimeout(openTimerRef.current);
    clearTimeout(closeTimerRef.current);
    handleOpen(false);
  }, [handleOpen]);

  // The trigger wrapper is the anchor; the surface is the positioned
  // overlay. The surface only mounts while open, so element presence drives
  // the positioning lifecycle.
  //
  // The SIDE vocabulary is logical (`inline-start`/`inline-end`), resolved by
  // the positioning owner. The ALIGNMENT is still physical in the shared
  // runtime: along the inline axis (side: top/bottom) a logical `align`
  // mirrors under RTL, so it is resolved here from the reading direction
  // (Popover's toPhysicalPlacement precedent). Inline-axis sides align on the
  // BLOCK axis, which does not mirror in RTL.
  const placement = resolveOverlayPlacement(side, align);
  const logicalPlacement = React.useMemo<ReturnType<typeof resolveOverlayPlacement>>(() => {
    if (
      placement !== 'top-start' && placement !== 'top-end' &&
      placement !== 'bottom-start' && placement !== 'bottom-end'
    ) {
      return placement;
    }
    if (!anchorEl) return placement;
    if (!directionIsRtl) return placement;
    return (placement.endsWith('-start')
      ? placement.replace('-start', '-end')
      : placement.replace('-end', '-start')) as ReturnType<typeof resolveOverlayPlacement>;
  }, [anchorEl, placement]);

  const overlay = useFieldOverlay({
    kind: 'hover',
    open: isOpen,
    anchor: anchorEl,
    panel: surfaceEl,
    measure: true,
    placement: logicalPlacement,
    // ONE direction for this instance. The card has no anchor-context reader,
    // so the locale IS its authority -- and the surface stamps the same `dir`
    // below, which is what the anchor-css branch resolves `self-*` against.
    direction: directionIsRtl ? 'rtl' : 'ltr',
    // The card claims no Escape slot (its own trigger-scoped handler owns
    // that, keeping focus return to the trigger) and takes no scroll lock.
    modal: false,
    lockScroll: false,
    restoreFocus: false,
    onDismiss: dismissOutside,
    dismissOnEscape: false,
    dismissOnOutsidePointer: true,
  });
  const {
    strategy,
    anchorProps: anchorAttrs,
    layerProps,
  } = overlay;

  // Disclosure semantics live on the consumer's trigger ELEMENT (Popover's
  // describeTrigger precedent): this role-less wrapper may not carry
  // aria-controls/aria-expanded (axe aria-allowed-attr). Non-element triggers
  // (text, fragments) receive nothing — there is no valid host for them.
  const surfaceId = useId();
  const describedTrigger =
    isValidElement(trigger) && trigger.type !== React.Fragment
      ? cloneElement(
          trigger as React.ReactElement<{ 'aria-controls'?: string; 'aria-expanded'?: boolean }>,
          { 'aria-controls': surfaceId, 'aria-expanded': isOpen },
        )
      : trigger;

  // The band travels on the family layer channel; the measured positioning
  // keys spread last so they win over a caller's overlayStyle.
  const surfaceStyle = {
    '--ds-hover-card-layer': overlay.zIndex,
    ...overlayStyle,
    ...overlay.positionStyle,
  } as React.CSSProperties;

  return (
    <div
      ref={setAnchorEl}
      data-part="trigger"
      data-open={isOpen ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : undefined}
      className={`ds-hover-card ds-hover-card--modern ${className || ''}`.trim()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      {...anchorAttrs}
    >
      {describedTrigger}
      {shouldRender && mounted && (
        <div
          {...layerProps}
          ref={setSurfaceRef}
          id={surfaceId}
          dir={directionIsRtl ? 'rtl' : 'ltr'}
          data-part="surface"
          data-open={dataState === 'open' ? 'true' : 'false'}
          data-placement={toPhysicalPlacementAttribute(
            logicalPlacement,
            directionIsRtl ? 'rtl' : 'ltr',
          )}
          data-ds-position-strategy={strategy}
          className={overlayClassName || undefined}
          style={surfaceStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </div>
      )}
    </div>
  );
}

ModernHoverCard.displayName = 'HoverCard.Modern';
