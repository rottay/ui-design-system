'use client';

/**
 * @fileoverview HoverCard Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the HoverCard component.
 * Uses a portal card with mouse enter/leave + delay.
 *
 * @module HoverCard/Engines/Rustic
 * @category Overlay
 * @package @rottay/design-system
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { HoverCardProps } from '../HoverCard.types';
import { HOVERCARD_DEFAULTS } from '../HoverCard.types';

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
  const isOpen = disabled ? false : (isControlled ? controlledOpen : internalOpen);

  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
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

  const getCardTransform = () => {
    switch (side) {
      case 'top': return 'translate(-50%, -100%)';
      case 'bottom': return 'translateX(-50%)';
      case 'left': return 'translate(-100%, -50%)';
      case 'right': return 'translateY(-50%)';
      default: return 'translateX(-50%)';
    }
  };

  const cardContent = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={cardRef}
          className={overlayClassName}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            transform: getCardTransform(),
            zIndex: 1060,
            minWidth: 240,
            maxWidth: 320,
            backgroundColor: 'var(--ds-popover-bg, var(--ds-color-bg-elevated, #fff))',
            borderRadius: 'var(--ds-popover-radius, var(--ds-radius-lg, 12px))',
            boxShadow: 'var(--ds-popover-shadow, var(--ds-shadow-lg))',
            padding: 16,
            border: '1px solid var(--ds-popover-border-color, var(--ds-color-neutral-200, #e5e7eb))',
            fontFamily: 'var(--ds-font-family-base, inherit)',
            backdropFilter: 'var(--ds-modal-overlay-backdrop, blur(4px))',
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
