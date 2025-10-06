import React from 'react';
import { Result, Button } from 'antd';
import type { ResultProps } from './types';

export interface ErrorResultProps extends Omit<ResultProps, 'status'> {
  onRetry?: () => void;
  onGoBack?: () => void;
  retryText?: string;
  goBackText?: string;
  errorCode?: string | number;
}

export const ErrorResult: React.FC<ErrorResultProps> = ({
  title = 'Something went wrong',
  subTitle = 'Sorry, an unexpected error occurred. Please try again.',
  onRetry,
  onGoBack,
  retryText = 'Try Again',
  goBackText = 'Go Back',
  errorCode,
  extra,
  ...props
}) => {
  const defaultExtra = (
    <>
      {onRetry && (
        <Button type="primary" onClick={onRetry}>
          {retryText}
        </Button>
      )}
      {onGoBack && <Button onClick={onGoBack}>{goBackText}</Button>}
    </>
  );

  const displayTitle = errorCode ? `${errorCode}: ${title}` : title;

  return (
    <Result
      status="error"
      title={displayTitle}
      subTitle={subTitle}
      extra={extra || defaultExtra}
      {...props}
    />
  );
};

ErrorResult.displayName = 'ErrorResult';
