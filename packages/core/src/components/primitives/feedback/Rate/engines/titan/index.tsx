'use client';

/**
 * Rate - Titan Engine (Ant Design)
 */
import React from 'react';
import { Rate as AntRate } from 'antd';
import type { RateProps } from '../../types';
import { RATE_DEFAULTS } from '../../types';

export const Rate = React.forwardRef<HTMLUListElement, RateProps>(
  (props, ref) => {
    const {
      value,
      defaultValue = RATE_DEFAULTS.defaultValue,
      count = RATE_DEFAULTS.count,
      allowHalf = RATE_DEFAULTS.allowHalf,
      allowClear = RATE_DEFAULTS.allowClear,
      disabled = RATE_DEFAULTS.disabled,
      onChange,
      onHoverChange,
      character,
      className,
      style,
      tooltips,
      autoFocus,
      keyboard = RATE_DEFAULTS.keyboard,
    } = props;

    return (
      <AntRate
        ref={ref as any}
        value={value}
        defaultValue={defaultValue}
        count={count}
        allowHalf={allowHalf}
        allowClear={allowClear}
        disabled={disabled}
        onChange={onChange}
        onHoverChange={onHoverChange}
        character={character as any}
        className={className}
        style={style}
        tooltips={tooltips}
        autoFocus={autoFocus}
        keyboard={keyboard}
      />
    );
  }
);

Rate.displayName = 'Rate.Titan';

export default Rate;
