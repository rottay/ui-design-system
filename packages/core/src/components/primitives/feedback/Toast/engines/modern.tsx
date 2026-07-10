/**
 * @fileoverview Toast Modern Engine - Rottay Design System
 * @description Token-driven Tailwind implementation of the Toast component.
 * Uses DS token inline styles for toast notifications.
 *
 * @remarks
 * The Modern engine uses DS token inline styles:
 * - `alert` structural class for container styling
 * - DS token inline styles (--ds-color-*) for color variants
 * - Tailwind utilities for layout and spacing
 *
 * This implementation provides:
 * - Utility-first styling with Tailwind CSS
 * - DS token semantic color styles
 * - Consistent animation timing
 * - Full feature parity with other engines
 *
 * @example Basic Usage
 * ```tsx
 * <Toast
 *   engine="modern"
 *   variant="success"
 *   description="File uploaded successfully"
 *   visible={true}
 * />
 * ```
 *
 * @example With Title and Description
 * ```tsx
 * <Toast
 *   engine="modern"
 *   variant="warning"
 *   title="Low Storage"
 *   description="You have less than 10% storage remaining."
 *   visible={true}
 * />
 * ```
 *
 * @see {@link ToastProps} for prop documentation
 * @see {@link Toast} for the engine-agnostic component
 *
 * @module Toast/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ToastProps, ToastVariant } from '../Toast.types';
import { TOAST_DEFAULTS, TOAST_ANIMATION } from '../Toast.types';
import { getToastAnimationStyle } from '../utils/animations';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps Toast variant to DS token inline styles.
 *
 * @description
 * Converts the design system's variant to a tinted background and
 * matching text color using CSS custom properties.
 * Variants outside this switch (e.g. `primary`, `secondary`, `gradient`)
 * return an empty object and inherit the `.alert` class's own styling.
 *
 * @param variant - Toast variant
 * @returns React.CSSProperties with background and color
 *
 * @internal
 */
function getAlertStyle(variant: ToastVariant): React.CSSProperties {
  switch (variant) {
    case 'default':
      // Card is the DS's only BrandTheme-reachable neutral elevated surface
      // today (chrome.cardComponent.bg/color) -- Toast has no chrome.toast.*
      // section of its own. The foundation --ds-color-bg-elevated/text-primary
      // literals are not emitted by compileBrandTheme, so they cannot move
      // for a dynamic tenant; --ds-card-bg/--ds-card-color can.
      return { background: 'var(--ds-card-bg)', color: 'var(--ds-card-color)' };
    case 'success':
      return { background: 'color-mix(in srgb, var(--ds-color-success) 10%, transparent)', color: 'var(--ds-color-success)' };
    case 'error':
      return { background: 'color-mix(in srgb, var(--ds-color-error) 10%, transparent)', color: 'var(--ds-color-error)' };
    case 'warning':
      return { background: 'color-mix(in srgb, var(--ds-color-warning) 10%, transparent)', color: 'var(--ds-color-warning)' };
    case 'info':
      return { background: 'color-mix(in srgb, var(--ds-color-info) 10%, transparent)', color: 'var(--ds-color-info)' };
    default:
      return {};
  }
}

/**
 * Returns the default icon SVG for a given variant.
 *
 * @description
 * Provides semantic icons matching the alert icon styling:
 * - Success: Checkmark circle
 * - Error: X circle
 * - Warning: Triangle exclamation
 * - Info: Information circle
 *
 * @param variant - Toast variant
 * @returns React node with SVG icon, or null
 *
 * @internal
 */
function getDefaultIcon(variant: ToastVariant): React.ReactNode {
  switch (variant) {
    case 'success':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'error':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'warning':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

// ============================================================================
// Modern Toast Component
// ============================================================================

/**
 * ModernToast - Token-driven implementation of Toast.
 *
 * @description
 * Renders an alert component styled as a toast notification using
 * DS token inline styles and Tailwind utilities.
 *
 * @remarks
 * This component manages its own visibility state and animations.
 * It uses DS token inline styles for consistent styling within
 * token-themed applications.
 *
 * @param props - {@link ToastProps}
 * @returns Styled alert element, or null if not visible
 *
 * @example
 * ```tsx
 * <ModernToast
 *   variant="success"
 *   title="Success!"
 *   description="Your profile has been updated."
 *   closable={true}
 *   visible={true}
 * />
 * ```
 */
export default function ModernToast(props: ToastProps): React.ReactElement | null {
  const {
    variant = TOAST_DEFAULTS.variant,
    title,
    description,
    icon,
    duration = TOAST_DEFAULTS.duration,
    closable = TOAST_DEFAULTS.closable,
    onClose,
    action,
    visible = true,
    pauseOnHover = TOAST_DEFAULTS.pauseOnHover,
    showProgress = TOAST_DEFAULTS.showProgress,
    children,
    className = '',
    style,
  } = props;

  // ========================================================================
  // State Management
  // ========================================================================

  const [isVisible, setIsVisible] = useState(visible);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles the close animation and callback.
   * Triggers exit animation before calling onClose.
   */
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, TOAST_ANIMATION.exitDuration);
  }, [onClose]);

  // ========================================================================
  // Auto-Dismiss Effect
  // ========================================================================

  /**
   * Effect to handle auto-dismiss timer and progress bar animation.
   */
  useEffect(() => {
    if (!visible || duration === 0 || isPaused) return;

    const startTime = Date.now();
    // Scale remaining time by current progress so pausing and resuming
    // continues from where it left off instead of restarting the timer
    const remainingTime = (progress / 100) * duration;

    const timer = setTimeout(() => {
      handleClose();
    }, remainingTime);

    // Progress animation
    let animationFrame: number;
    if (showProgress) {
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.max(0, (1 - elapsed / remainingTime) * progress);
        setProgress(newProgress);
        if (newProgress > 0 && !isPaused) {
          animationFrame = requestAnimationFrame(updateProgress);
        }
      };
      animationFrame = requestAnimationFrame(updateProgress);
    }

    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [visible, duration, isPaused, handleClose, showProgress, progress]);

  // ========================================================================
  // Visibility Sync Effect
  // ========================================================================

  /**
   * Effect to sync internal visibility with visible prop.
   */
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsExiting(false);
      setProgress(100);
    } else if (!visible && isVisible) {
      handleClose();
    }
  }, [visible, isVisible, handleClose]);

  // Don't render if not visible
  if (!isVisible) return null;

  // ========================================================================
  // Class Names
  // ========================================================================

  // DS token styles provide the variant colouring; boxShadow via DS elevation
  // token adds depth so the toast visually floats above the page content
  const alertStyle = getAlertStyle(variant as ToastVariant);
  const baseClasses = 'alert';
  // Enter/exit motion comes entirely from the inline `animation` set below via
  // getToastAnimationStyle, which reads --ds-toast-enter/exit-duration/easing
  // and is neutralized by the global prefers-reduced-motion guard. No
  // Tailwind animate-* utility class is applied here: this design system does
  // not define one, and it would carry a literal duration outside that guard.

  // ========================================================================
  // Event Handlers for Hover
  // ========================================================================

  /** Handle mouse enter for pause on hover */
  const handleMouseEnter = pauseOnHover ? () => setIsPaused(true) : undefined;
  /** Handle mouse leave for pause on hover */
  const handleMouseLeave = pauseOnHover ? () => setIsPaused(false) : undefined;

  // Explicit `icon` prop (including null to suppress) overrides the default.
  // Checking !== undefined distinguishes "no prop" from "intentionally null".
  const displayIcon = icon !== undefined ? icon : getDefaultIcon(variant as ToastVariant);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div
      role="alert"
      className={`${baseClasses} ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--ds-elevation-2)',
        ...alertStyle,
        ...getToastAnimationStyle('top-right', isExiting ? 'out' : 'in', 'fade'),
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      {displayIcon}

      {/* Content */}
      <div className="flex flex-col">
        {title && <span className="font-semibold">{title}</span>}
        {description && <span className="text-sm">{description}</span>}
        {children}
      </div>

      {/* Actions */}
      <div className="flex-none flex gap-2">
        {action && (
          <button
            onClick={() => {
              action.onClick();
              if (action.closeOnClick !== false) {
                handleClose();
              }
            }}
            style={{
              height: 32,
              padding: '0 12px',
              fontSize: 13,
              borderRadius: 'var(--ds-radius-md)',
              border: 'none',
              background: 'transparent',
              color: 'var(--ds-color-text-primary)',
              cursor: 'pointer',
            }}
          >
            {action.label}
          </button>
        )}

        {closable && (
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--ds-color-text-primary)',
              cursor: 'pointer',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar shrinks from 100% to 0% matching the auto-dismiss timer.
          bg-current inherits the alert's text color for consistent theming. */}
      {showProgress && duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
          style={{ width: `${progress}%`, transition: 'width var(--ds-motion-fast) linear' }}
        />
      )}
    </div>
  );
}

ModernToast.displayName = 'ModernToast';
