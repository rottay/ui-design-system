/**
 * QRCode Component Exports
 */

export { QRCode } from './QRCode';

export type {
  QRCodeErrorLevel,
  QRCodeStatus,
  QRCodeType,
  QRCodeProps,
} from './types';

export {
  generateQRMatrix,
  generateQRSvgPath,
  getStatusOverlayProps,
} from './types';

// Engine exports for direct usage
export { default as TitanQRCode } from './engines/titan';
export { default as HermesQRCode } from './engines/hermes';
export { default as ApolloQRCode } from './engines/apollo';
export { default as AthenaQRCode } from './engines/athena';
