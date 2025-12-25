/**
 * Progress - Hermes Engine (DaisyUI)
 */

import React from 'react';
import type { ProgressProps } from '../types';
import { PROGRESS_DEFAULTS } from '../types';

const STATUS_CLASSES = {
  normal: 'progress-primary',
  success: 'progress-success',
  error: 'progress-error',
  active: 'progress-primary',
};

export default function HermesProgress(props: ProgressProps): React.ReactElement {
  const {
    percent,
    type = PROGRESS_DEFAULTS.type,
    status = PROGRESS_DEFAULTS.status,
    showInfo = PROGRESS_DEFAULTS.showInfo,
    strokeColor,
    className = '',
    style,
  } = props;

  // DaisyUI only supports line progress, for circle we'll use radial-progress
  if (type === 'circle') {
    const circleStyle: React.CSSProperties = {
      ...style,
      ...(strokeColor ? { '--value': percent, '--size': '6rem', color: strokeColor } as React.CSSProperties : {}),
    };

    return (
      <div
        className={`radial-progress ${STATUS_CLASSES[status!]} ${className}`}
        style={circleStyle}
        role="progressbar"
      >
        {showInfo && `${percent}%`}
      </div>
    );
  }

  const progressStyle: React.CSSProperties = {
    ...style,
    ...(strokeColor ? { backgroundColor: strokeColor } as React.CSSProperties : {}),
  };

  return (
    <div className="w-full">
      <progress
        className={`progress ${STATUS_CLASSES[status!]} w-full ${className}`}
        value={percent}
        max="100"
        style={progressStyle}
      />
      {showInfo && (
        <div className="text-sm text-center mt-1">{percent}%</div>
      )}
    </div>
  );
}
