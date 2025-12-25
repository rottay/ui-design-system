/**
 * Titan Progress Engine
 *
 * Adapter that converts unified ProgressProps to Ant Design Progress.
 */

'use client';

import { Progress as AntProgress } from 'antd';
import type { ProgressProps } from '../../../../types/components/progress';
import { isGradientColor } from '../../../../types/components/progress';

/**
 * Titan Progress - Ant Design implementation with unified ProgressProps
 */
function TitanProgress({
  percent,
  type = 'line',
  status,
  showInfo = true,
  strokeColor,
  trailColor,
  strokeWidth,
  size,
  format,
  children,
  className,
  style,
}: ProgressProps) {
  // Convert gradient object to AntD format
  const antStrokeColor = strokeColor
    ? isGradientColor(strokeColor)
      ? {
          from: strokeColor.from,
          to: strokeColor.to,
          direction: strokeColor.direction,
        }
      : strokeColor
    : undefined;

  // AntD uses 'default' size differently, map to undefined
  const antSize = size === 'default' ? undefined : size;

  return (
    <AntProgress
      percent={percent}
      type={type}
      status={status}
      showInfo={showInfo}
      strokeColor={antStrokeColor}
      trailColor={trailColor}
      strokeWidth={strokeWidth}
      size={antSize}
      format={format}
      className={className}
      style={style}
    >
      {children}
    </AntProgress>
  );
}

TitanProgress.displayName = 'TitanProgress';

export default TitanProgress;
