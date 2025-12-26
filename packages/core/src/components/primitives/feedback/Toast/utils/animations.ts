/**
 * Toast - Animation Utilities
 * CSS keyframes and animation helpers
 */

import type { ToastPosition } from '../types';
import { TOAST_ANIMATION } from '../types';

/**
 * Get slide direction based on position
 */
export function getSlideDirection(position: ToastPosition): {
  enter: string;
  exit: string;
} {
  const positionParts = position.split('-');
  const horizontal = positionParts[1] || 'right';

  if (horizontal === 'left') {
    return { enter: 'translateX(-100%)', exit: 'translateX(-100%)' };
  }
  if (horizontal === 'right') {
    return { enter: 'translateX(100%)', exit: 'translateX(100%)' };
  }
  // center
  const vertical = positionParts[0] || 'top';
  if (vertical === 'top') {
    return { enter: 'translateY(-100%)', exit: 'translateY(-100%)' };
  }
  return { enter: 'translateY(100%)', exit: 'translateY(100%)' };
}

/**
 * Generate enter animation styles
 */
export function getEnterAnimation(_position: ToastPosition): React.CSSProperties {
  return {
    animation: `toast-slide-in ${TOAST_ANIMATION.enterDuration}ms ease-out forwards`,
  };
}

/**
 * Generate exit animation styles
 */
export function getExitAnimation(_position: ToastPosition): React.CSSProperties {
  return {
    animation: `toast-slide-out ${TOAST_ANIMATION.exitDuration}ms ease-in forwards`,
  };
}

/**
 * CSS keyframes for toast animations
 * Should be injected into the document
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

/**
 * Get animation name based on position and direction
 */
export function getAnimationName(
  position: ToastPosition,
  direction: 'in' | 'out'
): string {
  const [vertical, horizontal] = position.split('-') as [string, string];

  if (horizontal === 'center') {
    return `toast-slide-${direction}-${vertical}`;
  }

  return `toast-slide-${direction}-${horizontal}`;
}

/**
 * Inject keyframes into document if not already present
 */
let stylesInjected = false;

export function injectToastStyles(): void {
  if (typeof document === 'undefined' || stylesInjected) return;

  const styleId = 'rottay-toast-animations';
  if (document.getElementById(styleId)) {
    stylesInjected = true;
    return;
  }

  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = TOAST_KEYFRAMES;
  document.head.appendChild(styleEl);
  stylesInjected = true;
}
