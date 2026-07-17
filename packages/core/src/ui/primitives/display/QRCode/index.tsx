'use client';

/**
 * @fileoverview QRCode - Scannable QR code generator with canvas/SVG output.
 * Supports error correction levels, center icons/logos, expiry status states,
 * and custom colors. No compound sub-components.
 *
 * @example
 * ```tsx
 * import { QRCode } from '@rottay/design-system';
 *
 * <QRCode value="https://example.com" icon="/logo.png" errorLevel="H" />
 *
 * <QRCode
 *   value={sessionCode}
 *   status={isExpired ? 'expired' : 'active'}
 *   onRefresh={() => generateNewCode()}
 * />
 * ```
 *
 * @module QRCode
 * @category Display
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { QRCodeProps } from './contracts';

export type {
  QRCodeProps,
  QRCodeStatus,
  QRCodeErrorLevel,
  QRCodeType,
} from './contracts';

export { QRCODE_DEFAULTS, SIZE_MAP } from './contracts';

/** Single engine-routed component with no compound sub-components. */
export const QRCode = createEngineComponent<QRCodeProps>('QRCode', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default QRCode;
