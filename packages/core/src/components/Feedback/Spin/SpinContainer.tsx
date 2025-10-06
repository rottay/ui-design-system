import React from 'react';
import { Spin } from 'antd';
import type { SpinProps } from './types';

export interface SpinContainerProps extends Omit<SpinProps, 'spinning'> {
  loading?: boolean;
  children?: React.ReactNode;
  delay?: number;
  blur?: boolean;
}

export const SpinContainer: React.FC<SpinContainerProps> = ({
  loading = false,
  children,
  delay = 0,
  blur = true,
  tip,
  ...spinProps
}) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
  };

  const contentStyle: React.CSSProperties = {
    filter: loading && blur ? 'blur(2px)' : 'none',
    transition: 'filter 0.3s ease',
    pointerEvents: loading ? 'none' : 'auto',
  };

  return (
    <div style={wrapperStyle}>
      <Spin spinning={loading} delay={delay} tip={tip} {...spinProps}>
        <div style={contentStyle}>{children}</div>
      </Spin>
    </div>
  );
};

SpinContainer.displayName = 'SpinContainer';
