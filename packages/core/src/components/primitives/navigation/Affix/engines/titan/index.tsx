'use client';

/**
 * Affix - Titan Engine (Ant Design)
 * Leverages Ant Design's Affix component for full-featured sticky behavior
 */

import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Affix as AntAffix } from 'antd';
import type { AffixProps } from '../../types';
import { AFFIX_DEFAULTS } from '../../types';

/**
 * Titan engine implementation using Ant Design's Affix component.
 * Provides the most feature-complete implementation with full target and onChange support.
 */
export const TitanAffix = forwardRef<HTMLDivElement, AffixProps>(
  (props, ref) => {
    const {
      offsetTop = AFFIX_DEFAULTS.offsetTop,
      offsetBottom,
      target,
      onChange,
      children,
      className = '',
      style,
      zIndex = AFFIX_DEFAULTS.zIndex,
    } = props;

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Forward ref to wrapper
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    // Build wrapper styles
    const wrapperStyle: React.CSSProperties = {
      '--affix-z-index': zIndex,
      '--affix-offset-top': `${offsetTop}px`,
      '--affix-offset-bottom': offsetBottom !== undefined ? `${offsetBottom}px` : 'auto',
      ...style,
    } as React.CSSProperties;

    return (
      <div
        ref={wrapperRef}
        className={`rottay-affix rottay-affix--titan ${className}`}
        style={wrapperStyle}
      >
        <AntAffix
          offsetTop={offsetBottom === undefined ? offsetTop : undefined}
          offsetBottom={offsetBottom}
          target={target}
          onChange={(affixed) => onChange?.(affixed ?? false)}
          style={{ zIndex }}
        >
          <div className="rottay-affix__content">
            {children}
          </div>
        </AntAffix>
      </div>
    );
  }
);

TitanAffix.displayName = 'Affix.Titan';

export default TitanAffix;
