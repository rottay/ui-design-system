'use client';

/**
 * Titan Upload Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Upload as AntUpload } from 'antd';
import type { UploadProps } from '../types';

/**
 * Titan Upload Component
 *
 * Uses Ant Design Upload under the hood.
 */
export default function TitanUpload<T = unknown>(props: UploadProps<T>) {
  const { type, ...rest } = props;

  if (type === 'drag') {
    return <AntUpload.Dragger {...rest} />;
  }

  return <AntUpload {...rest} />;
}
