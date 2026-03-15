/**
 * @fileoverview Toast Animation Utilities - Rottay Design System
 * @description CSS keyframes and animation helpers for toast transitions.
 * Provides position-aware animations for enter/exit transitions.
 *
 * @remarks
 * This module provides:
 * - CSS keyframe definitions for all toast animations
 * - Helper functions to get animation names based on position
 * - Automatic style injection into the document head
 * - Position-specific slide animations
 *
 * Animations are designed to match the toast position:
 * - Left positions slide in from the left
 * - Right positions slide in from the right
 * - Center positions slide from top/bottom based on vertical position
 *
 * @example Using Animation Utilities
 * ```tsx
 * import { getAnimationName, injectToastStyles } from './animations';
 *
 * // Inject styles on mount
 * useEffect(() => {
 *   injectToastStyles();
 * }, []);
 *
 * // Get animation name for position
 * const enterAnim = getAnimationName('top-right', 'in');
 * // Returns: 'toast-slide-in-right'
 *
 * const exitAnim = getAnimationName('bottom-center', 'out');
 * // Returns: 'toast-slide-out-bottom'
 * ```
 *
 * @module Toast/Animations
 * @category Feedback
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';

import type { ToastPosition } from '../Toast.types';
import { TOAST_ANIMATION } from '../Toast.types';

function readRootCssVariable(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value.length > 0 ? value : null;
}

function getToastAnimationDuration(phase: 'in' | 'out'): string {
  const variableName = phase === 'in' ? '--ds-toast-enter-duration' : '--ds-toast-exit-duration';
  const fallback = `${phase === 'in' ? TOAST_ANIMATION.enterDuration : TOAST_ANIMATION.exitDuration}ms`;
  return readRootCssVariable(variableName) ?? fallback;
}

function getToastAnimationEasing(phase: 'in' | 'out'): string {
  const variableName = phase === 'in' ? '--ds-toast-enter-easing' : '--ds-toast-exit-easing';
  const fallback = phase === 'in' ? 'ease-out' : 'ease-in';
  return readRootCssVariable(variableName) ?? fallback;
}

// ============================================================================
// CSS Keyframes
// ============================================================================

/**
 * CSS keyframes for all toast animations.
 *
 * @description
 * Complete set of animation keyframes for toast transitions:
 * - Slide animations for each direction (left, right, top, bottom)
 * - Fade in/out with scale for generic animations
 * - Progress bar animation for countdown display
 *
 * @remarks
 * These keyframes are automatically injected into the document
 * when `injectToastStyles()` is called.
 *
 * Available animations:
 * - `toast-slide-in-right` / `toast-slide-out-right`
 * - `toast-slide-in-left` / `toast-slide-out-left`
 * - `toast-slide-in-top` / `toast-slide-out-top`
 * - `toast-slide-in-bottom` / `toast-slide-out-bottom`
 * - `toast-fade-in` / `toast-fade-out`
 * - `toast-progress`
 */
export const TOAST_KEYFRAMES = `
@keyframes toast-slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes toast-slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes toast-slide-in-top {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out-top {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
}

@keyframes toast-slide-in-bottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out-bottom {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

@keyframes toast-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes toast-fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
`;

// ============================================================================
// Animation Name Helper
// ============================================================================

/**
 * Gets the animation name based on position and direction.
 *
 * @description
 * Determines the appropriate keyframe animation name based on
 * the toast's position and whether it's entering or exiting.
 *
 * @param position - Toast position (e.g., 'top-right', 'bottom-center')
 * @param direction - Animation direction ('in' for enter, 'out' for exit)
 * @returns CSS animation name string
 *
 * @example
 * ```tsx
 * // Right-side positions use horizontal slide
 * getAnimationName('top-right', 'in');    // 'toast-slide-in-right'
 * getAnimationName('bottom-right', 'out'); // 'toast-slide-out-right'
 *
 * // Left-side positions use horizontal slide
 * getAnimationName('top-left', 'in');     // 'toast-slide-in-left'
 *
 * // Center positions use vertical slide
 * getAnimationName('top-center', 'in');   // 'toast-slide-in-top'
 * getAnimationName('bottom-center', 'in'); // 'toast-slide-in-bottom'
 * ```
 */
export function getAnimationName(
  position: ToastPosition,
  direction: 'in' | 'out'
): string {
  const [vertical, horizontal] = position.split('-') as [string, string];

  // Center positions use vertical direction
  if (horizontal === 'center') {
    return `toast-slide-${direction}-${vertical}`;
  }

  // Left/right positions use horizontal direction
  return `toast-slide-${direction}-${horizontal}`;
}

export function getToastAnimationStyle(
  position: ToastPosition,
  direction: 'in' | 'out',
  mode: 'slide' | 'fade' = 'slide'
): CSSProperties {
  const animationName =
    mode === 'fade'
      ? direction === 'in'
        ? 'toast-fade-in'
        : 'toast-fade-out'
      : getAnimationName(position, direction);

  return {
    animation: `${animationName} ${getToastAnimationDuration(direction)} ${getToastAnimationEasing(direction)} forwards`,
  };
}

// ============================================================================
// Style Injection
// ============================================================================

/** Tracks whether styles have been injected */
let stylesInjected = false;

/**
 * Injects toast animation keyframes into the document.
 *
 * @description
 * Creates a style element with all toast animation keyframes and
 * appends it to the document head. Safe to call multiple times;
 * subsequent calls are no-ops.
 *
 * @remarks
 * - Only runs in browser environment (checks for `document`)
 * - Uses a unique ID to prevent duplicate injection
 * - Called automatically by ToastProvider and ToastContainer
 *
 * @example
 * ```tsx
 * // In a component or effect
 * useEffect(() => {
 *   injectToastStyles();
 * }, []);
 * ```
 */
export function injectToastStyles(): void {
  // Skip if not in browser or already injected
  if (typeof document === 'undefined' || stylesInjected) return;

  const styleId = 'rottay-toast-animations';

  // Check if already exists in DOM
  if (document.getElementById(styleId)) {
    stylesInjected = true;
    return;
  }

  // Create and inject style element
  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = TOAST_KEYFRAMES;
  document.head.appendChild(styleEl);
  stylesInjected = true;
}
