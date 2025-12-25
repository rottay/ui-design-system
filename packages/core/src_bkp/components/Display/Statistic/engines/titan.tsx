'use client';

/**
 * Titan Statistic Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Statistic as AntStatistic } from 'antd';
import type { StatisticProps } from '../types';

/**
 * Titan Statistic Component
 *
 * Uses Ant Design Statistic under the hood.
 */
export default function TitanStatistic(props: StatisticProps) {
  return <AntStatistic {...props} />;
}
