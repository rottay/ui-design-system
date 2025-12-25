'use client';
import React, { forwardRef } from 'react';
import type { SelectProps } from '../types';

export const BaseSelect = forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-select ${className}`} style={style} {...rest}>{children}</div>;
});
BaseSelect.displayName = 'BaseSelect';
