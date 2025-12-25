/**
 * Button - Titan Engine (Ant Design)
 */

import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps } from '../types';
import { BUTTON_DEFAULTS } from '../types';

const VARIANT_MAP = {
  primary: { type: 'primary' as const },
  secondary: { type: 'default' as const },
  ghost: { type: 'text' as const },
  danger: { type: 'primary' as const, danger: true },
  link: { type: 'link' as const },
};

const SIZE_MAP = {
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
};

export default function TitanButton(props: ButtonProps): React.ReactElement {
  const {
    children,
    variant = BUTTON_DEFAULTS.variant,
    size = BUTTON_DEFAULTS.size,
    disabled,
    loading,
    icon,
    iconPosition = BUTTON_DEFAULTS.iconPosition,
    fullWidth,
    type = BUTTON_DEFAULTS.type,
    onClick,
    className,
    style,
    ...rest
  } = props;

  const variantProps = VARIANT_MAP[variant!];

  return (
    <AntButton
      {...variantProps}
      size={SIZE_MAP[size!]}
      disabled={disabled}
      loading={loading}
      icon={iconPosition === 'start' ? icon : undefined}
      block={fullWidth}
      htmlType={type}
      onClick={onClick}
      className={className}
      style={style}
      {...rest}
    >
      {children}
      {iconPosition === 'end' && icon}
    </AntButton>
  );
}
