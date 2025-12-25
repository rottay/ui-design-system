'use client';

/**
 * Titan TreeSelect Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { TreeSelect as AntTreeSelect } from 'antd';
import type { TreeSelectProps } from '../types';

/**
 * Titan TreeSelect Component
 *
 * Uses Ant Design TreeSelect under the hood.
 */
export default function TitanTreeSelect(props: TreeSelectProps) {
  return <AntTreeSelect {...props} />;
}
