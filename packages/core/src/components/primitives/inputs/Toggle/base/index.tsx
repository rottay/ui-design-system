'use client';
import React, { forwardRef } from 'react';
import type { ToggleProps } from '../types';

export const BaseToggle = forwardRef<HTMLDivElement, ToggleProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-toggle ${className}`} style={style} {...rest}>{children}</div>;
});
BaseToggle.displayName = 'BaseToggle';
