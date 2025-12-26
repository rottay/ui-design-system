'use client';

/**
 * Affix - Titan Engine (Ant Design)
 */
import React from 'react';
import { Affix as AntAffix } from 'antd';
import type { AffixProps } from '../../types';
import { AFFIX_DEFAULTS } from '../../types';

export const Affix = React.forwardRef<HTMLDivElement, AffixProps>(
  (props, ref) => {
    const {
      offsetTop = AFFIX_DEFAULTS.offsetTop,
      offsetBottom,
      target,
      onChange,
      children,
      className,
      style,
    } = props;

    return (
      <div ref={ref} className={className} style={style}>
        <AntAffix
          offsetTop={offsetBottom === undefined ? offsetTop : undefined}
          offsetBottom={offsetBottom}
          target={target}
          onChange={onChange as any}
        >
          {children}
        </AntAffix>
      </div>
    );
  }
);

Affix.displayName = 'Affix.Titan';

export default Affix;
