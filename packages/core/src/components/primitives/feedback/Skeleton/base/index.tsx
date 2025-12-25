'use client';
import React, { forwardRef } from 'react';
import type { SkeletonProps } from '../types';

export const BaseSkeleton = forwardRef<HTMLDivElement, SkeletonProps>((props, ref) => {
  const { className = '', style = {}, children, ...rest } = props;
  return <div ref={ref} className={`rottay-skeleton ${className}`} style={style} {...rest}>{children}</div>;
});
BaseSkeleton.displayName = 'BaseSkeleton';
