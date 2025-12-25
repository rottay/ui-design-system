'use client';

/**
 * Hermes Affix Engine
 *
 * DaisyUI implementation using position: sticky.
 */

import { useState, useEffect, useRef } from 'react';
import type { AffixProps } from '../../../../types/components/affix';

/**
 * Hermes Affix - DaisyUI implementation with sticky positioning
 */
function HermesAffix({
  children,
  offsetTop,
  offsetBottom,
  className = '',
  style,
  onChange,
  target,
  zIndex = 10,
}: AffixProps) {
  const [affixed, setAffixed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getTarget = () => {
      if (target) {
        const result = target();
        return result instanceof Window ? window : result;
      }
      return window;
    };

    const scrollContainer = getTarget();
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const isAffixed = offsetTop !== undefined
        ? rect.top <= offsetTop
        : offsetBottom !== undefined
        ? rect.bottom >= window.innerHeight - offsetBottom
        : false;

      if (isAffixed !== affixed) {
        setAffixed(isAffixed);
        onChange?.(isAffixed);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [offsetTop, offsetBottom, affixed, onChange, target]);

  const stickyStyle: React.CSSProperties = {
    ...style,
    position: 'sticky',
    zIndex,
    ...(offsetTop !== undefined && { top: offsetTop }),
    ...(offsetBottom !== undefined && { bottom: offsetBottom }),
  };

  return (
    <div ref={wrapperRef} className={className} style={stickyStyle}>
      {children}
    </div>
  );
}

HermesAffix.displayName = 'HermesAffix';

export default HermesAffix;
