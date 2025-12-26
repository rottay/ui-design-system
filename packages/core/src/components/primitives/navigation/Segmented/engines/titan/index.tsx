'use client';

/**
 * Segmented - Titan Engine (Ant Design)
 */
import React from 'react';
import { Segmented as AntSegmented } from 'antd';
import type { SegmentedProps } from '../../types';
import { SEGMENTED_DEFAULTS } from '../../types';

export const Segmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
  (props, ref) => {
    const {
      options,
      value,
      defaultValue,
      onChange,
      block = SEGMENTED_DEFAULTS.block,
      disabled = SEGMENTED_DEFAULTS.disabled,
      size = SEGMENTED_DEFAULTS.size,
      className,
      style,
    } = props;

    return (
      <div ref={ref} className={className} style={style}>
        <AntSegmented
          options={options}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          block={block}
          disabled={disabled}
          size={size}
        />
      </div>
    );
  }
);

Segmented.displayName = 'Segmented.Titan';

export default Segmented;
