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

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { QRCodeProps } from './QRCode.types';

export type {
  QRCodeProps,
  QRCodeStatus,
  QRCodeErrorLevel,
  QRCodeType,
} from './QRCode.types';

export { QRCODE_DEFAULTS, SIZE_MAP } from './QRCode.types';

/** Single engine-routed component with no compound sub-components. */
export const QRCode = createEngineComponent<QRCodeProps>('QRCode', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default QRCode;
