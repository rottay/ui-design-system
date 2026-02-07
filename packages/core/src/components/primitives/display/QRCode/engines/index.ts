/**
 * @fileoverview QRCode Engine Exports - Rottay Design System
 * @description Barrel exports for all QRCode engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design QRCode with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla canvas/SVG rendering
 *
 * All engines implement:
 * - QR code generation from string values
 * - Canvas and SVG render types
 * - Error correction levels (L, M, Q, H)
 * - Center icon support
 * - Status states with visual feedback
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <QRCode engine="modern" value={url} errorLevel="H">
 *   QR content
 * </QRCode>
 * ```
 *
 * @see {@link QRCode} - Main component with engine switching
 * @module QRCode/Engines
 * @category Display
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
