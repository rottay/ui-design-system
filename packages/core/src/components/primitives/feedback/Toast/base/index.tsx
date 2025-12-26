/**
 * Toast - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useEffect, useState, useCallback } from 'react';
import type { ToastProps, ToastVariant } from '../types';
import { TOAST_DEFAULTS, TOAST_ANIMATION, VARIANT_COLORS } from '../types';

/**
 * Default icons for each variant
 */
function getDefaultIcon(variant: ToastVariant): React.ReactNode {
  const iconSize = 20;
  const iconStyle = { width: iconSize, height: iconSize };

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

/**
 * Close button icon
 */
function CloseIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/**
 * Base Toast component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseToast = forwardRef<HTMLDivElement, ToastProps>(
  (props, ref) => {
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
      showProgress = TOAST_DEFAULTS.showProgress,
      pauseOnHover = TOAST_DEFAULTS.pauseOnHover,
      radius = TOAST_DEFAULTS.radius,
      shadow = TOAST_DEFAULTS.shadow,
      children,
      className = '',
      style = {},
    } = props;

    const [isVisible, setIsVisible] = useState(visible);
    const [isExiting, setIsExiting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(100);

    // Get variant colors
    const colors = VARIANT_COLORS[variant as keyof typeof VARIANT_COLORS] || VARIANT_COLORS.default;

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

    // Handle mouse events for pause on hover
    const handleMouseEnter = pauseOnHover ? () => setIsPaused(true) : undefined;
    const handleMouseLeave = pauseOnHover ? () => setIsPaused(false) : undefined;

    // Border radius map
    const radiusMap = {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
    };

    // Build CSS variables for the toast
    const toastVars: React.CSSProperties = {
      '--toast-bg': `var(--toast-${variant}-bg, ${colors.bg})`,
      '--toast-color': `var(--toast-${variant}-color, ${colors.color})`,
      '--toast-border-color': `var(--toast-${variant}-border-color, ${colors.borderColor})`,
      '--toast-icon-color': `var(--toast-${variant}-icon-color, ${colors.iconColor})`,
      '--toast-border-radius': `var(--toast-border-radius, ${radiusMap[radius]})`,
      '--toast-shadow': shadow ? 'var(--toast-shadow, 0 4px 12px rgba(0, 0, 0, 0.15))' : 'none',
      '--toast-padding': 'var(--toast-padding, 12px 16px)',
      '--toast-max-width': 'var(--toast-max-width, 400px)',
      '--toast-enter-duration': `${TOAST_ANIMATION.enterDuration}ms`,
      '--toast-exit-duration': `${TOAST_ANIMATION.exitDuration}ms`,
    } as React.CSSProperties;

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...toastVars,
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: 'var(--toast-padding)',
      maxWidth: 'var(--toast-max-width)',
      background: 'var(--toast-bg)',
      color: 'var(--toast-color)',
      borderRadius: 'var(--toast-border-radius)',
      border: '1px solid var(--toast-border-color)',
      boxShadow: 'var(--toast-shadow)',
      overflow: 'hidden',
      animation: isExiting
        ? `toast-fade-out var(--toast-exit-duration) ease-in forwards`
        : `toast-fade-in var(--toast-enter-duration) ease-out forwards`,
      ...style,
    };

    // Icon styles
    const iconStyle: React.CSSProperties = {
      color: 'var(--toast-icon-color)',
      flexShrink: 0,
      marginTop: '2px',
    };

    // Content styles
    const contentStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 0,
    };

    // Title styles
    const titleStyle: React.CSSProperties = {
      fontWeight: 600,
      fontSize: '14px',
      lineHeight: 1.4,
      margin: 0,
    };

    // Description styles
    const descriptionStyle: React.CSSProperties = {
      fontSize: '14px',
      lineHeight: 1.5,
      marginTop: title ? '4px' : 0,
      opacity: 0.9,
    };

    // Close button styles
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
      opacity: 0.5,
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'opacity 0.2s, background 0.2s',
      flexShrink: 0,
    };

    // Action button styles
    const actionButtonStyle: React.CSSProperties = {
      marginTop: '8px',
      padding: '4px 12px',
      fontSize: '13px',
      fontWeight: 500,
      background: 'transparent',
      border: '1px solid currentColor',
      borderRadius: '4px',
      color: 'inherit',
      cursor: 'pointer',
      transition: 'background 0.2s',
    };

    // Progress bar styles
    const progressStyle: React.CSSProperties = {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '3px',
      width: `${progress}%`,
      background: 'var(--toast-icon-color)',
      opacity: 0.5,
      transition: 'width 0.1s linear',
    };

    // Display icon
    const displayIcon = icon !== undefined ? icon : getDefaultIcon(variant as ToastVariant);

    return (
      <div
        ref={ref}
        className={`rottay-toast rottay-toast--${variant} ${className}`}
        style={containerStyle}
        role="alert"
        aria-live="polite"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {displayIcon && (
          <span className="rottay-toast__icon" style={iconStyle}>
            {displayIcon}
          </span>
        )}

        <div className="rottay-toast__content" style={contentStyle}>
          {title && (
            <p className="rottay-toast__title" style={titleStyle}>
              {title}
            </p>
          )}
          {description && (
            <p className="rottay-toast__description" style={descriptionStyle}>
              {description}
            </p>
          )}
          {children}
          {action && (
            <button
              type="button"
              className="rottay-toast__action"
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

        {closable && (
          <button
            type="button"
            className="rottay-toast__close"
            style={closeButtonStyle}
            onClick={handleClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        )}

        {showProgress && duration > 0 && (
          <div className="rottay-toast__progress" style={progressStyle} />
        )}
      </div>
    );
  }
);

BaseToast.displayName = 'BaseToast';
