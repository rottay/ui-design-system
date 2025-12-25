/**
 * Spinner - Hermes Engine (DaisyUI)
 */

import React from 'react';
import type { SpinnerProps } from '../types';
import { SPINNER_DEFAULTS } from '../types';

const SIZE_CLASSES = {
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
  xl: 'loading-lg', // DaisyUI doesn't have xl, use lg
};

export default function HermesSpinner(props: SpinnerProps): React.ReactElement {
  const {
    size = SPINNER_DEFAULTS.size,
    label,
    className = '',
    style,
  } = props;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`} style={style}>
      <span className={`loading loading-spinner ${SIZE_CLASSES[size!]}`}></span>
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
