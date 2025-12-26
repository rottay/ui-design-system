/**
 * QRCode - Engine Router
 *
 * A QR code generation component that supports multiple rendering engines.
 * Encodes text, URLs, or other data into a scannable QR code format.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <QRCode value="https://example.com" />
 *
 * // With custom size and colors
 * <QRCode value="https://example.com" size={200} color="#1890ff" />
 *
 * // With center icon
 * <QRCode value="https://example.com" icon="/logo.png" errorLevel="H" />
 *
 * // With status handling
 * <QRCode value="https://example.com" status="expired" onRefresh={handleRefresh} />
 *
 * // Using specific engine
 * <QRCode engine="hermes" value="https://example.com" />
 * ```
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { QRCodeProps } from './types';

// Export types
export type {
  QRCodeProps,
  QRCodeStatus,
  QRCodeErrorLevel,
  QRCodeType,
} from './types';

export { QRCODE_DEFAULTS, SIZE_MAP } from './types';

// Export base component
export { BaseQRCode } from './base';

// Create engine-aware QRCode component
export const QRCode = createEngineComponent<QRCodeProps>('QRCode', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default QRCode;
