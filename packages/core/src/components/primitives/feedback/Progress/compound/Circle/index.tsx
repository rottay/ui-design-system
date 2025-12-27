/**
 * Progress.Circle - Compound Component
 */

'use client';

import React, { forwardRef } from 'react';

export interface ProgressCircleProps {
  percent?: number;
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  trailColor?: string;
  showInfo?: boolean;
  format?: (percent: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(
  (props, ref) => {
    const {
      percent = 0,
      size = 120,
      strokeWidth = 8,
      strokeColor = 'var(--color-primary-500, #1890ff)',
      trailColor = 'var(--color-gray-200, #f0f0f0)',
      showInfo = true,
      format,
      className = '',
      style = {},
    } = props;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <div
        ref={ref}
        className={`rottay-progress-circle ${className}`}
        style={{ position: 'relative', width: size, height: size, ...style }}
      >
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trailColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        {showInfo && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: size * 0.2,
              fontWeight: 500,
            }}
          >
            {format ? format(percent) : `${percent}%`}
          </div>
        )}
      </div>
    );
  }
);

ProgressCircle.displayName = 'Progress.Circle';

export default ProgressCircle;
