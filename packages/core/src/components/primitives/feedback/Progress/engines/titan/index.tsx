/**
 * Progress - Titan Engine (Ant Design)
 */

import React from 'react';
import { Progress as AntProgress } from 'antd';
import type { ProgressProps } from '../types';
import { PROGRESS_DEFAULTS } from '../types';

export default function TitanProgress(props: ProgressProps): React.ReactElement {
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

  return (
    <AntProgress
      percent={percent}
      type={type}
      status={status === 'error' ? 'exception' : status === 'success' ? 'success' : undefined}
      showInfo={showInfo}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
    />
  );
}
