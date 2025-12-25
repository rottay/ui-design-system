'use client';

/**
 * Titan Collapse Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Collapse as AntCollapse } from 'antd';
import type { CollapseProps } from '../types';

/**
 * Titan Collapse Component
 *
 * Uses Ant Design Collapse under the hood.
 */
export default function TitanCollapse(props: CollapseProps) {
  return <AntCollapse {...props} />;
}
