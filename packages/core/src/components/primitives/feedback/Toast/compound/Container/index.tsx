/**
 * @fileoverview Toast Container Component - Rottay Design System
 * @description Compound component that renders the toast stack at a given position.
 * Manages positioning, stacking, animations, and portal rendering.
 *
 * @remarks
 * The ToastContainer component is responsible for:
 * - Rendering toasts in a fixed position on the screen
 * - Managing the toast stack with configurable maximum
 * - Handling enter/exit animations per position
 * - Rendering via React Portal for proper z-index stacking
 * - Providing pause on hover functionality for the entire stack
 *
 * @module Toast/Container
 * @category Feedback
 * @package @rottay/design-system
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

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props for the ToastContainer compound component.
 *
 * @description
 * Configuration options for the toast stack container.
 *
 * @example
 * ```tsx
 * <Toast.Container
 *   position="bottom-right"
 *   max={3}
 *   gap={12}
 *   renderToast={(toast) => <CustomToast {...toast} />}
 * />
 * ```
 */
export interface ToastContainerProps {
  /**
   * Position of the toast stack on the screen.
   * @default Uses position from ToastProvider config
   */
  position?: ToastPosition;

  /**
   * Maximum number of toasts to show simultaneously.
   * Older toasts are hidden when limit is reached.
   * @default 5
   */
  max?: number;

  /**
   * Gap between toasts in pixels.
   * @default 8
   */
  gap?: number;

  /**
   * Additional CSS class name for the container.
   */
  className?: string;

  /**
   * Additional inline styles for the container.
   */
  style?: CSSProperties;

  /**
   * Custom render function for each toast.
   * Allows complete control over toast rendering.
   *
   * @param toast - The toast state object
   * @returns React node to render
   *
   * @example
   * ```tsx
   * renderToast={(toast) => (
   *   <MyCustomToast
   *     key={toast.id}
   *     message={toast.options.description}
   *     type={toast.options.variant}
   *   />
   * )}
   * ```
   */
  renderToast?: (toast: ToastState) => ReactNode;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculates CSS positioning based on toast position.
 *
 * @description
 * Converts a ToastPosition value to CSS properties for fixed positioning.
 * Handles all six position combinations and sets appropriate flex direction.
 *
 * @param position - The desired toast stack position
 * @returns CSS properties for the container
 *
 * @internal
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

// ============================================================================
// Toast Container Component
// ============================================================================

/**
 * ToastContainer - Renders toast stack at a position.
 *
 * @description
 * A compound component that manages the toast stack rendering.
 * Must be used within a ToastProvider context.
 *
 * Features:
 * - Fixed positioning with six position options
 * - Configurable maximum toast count
 * - Smooth enter/exit animations
 * - Pause on hover for all toasts
 * - Portal rendering for proper stacking
 * - Custom render function support
 *
 * @example Basic Usage
 * ```tsx
 * <ToastProvider>
 *   <App />
 *   <Toast.Container />
 * </ToastProvider>
 * ```
 *
 * @example Custom Position and Limit
 * ```tsx
 * <Toast.Container
 *   position="bottom-center"
 *   max={3}
 *   gap={16}
 * />
 * ```
 *
 * @example With Custom Rendering
 * ```tsx
 * <Toast.Container
 *   renderToast={(toast) => (
 *     <div className="custom-toast">
 *       <strong>{toast.options.title}</strong>
 *       <p>{toast.options.description}</p>
 *     </div>
 *   )}
 * />
 * ```
 *
 * @param props - {@link ToastContainerProps}
 * @returns Portal-rendered toast container or null if empty
 *
 * @see {@link ToastProvider} for context setup
 * @see {@link useToast} for triggering toasts
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

  // ========================================================================
  // Animation Styles Injection
  // ========================================================================

  /**
   * Effect to inject animation keyframes on mount.
   */
  useEffect(() => {
    injectToastStyles();
  }, []);

  // ========================================================================
  // Toast Filtering
  // ========================================================================

  /**
   * Filter toasts by position and limit to max count.
   */
  const visibleToasts = toasts
    .filter((t) => {
      const toastPos = t.options.position || config.position;
      return toastPos === position && t.visible;
    })
    .slice(0, max);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Removes a toast from the stack after exit animation.
   * @param id - Toast ID to remove
   */
  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE', payload: id });
  };

  /**
   * Dismisses a toast, triggering exit animation.
   * @param id - Toast ID to dismiss
   */
  const handleDismiss = (id: string) => {
    dispatch({ type: 'DISMISS', payload: id });
    // Remove after animation
    setTimeout(() => {
      handleRemove(id);
    }, TOAST_ANIMATION.exitDuration);
  };

  /**
   * Pauses auto-dismiss for a toast on hover.
   * @param id - Toast ID to pause
   */
  const handlePause = (id: string) => {
    if (config.pauseOnHover) {
      dispatch({ type: 'PAUSE', payload: id });
    }
  };

  /**
   * Resumes auto-dismiss for a toast after hover.
   * @param id - Toast ID to resume
   */
  const handleResume = (id: string) => {
    if (config.pauseOnHover) {
      dispatch({ type: 'RESUME', payload: id });
    }
  };

  // ========================================================================
  // Style Calculation
  // ========================================================================

  /**
   * Calculate container styles based on position and gap.
   */
  const containerStyle: CSSProperties = {
    ...getContainerPosition(position),
    gap: `${gap}px`,
    ...style,
  };

  // ========================================================================
  // Early Return
  // ========================================================================

  // Don't render if no toasts
  if (visibleToasts.length === 0) {
    return null;
  }

  // ========================================================================
  // Animation Names
  // ========================================================================

  // Get animation name based on position
  const enterAnimation = getAnimationName(position, 'in');
  const exitAnimation = getAnimationName(position, 'out');

  // ========================================================================
  // Render Content
  // ========================================================================

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

  // ========================================================================
  // Portal Rendering
  // ========================================================================

  // Render in a portal for proper z-index stacking
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
}

ToastContainer.displayName = 'Toast.Container';
