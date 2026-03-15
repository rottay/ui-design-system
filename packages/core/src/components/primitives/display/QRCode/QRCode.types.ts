/**
 * @fileoverview QRCode Types Re-exports - Rottay Design System
 * @description Barrel exports for QRCode type definitions from centralized types.
 *
 * @remarks
 * This module re-exports QRCode types from the centralized type system.
 * All type modifications should be made in the source file at:
 * `types/primitives/display/QRCode/index.ts`
 *
 * @see {@link QRCodeProps} for component props
 * @see {@link QRCodeStatus} for status states
 * @see {@link QRCodeErrorLevel} for error correction levels
 * @module QRCode/Types
 * @category Display
 * @package @rottay/design-system
 */

export type {
  QRCodeProps,
  QRCodeStatus,
  QRCodeErrorLevel,
  QRCodeType,
} from '../../../../core/types/primitives/display/QRCode';

export {
  QRCODE_DEFAULTS,
  SIZE_MAP,
} from '../../../../core/types/primitives/display/QRCode';
