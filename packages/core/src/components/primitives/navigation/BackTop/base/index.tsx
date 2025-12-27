'use client';

/**
 * BackTop - Base Component (Vanilla HTML/CSS)
 */
import React, { useState, useEffect, useCallback } from 'react';
import type { BackTopProps } from '../types';
import { BACKTOP_DEFAULTS } from '../types';

const styles = {
  button: {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#1677ff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    transition: 'opacity 0.3s, transform 0.3s',
  } as React.CSSProperties,
  hidden: {
    opacity: 0,
    transform: 'scale(0)',
    pointerEvents: 'none',
  } as React.CSSProperties,
  visible: {
    opacity: 1,
    transform: 'scale(1)',
  } as React.CSSProperties,
};

export const BaseBackTop = React.forwardRef<HTMLButtonElement, BackTopProps>(
  (props, ref) => {
    const {
      target,
      visibilityHeight = BACKTOP_DEFAULTS.visibilityHeight!,
      onClick,
      children,
      className,
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

    const buttonStyle: React.CSSProperties = {
      ...styles.button,
      ...(visible ? styles.visible : styles.hidden),
      ...style,
    };

    return (
      <button
        ref={ref}
        type="button"
        className={className}
        style={buttonStyle}
        onClick={handleClick}
        aria-label="Back to top"
      >
        {children || (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        )}
      </button>
    );
  }
);

BaseBackTop.displayName = 'BaseBackTop';

export default BaseBackTop;
