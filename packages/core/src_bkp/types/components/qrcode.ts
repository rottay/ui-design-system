/**
 * QRCode Component Types
 *
 * Unified type definitions for the QRCode component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * QRCode Error Level
 * L = ~7%, M = ~15%, Q = ~25%, H = ~30% error correction
 */
export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * QRCode Status
 */
export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned';

/**
 * QRCode Type
 */
export type QRCodeType = 'canvas' | 'svg';

/**
 * QRCode Props
 */
export interface QRCodeProps {
  /** The data/content to encode in the QR code */
  value: string;

  /** QR code size in pixels */
  size?: number;

  /** Icon displayed in the center of QR code */
  icon?: string;

  /** Size of the center icon */
  iconSize?: number;

  /** QR code foreground color */
  color?: string;

  /** QR code background color */
  bgColor?: string;

  /** Whether to show border */
  bordered?: boolean;

  /** Error correction level */
  errorLevel?: QRCodeErrorLevel;

  /** QR code status */
  status?: QRCodeStatus;

  /** Callback when expired QR is clicked */
  onRefresh?: () => void;

  /** Render type */
  type?: QRCodeType;

  /** Additional class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simple QR code matrix generator
 * Note: This is a simplified version. For production, use a proper QR library.
 * This generates a basic pattern for visual purposes.
 */
export function generateQRMatrix(
  data: string,
  errorLevel: QRCodeErrorLevel = 'M'
): boolean[][] {
  // Simple hash-based matrix generation for demo purposes
  // In production, use a proper QR code library like 'qrcode'
  const size = Math.max(21, Math.min(41, 21 + Math.floor(data.length / 10) * 4));
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // Add finder patterns (the three big squares in corners)
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, size - 7, 0);
  addFinderPattern(matrix, 0, size - 7);

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Fill data area with hash-based pattern
  let hash = simpleHash(data + errorLevel);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!isReservedArea(row, col, size)) {
        hash = (hash * 1103515245 + 12345) & 0x7fffffff;
        matrix[row][col] = (hash % 3) === 0;
      }
    }
  }

  return matrix;
}

function addFinderPattern(matrix: boolean[][], row: number, col: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
      const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[row + r][col + c] = isOuter || isInner;
    }
  }
}

function isReservedArea(row: number, col: number, size: number): boolean {
  // Finder patterns + separators
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= size - 8) return true;
  if (row >= size - 8 && col < 9) return true;
  // Timing patterns
  if (row === 6 || col === 6) return true;
  return false;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Generate SVG path for QR code
 */
export function generateQRSvgPath(matrix: boolean[][], moduleSize: number = 1): string {
  const paths: string[] = [];

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        const x = col * moduleSize;
        const y = row * moduleSize;
        paths.push(`M${x},${y}h${moduleSize}v${moduleSize}h-${moduleSize}Z`);
      }
    }
  }

  return paths.join(' ');
}

/**
 * Get status overlay content
 */
export function getStatusOverlayProps(status?: QRCodeStatus): {
  showOverlay: boolean;
  icon: ReactNode;
  text: string;
} {
  switch (status) {
    case 'loading':
      return {
        showOverlay: true,
        icon: null, // Spinner
        text: 'Loading...',
      };
    case 'expired':
      return {
        showOverlay: true,
        icon: null, // Refresh icon
        text: 'QR code expired',
      };
    case 'scanned':
      return {
        showOverlay: true,
        icon: null, // Check icon
        text: 'Scanned',
      };
    default:
      return {
        showOverlay: false,
        icon: null,
        text: '',
      };
  }
}
