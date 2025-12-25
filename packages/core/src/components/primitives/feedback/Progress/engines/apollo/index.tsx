/**
 * Progress - Apollo Engine (Pure HTML/CSS)
 */

import React from 'react';
import type { ProgressProps } from '../types';
import { PROGRESS_DEFAULTS } from '../types';

const STATUS_COLORS = {
  normal: '#1890ff',
  success: '#52c41a',
  error: '#ff4d4f',
  active: '#1890ff',
};

export default function ApolloProgress(props: ProgressProps): React.ReactElement {
  const {
    percent,
    type = PROGRESS_DEFAULTS.type,
    status = PROGRESS_DEFAULTS.status,
    showInfo = PROGRESS_DEFAULTS.showInfo,
    strokeColor,
    strokeWidth = PROGRESS_DEFAULTS.strokeWidth,
    className,
    style,
  } = props;

  const color = strokeColor || STATUS_COLORS[status!];
  const clampedPercent = Math.min(100, Math.max(0, percent));

  if (type === 'circle') {
    const size = 120;
    const center = size / 2;
    const radius = (size - strokeWidth!) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedPercent / 100) * circumference;

    const containerStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: size,
      height: size,
      ...style,
    };

    return (
      <div className={className} style={containerStyle}>
        <svg width={size} height={size}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        {showInfo && (
          <div
            style={{
              position: 'absolute',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: color,
            }}
          >
            {clampedPercent}%
          </div>
        )}
      </div>
    );
  }

  // Line progress
  const containerStyle: React.CSSProperties = {
    width: '100%',
    ...style,
  };

  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: strokeWidth,
    backgroundColor: '#f0f0f0',
    borderRadius: strokeWidth! / 2,
    overflow: 'hidden',
    position: 'relative',
  };

  const barStyle: React.CSSProperties = {
    height: '100%',
    width: `${clampedPercent}%`,
    backgroundColor: color,
    borderRadius: strokeWidth! / 2,
    transition: 'width 0.3s ease',
    ...(status === 'active' ? {
      backgroundImage: `linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      )`,
      backgroundSize: '1rem 1rem',
      animation: 'apollo-progress-active 1s linear infinite',
    } : {}),
  };

  return (
    <div className={className} style={containerStyle}>
      {status === 'active' && (
        <style>{`
          @keyframes apollo-progress-active {
            0% { background-position: 0 0; }
            100% { background-position: 1rem 0; }
          }
        `}</style>
      )}
      <div style={trackStyle}>
        <div style={barStyle} />
      </div>
      {showInfo && (
        <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', textAlign: 'right' }}>
          {clampedPercent}%
        </div>
      )}
    </div>
  );
}
