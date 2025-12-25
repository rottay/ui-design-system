import React from 'react';
import { Spin } from 'antd';
import type { SpinProps } from './types';

export interface PageLoaderProps extends SpinProps {
  tip?: string;
  backgroundColor?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  tip = 'Loading...',
  backgroundColor = 'rgba(255, 255, 255, 0.9)',
  size = 'large',
  ...spinProps
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        zIndex: 9999,
      }}
    >
      <Spin tip={tip} size={size} {...spinProps} />
    </div>
  );
};

PageLoader.displayName = 'PageLoader';
