'use client';

/**
 * BackTop - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState, useEffect, useCallback } from 'react';
import type { BackTopProps } from '../../types';
import { BACKTOP_DEFAULTS } from '../../types';

export const BackTop = React.forwardRef<HTMLButtonElement, BackTopProps>(
  (props, ref) => {
    const {
      target,
      visibilityHeight = BACKTOP_DEFAULTS.visibilityHeight!,
      onClick,
      children,
      className = '',
      style,
    } = props;

    const [visible, setVisible] = useState(false);

    const getTarget = useCallback(() => target?.() ?? window, [target]);

    const handleScroll = useCallback(() => {
      const t = getTarget();
      const scrollTop = t === window
        ? document.documentElement.scrollTop || document.body.scrollTop
        : (t as HTMLElement).scrollTop;
      setVisible(scrollTop >= visibilityHeight);
    }, [getTarget, visibilityHeight]);

    useEffect(() => {
      const t = getTarget();
      t.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => t.removeEventListener('scroll', handleScroll);
    }, [getTarget, handleScroll]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const t = getTarget();
      if (t === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        (t as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
      }
      onClick?.(e);
    };

    if (!visible) return null;

    return (
      <button
        ref={ref}
        type="button"
        className={`btn btn-circle btn-primary fixed bottom-8 right-8 shadow-lg z-50 ${className}`}
        style={style}
        onClick={handleClick}
        aria-label="Back to top"
      >
        {children || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </button>
    );
  }
);

BackTop.displayName = 'BackTop.Hermes';

export default BackTop;
