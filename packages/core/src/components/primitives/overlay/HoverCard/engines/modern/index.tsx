'use client';

/**
 * @fileoverview HoverCard Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the HoverCard component.
 * Uses a tooltip-like pattern with card content.
 *
 * @module HoverCard/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useState, useRef, useCallback } from 'react';
import type { HoverCardProps } from '../../types';
import { HOVERCARD_DEFAULTS } from '../../types';

const SIDE_CLASSES: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

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
  const isOpen = disabled ? false : (isControlled ? controlledOpen : internalOpen);

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

  const positionClass = SIDE_CLASSES[side] || SIDE_CLASSES.bottom;

  return (
    <div
      className={`relative inline-block ${className || ''}`}
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
            className={`card bg-base-100 shadow-xl border border-base-300 p-4 w-72 ${overlayClassName || ''}`}
            style={overlayStyle}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

ModernHoverCard.displayName = 'HoverCard.Modern';
