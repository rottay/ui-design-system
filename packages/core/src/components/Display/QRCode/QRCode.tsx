import React from 'react';
import { QRCode as AntQRCode } from 'antd';
import type { QRCodeProps } from './types';

export const QRCode: React.FC<QRCodeProps> = (props) => {
  return <AntQRCode {...props} />;
};

QRCode.displayName = 'QRCode';
