/**
 * @fileoverview Overlay - full-viewport backdrop for modals, drawers, and sheets.
 * Supports optional blur, configurable background color, smooth opacity transitions,
 * and click-to-dismiss. The only importer today is `overlay/Modal`'s rustic engine.
 *
 * @example
 * ```tsx
 * <Overlay visible={isOpen} blur onClick={handleClose}>
 *   <ModalContent />
 * </Overlay>
 * ```
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
 * Full-viewport overlay with opacity/visibility transitions.
 * Click handler fires only on direct backdrop click (not child content).
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

    // Guard against clicks that bubble up from modal content.
    // e.target === e.currentTarget ensures only direct backdrop clicks dismiss.
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && clickable && onClick) {
          onClick();
        }
      },
      [clickable, onClick]
    );

    // Use opacity + visibility for the show/hide transition so the overlay
    // remains in the DOM (preserving focus trap and portal mount) while
    // smoothly fading. `visibility: hidden` removes it from the a11y tree
    // and prevents pointer events when not visible.
    const overlayStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex,
      backgroundColor,
      // `blurAmount` is a free px prop, so the filter cannot be enumerated in
      // CSS. The skin reads this custom property for both the prefixed and the
      // unprefixed backdrop-filter (Safari); `none` is the unblurred value.
      ['--ds-overlay-backdrop-filter' as any]: blur ? `blur(${blurAmount}px)` : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: clickable ? 'pointer' : 'default',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      // Expo-out easing for a snappy, natural-feeling fade.
      transition: disableAnimation
        ? 'none'
        : 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s, backdrop-filter 0.3s',
      ...style,
    };

    return (
      <div
        ref={ref}
        data-part="backdrop"
        className={`rottay-overlay ${className}`}
        style={overlayStyle}
        onClick={handleClick}
        // aria-hidden keeps screen readers from reading backdrop content
        // when the overlay is not visible.
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
