/**
 * Toast.Container - Compound Component
 * Renders the toast stack at a given position
 */

'use client';

import React, { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ToastPosition, ToastState } from '../../types';
import { TOAST_CONTAINER_DEFAULTS, TOAST_ANIMATION, POSITION_MAP } from '../../types';
import { useToastContext } from '../../utils/ToastProvider';
import { injectToastStyles, getAnimationName } from '../../utils/animations';
import { Toast } from '../..';

export interface ToastContainerProps {
  /** Position of the toast stack */
  position?: ToastPosition;
  /** Maximum number of toasts to show */
  max?: number;
  /** Gap between toasts in pixels */
  gap?: number;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Custom render function for each toast */
  renderToast?: (toast: ToastState) => ReactNode;
}

/**
 * Get container position styles
 */
function getContainerPosition(position: ToastPosition): CSSProperties {
  const posMap = POSITION_MAP[position];
  const base: CSSProperties = {
    position: 'fixed',
    zIndex: 'var(--toast-z-index, 9999)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none',
  };

  // Vertical positioning
  if (posMap.vertical === 'top') {
    base.top = 0;
  } else {
    base.bottom = 0;
    base.flexDirection = 'column-reverse';
  }

  // Horizontal positioning
  if (posMap.horizontal === 'left') {
    base.left = 0;
    base.alignItems = 'flex-start';
  } else if (posMap.horizontal === 'right') {
    base.right = 0;
    base.alignItems = 'flex-end';
  } else {
    base.left = '50%';
    base.transform = 'translateX(-50%)';
    base.alignItems = 'center';
  }

  return base;
}

/**
 * ToastContainer - Renders toast stack at a position
 */
export function ToastContainer({
  position: positionProp,
  max = TOAST_CONTAINER_DEFAULTS.max,
  gap = TOAST_CONTAINER_DEFAULTS.gap,
  className = '',
  style,
  renderToast,
}: ToastContainerProps): React.ReactElement | null {
  const { toasts, config, dispatch } = useToastContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Use prop position or fall back to config
  const position = positionProp || config.position;

  // Inject animation styles on mount
  useEffect(() => {
    injectToastStyles();
  }, []);

  // Filter toasts by position and limit to max
  const visibleToasts = toasts
    .filter((t) => {
      const toastPos = t.options.position || config.position;
      return toastPos === position && t.visible;
    })
    .slice(0, max);

  // Handle toast removal after exit animation
  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE', payload: id });
  };

  // Handle toast dismiss
  const handleDismiss = (id: string) => {
    dispatch({ type: 'DISMISS', payload: id });
    // Remove after animation
    setTimeout(() => {
      handleRemove(id);
    }, TOAST_ANIMATION.exitDuration);
  };

  // Handle pause on hover
  const handlePause = (id: string) => {
    if (config.pauseOnHover) {
      dispatch({ type: 'PAUSE', payload: id });
    }
  };

  const handleResume = (id: string) => {
    if (config.pauseOnHover) {
      dispatch({ type: 'RESUME', payload: id });
    }
  };

  // Get container styles
  const containerStyle: CSSProperties = {
    ...getContainerPosition(position),
    gap: `${gap}px`,
    ...style,
  };

  // Don't render if no toasts
  if (visibleToasts.length === 0) {
    return null;
  }

  // Get animation name based on position
  const enterAnimation = getAnimationName(position, 'in');
  const exitAnimation = getAnimationName(position, 'out');

  // Render content
  const content = (
    <div
      ref={containerRef}
      className={`rottay-toast-container rottay-toast-container--${position} ${className}`}
      style={containerStyle}
      aria-live="polite"
      aria-atomic="false"
    >
      {visibleToasts.map((toast) => {
        // Use custom render if provided
        if (renderToast) {
          return (
            <div
              key={toast.id}
              style={{ pointerEvents: 'auto' }}
              onMouseEnter={() => handlePause(toast.id)}
              onMouseLeave={() => handleResume(toast.id)}
            >
              {renderToast(toast)}
            </div>
          );
        }

        // Default toast rendering
        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              animation: toast.visible
                ? `${enterAnimation} ${TOAST_ANIMATION.enterDuration}ms ease-out forwards`
                : `${exitAnimation} ${TOAST_ANIMATION.exitDuration}ms ease-in forwards`,
            }}
            onMouseEnter={() => handlePause(toast.id)}
            onMouseLeave={() => handleResume(toast.id)}
          >
            <Toast
              {...toast.options}
              visible={toast.visible}
              onClose={() => handleDismiss(toast.id)}
            />
          </div>
        );
      })}
    </div>
  );

  // Render in a portal
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
}

ToastContainer.displayName = 'Toast.Container';
