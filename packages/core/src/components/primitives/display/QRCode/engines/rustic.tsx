/**
 * QRCode - Rustic Engine (Pure HTML/CSS/Canvas)
 *
 * Minimal QR code implementation using vanilla HTML, CSS, and Canvas.
 * Provides maximum accessibility and zero dependencies.
 * Note: Uses a simplified pattern generator. For production use,
 * consider integrating a proper QR code library.
 */

'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import type { QRCodeProps } from '../QRCode.types';
import { QRCODE_DEFAULTS } from '../QRCode.types';

/**
 * Generates a visual pattern that resembles a QR code.
 * This is a placeholder - real QR encoding requires a proper library.
 */
function generatePattern(value: string, gridSize: number): boolean[][] {
  const pattern: boolean[][] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash = hash & hash;
  }

  for (let i = 0; i < gridSize; i++) {
    pattern[i] = [];
    for (let j = 0; j < gridSize; j++) {
      const seed = (hash + i * gridSize + j) * 2654435761;
      pattern[i][j] = (seed & 0xFF) > 127;
    }
  }

  // Add finder patterns (the three squares in corners)
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
 * Rustic QRCode component using pure HTML/CSS/Canvas.
 *
 * @example
 * ```tsx
 * <RusticQRCode value="https://example.com" />
 * ```
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
  const gridSize = 25;
  const pattern = useMemo(() => generatePattern(value || '', gridSize), [value]);

  // Draw QR code pattern on canvas
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
      for (let j = 0; j < gridSize; j++) {
        if (pattern[i][j]) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [value, size, color, bgColor, pattern]);

  // Container styles
  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    ...(bordered && {
      border: '1px solid var(--ds-qrcode-border-color, #d9d9d9)',
      padding: 'var(--ds-qrcode-padding, 12px)',
      borderRadius: 'var(--ds-qrcode-radius, 8px)',
      backgroundColor: 'var(--ds-qrcode-bg, #ffffff)',
    }),
    ...style,
  };

  // Overlay styles
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
    backgroundColor: 'var(--ds-qrcode-overlay-bg, rgba(255, 255, 255, 0.9))',
  };

  // Icon wrapper styles
  const iconWrapperStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: iconSize,
    height: iconSize,
    backgroundColor: 'var(--ds-qrcode-icon-bg, #fff)',
    padding: 4,
    borderRadius: 4,
  };

  // Button styles
  const buttonStyle: React.CSSProperties = {
    padding: '4px 12px',
    border: '1px solid var(--ds-qrcode-button-color, var(--ds-color-primary-500, #1890ff))',
    borderRadius: 4,
    background: 'transparent',
    color: 'var(--ds-qrcode-button-color, var(--ds-color-primary-500, #1890ff))',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'inherit',
  };

  // Spinner styles with animation
  const spinnerStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    border: '3px solid var(--ds-qrcode-spinner-track, #f3f3f3)',
    borderTop: '3px solid var(--ds-qrcode-spinner-color, var(--ds-color-primary-500, #1890ff))',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  /**
   * Renders the status overlay based on current status.
   */
  const renderOverlay = () => {
    switch (status) {
      case 'loading':
        return (
          <div style={overlayStyle} role="status" aria-label="Loading QR code">
            <div style={spinnerStyle} />
          </div>
        );
      case 'expired':
        return (
          <div style={overlayStyle} role="alert">
            <p style={{ margin: 0, color: 'var(--ds-qrcode-expired-color, #666)', fontSize: 14 }}>QR Code expired</p>
            {onRefresh && (
              <button
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
          <div style={overlayStyle} role="status" aria-label="QR code scanned">
            <svg width={48} height={48} fill="var(--ds-qrcode-success-color, var(--ds-color-success-500, #52c41a))" viewBox="0 0 20 20" aria-hidden="true">
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
      data-status={status}
    >
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ position: 'relative', width: size, height: size }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ display: 'block' }}
          aria-label={`QR code for: ${value}`}
          role="img"
        />
        {icon && status === 'active' && (
          <div style={iconWrapperStyle}>
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
