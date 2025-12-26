/**
 * QRCode - Titan Engine (Ant Design)
 *
 * Uses Ant Design's QRCode component for full-featured QR code generation.
 * Supports all standard QR code features including error correction,
 * custom icons, and various status states.
 */

'use client';

import React from 'react';
import { QRCode as AntQRCode } from 'antd';
import type { QRCodeProps } from '../../types';
import { QRCODE_DEFAULTS } from '../../types';

/**
 * Maps internal status to Ant Design status.
 */
function mapStatus(status: QRCodeProps['status']): 'active' | 'expired' | 'loading' | 'scanned' {
  switch (status) {
    case 'expired':
      return 'expired';
    case 'loading':
      return 'loading';
    case 'scanned':
      return 'scanned';
    default:
      return 'active';
  }
}

/**
 * Titan QRCode component using Ant Design.
 *
 * @example
 * ```tsx
 * <TitanQRCode value="https://example.com" />
 * ```
 */
export default function TitanQRCode(props: QRCodeProps): React.ReactElement {
  const {
    value,
    type = QRCODE_DEFAULTS.type,
    icon,
    size = QRCODE_DEFAULTS.size,
    iconSize = QRCODE_DEFAULTS.iconSize,
    color = QRCODE_DEFAULTS.color,
    bgColor = QRCODE_DEFAULTS.bgColor,
    errorLevel = QRCODE_DEFAULTS.errorLevel,
    status = QRCODE_DEFAULTS.status,
    bordered = QRCODE_DEFAULTS.bordered,
    onRefresh,
    className,
    style,
  } = props;

  return (
    <div
      className={`rottay-qrcode rottay-qrcode--titan ${className || ''}`}
      style={style}
      data-status={status}
    >
      <AntQRCode
        value={value || ' '}
        type={type}
        icon={icon}
        size={size}
        iconSize={iconSize}
        color={color}
        bgColor={bgColor}
        errorLevel={errorLevel}
        status={mapStatus(status)}
        bordered={bordered}
        onRefresh={status === 'expired' ? onRefresh : undefined}
      />
    </div>
  );
}

TitanQRCode.displayName = 'TitanQRCode';
