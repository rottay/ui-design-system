'use client';

/**
 * Titan Tree Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Tree as AntTree } from 'antd';
import type { TreeProps } from '../types';

/**
 * Titan Tree Component
 *
 * Uses Ant Design Tree under the hood.
 */
export default function TitanTree(props: TreeProps) {
  return <AntTree {...props} />;
}
