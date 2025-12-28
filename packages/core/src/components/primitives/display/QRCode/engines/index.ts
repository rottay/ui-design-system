/**
 * @fileoverview QRCode Engine Exports - Rottay Design System
 * @description Barrel exports for all QRCode engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design QRCode with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla canvas/SVG rendering
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
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <QRCode engine="hermes" value={url} errorLevel="H">
 *   QR content
 * </QRCode>
 * ```
 *
 * @see {@link QRCode} - Main component with engine switching
 * @module QRCode/Engines
 * @category Display
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
