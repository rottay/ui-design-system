'use client';

/**
 * Apollo QRCode Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
 */

import { useMemo } from 'react';
import type { QRCodeProps } from '../types';
import { generateQRMatrix, generateQRSvgPath } from '../../../../types/components/qrcode';

/**
 * Apollo QRCode Component
 *
 * Pure Tailwind-styled QR code display.
 * Uses SVG rendering with a simplified QR generation algorithm.
 */
export default function ApolloQRCode(props: QRCodeProps) {
  const {
    value,
    size = 160,
    icon,
    iconSize = 40,
    color = '#000000',
    bgColor = '#ffffff',
    bordered = true,
    errorLevel = 'M',
    status = 'active',
    onRefresh,
    className = '',
    style,
  } = props;

  // Generate QR matrix and SVG path
  const { matrix, svgPath, moduleSize } = useMemo(() => {
    const mat = generateQRMatrix(value, errorLevel);
    const modSize = size / mat.length;
    const path = generateQRSvgPath(mat, modSize);
    return { matrix: mat, svgPath: path, moduleSize: modSize };
  }, [value, errorLevel, size]);

  // Status overlay
  const showOverlay = status !== 'active';

  return (
    <div
      className={`relative inline-block ${bordered ? 'border border-gray-200 rounded-lg p-2' : ''} ${className}`}
      style={{ backgroundColor: bgColor, ...style }}
    >
      {/* QR Code SVG */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={showOverlay ? 'blur-sm' : ''}
      >
        <rect width={size} height={size} fill={bgColor} />
        <path d={svgPath} fill={color} />
      </svg>

      {/* Center Icon */}
      {icon && status === 'active' && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-1 shadow-sm"
          style={{ width: iconSize, height: iconSize }}
        >
          <img
            src={icon}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Status Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded">
          {status === 'loading' && (
            <>
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm mt-2 text-gray-500">Loading...</span>
            </>
          )}
          {status === 'expired' && (
            <>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                onClick={onRefresh}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <span className="text-sm mt-2 text-gray-500">QR code expired</span>
            </>
          )}
          {status === 'scanned' && (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm mt-2 text-gray-500">Scanned</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
