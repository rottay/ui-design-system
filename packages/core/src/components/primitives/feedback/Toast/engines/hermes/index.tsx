/**
 * Toast - Hermes Engine (DaisyUI)
 * Uses DaisyUI alert classes inside a toast container
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ToastProps, ToastVariant } from '../../types';
import { TOAST_DEFAULTS, TOAST_ANIMATION } from '../../types';

/**
 * Map variant to DaisyUI alert class
 */
function getAlertClass(variant: ToastVariant): string {
  switch (variant) {
    case 'success':
      return 'alert-success';
    case 'error':
      return 'alert-error';
    case 'warning':
      return 'alert-warning';
    case 'info':
      return 'alert-info';
    default:
      return '';
  }
}

/**
 * Get default icon SVG for variant
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

/**
 * HermesToast - DaisyUI implementation
 * Renders an alert component styled as a toast
 */
export default function HermesToast(props: ToastProps): React.ReactElement | null {
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

  const [isVisible, setIsVisible] = useState(visible);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  // Handle close
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, TOAST_ANIMATION.exitDuration);
  }, [onClose]);

  // Auto-dismiss timer
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

  // Sync with visible prop
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsExiting(false);
      setProgress(100);
    } else if (!visible && isVisible) {
      handleClose();
    }
  }, [visible, isVisible, handleClose]);

  if (!isVisible) return null;

  // Build class names
  const alertClass = getAlertClass(variant as ToastVariant);
  const baseClasses = `alert ${alertClass} shadow-lg`.trim();
  const animationClass = isExiting ? 'animate-fade-out' : 'animate-fade-in';

  // Handle mouse events
  const handleMouseEnter = pauseOnHover ? () => setIsPaused(true) : undefined;
  const handleMouseLeave = pauseOnHover ? () => setIsPaused(false) : undefined;

  // Display icon
  const displayIcon = icon !== undefined ? icon : getDefaultIcon(variant as ToastVariant);

  return (
    <div
      role="alert"
      className={`${baseClasses} ${animationClass} ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        animation: isExiting
          ? `toast-fade-out ${TOAST_ANIMATION.exitDuration}ms ease-in forwards`
          : `toast-fade-in ${TOAST_ANIMATION.enterDuration}ms ease-out forwards`,
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayIcon}

      <div className="flex flex-col">
        {title && <span className="font-semibold">{title}</span>}
        {description && <span className="text-sm">{description}</span>}
        {children}
      </div>

      <div className="flex-none flex gap-2">
        {action && (
          <button
            className="btn btn-sm btn-ghost"
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
            className="btn btn-sm btn-ghost btn-circle"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showProgress && duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        />
      )}
    </div>
  );
}

HermesToast.displayName = 'HermesToast';
