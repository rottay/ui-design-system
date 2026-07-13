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
import type { ToastPosition, ToastState } from '../../Toast.types';
import { TOAST_CONTAINER_DEFAULTS, POSITION_MAP } from '../../Toast.types';
import { useToastContext } from '../../utils/ToastProvider';
import { injectToastStyles, getToastAnimationStyle } from '../../utils/animations';
import { BaseToast } from '../../base';
import { useBreakpoints } from '../../../../../../hooks';
import { usePresence } from '../../../../../../motion/hooks/use-presence';

// ============================================================================
// Stacking Physics
// ============================================================================

/**
 * Maximum number of "behind" layers that visibly compress/fan. Capping at 2
 * keeps a 5-toast stack from over-shrinking the back-most items to an
 * illegible size.
 */
const MAX_STACK_DEPTH = 2;

/** Per-depth-step scale reduction and vertical offset (px), transform-only. */
const STACK_SCALE_STEP = 0.035;
const STACK_OFFSET_STEP = 5;

/**
 * Computes the transform-only compress/fan style for one toast in the stack.
 *
 * The most recently added toast (last entry in `visibleToasts`) is the front
 * layer: full scale, no offset. Earlier toasts scale down and shift toward
 * the container's anchored edge (the direction its own position already
 * grows toward -- see `getContainerPosition`), so the stack reads as cards
 * fanned behind the front one. Because each toast keeps the same DOM node
 * (`key={toast.id}`) across re-renders, the `transition` below animates the
 * transform delta automatically whenever a dismissal shifts every other
 * toast's depth -- no extra JS re-settle logic is needed.
 */
function getStackTransform(
  index: number,
  total: number,
  vertical: 'top' | 'bottom',
  disableTransition: boolean
): CSSProperties {
  const depthFromFront = Math.min(total - 1 - index, MAX_STACK_DEPTH);

  if (depthFromFront === 0) {
    return {
      transform: 'none',
      transition: disableTransition ? 'none' : 'transform var(--ds-motion-normal) var(--ds-motion-ease-out)',
    };
  }

  const scale = 1 - depthFromFront * STACK_SCALE_STEP;
  const offset = depthFromFront * STACK_OFFSET_STEP * (vertical === 'top' ? -1 : 1);

  return {
    transform: `scale(${scale}) translateY(${offset}px)`,
    transition: disableTransition ? 'none' : 'transform var(--ds-motion-normal) var(--ds-motion-ease-out)',
  };
}

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
    zIndex: 'var(--ds-toast-z-index, 9999)',
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
// ToastStackItem
// ============================================================================

interface ToastStackItemProps {
  toast: ToastState;
  position: ToastPosition;
  depth: number;
  stackStyle: CSSProperties;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  /** Fires once this toast's own exit animation has actually finished playing. */
  onExited: () => void;
  children: ReactNode;
}

/**
 * One toast's stack slot. The OUTER div carries the compress/fan stacking
 * transform (repositions as siblings are added/removed); the INNER div
 * carries the enter/exit `animation` (getToastAnimationStyle) AND the
 * usePresence ref, so `onExited` fires from THIS toast's own
 * animationend, not a fixed timer guessed to match the CSS duration.
 * Kept as separate elements (not merged into one) because the enter/exit
 * keyframe runs with `animation-fill-mode: forwards`, which would otherwise
 * permanently pin the outer transform to the animation's final keyframe
 * value and mask the stacking transform.
 */
function ToastStackItem({
  toast,
  position,
  depth,
  stackStyle,
  onMouseEnter,
  onMouseLeave,
  onExited,
  children,
}: ToastStackItemProps): React.ReactElement {
  const { ref } = usePresence(toast.visible, { onExitComplete: onExited });

  return (
    <div
      data-stack-depth={depth}
      style={{ pointerEvents: 'auto', ...stackStyle }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div ref={ref} style={getToastAnimationStyle(position, toast.visible ? 'in' : 'out')}>
        {children}
      </div>
    </div>
  );
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
  const { prefersReducedMotion } = useBreakpoints();

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
   * Toasts matching this container's position, in stack order. Includes a
   * dismissed toast (visible: false) until its own exit choreography
   * reports completion via usePresence below -- filtering on `t.visible`
   * here would drop it before its exit animation ever played, which is
   * exactly the "pops out of existence" defect this container used to have.
   */
  const positionToasts = toasts.filter((t) => (t.options.position || config.position) === position);
  const activeIds = new Set(positionToasts.filter((t) => t.visible).slice(0, max).map((t) => t.id));
  const renderedToasts = positionToasts.filter((t) => activeIds.has(t.id) || !t.visible);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Removes a toast from the stack. Called once a dismissed toast's own
   * exit transition/animation has actually finished playing (see
   * ToastStackItem's usePresence below) -- not on a fixed timer guessed to
   * match the CSS duration.
   * @param id - Toast ID to remove
   */
  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE', payload: id });
  };

  /**
   * Dismisses a toast, triggering its exit animation. Removal from state
   * happens later, when ToastStackItem's presence gate observes the exit
   * actually complete.
   * @param id - Toast ID to dismiss
   */
  const handleDismiss = (id: string) => {
    dispatch({ type: 'DISMISS', payload: id });
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
  if (renderedToasts.length === 0) {
    return null;
  }

  // ========================================================================
  // Render Content
  // ========================================================================

  const content = (
    <div
      ref={containerRef}
      data-part="stack-container"
      data-placement={position}
      className={`rottay-toast-container rottay-toast-container--${position} ${className}`}
      style={containerStyle}
      aria-live="polite"
      aria-atomic="false"
    >
      {renderedToasts.map((toast, index) => {
        // Compress/fan stacking transform, keyed to this toast's distance
        // from the front (most recent) of the CURRENT rendered slice. This is
        // computed fresh every render, so when a dismissal shrinks (once its
        // exit completes and it is actually removed) every surviving toast
        // (same DOM node, same `key`) recomputes a new depth and transitions
        // to it -- the re-settle.
        const stackStyle = getStackTransform(
          index,
          renderedToasts.length,
          POSITION_MAP[position].vertical,
          prefersReducedMotion
        );
        const depth = Math.min(renderedToasts.length - 1 - index, MAX_STACK_DEPTH);

        return (
          <ToastStackItem
            key={toast.id}
            toast={toast}
            position={position}
            depth={depth}
            stackStyle={stackStyle}
            onMouseEnter={() => handlePause(toast.id)}
            onMouseLeave={() => handleResume(toast.id)}
            onExited={() => handleRemove(toast.id)}
          >
            {renderToast ? (
              renderToast(toast)
            ) : (
              <BaseToast
                {...toast.options}
                visible={toast.visible}
                onClose={() => handleDismiss(toast.id)}
              />
            )}
          </ToastStackItem>
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
