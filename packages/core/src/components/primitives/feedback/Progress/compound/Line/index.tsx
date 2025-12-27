/**
 * Progress.Line - Compound Component
 */

'use client';

import React, { forwardRef } from 'react';

export interface ProgressLineProps {
  percent?: number;
  size?: 'sm' | 'md' | 'lg';
  strokeColor?: string;
  trailColor?: string;
  showInfo?: boolean;
  format?: (percent: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP = {
  sm: 4,
  md: 8,
  lg: 12,
};

export const ProgressLine = forwardRef<HTMLDivElement, ProgressLineProps>(
  (props, ref) => {
    const {
      percent = 0,
      size = 'md',
      strokeColor = 'var(--color-primary-500, #1890ff)',
      trailColor = 'var(--color-gray-200, #f0f0f0)',
      showInfo = true,
      format,
      className = '',
      style = {},
    } = props;

    const height = SIZE_MAP[size];

    return (
      <div
        ref={ref}
        className={`rottay-progress-line ${className}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}
      >
        <div
          style={{
            flex: 1,
            height,
            borderRadius: height / 2,
            backgroundColor: trailColor,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, Math.max(0, percent))}%`,
              height: '100%',
              borderRadius: height / 2,
              backgroundColor: strokeColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        {showInfo && (
          <span style={{ fontSize: '14px', minWidth: '40px', textAlign: 'right' }}>
            {format ? format(percent) : `${percent}%`}
          </span>
        )}
      </div>
    );
  }
);

ProgressLine.displayName = 'Progress.Line';

export default ProgressLine;
