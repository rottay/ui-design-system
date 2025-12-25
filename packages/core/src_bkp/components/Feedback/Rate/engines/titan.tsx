/**
 * Titan Rate Engine
 *
 * Adapter that converts unified RateProps to Ant Design Rate.
 * AntD Rate is feature-complete and supports all unified props.
 */

'use client';

import { Rate as AntRate } from 'antd';
import type { RateProps } from '../../../../types/components/rate';

/**
 * Titan Rate - Ant Design implementation with unified RateProps
 */
function TitanRate({
  value,
  defaultValue,
  onChange,
  count = 5,
  disabled = false,
  allowHalf = false,
  allowClear = true,
  character,
  tooltips,
  onHoverChange,
  autoFocus,
  tabIndex,
  id,
  className,
  style,
}: RateProps) {
  return (
    <AntRate
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      count={count}
      disabled={disabled}
      allowHalf={allowHalf}
      allowClear={allowClear}
      character={character}
      tooltips={tooltips}
      onHoverChange={onHoverChange}
      autoFocus={autoFocus}
      tabIndex={tabIndex}
      id={id}
      className={className}
      style={style}
    />
  );
}

TitanRate.displayName = 'TitanRate';

export default TitanRate;
