/**
 * @fileoverview Toast Animation Utilities - Rottay Design System
 * @description CSS keyframes and animation helpers for toast transitions.
 * Provides position-aware animations for enter/exit transitions.
 *
 * @remarks
 * This module provides:
 * - CSS keyframe definitions for all toast animations
 * - Helper functions to get animation names based on position
 * - Shared stylesheet delivery through the core skin entrypoint
 * - Position-specific slide animations
 *
 * Animations are designed to match the toast position:
 * - Left positions slide in from the left
 * - Right positions slide in from the right
 * - Center positions slide from top/bottom based on vertical position
 *
 * @example Using Animation Utilities
 * ```tsx
 * import '@rottay/design-system/styles.css';
 * import { getAnimationName } from './animations';
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
 * Compatibility export of the definitions now shipped by
 * `toast-animation-keyframes.css` through the core stylesheet entrypoint.
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
export function getAnimationName(position: ToastPosition, direction: 'in' | 'out'): string {
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
    mode === 'fade' ? (direction === 'in' ? 'toast-fade-in' : 'toast-fade-out') : getAnimationName(position, direction);

  return {
    animation: `${animationName} ${getToastAnimationDuration(direction)} ${getToastAnimationEasing(
      direction
    )} forwards`,
  };
}

// ============================================================================
// Legacy Injector Compatibility
// ============================================================================

/**
 * Backward-compatible no-op retained for consumers that called the old
 * imperative injector. Toast keyframes now ship in the core stylesheet.
 *
 * @description
 * Safe to call multiple times and during SSR.
 *
 * @remarks
 * - Does not mutate the document
 * - Called automatically by ToastProvider and ToastContainer for API parity
 * - Consumers must import one public design-system stylesheet entrypoint, such as
 *   `@rottay/design-system/styles.css` or the matching `styles/<vertical>` bundle;
 *   this compatibility function no longer installs keyframes by itself
 *
 * @example
 * ```tsx
 * import '@rottay/design-system/styles.css';
 *
 * // Legacy calls remain safe but are no longer responsible for CSS delivery.
 * injectToastStyles();
 * ```
 */
export function injectToastStyles(): void {
  // Intentionally empty. The function remains exported to avoid an API break.
}
