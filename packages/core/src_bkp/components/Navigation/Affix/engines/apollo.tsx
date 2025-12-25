'use client';

/**
 * Apollo Affix Engine
 *
 * Native HTML + Tailwind CSS implementation with fixed positioning.
 */

import { useState, useEffect, useRef } from 'react';
import type { AffixProps } from '../../../../types/components/affix';

/**
 * Apollo Affix - Native HTML + Tailwind implementation
 */
function ApolloAffix({
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
  const [placeholderStyle, setPlaceholderStyle] = useState<React.CSSProperties>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

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
      if (!placeholderRef.current || !wrapperRef.current) return;

      const placeholderRect = placeholderRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();

      let shouldAffix = false;
      if (offsetTop !== undefined) {
        shouldAffix = placeholderRect.top <= offsetTop;
      } else if (offsetBottom !== undefined) {
        shouldAffix = placeholderRect.bottom >= window.innerHeight - offsetBottom;
      }

      if (shouldAffix !== affixed) {
        setAffixed(shouldAffix);
        onChange?.(shouldAffix);

        if (shouldAffix) {
          setPlaceholderStyle({
            width: wrapperRect.width,
            height: wrapperRect.height,
          });
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [offsetTop, offsetBottom, affixed, onChange, target]);

  const affixStyle: React.CSSProperties = affixed
    ? {
        ...style,
        position: 'fixed',
        zIndex,
        ...(offsetTop !== undefined && { top: offsetTop }),
        ...(offsetBottom !== undefined && { bottom: offsetBottom }),
      }
    : style;

  const baseClasses = `transition-shadow duration-200 ${affixed ? 'shadow-md' : ''} ${className}`;

  return (
    <>
      <div ref={placeholderRef} style={affixed ? placeholderStyle : { display: 'contents' }}>
        {!affixed && (
          <div ref={wrapperRef} className={baseClasses} style={style}>
            {children}
          </div>
        )}
      </div>
      {affixed && (
        <div ref={wrapperRef} className={baseClasses} style={affixStyle}>
          {children}
        </div>
      )}
    </>
  );
}

ApolloAffix.displayName = 'ApolloAffix';

export default ApolloAffix;
