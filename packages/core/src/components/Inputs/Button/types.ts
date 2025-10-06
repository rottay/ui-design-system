import type { ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends Omit<AntButtonProps, 'variant'> {
  // Custom additional props
  fullWidth?: boolean;
}
