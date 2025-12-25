import React from 'react';
import { Spin } from 'antd';
import type { SpinProps } from './types';

export interface LoadingContainerProps extends SpinProps {
  loading?: boolean;
  children?: React.ReactNode;
  minHeight?: number | string;
  fullHeight?: boolean;
}

export const LoadingContainer: React.FC<LoadingContainerProps> = ({
  loading = true,
  children,
  minHeight = 200,
  fullHeight = false,
  ...spinProps
}) => {
  const containerStyle: React.CSSProperties = {
    minHeight: fullHeight ? '100vh' : minHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <Spin {...spinProps} />
      </div>
    );
  }

  return <>{children}</>;
};

LoadingContainer.displayName = 'LoadingContainer';
