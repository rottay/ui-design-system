'use client';

import React, { forwardRef } from 'react';

import type { AffixProps } from '../../contracts';

/** Lightweight CSS-sticky fallback usable outside the engine system. */
export const BaseAffix = forwardRef<HTMLDivElement, AffixProps>((props, ref) => {
  const {
    offsetTop = 0,
    offsetBottom,
    children,
    className = '',
    style = {},
    zIndex = 10,
  } = props;

  const stickyStyle: React.CSSProperties = {
    position: 'sticky',
    zIndex,
    ...(offsetBottom !== undefined ? { bottom: offsetBottom } : { top: offsetTop }),
    ...style,
  };

  return (
    <div ref={ref} className={`rottay-affix ${className}`} style={stickyStyle}>
      {children}
    </div>
  );
});

BaseAffix.displayName = 'BaseAffix';
