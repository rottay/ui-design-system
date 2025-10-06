import React from 'react';
import { Result, Button } from 'antd';
import type { ResultProps } from './types';

export interface SuccessResultProps extends Omit<ResultProps, 'status'> {
  onContinue?: () => void;
  onGoHome?: () => void;
  continueText?: string;
  goHomeText?: string;
}

export const SuccessResult: React.FC<SuccessResultProps> = ({
  title = 'Successfully Completed',
  subTitle = 'Your operation has been completed successfully.',
  onContinue,
  onGoHome,
  continueText = 'Continue',
  goHomeText = 'Go Home',
  extra,
  ...props
}) => {
  const defaultExtra = (
    <>
      {onContinue && (
        <Button type="primary" onClick={onContinue}>
          {continueText}
        </Button>
      )}
      {onGoHome && <Button onClick={onGoHome}>{goHomeText}</Button>}
    </>
  );

  return (
    <Result
      status="success"
      title={title}
      subTitle={subTitle}
      extra={extra || defaultExtra}
      {...props}
    />
  );
};

SuccessResult.displayName = 'SuccessResult';
