/**
 * Overlay - Utility Component
 * Backdrop overlay with optional blur effect and click handler
 */

'use client';

import React, { forwardRef, useCallback } from 'react';

export interface OverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Callback when overlay is clicked */
  onClick?: () => void;
  /** Whether clicking the overlay should trigger onClick */
  clickable?: boolean;
  /** Whether to apply blur effect */
  blur?: boolean;
  /** Blur intensity (in pixels) */
  blurAmount?: number;
  /** Background color/opacity */
  backgroundColor?: string;
  /** Z-index of the overlay */
  zIndex?: number;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Whether to disable animations */
  disableAnimation?: boolean;
  /** Children to render on top of overlay */
  children?: React.ReactNode;
}

/**
 * Overlay component for modal backdrops.
 * Supports blur effects, click handling, and smooth animations.
 */
export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  (props, ref) => {
    const {
      visible,
      onClick,
      clickable = true,
      blur = false,
      blurAmount = 4,
      backgroundColor = 'var(--ds-overlay-bg, var(--ds-modal-overlay-bg, rgba(0, 0, 0, 0.5)))',
      zIndex = 999,
      className = '',
      style = {},
      disableAnimation = false,
      children,
    } = props;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        // Only trigger if clicking directly on overlay (not children)
        if (e.target === e.currentTarget && clickable && onClick) {
          onClick();
        }
      },
      [clickable, onClick]
    );

    const overlayStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex,
      backgroundColor,
      backdropFilter: blur ? `blur(${blurAmount}px)` : undefined,
      WebkitBackdropFilter: blur ? `blur(${blurAmount}px)` : undefined,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: clickable ? 'pointer' : 'default',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      transition: disableAnimation
        ? 'none'
        : 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s, backdrop-filter 0.3s',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-overlay ${className}`}
        style={overlayStyle}
        onClick={handleClick}
        aria-hidden={!visible}
        data-visible={visible}
      >
        {children}
      </div>
    );
  }
);

Overlay.displayName = 'Overlay';

export default Overlay;
