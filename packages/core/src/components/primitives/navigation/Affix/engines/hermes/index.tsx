'use client';

/**
 * Affix - Hermes Engine (DaisyUI/Tailwind)
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
      className = '',
      style,
    } = props;

    const stickyStyle: React.CSSProperties = offsetBottom !== undefined
      ? { position: 'sticky', bottom: `${offsetBottom}px` }
      : { position: 'sticky', top: `${offsetTop}px` };

    return (
      <div ref={ref} className={`z-10 ${className}`} style={{ ...stickyStyle, ...style }}>
        {children}
      </div>
    );
  }
);

Affix.displayName = 'Affix.Hermes';

export default Affix;
