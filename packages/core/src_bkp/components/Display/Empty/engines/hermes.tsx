/**
 * Hermes Empty Engine
 *
 * Simple HTML empty state implementation with minimal styling.
 */

'use client';

import type { EmptyProps } from '../../../../types/components/empty';

// Simple empty icon using basic SVG
const DefaultEmptyIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ margin: '0 auto' }}
  >
    <circle cx="32" cy="32" r="30" stroke="#D1D5DB" strokeWidth="2" fill="none" />
    <path
      d="M22 28 L28 34 M28 28 L22 34 M36 28 L42 34 M42 28 L36 34"
      stroke="#D1D5DB"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M20 44 Q32 48 44 44"
      stroke="#D1D5DB"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/**
 * Hermes Empty - Simple HTML implementation
 */
function HermesEmpty({
  image,
  imageStyle,
  description = 'No Data',
  children,
  className = '',
  style,
}: EmptyProps) {
  return (
    <div
      className={`empty-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        textAlign: 'center',
        ...style,
      }}
    >
      {/* Image/Icon */}
      <div
        className="empty-image"
        style={{
          marginBottom: '16px',
          ...imageStyle,
        }}
      >
        {image ?? <DefaultEmptyIcon />}
      </div>

      {/* Description */}
      {description && (
        <div
          className="empty-description"
          style={{
            color: '#6B7280',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {description}
        </div>
      )}

      {/* Action buttons or custom content */}
      {children && (
        <div className="empty-actions" style={{ marginTop: '8px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

HermesEmpty.displayName = 'HermesEmpty';

export default HermesEmpty;
