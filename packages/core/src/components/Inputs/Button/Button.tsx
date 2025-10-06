import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
  fullWidth = false,
  style,
  ...rest
}) => {
  return (
    <AntButton
      style={{
        width: fullWidth ? '100%' : undefined,
        ...style,
      }}
      {...rest}
    />
  );
};

Button.displayName = 'Button';
