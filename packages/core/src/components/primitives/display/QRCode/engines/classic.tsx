/**
 * @fileoverview Classic (Ant Design) engine for the QRCode display primitive.
 * Delegates to `antd/QRCode` for real Reed-Solomon QR encoding, error
 * correction, icon overlay, and status states (loading/expired/scanned).
 *
 * @example
 * ```tsx
 * <QRCode engine="classic" value="https://example.com" size={160} />
 * ```
 */

'use client';

import React from 'react';
import { QRCode as AntQRCode } from 'antd';
import type { QRCodeProps } from '../QRCode.types';
import { QRCODE_DEFAULTS } from '../QRCode.types';

/**
 * Translates the DS status union to the narrower set antd accepts.
 * The default case maps any unknown/active status to 'active'.
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
 * Classic QRCode engine. Wraps `antd/QRCode` with DS prop normalization.
 * Ant Design handles the actual QR matrix generation and canvas/SVG rendering.
 *
 * @param props - DS QRCodeProps (value, size, colors, status, icon, etc.).
 * @returns A wrapper div containing the `antd/QRCode` component.
 */
export default function ClassicQRCode(props: QRCodeProps): React.ReactElement {
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
      className={`rottay-qrcode rottay-qrcode--classic ${className || ''}`}
      style={style}
      data-status={status}
    >
      {/* Pass a space for empty value to avoid antd's empty-state rendering.
          onRefresh is only wired when expired to prevent accidental re-generation. */}
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

ClassicQRCode.displayName = 'ClassicQRCode';
