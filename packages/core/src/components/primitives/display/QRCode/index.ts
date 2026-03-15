'use client';

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
 * - **Multi-engine support**: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla)
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
 *   color="var(--ds-color-primary)"
 *   bgColor="var(--ds-color-neutral-100)"
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
 * // Classic engine (Ant Design - default)
 * <QRCode engine="classic" value={url} bordered />
 *
 * // Modern engine (DaisyUI/Tailwind)
 * <QRCode engine="modern" value={url} type="svg" />
 *
 * // Rustic engine (Pure HTML/CSS)
 * <QRCode engine="rustic" value={url} size={180} />
 * ```
 *
 * @see {@link QRCodeProps} for component props
 * @see {@link QRCodeErrorLevel} for error correction options
 * @see {@link QRCodeStatus} for status states
 * @module QRCode
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
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

/**
 * Create engine-aware QRCode component.
 *
 * The QRCode component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **classic**: Full-featured implementation using Ant Design (default)
 * - **modern**: Lightweight implementation using DaisyUI/Tailwind
 * - **rustic**: Headless implementation using vanilla HTML/CSS
 */
export const QRCode = createEngineComponent<QRCodeProps>('QRCode', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default QRCode;
