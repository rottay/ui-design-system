/**
 * Spinner - Apollo Engine (Pure HTML/CSS)
 */

import React from 'react';
import type { SpinnerProps } from '../../types';
import { SPINNER_DEFAULTS, SIZE_MAP } from '../../types';

export default function ApolloSpinner(props: SpinnerProps): React.ReactElement {
  const {
    size = SPINNER_DEFAULTS.size,
    color = '#1890ff',
    label,
    className,
    style,
  } = props;

  const spinnerSize = SIZE_MAP[size!];

  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: 'var(--spinner-stroke-width, 2px) solid rgba(0, 0, 0, 0.1)',
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'apollo-spin 0.8s linear infinite',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      <style>{`
        @keyframes apollo-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle} />
      {label && <div style={{ fontSize: '0.875rem' }}>{label}</div>}
    </div>
  );
}
