/**
 * BackTop Component Types
 *
 * Unified type definitions for back-to-top button.
 * Works with titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import type { CSSProperties, ReactNode, MouseEvent } from 'react';

/**
 * Base BackTop props supported by all engines
 */
export interface BackTopBaseProps {
  /** Custom content (icon or element) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Callback when clicked */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Extended BackTop props with engine-specific features
 */
export interface BackTopProps extends BackTopBaseProps {
  /** Scroll height to show button (default: 400) */
  visibilityHeight?: number;
  /** Scroll target (default: window) */
  target?: () => HTMLElement | Window | null;
  /** Scroll animation duration in ms */
  duration?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default up arrow icon SVG path
 */
export const DEFAULT_BACKTOP_ICON = `M4.5 15.75l7.5-7.5 7.5 7.5`;

/**
 * Smooth scroll to top
 */
export function scrollToTop(
  target: HTMLElement | Window | null = window,
  duration = 450
): void {
  if (!target) return;

  const scrollElement = target === window ? document.documentElement : (target as HTMLElement);
  const startPosition = scrollElement.scrollTop;
  const startTime = performance.now();

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    scrollElement.scrollTop = startPosition * (1 - easedProgress);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
}

/**
 * Get current scroll position
 */
export function getScrollTop(target: HTMLElement | Window | null = window): number {
  if (!target) return 0;
  if (target === window) {
    return window.pageYOffset || document.documentElement.scrollTop;
  }
  return (target as HTMLElement).scrollTop;
}
