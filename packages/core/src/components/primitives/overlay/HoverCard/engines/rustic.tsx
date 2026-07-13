'use client';

/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the HoverCard overlay component.
 * Renders a portal-based card at a position computed from the trigger's bounding
 * rect, styled entirely via inline CSS and DS custom properties. Supports
 * configurable open/close delays and all four side placements.
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

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { HoverCardProps } from '../HoverCard.types';
import { HOVERCARD_DEFAULTS } from '../HoverCard.types';

/**
 * HoverCard implementation using pure inline CSS and React portals.
 *
 * The card is portalled to `document.body` and positioned absolutely using
 * the trigger's bounding rect plus scroll offsets. A CSS `transform` based on
 * the `side` prop ensures the card is centred/aligned correctly. Debounced
 * open/close timers allow the user to move the cursor from trigger to card
 * without the card disappearing.
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isControlled = controlledOpen !== undefined;
  // Disabled always wins: forces card hidden even if controlled open is true
  const isOpen = disabled ? false : (isControlled ? controlledOpen : internalOpen);

  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
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

  // Recalculate card position from the trigger's bounding rect each time
  // the card opens or the side prop changes
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;
      const gap = 8;

      switch (side) {
        case 'top':
          top = rect.top + window.scrollY - gap;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + window.scrollY + gap;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.left + window.scrollX - gap;
          break;
        case 'right':
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.right + window.scrollX + gap;
          break;
      }

      setPosition({ top, left });
    }
  }, [isOpen, side]);


  const cardContent = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={cardRef}
          data-part="surface"
          data-open="true"
          data-side={side}
          className={`rottay-hover-card--rustic ${overlayClassName || ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 1060,
            minWidth: 240,
            maxWidth: 320,
            padding: 16,
            fontFamily: 'var(--ds-font-family-base, inherit)',
            ...overlayStyle,
          }}
        >
          {content}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div
        ref={triggerRef}
        data-part="trigger"
        data-open={isOpen ? 'true' : 'false'}
        className={className}
        style={{ display: 'inline-block', ...style }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {trigger}
      </div>
      {cardContent}
    </>
  );
}

RusticHoverCard.displayName = 'HoverCard.Rustic';
