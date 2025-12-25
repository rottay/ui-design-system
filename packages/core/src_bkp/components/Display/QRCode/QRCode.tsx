'use client';

/**
 * QRCode Component
 *
 * Multi-engine QR code generator component.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import { createEngineComponent, lazyEngine } from '../../../engine';
import type { QRCodeProps } from './types';

// Default engine (titan) - loaded synchronously
import TitanQRCode from './engines/titan';

// Lazy-loaded engines
const HermesQRCode = lazyEngine(() => import('./engines/hermes'));
const ApolloQRCode = lazyEngine(() => import('./engines/apollo'));
const AthenaQRCode = lazyEngine(() => import('./engines/athena'));

/**
 * QRCode component with multi-engine support
 */
export const QRCode = createEngineComponent<QRCodeProps>({
  titan: TitanQRCode,
  hermes: HermesQRCode,
  apollo: ApolloQRCode,
  athena: AthenaQRCode,
});

QRCode.displayName = 'QRCode';
