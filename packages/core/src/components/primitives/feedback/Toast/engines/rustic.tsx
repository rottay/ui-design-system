/**
 * @fileoverview Toast Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Toast component.
 * Headless implementation with inline styles and zero external dependencies.
 *
 * @remarks
 * The Rustic engine provides a completely self-contained toast implementation:
 * - No external CSS framework dependencies
 * - All styles applied via inline CSS
 * - Maximum accessibility with ARIA attributes
 * - Ideal for projects without Ant Design or DaisyUI
 *
 * This implementation provides:
 * - Pure React with no external styling dependencies
 * - Complete feature parity with other engines
 * - Inline styles for maximum isolation
 * - Full accessibility support
 *
 * @example Basic Usage
 * ```tsx
 * <Toast
 *   engine="rustic"
 *   variant="success"
 *   description="Operation completed"
 *   visible={true}
 * />
 * ```
 *
 * @example With Custom Styling
 * ```tsx
 * <Toast
 *   engine="rustic"
 *   variant="info"
 *   title="Custom Toast"
 *   description="With custom border radius and no shadow."
 *   radius="lg"
 *   shadow={false}
 *   visible={true}
 * />
 * ```
 *
 * @see {@link ToastProps} for prop documentation
 * @see {@link Toast} for the engine-agnostic component
 *
 * @module Toast/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ToastProps, ToastVariant } from '../Toast.types';
import { TOAST_DEFAULTS, TOAST_ANIMATION, VARIANT_COLORS } from '../Toast.types';
import { getToastAnimationStyle } from '../utils/animations';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Returns the default icon SVG for a given variant.
 *
 * @description
 * Provides semantic icons for each variant type:
 * - Success: Checkmark circle
 * - Error: X circle
 * - Warning: Triangle exclamation
 * - Info: Information circle
 *
 * @param variant - Toast variant
 * @returns React node containing SVG icon, or null
 *
 * @internal
 */
function getDefaultIcon(variant: ToastVariant): React.ReactNode {
  const iconSize = 20;
  const iconStyle: React.CSSProperties = { width: iconSize, height: iconSize };

  switch (variant) {
    case 'success':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'error':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'warning':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

// ============================================================================
// Rustic Toast Component
// ============================================================================

/**
 * RusticToast - Pure HTML/CSS implementation of Toast.
 *
 * @description
 * A headless toast component with all styles applied inline.
 * Perfect for applications that don't use Ant Design or DaisyUI.
 *
 * @remarks
 * This component:
 * - Uses VARIANT_COLORS for styling
 * - Manages its own visibility and animation state
 * - Provides full accessibility with ARIA attributes
 * - Supports all Toast props including actions and progress
 *
 * @param props - {@link ToastProps}
 * @returns Styled div element, or null if not visible
 *
 * @example
 * ```tsx
 * <RusticToast
 *   variant="warning"
 *   title="Warning!"
 *   description="This action cannot be undone."
 *   closable={true}
 *   showProgress={true}
 *   visible={true}
 * />
 * ```
 */
export default function RusticToast(props: ToastProps): React.ReactElement | null {
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
    radius = TOAST_DEFAULTS.radius,
    shadow = TOAST_DEFAULTS.shadow,
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

  // Get variant colors from the color map
  const colors = VARIANT_COLORS[variant as keyof typeof VARIANT_COLORS] || VARIANT_COLORS.default;

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
  // Event Handlers for Hover
  // ========================================================================

  /** Handle mouse enter for pause on hover */
  const handleMouseEnter = pauseOnHover ? () => setIsPaused(true) : undefined;
  /** Handle mouse leave for pause on hover */
  const handleMouseLeave = pauseOnHover ? () => setIsPaused(false) : undefined;

  // ========================================================================
  // Style Definitions
  // ========================================================================

  /** Border radius map for the radius prop */
  const radiusMap: Record<string, string> = {
    none: '0',
    sm: 'var(--ds-toast-radius-sm, 4px)',
    md: 'var(--ds-toast-radius-md, 8px)',
    lg: 'var(--ds-toast-radius-lg, 12px)',
  };

  /** Main container styles */
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--ds-toast-gap, 12px)',
    padding: 'var(--ds-toast-padding, 12px 16px)',
    maxWidth: 'var(--ds-toast-max-width, 400px)',
    background: colors.bg,
    color: colors.color,
    borderRadius: radiusMap[radius] || 'var(--ds-toast-radius-md, 8px)',
    border: `1px solid ${colors.borderColor}`,
    boxShadow: shadow ? 'var(--ds-toast-shadow, 0 4px 12px rgba(0, 0, 0, 0.15))' : 'none',
    overflow: 'hidden',
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
    transition: `opacity var(--ds-toast-exit-duration, ${TOAST_ANIMATION.exitDuration}ms) var(--ds-toast-exit-easing, ease), transform var(--ds-toast-exit-duration, ${TOAST_ANIMATION.exitDuration}ms) var(--ds-toast-exit-easing, ease)`,
    ...getToastAnimationStyle('top-right', isExiting ? 'out' : 'in', 'fade'),
    ...style,
  };

  /** Icon container styles */
  const iconStyle: React.CSSProperties = {
    color: colors.iconColor,
    flexShrink: 0,
    marginTop: '2px',
  };

  /** Content container styles */
  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  /** Title text styles */
  const titleStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: 'var(--ds-toast-title-size, 14px)',
    lineHeight: 1.4,
    margin: 0,
  };

  /** Description text styles */
  const descriptionStyle: React.CSSProperties = {
    fontSize: 'var(--ds-toast-desc-size, 14px)',
    lineHeight: 1.5,
    marginTop: title ? '4px' : 0,
    opacity: 0.9,
  };

  /** Close button styles */
  const closeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    opacity: 'var(--ds-toast-close-opacity, 0.5)' as unknown as number,
    cursor: 'pointer',
    borderRadius: '4px',
    flexShrink: 0,
  };

  /** Action button styles */
  const actionButtonStyle: React.CSSProperties = {
    marginTop: '8px',
    padding: 'var(--ds-toast-action-padding, 4px 12px)',
    fontSize: 'var(--ds-toast-action-size, 13px)',
    fontWeight: 500,
    background: 'transparent',
    border: '1px solid currentColor',
    borderRadius: 'var(--ds-toast-action-radius, 4px)',
    color: 'inherit',
    cursor: 'pointer',
  };

  /** Progress bar styles */
  const progressStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 'var(--ds-toast-progress-height, 3px)',
    width: `${progress}%`,
    background: colors.iconColor,
    opacity: 'var(--ds-toast-progress-opacity, 0.5)' as unknown as number,
    transition: 'width 0.1s linear',
  };

  // Determine icon to display
  const displayIcon = icon !== undefined ? icon : getDefaultIcon(variant as ToastVariant);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div
      role="alert"
      aria-live="polite"
      className={className}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      {displayIcon && <span style={iconStyle}>{displayIcon}</span>}

      {/* Content */}
      <div style={contentStyle}>
        {title && <p style={titleStyle}>{title}</p>}
        {description && <p style={descriptionStyle}>{description}</p>}
        {children}
        {action && (
          <button
            type="button"
            style={actionButtonStyle}
            onClick={() => {
              action.onClick();
              if (action.closeOnClick !== false) {
                handleClose();
              }
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      {closable && (
        <button
          type="button"
          style={closeButtonStyle}
          onClick={handleClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Progress Bar */}
      {showProgress && duration > 0 && <div style={progressStyle} />}
    </div>
  );
}

RusticToast.displayName = 'RusticToast';
