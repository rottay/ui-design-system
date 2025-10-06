import React from 'react';
import { Skeleton as AntSkeleton } from 'antd';
import type { SkeletonProps } from './types';

export const Skeleton: React.FC<SkeletonProps> = (props) => {
  return <AntSkeleton {...props} />;
};

Skeleton.displayName = 'Skeleton';
