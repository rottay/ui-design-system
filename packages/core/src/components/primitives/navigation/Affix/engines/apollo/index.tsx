'use client';

/**
 * Affix - Apollo Engine (Vanilla HTML/CSS)
 */
import React from 'react';
import type { AffixProps } from '../../types';
import { AFFIX_DEFAULTS } from '../../types';

export const Affix = React.forwardRef<HTMLDivElement, AffixProps>(
  (props, ref) => {
    const {
      offsetTop = AFFIX_DEFAULTS.offsetTop!,
      offsetBottom,
      children,
      className,
      style,
    } = props;

    const stickyStyle: React.CSSProperties = {
      position: 'sticky',
      zIndex: 10,
      ...(offsetBottom !== undefined
        ? { bottom: `${offsetBottom}px` }
        : { top: `${offsetTop}px` }
      ),
      ...style,
    };

    return (
      <div ref={ref} className={className} style={stickyStyle}>
        {children}
      </div>
    );
  }
);

Affix.displayName = 'Affix.Apollo';

export default Affix;
