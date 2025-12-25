'use client';

/**
 * Titan Timeline Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Timeline as AntTimeline } from 'antd';
import type { TimelineProps } from '../types';

/**
 * Titan Timeline Component
 *
 * Uses Ant Design Timeline under the hood.
 */
export default function TitanTimeline(props: TimelineProps) {
  return <AntTimeline {...props} />;
}
