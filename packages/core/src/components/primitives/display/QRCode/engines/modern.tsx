/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the QRCode display primitive.
 * Renders a QR-like visual on a `<canvas>` with DaisyUI-styled status overlays.
 * NOTE: Uses a simplified hash-based pattern, not real Reed-Solomon encoding.
 *
 * @example
 * ```tsx
 * <QRCode engine="modern" value="https://example.com" bordered />
 * ```
 */

'use client';

import React, { useEffect, useRef, useMemo } from 'react';
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
 * Modern QRCode engine. Draws the pattern on a `<canvas>`, centers an optional
 * icon, and overlays DaisyUI-styled loading/expired/scanned status indicators.
 *
 * @param props - DS QRCodeProps (value, size, colors, status, icon, etc.).
 * @returns A DaisyUI-styled container with canvas, icon, and status overlay.
 */
export default function ModernQRCode(props: QRCodeProps): React.ReactElement {
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
    className = '',
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
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = color;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (pattern[i][j]) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [value, size, color, bgColor, pattern]);

  // Each status state gets its own DaisyUI-themed overlay on top of the canvas
  const renderOverlay = () => {
    switch (status) {
      case 'loading':
        return (
          <div data-part="overlay" className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--ds-qrcode-loading-bg, color-mix(in srgb, var(--ds-surface-card) 80%, transparent))', opacity: 'var(--ds-qrcode-loading-opacity, 1)' }}>
            <span data-part="spinner" style={{ display: 'inline-block', width: 24, height: 24, border: '2.5px solid var(--ds-qrcode-border-color, var(--ds-color-border))', borderTopColor: 'var(--ds-color-primary)', borderRadius: '50%', animation: 'spin var(--ds-motion-glacial) linear infinite' }} />
          </div>
        );
      case 'expired':
        return (
          <div data-part="overlay" className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: 'var(--ds-qrcode-status-expired-overlay-bg, color-mix(in srgb, var(--ds-surface-card) 90%, transparent))', opacity: 'var(--ds-qrcode-status-expired-opacity, 1)' }}>
            <span data-part="status-text" className="text-sm" style={{ color: 'var(--ds-qrcode-status-expired-text-color, var(--ds-color-text-secondary))' }}>QR Code expired</span>
            {onRefresh && (
              <button
                data-part="refresh-button"
                style={{ background: 'var(--ds-qrcode-refresh-button-bg, transparent)', color: 'var(--ds-qrcode-refresh-button-color, var(--ds-color-primary))', height: 'var(--ds-qrcode-refresh-button-size, 32px)', padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-qrcode-refresh-button-radius, var(--ds-radius-md))', border: '1px solid var(--ds-color-primary)', cursor: 'pointer' }}
                onClick={onRefresh}
              >
                Refresh
              </button>
            )}
          </div>
        );
      case 'scanned':
        return (
          <div data-part="overlay" className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--ds-qrcode-status-scanned-overlay-bg, color-mix(in srgb, var(--ds-surface-card) 80%, transparent))', opacity: 'var(--ds-qrcode-status-scanned-opacity, 1)' }}>
            <svg
              data-part="status-icon"
              className="w-12 h-12"
              style={{ color: 'var(--ds-qrcode-status-scanned-icon-color, var(--ds-color-success))' }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
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

  const containerClasses = [
    'inline-block relative',
    bordered ? 'border p-3 rounded-lg' : '',
    className,
  ].filter(Boolean).join(' ');

  const containerInlineStyle: React.CSSProperties = {
    ...(bordered && {
      borderColor: 'var(--ds-qrcode-border-color, var(--ds-color-border))',
      borderWidth: 'var(--ds-qrcode-border-width, 1px)',
      borderRadius: 'var(--ds-qrcode-border-radius, var(--ds-radius-md))',
      background: 'var(--ds-qrcode-background-color, var(--ds-surface-card))',
    }),
    ...style,
  };

  return (
    <div
      className={`rottay-qrcode rottay-qrcode--modern ${containerClasses}`}
      style={containerInlineStyle}
      data-part="root"
      data-status={status}
      data-bordered={bordered ? 'true' : undefined}
    >
      <div className="relative" data-part="canvas-wrapper" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="block"
          data-part="canvas"
        />
        {icon && status === 'active' && (
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-1 rounded"
            data-part="icon"
            style={{ width: iconSize, height: iconSize, background: 'var(--ds-qrcode-icon-bg, var(--ds-surface-card))', padding: 'var(--ds-qrcode-icon-padding, 4px)', borderRadius: 'var(--ds-qrcode-icon-border-radius, var(--ds-radius-sm))' }}
          >
            <img
              src={icon}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {renderOverlay()}
      </div>
    </div>
  );
}

ModernQRCode.displayName = 'ModernQRCode';
