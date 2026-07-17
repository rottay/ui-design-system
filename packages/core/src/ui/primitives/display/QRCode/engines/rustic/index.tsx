/**
 * @fileoverview Rustic HTML/CSS chrome for the QRCode display primitive.
 * The shared QR runtime owns standards-compliant Canvas/SVG encoding and accessible
 * naming. Chrome is painted by
 * `foundation/tokens/css/runtime/engines/rustic/skin/qrcode.css`, keyed on the `data-part`/`data-status`/
 * `data-bordered` contract stamped below; the encoded symbol and a caller's own
 * `style` stay in this file.
 *
 * @example
 * ```tsx
 * <QRCode engine="rustic" value="https://example.com" bordered />
 * ```
 */

'use client';

import React, { useRef } from 'react';
import type { QRCodeProps } from '../../contracts';
import { QRCODE_DEFAULTS } from '../../contracts';
import { EncodedQRCodeSymbol } from '../../runtime/encoded-symbol';

/**
 * Rustic QRCode engine. Renders the shared encoded symbol with full ARIA
 * labelling and overlays status indicators with
 * role="status" / role="alert" for accessibility.
 *
 * @param props - DS QRCodeProps (value, size, colors, status, icon, etc.).
 * @returns A container with an encoded symbol and status overlay.
 */
export default function RusticQRCode(props: QRCodeProps): React.ReactElement {
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
    className,
    style,
  } = props;

  const paintOwnerRef = useRef<HTMLDivElement>(null);

  // bordered still owns the padding; its frame and fill are painted by qrcode.css,
  // which keys on the data-bordered stamp below
  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    ...(bordered && {
      padding: 'var(--ds-qrcode-padding, 12px)',
    }),
    ...style,
  };

  // Shared overlay base for loading/expired/scanned states
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  // Absolutely centered over the matrix space reserved by the QR encoder.
  const iconWrapperStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: iconSize,
    height: iconSize,
    padding: 4,
  };

  // Button styles
  const buttonStyle: React.CSSProperties = {
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'inherit',
  };

  // CSS-only spinner; the ring and the keyframe both live in qrcode.css
  const spinnerStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    animation: 'ds-qrcode-spin-rustic 1s linear infinite',
  };

  // Each status gets proper ARIA roles: 'status' for loading/scanned, 'alert' for expired
  const renderOverlay = () => {
    switch (status) {
      case 'loading':
        return (
          <div data-part="overlay" style={overlayStyle} role="status" aria-label="Loading QR code">
            <div data-part="spinner" style={spinnerStyle} />
          </div>
        );
      case 'expired':
        return (
          <div data-part="overlay" style={overlayStyle} role="alert">
            <p data-part="status-text" style={{ margin: 0, fontSize: 14 }}>QR Code expired</p>
            {onRefresh && (
              <button
                data-part="refresh-button"
                onClick={onRefresh}
                style={buttonStyle}
                type="button"
                aria-label="Refresh QR code"
              >
                Refresh
              </button>
            )}
          </div>
        );
      case 'scanned':
        return (
          <div data-part="overlay" style={overlayStyle} role="status" aria-label="QR code scanned">
            <svg data-part="status-icon" width={48} height={48} fill="var(--ds-qrcode-success-color, var(--ds-color-success-500, #52c41a))" viewBox="0 0 20 20" aria-hidden="true">
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

  return (
    <div
      className={`rottay-qrcode rottay-qrcode--rustic ${className || ''}`}
      style={containerStyle}
      data-part="root"
      data-status={status}
      data-bordered={bordered ? 'true' : undefined}
    >
      <div ref={paintOwnerRef} style={{ position: 'relative', width: size, height: size }} data-part="canvas-wrapper">
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
          <div data-part="icon" style={iconWrapperStyle}>
            <img
              src={icon}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
        {renderOverlay()}
      </div>
    </div>
  );
}

RusticQRCode.displayName = 'RusticQRCode';
