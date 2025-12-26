'use client';
import { forwardRef } from 'react';
import type { TextareaProps } from '../types';

export const BaseTextarea = forwardRef<HTMLDivElement, TextareaProps>((props, ref) => {
  const { className = '', style = {} } = props;
  return <div ref={ref} className={`rottay-textarea ${className}`} style={style} />;
});
BaseTextarea.displayName = 'BaseTextarea';
