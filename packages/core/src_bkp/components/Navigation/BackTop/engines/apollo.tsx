'use client';

/**
 * Apollo BackTop Engine
 *
 * Native HTML + Tailwind CSS implementation.
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
 * Apollo BackTop - Native HTML + Tailwind implementation
 */
function ApolloBackTop({
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

  const buttonClasses = [
    'fixed right-6 bottom-6 z-50',
    'w-10 h-10 rounded-full',
    'bg-blue-600 text-white shadow-lg',
    'flex items-center justify-center',
    'transition-all duration-300',
    'hover:bg-blue-700 hover:shadow-xl hover:scale-110',
    'active:scale-95',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={buttonClasses}
      style={style}
      onClick={handleClick}
      aria-label="Back to top"
    >
      {children ?? <DefaultIcon />}
    </button>
  );
}

ApolloBackTop.displayName = 'ApolloBackTop';

export default ApolloBackTop;
