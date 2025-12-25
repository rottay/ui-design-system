'use client';
import React, { forwardRef } from 'react';
import type { CheckboxProps } from '../types';

export const BaseCheckbox = forwardRef<HTMLDivElement, CheckboxProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-checkuox ${className}`} style={style} {...rest}>{children}</div>;
});
BaseCheckbox.displayName = 'BaseCheckbox';
