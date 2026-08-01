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
import { TOAST_DEFAULTS } from '../../contracts';
import { getToastAnimationStyle } from '../../runtime/animation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { CommunicationNotificationIcon } from '@/graphics/icons/presentation/semantic/generated/roles/communication-notification';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { governedExitMs } from '@/graphics/motion/react/runtime/presence/duration';

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
  // Optional channel: a bare composition (no I18nProvider, e.g. direct engine
  // renders) must still render -- the hard useTranslation hook throws without
  // one. The close control keeps its documented English floor.
  const i18n = useOptionalTranslation('common');
  const closeLabel = i18n?.tOr('close', 'Close') ?? 'Close';
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
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const exitTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  /**
   * Finalizes the dismissal: hides the node and reports onClose. Reached
   * from the exit animation's own `animationend` (primary path) or from the
   * computed fallback timer below -- never from a fixed JS constant.
   */
  const finalizeClose = useCallback(() => {
    clearExitTimer();
    setIsVisible(false);
    onClose?.();
  }, [onClose, clearExitTimer]);

  /**
   * Handles the close animation and callback.
   * Triggers exit animation before calling onClose.
   *
   * @remarks
   * Exit lifecycle (Message/Notification parity): the dismissal plays the
   * exit animation first, then hides the node. The window is NOT the fixed
   * `TOAST_ANIMATION.exitDuration` constant -- that desynced the moment a
   * tenant retuned `--ds-toast-exit-duration`. `animationend` on the root is
   * the primary path and the fallback timer reads the resolved duration from
   * the element's computed style (~0ms under the global reduced-motion
   * guard, which lands the removal immediately).
   */
  const handleClose = useCallback(() => {
    if (exitTimerRef.current) return; // exit already in flight
    setIsExiting(true);
    const el = rootRef.current;
    exitTimerRef.current = setTimeout(finalizeClose, el ? governedExitMs(el) : 0);
  }, [finalizeClose]);

  /**
   * Only the exit keyframes finalize the dismissal: an early close can land
   * while the ENTER animation is still playing, and its `animationend` must
   * not hide the toast prematurely (the bubbled progress-bar animationend is
   * filtered by the target check as well).
   */
  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (
        isExiting &&
        event.target === rootRef.current &&
        event.animationName.startsWith('toast-') &&
        event.animationName.includes('out')
      ) {
        finalizeClose();
      }
    },
    [isExiting, finalizeClose]
  );

  // The exit timer is independent of the pause-aware countdown below: it only
  // needs cancelling on unmount.
  useEffect(() => clearExitTimer, [clearExitTimer]);

  // ========================================================================
  // Auto-Dismiss Effect
  // ========================================================================

  /**
   * Auto-dismiss countdown with remaining-time tracking (Message engine
   * parity): pausing freezes the remaining budget instead of restarting it.
   * The visible progress bar is ONE CSS animation owned by the skin, driven
   * by the `--ds-toast-duration` instance hatch stamped on the root and
   * frozen through `data-paused` -- no per-frame requestAnimationFrame loop
   * repainting layout (`width`) sixty times a second.
   */
  const remainingRef = React.useRef(duration);
  const startedAtRef = React.useRef(0);
  // A duration prop change re-arms the countdown from its full length,
  // matching the pre-channel contract.
  const prevDurationRef = React.useRef(duration);
  if (prevDurationRef.current !== duration) {
    prevDurationRef.current = duration;
    remainingRef.current = duration;
  }

  useEffect(() => {
    if (!visible || duration === 0 || isPaused) return;

    startedAtRef.current = Date.now();
    const timer = setTimeout(() => {
      handleClose();
    }, remainingRef.current);

    return () => {
      clearTimeout(timer);
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (Date.now() - startedAtRef.current)
      );
    };
  }, [visible, duration, isPaused, handleClose]);

  // ========================================================================
  // Visibility Sync Effect
  // ========================================================================

  /**
   * Effect to sync internal visibility with visible prop.
   */
  useEffect(() => {
    if (visible) {
      // A re-show while an exit is still in flight cancels the pending
      // removal -- the toast stays up with a fresh countdown.
      clearExitTimer();
      setIsVisible(true);
      setIsExiting(false);
      remainingRef.current = duration;
    } else if (!visible && isVisible) {
      handleClose();
    }
  }, [visible, isVisible, duration, handleClose, clearExitTimer]);

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
  /**
   * Keyboard parity for the hover pause (WCAG 2.2.1): a toast must not
   * auto-dismiss while the user is focused inside it. Focus bubbles in React,
   * so plain handlers cover every focusable descendant; the blur only
   * resumes when focus leaves the toast entirely.
   */
  const handleFocus = pauseOnHover ? () => setIsPaused(true) : undefined;
  const handleBlur = pauseOnHover
    ? (event: React.FocusEvent<HTMLDivElement>) => {
        const next = event.relatedTarget as Node | null;
        if (!next || !event.currentTarget.contains(next)) setIsPaused(false);
      }
    : undefined;

  // Explicit `icon` prop (including null to suppress) overrides the default.
  // Checking !== undefined distinguishes "no prop" from "intentionally null".
  const displayIcon = icon !== undefined ? icon : getDefaultIcon(variant as ToastVariant);

  /**
   * Escape dismisses a closable toast while focus lives inside it (overlay
   * grammar: a transient surface yields to the keyboard). Non-closable toasts
   * are deliberately sticky, so the key stays inert there. Focus is never
   * moved by the dismiss itself.
   */
  const handleKeyDown = closable
    ? (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') handleClose();
      }
    : undefined;

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div
      ref={rootRef}
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
        // Instance hatch: the skin's progress animation consumes the toast's
        // lifetime from this channel (`--ds-message-duration` parity). Surface
        // paint and position/overflow stay skin-owned (toast.css root rule).
        '--ds-toast-duration': `${duration}ms`,
        ...getToastAnimationStyle('top-right', isExiting ? 'out' : 'in', 'fade'),
        ...style,
      } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onAnimationEnd={handleAnimationEnd}
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
            aria-label={closeLabel}
          >
            <ActionCloseIcon decorative size={16} />
          </button>
        )}
        </div>
      </div>

      {/* Lifetime bar: ONE CSS animation (compositor-safe scaleX) driven by
          the --ds-toast-duration hatch, frozen through data-paused -- the skin
          owns track paint, direction and the reduced-motion posture. */}
      {showProgress && duration > 0 && (
        <div data-part="progress-bar" aria-hidden="true" />
      )}
    </div>
  );
}

ModernToast.displayName = 'ModernToast';
