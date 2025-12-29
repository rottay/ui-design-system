/**
 * @fileoverview QRCode Component Types - Rottay Design System
 * @description Type definitions for the QRCode component including render types,
 * error correction levels, status states, and customization options.
 *
 * @remarks
 * The QRCode types provide comprehensive configuration for:
 * - Value encoding: Text, URLs, vCard, WiFi credentials
 * - Render options: Canvas (performance) vs SVG (scalability)
 * - Error correction: L (7%), M (15%), Q (25%), H (30%)
 * - Visual customization: Colors, sizes, borders, icons
 * - Status handling: Active, expired, loading, scanned states
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   QRCodeProps,
 *   QRCodeStatus,
 *   QRCodeErrorLevel,
 * } from '@rottay/design-system';
 *
 * const config: QRCodeProps = {
 *   value: 'https://example.com',
 *   size: 200,
 *   errorLevel: 'H',
 *   icon: '/logo.png',
 * };
 *
 * const status: QRCodeStatus = 'active';
 * const errorLevel: QRCodeErrorLevel = 'M';
 * ```
 *
 * @module QRCode/Types
 * @category Display
 * @package @rottay/design-system
 */

import type { BaseComponentProps, BorderedProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * QR Code status states for lifecycle management.
 *
 * @example
 * ```tsx
 * const [status, setStatus] = useState<QRCodeStatus>('active');
 *
 * // Handle expiration
 * useEffect(() => {
 *   const timer = setTimeout(() => setStatus('expired'), 60000);
 *   return () => clearTimeout(timer);
 * }, []);
 * ```
 */
export type QRCodeStatus =
  /** QR code is active and scannable */
  | 'active'
  /** QR code has expired and needs refresh */
  | 'expired'
  /** QR code is being generated */
  | 'loading'
  /** QR code has been successfully scanned */
  | 'scanned';

/**
 * QR Code error correction levels.
 *
 * Higher levels allow more damage/obstruction while remaining scannable,
 * but reduce the data capacity of the QR code.
 *
 * @remarks
 * - **L (Low)**: ~7% error correction, maximum data capacity
 * - **M (Medium)**: ~15% error correction, recommended for most uses
 * - **Q (Quartile)**: ~25% error correction, good for printed codes
 * - **H (High)**: ~30% error correction, required when using center icons
 *
 * @example
 * ```tsx
 * // Use H level when adding an icon
 * <QRCode value={url} icon="/logo.png" errorLevel="H" />
 *
 * // Use L for maximum data in the QR code
 * <QRCode value={longText} errorLevel="L" />
 * ```
 */
export type QRCodeErrorLevel =
  /** Low: ~7% error correction */
  | 'L'
  /** Medium: ~15% error correction (default) */
  | 'M'
  /** Quartile: ~25% error correction */
  | 'Q'
  /** High: ~30% error correction */
  | 'H';

/**
 * QR Code render type for output format.
 *
 * @remarks
 * - **canvas**: HTML5 Canvas rendering, better performance for dynamic codes
 * - **svg**: SVG rendering, better for printing and scaling
 *
 * @example
 * ```tsx
 * // Use canvas for interactive/dynamic codes
 * <QRCode value={dynamicUrl} type="canvas" />
 *
 * // Use SVG for print-ready codes
 * <QRCode value={url} type="svg" />
 * ```
 */
export type QRCodeType =
  /** HTML5 Canvas rendering */
  | 'canvas'
  /** SVG vector rendering */
  | 'svg';

/**
 * Props for the QRCode component.
 *
 * @example Basic usage
 * ```tsx
 * <QRCode value="https://example.com" />
 * ```
 *
 * @example With branding icon
 * ```tsx
 * <QRCode
 *   value="https://example.com"
 *   icon="/logo.png"
 *   iconSize={48}
 *   errorLevel="H"
 * />
 * ```
 *
 * @example With status and refresh
 * ```tsx
 * <QRCode
 *   value={sessionCode}
 *   status="expired"
 *   onRefresh={() => generateNewCode()}
 * />
 * ```
 *
 * @example Custom styling
 * ```tsx
 * <QRCode
 *   value={url}
 *   size={256}
 *   color="#1a1a1a"
 *   bgColor="#fafafa"
 *   bordered
 * />
 * ```
 */
export interface QRCodeProps extends BaseComponentProps, EngineAwareProps, BorderedProps {
  /**
   * The value to encode in the QR code.
   * Can be a URL, text, or any string data.
   */
  value: string;

  /**
   * Render type for the QR code.
   * @default 'canvas'
   */
  type?: QRCodeType;

  /**
   * URL of an icon/image to display in the center of the QR code.
   * The icon should be small enough not to interfere with scanning.
   */
  icon?: string;

  /**
   * Size of the QR code in pixels.
   * @default 160
   */
  size?: number;

  /**
   * Size of the center icon in pixels.
   * @default 40
   */
  iconSize?: number;

  /**
   * Foreground color of the QR code modules.
   * @default '#000000'
   */
  color?: string;

  /**
   * Background color of the QR code.
   * @default '#ffffff'
   */
  bgColor?: string;

  /**
   * Error correction level.
   * Higher levels allow more damage to the code while still being readable.
   * Use 'H' when adding an icon to ensure scannability.
   * @default 'M'
   */
  errorLevel?: QRCodeErrorLevel;

  /**
   * Current status of the QR code.
   * @default 'active'
   */
  status?: QRCodeStatus;

  /**
   * Callback fired when the refresh button is clicked (when status is 'expired').
   */
  onRefresh?: () => void;
}

/**
 * Default values for QRCode component props.
 */
export const QRCODE_DEFAULTS = {
  /** Default render type */
  type: 'canvas' as const,
  /** Default size in pixels */
  size: 160,
  /** Default icon size in pixels */
  iconSize: 40,
  /** Default foreground color */
  color: '#000000',
  /** Default background color */
  bgColor: '#ffffff',
  /** Default error correction level */
  errorLevel: 'M' as const,
  /** Default status */
  status: 'active' as const,
  /** Default bordered state */
  bordered: true,
} as const;

/**
 * Size mapping for preset QR code sizes using CSS variables.
 */
export const SIZE_MAP: Record<string, string> = {
  xs: 'var(--qrcode-xs-size)',
  sm: 'var(--qrcode-sm-size)',
  md: 'var(--qrcode-md-size)',
  lg: 'var(--qrcode-lg-size)',
  xl: 'var(--qrcode-xl-size)',
  '2xl': 'var(--qrcode-2xl-size)',
};
