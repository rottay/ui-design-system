'use client';

/**
 * Titan QRCode Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { QRCode as AntQRCode } from 'antd';
import type { QRCodeProps } from '../types';

/**
 * Titan QRCode Component
 *
 * Uses Ant Design QRCode under the hood.
 */
export default function TitanQRCode(props: QRCodeProps) {
  return <AntQRCode {...props} />;
}
