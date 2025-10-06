import React from 'react';
import { Statistic as AntStatistic } from 'antd';
import type { StatisticProps } from './types';

export const Statistic: React.FC<StatisticProps> = (props) => {
  return <AntStatistic {...props} />;
};

Statistic.displayName = 'Statistic';
