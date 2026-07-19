'use client';

/**
 * @fileoverview Rustic engine for the HoverCard overlay component. Portals
 * the card through the shared portal root and positions it via the shared
 * overlay positioning runtime (`runtime/overlay/positioning`): this
 * engine's existing portal posture (checkpoint contract P4: HoverCard
 * rustic always portals) is preserved in BOTH branches -- top-layer
 * promotion (anchor-css branch) is DOM-position-agnostic, so portaling
 * ahead of it costs nothing. Supports configurable open/close delays and
 * all placement + alignment combinations.
 *
 * @example
 * ```tsx
 * <RusticHoverCard
 *   content={<UserProfileCard />}
 *   trigger={<span>@username</span>}
 *   side="right"
 *   openDelay={300}
 * />
 * ```
 */

import React, { useState, useRef, useCallback } from 'react';
import type { HoverCardProps } from '../../contracts';
import { HOVERCARD_DEFAULTS, resolveOverlayPlacement } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
} from '../../../../runtime/overlay/positioning';

/**
 * HoverCard implementation portaled through the shared portal root and
 * positioned by the shared overlay runtime.
 *
 * Debounced open/close timers allow the user to move the cursor from
 * trigger to card without the card disappearing.
 *
 * @param props - {@link HoverCardProps} shared across all engines.
 * @returns The trigger element plus a portal-rendered hover card.
 */
export default function RusticHoverCard(props: HoverCardProps): React.ReactElement {
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
    style,
    overlayClassName,
    overlayStyle,
  } = props;

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  // Disabled always wins: forces card hidden even if controlled open is true
  const isOpen = disabled ? false : (isControlled ? controlledOpen : internalOpen);

  const [triggerEl, setTriggerEl] = useState<HTMLDivElement | null>(null);
  const [cardEl, setCardEl] = useState<HTMLDivElement | null>(null);

  // Timer refs enable cancellation when cursor moves between trigger and card
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleOpen = useCallback((value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  }, [isControlled, onOpenChange]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    clearTimeout(closeTimerRef.current);
    openTimerRef.current = setTimeout(() => handleOpen(true), openDelay);
  }, [disabled, openDelay, handleOpen]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(openTimerRef.current);
    closeTimerRef.current = setTimeout(() => handleOpen(false), closeDelay);
  }, [closeDelay, handleOpen]);

  // The trigger is the anchor; the portaled card is the positioned overlay.
  // The card only mounts while open, so element presence drives the
  // positioning lifecycle.
  const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
    anchor: triggerEl,
    overlay: cardEl,
    placement: resolveOverlayPlacement(side, align),
  });

  const cardContent = isOpen ? (
    <Portal>
      <OverlayPortalBoundary>
        <div
          ref={setCardEl}
          data-part="surface"
          data-open="true"
          data-side={side}
          data-ds-position-strategy={strategy}
          className={`rottay-hover-card--rustic ${overlayClassName || ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            zIndex: 1060,
            minWidth: 240,
            maxWidth: 320,
            padding: 16,
            fontFamily: 'var(--ds-font-family-base, inherit)',
            ...overlayStyle,
            // Positioning keys come from the shared overlay runtime and
            // spread last so they win over a caller's overlayStyle.
            ...positionStyle,
          }}
        >
          {content}
        </div>
      </OverlayPortalBoundary>
    </Portal>
  ) : null;

  return (
    <>
      <div
        ref={setTriggerEl}
        data-part="trigger"
        data-open={isOpen ? 'true' : 'false'}
        className={className}
        style={{ display: 'inline-block', ...style }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...anchorAttrs}
      >
        {trigger}
      </div>
      {cardContent}
    </>
  );
}

RusticHoverCard.displayName = 'HoverCard.Rustic';
