/**
 * @fileoverview Rustic (pure HTML/CSS/Canvas) engine for the QRCode display primitive.
 * Zero-dependency implementation with full ARIA roles/labels. Chrome is painted by
 * `tokens/css/engines/rustic/skin/qrcode.css`, keyed on the `data-part`/`data-status`/
 * `data-bordered` contract stamped below; the canvas bitmap and a caller's own
 * `style` stay in this file.
 *
 * @example
 * ```tsx
 * <QRCode engine="rustic" value="https://example.com" bordered />
 * ```
 */

'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { arrayValueAt } from '@/_internal/utils/collections';
import type { QRCodeProps } from '../QRCode.types';
import { QRCODE_DEFAULTS } from '../QRCode.types';

/**
 * Creates a deterministic boolean grid from a string hash, then stamps three
 * finder patterns in the corners to visually resemble a real QR code.
 * This is a visual placeholder -- real QR encoding requires a dedicated library.
 */
function generatePattern(value: string, gridSize: number): boolean[][] {
  // Build a simple hash from the input string (djb2-like)
  const pattern: boolean[][] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash = hash & hash;
  }

  // Fill the grid using the Knuth multiplicative hash for pseudo-random distribution
  for (let i = 0; i < gridSize; i++) {
    pattern[i] = [];
    for (let j = 0; j < gridSize; j++) {
      const seed = (hash + i * gridSize + j) * 2654435761;
      pattern[i][j] = (seed & 0xFF) > 127;
    }
  }

  // Stamp the three 7x7 finder patterns that make QR codes recognizable
  const addFinderPattern = (startX: number, startY: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isOuter = i === 0 || i === 6 || j === 0 || j === 6;
        const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        if (startX + i < gridSize && startY + j < gridSize) {
          pattern[startX + i][startY + j] = isOuter || isInner;
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, gridSize - 7);
  addFinderPattern(gridSize - 7, 0);

  return pattern;
}

/**
 * Rustic QRCode engine. Draws the pattern on a `<canvas>` with full ARIA
 * labelling, centers an optional icon, and overlays status indicators with
 * role="status" / role="alert" for accessibility.
 *
 * @param props - DS QRCodeProps (value, size, colors, status, icon, etc.).
 * @returns A container with canvas, icon, and status overlay.
 */
export default function RusticQRCode(props: QRCodeProps): React.ReactElement {
  const {
    value,
    size = QRCODE_DEFAULTS.size,
    color = QRCODE_DEFAULTS.color,
    bgColor = QRCODE_DEFAULTS.bgColor,
    status = QRCODE_DEFAULTS.status,
    bordered = QRCODE_DEFAULTS.bordered,
    icon,
    iconSize = QRCODE_DEFAULTS.iconSize,
    onRefresh,
    className,
    style,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 25x25 matches QR version 2 dimensions for a realistic appearance
  const gridSize = 25;
  const pattern = useMemo(() => generatePattern(value || '', gridSize), [value]);

  // Re-paint the canvas whenever value, size, or colors change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = size / gridSize;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Draw QR modules
    ctx.fillStyle = color;
    for (let i = 0; i < gridSize; i++) {
      const row = arrayValueAt(pattern, i);
      if (!row) continue;
      for (let j = 0; j < gridSize; j++) {
        if (arrayValueAt(row, j)) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [value, size, color, bgColor, pattern]);

  // bordered still owns the padding; its frame and fill are painted by qrcode.css,
  // which keys on the data-bordered stamp below
  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    ...(bordered && {
      padding: 'var(--ds-qrcode-padding, 12px)',
    }),
    ...style,
  };

  // Shared overlay base for loading/expired/scanned states
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  // Absolutely centered over the canvas so the icon stays readable
  const iconWrapperStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: iconSize,
    height: iconSize,
    padding: 4,
  };

  // Button styles
  const buttonStyle: React.CSSProperties = {
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'inherit',
  };

  // CSS-only spinner; the ring and the keyframe both live in qrcode.css
  const spinnerStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    animation: 'ds-qrcode-spin-rustic 1s linear infinite',
  };

  // Each status gets proper ARIA roles: 'status' for loading/scanned, 'alert' for expired
  const renderOverlay = () => {
    switch (status) {
      case 'loading':
        return (
          <div data-part="overlay" style={overlayStyle} role="status" aria-label="Loading QR code">
            <div data-part="spinner" style={spinnerStyle} />
          </div>
        );
      case 'expired':
        return (
          <div data-part="overlay" style={overlayStyle} role="alert">
            <p data-part="status-text" style={{ margin: 0, fontSize: 14 }}>QR Code expired</p>
            {onRefresh && (
              <button
                data-part="refresh-button"
                onClick={onRefresh}
                style={buttonStyle}
                type="button"
                aria-label="Refresh QR code"
              >
                Refresh
              </button>
            )}
          </div>
        );
      case 'scanned':
        return (
          <div data-part="overlay" style={overlayStyle} role="status" aria-label="QR code scanned">
            <svg data-part="status-icon" width={48} height={48} fill="var(--ds-qrcode-success-color, var(--ds-color-success-500, #52c41a))" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`rottay-qrcode rottay-qrcode--rustic ${className || ''}`}
      style={containerStyle}
      data-part="root"
      data-status={status}
      data-bordered={bordered ? 'true' : undefined}
    >
      <div style={{ position: 'relative', width: size, height: size }} data-part="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ display: 'block' }}
          aria-label={`QR code for: ${value}`}
          role="img"
          data-part="canvas"
        />
        {icon && status === 'active' && (
          <div data-part="icon" style={iconWrapperStyle}>
            <img
              src={icon}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
        {renderOverlay()}
      </div>
    </div>
  );
}

RusticQRCode.displayName = 'RusticQRCode';
