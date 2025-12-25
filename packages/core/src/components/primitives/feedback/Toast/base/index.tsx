'use client';
import React, { forwardRef } from 'react';
import type { ToastProps } from '../types';

export const BaseToast = forwardRef<HTMLDivElement, ToastProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-toast ${className}`} style={style} {...rest}>{children}</div>;
});
BaseToast.displayName = 'BaseToast';
