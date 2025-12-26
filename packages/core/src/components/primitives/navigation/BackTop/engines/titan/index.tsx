'use client';

/**
 * BackTop - Titan Engine (Ant Design)
 */
import React from 'react';
import { FloatButton } from 'antd';
import type { BackTopProps } from '../../types';
import { BACKTOP_DEFAULTS } from '../../types';

export const BackTop = React.forwardRef<HTMLDivElement, BackTopProps>(
  (props, ref) => {
    const {
      target,
      visibilityHeight = BACKTOP_DEFAULTS.visibilityHeight,
      onClick,
      duration = BACKTOP_DEFAULTS.duration,
      children,
      className,
      style,
    } = props;

    return (
      <div ref={ref} className={className} style={style}>
        <FloatButton.BackTop
          target={target}
          visibilityHeight={visibilityHeight}
          onClick={onClick}
          duration={duration}
        >
          {children}
        </FloatButton.BackTop>
      </div>
    );
  }
);

BackTop.displayName = 'BackTop.Titan';

export default BackTop;
