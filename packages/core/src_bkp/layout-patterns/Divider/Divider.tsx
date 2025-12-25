import React from 'react';
import { Divider as AntDivider } from 'antd';
import type { DividerProps } from './types';

const spacingValues = {
  sm: '8px',
  md: '16px',
  lg: '24px',
};

/**
 * Divider component
 * Enhanced divider with additional styling options
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  variant = 'solid',
  spacing = 'md',
  style,
  ...rest
}) => {
  const spacingValue = spacingValues[spacing];

  const dividerStyle: React.CSSProperties = {
    ...(orientation === 'horizontal'
      ? {
          marginTop: spacingValue,
          marginBottom: spacingValue,
        }
      : {
          marginLeft: spacingValue,
          marginRight: spacingValue,
        }),
    ...style,
  };

  // Map variant to Ant Design props
  const isDashed = variant === 'dashed';
  const borderStyle = variant === 'dotted' ? { borderStyle: 'dotted' } : {};

  return (
    <AntDivider
      type={orientation}
      dashed={isDashed}
      style={{ ...dividerStyle, ...borderStyle }}
      {...rest}
    >
      {label}
    </AntDivider>
  );
};

Divider.displayName = 'Divider';
