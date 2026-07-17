/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the QRCode display primitive.
 * Renders a standards-compliant QR symbol with DaisyUI-styled status overlays.
 *
 * @example
 * ```tsx
 * <QRCode engine="modern" value="https://example.com" bordered />
 * ```
 */

'use client';

import React, { useRef } from 'react';
import type { QRCodeProps } from '../../contracts';
import { QRCODE_DEFAULTS } from '../../contracts';
import { EncodedQRCodeSymbol } from '../../runtime/encoded-symbol';

/**
 * Modern QRCode engine. Renders the shared standards-compliant Canvas/SVG
 * symbol and overlays DaisyUI-styled loading/expired/scanned indicators.
 *
 * @param props - DS QRCodeProps (value, size, colors, status, icon, etc.).
 * @returns A DaisyUI-styled container with an encoded symbol and status overlay.
 */
export default function ModernQRCode(props: QRCodeProps): React.ReactElement {
  const {
    value,
    type = QRCODE_DEFAULTS.type,
    size = QRCODE_DEFAULTS.size,
    color = QRCODE_DEFAULTS.color,
    bgColor = QRCODE_DEFAULTS.bgColor,
    errorLevel = QRCODE_DEFAULTS.errorLevel,
    status = QRCODE_DEFAULTS.status,
    bordered = QRCODE_DEFAULTS.bordered,
    icon,
    iconSize = QRCODE_DEFAULTS.iconSize,
    onRefresh,
    className = '',
    style,
  } = props;

  const paintOwnerRef = useRef<HTMLDivElement>(null);

  // Each status state gets its own DaisyUI-themed overlay on top of the canvas
  const renderOverlay = () => {
    switch (status) {
      case 'loading':
        return (
          <div data-part="overlay" className="absolute inset-0 flex items-center justify-center" style={{ opacity: 'var(--ds-qrcode-loading-opacity, 1)' }} role="status" aria-label="Loading QR code">
            <span data-part="spinner" aria-hidden="true" style={{ display: 'inline-block', width: 24, height: 24, animation: 'spin var(--ds-motion-glacial) linear infinite' }} />
          </div>
        );
      case 'expired':
        return (
          <div data-part="overlay" className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ opacity: 'var(--ds-qrcode-status-expired-opacity, 1)' }} role="alert">
            <span data-part="status-text" className="text-sm">QR Code expired</span>
            {onRefresh && (
              <button
                data-part="refresh-button"
                type="button"
                aria-label="Refresh QR code"
                style={{ height: 'var(--ds-qrcode-refresh-button-size, 32px)', padding: '0 12px', fontSize: 13, cursor: 'pointer' }}
                onClick={onRefresh}
              >
                Refresh
              </button>
            )}
          </div>
        );
      case 'scanned':
        return (
          <div data-part="overlay" className="absolute inset-0 flex items-center justify-center" style={{ opacity: 'var(--ds-qrcode-status-scanned-opacity, 1)' }} role="status" aria-label="QR code scanned">
            <svg
              data-part="status-icon"
              className="w-12 h-12"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const containerClasses = [
    'inline-block relative',
    bordered ? 'border p-3 rounded-lg' : '',
    className,
  ].filter(Boolean).join(' ');

  const containerInlineStyle: React.CSSProperties = {
    ...style,
  };

  return (
    <div
      className={`rottay-qrcode rottay-qrcode--modern ${containerClasses}`}
      style={containerInlineStyle}
      data-part="root"
      data-status={status}
      data-bordered={bordered ? 'true' : undefined}
    >
      <div ref={paintOwnerRef} className="relative" data-part="canvas-wrapper" style={{ width: size, height: size }}>
        <EncodedQRCodeSymbol
          ownerRef={paintOwnerRef}
          value={value}
          type={type}
          size={size}
          color={color}
          bgColor={bgColor}
          errorLevel={errorLevel}
          icon={status === 'active' ? icon : undefined}
          iconSize={iconSize}
        />
        {icon && status === 'active' && (
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-1 rounded"
            data-part="icon"
            style={{ width: iconSize, height: iconSize, padding: 'var(--ds-qrcode-icon-padding, 4px)' }}
          >
            <img
              src={icon}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {renderOverlay()}
      </div>
    </div>
  );
}

ModernQRCode.displayName = 'ModernQRCode';
