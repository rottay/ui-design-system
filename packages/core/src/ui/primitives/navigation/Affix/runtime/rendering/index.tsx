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
    // Stamp parity with the engine TSX (P2-20): the fallback carries the same
    // stable hooks (`data-part='root'` + `data-affix-edge`) the Modern engine
    // stamps, so selectors/tests observe one contract across render paths.
    <div
      ref={ref}
      className={`rottay-affix ${className}`}
      style={stickyStyle}
      data-part="root"
      data-affix-edge={offsetBottom !== undefined ? 'bottom' : 'top'}
    >
      {children}
    </div>
  );
});

BaseAffix.displayName = 'BaseAffix';
