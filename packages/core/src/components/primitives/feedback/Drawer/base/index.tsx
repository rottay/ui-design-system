'use client';
import React, { forwardRef } from 'react';
import type { DrawerProps } from '../types';

export const BaseDrawer = forwardRef<HTMLDivElement, DrawerProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-drawer ${className}`} style={style} {...rest}>{children}</div>;
});
BaseDrawer.displayName = 'BaseDrawer';
