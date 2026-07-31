/**
 * @fileoverview Modern engine for the QRCode display primitive.
 * Renders a standards-compliant QR symbol with token-driven status overlays
 * painted solely by the unlayered modern skin (`skin/qrcode.css`). No DaisyUI
 * classes are emitted (K4-C docblock correction: this engine never painted
 * through DaisyUI; the overlays are skin-owned).
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
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/**
 * Modern QRCode engine. Renders the shared standards-compliant Canvas/SVG
 * symbol and overlays skin-owned loading/expired/scanned indicators.
 *
 * @param props - DS QRCodeProps (value, size, colors, status, icon, etc.).
 * @returns A token-styled container with an encoded symbol and status overlay.
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

  // Status strings: translated when an I18nProvider is mounted, with the
  // documented English fallbacks otherwise (a missing catalog key echoes the
  // raw key back, which the endsWith guard detects — K4-C wires the channel
  // ahead of the locale JSONs, so behavior is byte-identical until they land).
  const i18n = useOptionalTranslation('components');
  const qrcodeLabel = (key: string, fallback: string): string => {
    const translated = i18n?.t(key);
    return translated && !translated.endsWith(key) ? translated : fallback;
  };

  // Each status state gets its own skin-painted overlay on top of the canvas.
  // No per-status opacity lives inline anymore (K4-C round 2 / Pass 2): the
  // declared opacities muted the CHROME (bridge root x overlay = unreadable
  // composites). The skin restores full chrome opacity per status and moves
  // each declared mute onto the CANVAS, which is what should read
  // loading/expired/scanned. Chrome geometry is skin-owned (single owner).
  const renderOverlay = () => {
    switch (status) {
      case 'loading':
        return (
          <div data-part="overlay" role="status" aria-label={qrcodeLabel('qrcode.loading', 'Loading QR code')}>
            <span data-part="spinner" aria-hidden="true" />
          </div>
        );
      case 'expired':
        return (
          <div data-part="overlay" role="alert">
            <span data-part="status-text">{qrcodeLabel('qrcode.expired', 'QR Code expired')}</span>
            {onRefresh && (
              <button
                data-part="refresh-button"
                type="button"
                aria-label={qrcodeLabel('qrcode.refreshLabel', 'Refresh QR code')}
                onClick={onRefresh}
              >
                {qrcodeLabel('qrcode.refresh', 'Refresh')}
              </button>
            )}
          </div>
        );
      case 'scanned':
        return (
          <div data-part="overlay" role="status" aria-label={qrcodeLabel('qrcode.scanned', 'QR code scanned')}>
            <svg
              data-part="status-icon"
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

  const containerInlineStyle: React.CSSProperties = {
    ...style,
  };

  return (
    <div
      className={`rottay-qrcode rottay-qrcode--modern ${className}`}
      style={containerInlineStyle}
      data-part="root"
      data-status={status}
      data-bordered={bordered ? 'true' : undefined}
    >
      <div ref={paintOwnerRef} data-part="canvas-wrapper" style={{ width: size, height: size }}>
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
            data-part="icon"
            // width/height ride the `iconSize` prop (runtime arithmetic, stays
            // JS-bound); the padding is owned by the skin (K4-C single owner).
            style={{ width: iconSize, height: iconSize }}
          >
            <img
              src={icon}
              alt=""
            />
          </div>
        )}
        {renderOverlay()}
      </div>
    </div>
  );
}

ModernQRCode.displayName = 'ModernQRCode';
