/**
 * QRCode Component Types
 *
 * Re-exports from unified types for local use.
 */

export type {
  QRCodeErrorLevel,
  QRCodeStatus,
  QRCodeType,
  QRCodeProps,
} from '../../../types/components/qrcode';

export {
  generateQRMatrix,
  generateQRSvgPath,
  getStatusOverlayProps,
} from '../../../types/components/qrcode';
