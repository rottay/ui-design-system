'use client';
import React, { forwardRef } from 'react';
import type { TextareaProps } from '../types';

export const BaseTextarea = forwardRef<HTMLDivElement, TextareaProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-textarea ${className}`} style={style} {...rest}>{children}</div>;
});
BaseTextarea.displayName = 'BaseTextarea';
