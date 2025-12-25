'use client';
import React, { forwardRef } from 'react';
import type { InputProps } from '../types';

export const BaseInput = forwardRef<HTMLDivElement, InputProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-input ${className}`} style={style} {...rest}>{children}</div>;
});
BaseInput.displayName = 'BaseInput';
