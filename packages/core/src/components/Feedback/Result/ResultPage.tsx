import React from 'react';
import { Result } from 'antd';
import type { ResultProps } from './types';

export interface ResultPageProps extends ResultProps {
  fullHeight?: boolean;
  backgroundColor?: string;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  fullHeight = true,
  backgroundColor = '#ffffff',
  style,
  ...props
}) => {
  const pageStyle: React.CSSProperties = {
    minHeight: fullHeight ? '100vh' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor,
    ...style,
  };

  return (
    <div style={pageStyle}>
      <Result {...props} />
    </div>
  );
};

ResultPage.displayName = 'ResultPage';
