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
 * skin, keyed on `rottay-hover-card--modern` (K4-A drained the last inline
 * `padding`/`width` geometry and the `relative inline-block` utilities).
 * `align: start/end` is LOGICAL along the inline axis and mirrors under
 * `dir="rtl"`.
 *
 * @example
 * ```tsx
 * <ModernHoverCard
 *   content={<UserProfileCard />}
 *   trigger={<span>@username</span>}
 *   side="bottom"
 * />
 * ```
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { HoverCardProps } from '../../contracts';
import { HOVERCARD_DEFAULTS, resolveOverlayPlacement } from '../../contracts';
import { useOverlayPosition } from '../../../../runtime/overlay/positioning';

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

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  // Disabled always wins: forces card hidden even if controlled open is true
  const isOpen = disabled ? false : (isControlled ? controlledOpen : internalOpen);

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);
  // The card never portals, so it must not join server markup:
  // `overlayCapabilities` resolves against `CSS`/`HTMLElement`, which differ
  // between the SSR probe (always false) and a capable browser, and
  // rendering the anchor-css branch's popover-attributed node on the first
  // client render would mismatch SSR's js-branch-shaped output.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // The trigger wrapper is the anchor; the surface is the positioned
  // overlay. The surface only mounts while open, so element presence drives
  // the positioning lifecycle.
  //
  // `start`/`end` in the shared runtime are PHYSICAL. Along the inline axis
  // (side: top/bottom) a logical `align` mirrors under RTL, so the physical
  // placement is resolved from the trigger's reading direction (Popover's
  // toPhysicalPlacement precedent). Left/right sides align on the BLOCK
  // axis, which does not mirror in RTL.
  const placement = resolveOverlayPlacement(side, align);
  const logicalPlacement = React.useMemo<ReturnType<typeof resolveOverlayPlacement>>(() => {
    if (
      placement !== 'top-start' && placement !== 'top-end' &&
      placement !== 'bottom-start' && placement !== 'bottom-end'
    ) {
      return placement;
    }
    if (!anchorEl) return placement;
    const isRtl =
      anchorEl.closest<HTMLElement>('[dir]')?.dir === 'rtl' ||
      window.getComputedStyle(anchorEl).direction === 'rtl';
    if (!isRtl) return placement;
    return (placement.endsWith('-start')
      ? placement.replace('-start', '-end')
      : placement.replace('-end', '-start')) as ReturnType<typeof resolveOverlayPlacement>;
  }, [anchorEl, placement]);

  const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
    anchor: anchorEl,
    overlay: surfaceEl,
    placement: logicalPlacement,
  });

  // Card chrome (width, padding) is skin-owned (hover-card.css); only the
  // z-index token channel, consumer overrides and measured positioning stay
  // inline. overlayStyle still wins over the skin via the inline cascade.
  const surfaceStyle: React.CSSProperties = {
    zIndex: 'var(--ds-z-popover)',
    ...overlayStyle,
    // Positioning keys come from the shared overlay runtime and spread last
    // so they win over a caller's overlayStyle.
    ...positionStyle,
  };

  return (
    <div
      ref={setAnchorEl}
      data-part="trigger"
      data-open={isOpen ? 'true' : 'false'}
      className={`rottay-hover-card--modern ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...anchorAttrs}
    >
      {trigger}
      {isOpen && mounted && (
        <div
          ref={setSurfaceEl}
          data-part="surface"
          data-open="true"
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
