import type { BaseComponentProps, BorderedProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * QR Code status states.
 * - active: QR code is active and can be scanned
 * - expired: QR code has expired and needs refresh
 * - loading: QR code is being generated
 * - scanned: QR code has been successfully scanned
 */
export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned';

/**
 * QR Code error correction levels.
 * Higher levels can recover more data but reduce capacity.
 * - L: ~7% error correction
 * - M: ~15% error correction (recommended)
 * - Q: ~25% error correction
 * - H: ~30% error correction
 */
export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * QR Code render type.
 * - canvas: Renders using HTML canvas (better performance)
 * - svg: Renders using SVG (better scalability)
 */
export type QRCodeType = 'canvas' | 'svg';

/**
 * QRCode component props.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <QRCode value="https://example.com" />
 *
 * // With icon
 * <QRCode value="https://example.com" icon="/logo.png" />
 *
 * // With status
 * <QRCode value="https://example.com" status="expired" onRefresh={handleRefresh} />
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
