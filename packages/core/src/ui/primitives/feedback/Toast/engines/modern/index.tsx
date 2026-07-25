/**
 * @fileoverview Toast Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Toast component on a
 * self-contained, skin-owned tree — no DaisyUI or utility-framework classes.
 *
 * @remarks
 * The Modern engine is a self-contained `rottay-toast--modern` tree:
 * - No DaisyUI classes: the structural `alert` class was drained (WO-SKIN-03);
 *   the unlayered skin `toast.css` is the single paint owner, keyed on the
 *   `data-tone`/`data-radius`/`data-shadow` attributes stamped here
 * - Enter/exit motion is inline via `getToastAnimationStyle` (token-driven,
 *   reduced-motion safe); all static surface paint lives in the skin
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
import type { ToastProps, ToastVariant } from '../../contracts';
import { TOAST_DEFAULTS, TOAST_ANIMATION } from '../../contracts';
import { getToastAnimationStyle } from '../../runtime/animation';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { CommunicationNotificationIcon } from '@/graphics/icons/presentation/semantic/generated/roles/communication-notification';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

// ============================================================================
// Helper Functions
// ============================================================================

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
      return <StatusSuccessIcon decorative size={20} />;
    case 'error':
      return <StatusErrorIcon decorative size={20} />;
    case 'warning':
      return <StatusWarningIcon decorative size={20} />;
    case 'info':
      return <StatusInfoIcon decorative size={20} />;
    default:
      return <CommunicationNotificationIcon decorative size={20} />;
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
  const { t } = useTranslation('common');
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

  // Variant colouring and elevation are keyed on `data-tone` in the unlayered
  // modern Toast skin. This engine applies NO DaisyUI class: the structural
  // `alert` class was drained in WO-SKIN-03 (Toast.modern-variant-tokens.test
  // pins its absence), so neither DaisyUI's `.alert` base paint nor
  // personality.css's `.alert` transition reaches this tree -- the unlayered
  // skin is the single paint owner.
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
      data-part="root"
      data-tone={variant}
      data-radius={props.radius ?? 'md'}
      data-shadow={props.shadow === false ? 'false' : 'true'}
      data-has-title={title ? 'true' : 'false'}
      data-has-description={description ? 'true' : 'false'}
      data-has-action={action ? 'true' : 'false'}
      data-paused={isPaused ? 'true' : 'false'}
      className={`rottay-toast--modern ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...getToastAnimationStyle('top-right', isExiting ? 'out' : 'in', 'fade'),
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div data-part="layout">
        {displayIcon && <span data-part="icon">{displayIcon}</span>}

        <div data-part="body">
          {title && <span data-part="title">{title}</span>}
          {description && <span data-part="description">{description}</span>}
          {children && <div data-part="custom-content">{children}</div>}
        </div>

        <div data-part="actions">
        {action && (
          <button
            type="button"
            data-part="action"
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

        {closable && (
          <button
            type="button"
            data-part="close-button"
            onClick={handleClose}
            aria-label={t('close')}
          >
            <ActionCloseIcon decorative size={16} />
          </button>
        )}
        </div>
      </div>

      {/* Progress bar shrinks from 100% to 0% matching the auto-dismiss timer.
          The skin paints its track from --ds-toast-accent for consistent theming. */}
      {showProgress && duration > 0 && (
        <div
          data-part="progress-bar"
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}

ModernToast.displayName = 'ModernToast';
