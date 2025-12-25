'use client';

/**
 * Titan Descriptions Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Descriptions as AntDescriptions } from 'antd';
import type { DescriptionsProps } from '../types';

/**
 * Titan Descriptions Component
 *
 * Uses Ant Design Descriptions under the hood.
 */
function TitanDescriptions(props: DescriptionsProps) {
  return <AntDescriptions {...props} />;
}

// Attach Item compound component
TitanDescriptions.Item = AntDescriptions.Item;

export default TitanDescriptions;
