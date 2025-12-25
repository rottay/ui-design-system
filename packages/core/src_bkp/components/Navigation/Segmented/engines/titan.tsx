'use client';

/**
 * Titan Segmented Engine
 *
 * Ant Design implementation with unified SegmentedProps.
 */

import { Segmented as AntSegmented } from 'antd';
import type { SegmentedProps, SegmentedValue } from '../../../../types/components/segmented';

/**
 * Titan Segmented - Ant Design implementation
 */
function TitanSegmented<T extends SegmentedValue = SegmentedValue>({
  options,
  value,
  defaultValue,
  onChange,
  className,
  style,
  disabled,
  size = 'middle',
  block,
}: SegmentedProps<T>) {
  return (
    <AntSegmented
      options={options as any}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange as any}
      className={className}
      style={style}
      disabled={disabled}
      size={size}
      block={block}
    />
  );
}

TitanSegmented.displayName = 'TitanSegmented';

export default TitanSegmented;
