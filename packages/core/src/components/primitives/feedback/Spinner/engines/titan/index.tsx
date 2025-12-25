/**
 * Spinner - Titan Engine (Ant Design)
 */

import React from 'react';
import { Spin } from 'antd';
import type { SpinnerProps } from '../types';
import { SPINNER_DEFAULTS } from '../types';

export default function TitanSpinner(props: SpinnerProps): React.ReactElement {
  const {
    size = SPINNER_DEFAULTS.size,
    label,
    className,
    style,
  } = props;

  return (
    <div className={className} style={{ textAlign: 'center', ...style }}>
      <Spin size={size === 'xl' ? 'large' : size === 'sm' ? 'small' : 'default'} />
      {label && <div style={{ marginTop: '0.5rem' }}>{label}</div>}
    </div>
  );
}
