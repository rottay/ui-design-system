'use client';

/**
 * Rate - Titan Engine (Ant Design)
 * Wraps Ant Design Rate component with design system props
 * @module Rate/Engines/Titan
 */

import React from 'react';
import { Rate as AntRate } from 'antd';
import type { RateProps } from '../../types';
import { RATE_DEFAULTS, RATE_SIZE_MAP } from '../../types';

/**
 * Map design system sizes to Ant Design font sizes
 */
const getSizeStyle = (size: RateProps['size']): React.CSSProperties => {
  const sizeValue = RATE_SIZE_MAP[size || 'md'];
  return {
    fontSize: `${sizeValue}px`,
  };
};

/**
 * Titan Rate component using Ant Design
 */
export const Rate = React.forwardRef<HTMLUListElement, RateProps>(
  (props, ref) => {
    const {
      value,
      defaultValue = RATE_DEFAULTS.defaultValue,
      count = RATE_DEFAULTS.count,
      allowHalf = RATE_DEFAULTS.allowHalf,
      allowClear = RATE_DEFAULTS.allowClear,
      disabled = RATE_DEFAULTS.disabled,
      readOnly,
      onChange,
      onHoverChange,
      character,
      className = '',
      style,
      tooltips,
      autoFocus,
      keyboard = RATE_DEFAULTS.keyboard,
      size = RATE_DEFAULTS.size,
      activeColor,
      inactiveColor,
      direction,
      // Omit props not supported by Ant Design
      engine: _engine,
      // Omit HTML props that conflict with Ant Design Rate
      onFocus: _onFocus,
      onBlur: _onBlur,
      ...restProps
    } = props;

    // Omit more conflicting props - using void to avoid unused variable warnings
    void restProps;

    // Combine size styles with custom styles and colors
    const combinedStyle: React.CSSProperties = {
      ...getSizeStyle(size),
      ...(activeColor && { '--ant-rate-star-color': activeColor } as React.CSSProperties),
      ...style,
    };

    // Custom root class for styling
    const rootClassName = `rottay-rate rottay-rate--${size} ${disabled ? 'rottay-rate--disabled' : ''} ${readOnly ? 'rottay-rate--readonly' : ''} ${className}`.trim();

    return (
      <AntRate
        ref={ref as any}
        value={value}
        defaultValue={defaultValue}
        count={count}
        allowHalf={allowHalf}
        allowClear={allowClear}
        disabled={disabled || readOnly}
        onChange={onChange}
        onHoverChange={onHoverChange}
        character={character as any}
        className={rootClassName}
        style={combinedStyle}
        tooltips={tooltips}
        autoFocus={autoFocus}
        keyboard={keyboard}
        direction={direction}
      />
    );
  }
);

Rate.displayName = 'Rate.Titan';

export default Rate;
