/**
 * @fileoverview QRCode Component - Rottay Design System
 * @description A QR code generation component that encodes text, URLs, or data
 * into a scannable QR code format with canvas or SVG rendering options.
 *
 * @remarks
 * The QRCode component generates scannable QR codes for various use cases:
 * - **URL sharing**: Website links, app download links
 * - **Payment codes**: Digital payment and transaction codes
 * - **Authentication**: Two-factor auth setup, login verification
 * - **Data transfer**: Contact info (vCard), WiFi credentials
 * - **Product tracking**: Inventory, shipping, and tracking codes
 *
 * Key features:
 * - **Multi-engine support**: Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
 * - **Render types**: Canvas (performance) or SVG (scalability)
 * - **Error correction**: Four levels (L, M, Q, H) for damage tolerance
 * - **Center icons**: Logo or branding in the QR code center
 * - **Status states**: Active, expired, loading, scanned with UI feedback
 * - **Customization**: Colors, sizes, borders, and styling
 *
 * @example Basic URL encoding
 * ```tsx
 * import { QRCode } from '@rottay/design-system';
 *
 * <QRCode value="https://example.com" />
 * ```
 *
 * @example Custom size and colors
 * ```tsx
 * <QRCode
 *   value="https://example.com"
 *   size={200}
 *   color="#1890ff"
 *   bgColor="#f0f0f0"
 * />
 * ```
 *
 * @example With center icon (use high error level)
 * ```tsx
 * <QRCode
 *   value="https://example.com"
 *   icon="/logo.png"
 *   iconSize={48}
 *   errorLevel="H"
 * />
 * ```
 *
 * @example Status handling with refresh
 * ```tsx
 * <QRCode
 *   value={sessionCode}
 *   status={isExpired ? 'expired' : 'active'}
 *   onRefresh={() => generateNewCode()}
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Titan engine (Ant Design - default)
 * <QRCode engine="titan" value={url} bordered />
 *
 * // Hermes engine (DaisyUI/Tailwind)
 * <QRCode engine="hermes" value={url} type="svg" />
 *
 * // Apollo engine (Pure HTML/CSS)
 * <QRCode engine="apollo" value={url} size={180} />
 * ```
 *
 * @see {@link QRCodeProps} for component props
 * @see {@link QRCodeErrorLevel} for error correction options
 * @see {@link QRCodeStatus} for status states
 * @module QRCode
 * @category Display
 * @package @rottay/design-system
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

/**
 * Create engine-aware QRCode component.
 *
 * The QRCode component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **titan**: Full-featured implementation using Ant Design (default)
 * - **hermes**: Lightweight implementation using DaisyUI/Tailwind
 * - **apollo**: Headless implementation using vanilla HTML/CSS
 */
export const QRCode = createEngineComponent<QRCodeProps>('QRCode', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default QRCode;
