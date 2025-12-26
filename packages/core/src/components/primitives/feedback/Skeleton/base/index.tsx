'use client';
import { forwardRef } from 'react';
import type { SkeletonProps } from '../types';

export const BaseSkeleton = forwardRef<HTMLDivElement, SkeletonProps>((props, ref) => {
  const { className = '', style = {}, children } = props;
  return <div ref={ref} className={`rottay-skeleton ${className}`} style={style}>{children}</div>;
});
BaseSkeleton.displayName = 'BaseSkeleton';
