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
import type { QRCodeErrorLevel, QRCodeProps } from '../../contracts';
import { QRCODE_DEFAULTS } from '../../contracts';
import { EncodedQRCodeSymbol } from '../../runtime/encoded-symbol';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';

/** Codeword recovery capacity per error-correction level (ISO/IEC 18004). */
const RECOVERY_BUDGET: Record<QRCodeErrorLevel, number> = {
  L: 0.07,
  M: 0.15,
  Q: 0.25,
  H: 0.3,
};

/**
 * The icon excavates center modules, so the symbol stays decodable only while
 * the lost AREA fits the level's recovery budget -- hence the square root.
 */
function clampIconSize(iconSize: number, size: number, errorLevel: QRCodeErrorLevel): number {
  if (!Number.isFinite(iconSize) || iconSize <= 0) return 0;
  const budget = RECOVERY_BUDGET[errorLevel] ?? RECOVERY_BUDGET.M;
  return Math.min(iconSize, Math.floor(size * Math.sqrt(budget)));
}

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
    engine: _engine,
    'data-part': dataPart,
    // Caller passthrough (id / aria-* / data-* / data-testid): spreads BEFORE
    // the engine's own stamps so the skin contract always lands last.
    ...rest
  } = props;

  const paintOwnerRef = useRef<HTMLDivElement>(null);
  const safeIconSize = clampIconSize(iconSize, size, errorLevel);

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
            {/* The governed status.success role replaces the local ad-hoc
                check-circle SVG (2xl = 3rem = --ds-qrcode-status-icon-size,
                currentColor so the skin's success channel keeps painting it);
                the overlay's role=status label carries the accessible name. */}
            <StatusSuccessIcon data-part="status-icon" decorative size="2xl" />
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
      {...rest}
      className={`rottay-qrcode rottay-qrcode--modern ${className}`}
      style={containerInlineStyle}
      data-part={dataPart ?? 'root'}
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
          iconSize={safeIconSize}
        />
        {icon && status === 'active' && safeIconSize > 0 && (
          <div
            data-part="icon"
            // width/height ride the clamped `iconSize` (runtime arithmetic,
            // stays JS-bound) so the DS chrome tracks the excavated area
            // exactly; the padding is owned by the skin (K4-C single owner).
            style={{ width: safeIconSize, height: safeIconSize }}
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
