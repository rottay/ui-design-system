'use client';

/**
 * @fileoverview Modern (Tailwind) engine for the HoverCard overlay component.
 * Positions the card absolutely relative to the trigger using Tailwind
 * transform/translate utilities, with configurable open/close delays.
 * It applies NO DaisyUI class of any kind: the card's chrome comes from this
 * engine's own skin, keyed on `rottay-hover-card--modern`.
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

import React, { useState, useRef, useCallback } from 'react';
import type { HoverCardProps } from '../HoverCard.types';
import { HOVERCARD_DEFAULTS } from '../HoverCard.types';

/** Maps each side to Tailwind position + translate classes for card placement. */
const SIDE_CLASSES: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * HoverCard implementation using Tailwind positioning utilities.
 *
 * Uses a debounced open/close pattern: entering the trigger starts an open timer,
 * leaving starts a close timer, and entering the card itself cancels the close timer
 * so the user can interact with the card content. Disabled state short-circuits
 * visibility regardless of controlled open value.
 *
 * @param props - {@link HoverCardProps} shared across all engines.
 * @returns A relatively-positioned inline-block container with an absolutely-placed card.
 */
export default function ModernHoverCard(props: HoverCardProps): React.ReactElement {
  const {
    content,
    trigger,
    openDelay = HOVERCARD_DEFAULTS.openDelay,
    closeDelay = HOVERCARD_DEFAULTS.closeDelay,
    side = HOVERCARD_DEFAULTS.side,
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

  const positionClass = SIDE_CLASSES[side] || SIDE_CLASSES.bottom;

  return (
    <div
      data-part="trigger"
      data-open={isOpen ? 'true' : 'false'}
      className={`relative inline-block rottay-hover-card--modern ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      {isOpen && (
        <div
          className={`absolute z-50 ${positionClass}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            data-part="surface"
            data-open="true"
            className={overlayClassName || undefined}
            style={{ padding: 16, width: 288, ...overlayStyle }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

ModernHoverCard.displayName = 'HoverCard.Modern';
