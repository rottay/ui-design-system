/**
 * Titan Steps Engine
 *
 * Adapter that converts unified StepsProps to Ant Design Steps.
 */

'use client';

import { Steps as AntSteps } from 'antd';
import type { StepsProps } from '../../../../types/components/steps';

/**
 * Titan Steps - Ant Design implementation with unified StepsProps
 */
function TitanSteps({
  items,
  current,
  onChange,
  className,
  style,
  id,
  direction,
  type,
  size,
  status,
  percent,
  labelPlacement,
  responsive,
  progressDot,
  initial,
  'aria-label': ariaLabel,
}: StepsProps) {
  // Map unified type to AntD type
  // AntD supports: 'default' | 'navigation' | 'inline'
  const antType = type ?? 'default';

  return (
    <AntSteps
      items={items}
      current={current}
      initial={initial}
      onChange={onChange}
      className={className}
      style={style}
      id={id}
      direction={direction}
      type={antType}
      size={size}
      status={status}
      percent={percent}
      labelPlacement={labelPlacement}
      responsive={responsive}
      progressDot={progressDot}
      aria-label={ariaLabel}
    />
  );
}

TitanSteps.displayName = 'TitanSteps';

export default TitanSteps;
