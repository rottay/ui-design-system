'use client';
import React, { forwardRef } from 'react';
import type { RadioProps } from '../types';

export const BaseRadio = forwardRef<HTMLDivElement, RadioProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-radio ${className}`} style={style} {...rest}>{children}</div>;
});
BaseRadio.displayName = 'BaseRadio';
