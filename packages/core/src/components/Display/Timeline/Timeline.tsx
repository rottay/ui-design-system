import React from 'react';
import { Timeline as AntTimeline } from 'antd';
import type { TimelineProps } from './types';

export const Timeline: React.FC<TimelineProps> = (props) => {
  return <AntTimeline {...props} />;
};

Timeline.displayName = 'Timeline';
