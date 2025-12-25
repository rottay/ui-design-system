'use client';

import React, { forwardRef } from 'react';
import { Tag as AntTag } from 'antd';
import type { TagProps } from '../../types';

/**
 * Titan (Ant Design) implementation of Tag component.
 *
 * Uses Ant Design's Tag with semantic colors.
 */
export const TitanTag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      size,
      variant,
      color = 'default',
      closable = false,
      onClose,
      icon,
      children,
      rounded,
      bordered = true,
      disabled,
      clickable,
      onClick,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const colorMap = {
      default: 'default',
      primary: 'blue',
      secondary: 'purple',
      success: 'success',
      warning: 'warning',
      error: 'error',
    };

    return (
      <AntTag
        ref={ref as any}
        color={colorMap[color]}
        closable={closable}
        onClose={onClose}
        icon={icon}
        bordered={variant === 'outline' || bordered}
        className={className}
        style={{
          cursor: clickable && !disabled ? 'pointer' : undefined,
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          ...style,
        }}
        onClick={onClick}
        {...props}
      >
        {children}
      </AntTag>
    );
  }
);

TitanTag.displayName = 'TitanTag';
