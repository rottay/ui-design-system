'use client';

/**
 * Hermes BackTop Engine
 *
 * DaisyUI implementation with scroll tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import type { BackTopProps } from '../../../../types/components/backtop';
import { scrollToTop, getScrollTop, DEFAULT_BACKTOP_ICON } from '../../../../types/components/backtop';

/**
 * Default up arrow icon
 */
const DefaultIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={DEFAULT_BACKTOP_ICON} />
  </svg>
);

/**
 * Hermes BackTop - DaisyUI implementation
 */
function HermesBackTop({
  children,
  className = '',
  style,
  onClick,
  visibilityHeight = 400,
  target,
  duration = 450,
}: BackTopProps) {
  const [visible, setVisible] = useState(false);

  // Track scroll position
  useEffect(() => {
    const scrollTarget = target?.() ?? window;
    if (!scrollTarget) return;

    const handleScroll = () => {
      const scrollTop = getScrollTop(scrollTarget);
      setVisible(scrollTop > visibilityHeight);
    };

    scrollTarget.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => scrollTarget.removeEventListener('scroll', handleScroll);
  }, [visibilityHeight, target]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const scrollTarget = target?.() ?? window;
      scrollToTop(scrollTarget, duration);
      onClick?.(e);
    },
    [target, duration, onClick]
  );

  if (!visible) return null;

  return (
    <button
      type="button"
      className={`btn btn-circle btn-primary fixed right-6 bottom-6 z-50 shadow-lg transition-all duration-300 hover:scale-110 ${className}`}
      style={style}
      onClick={handleClick}
      aria-label="Back to top"
    >
      {children ?? <DefaultIcon />}
    </button>
  );
}

HermesBackTop.displayName = 'HermesBackTop';

export default HermesBackTop;
