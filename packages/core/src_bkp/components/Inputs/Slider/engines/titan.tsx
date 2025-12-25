/**
 * Titan Slider Engine
 *
 * Adapter that converts unified SliderProps to Ant Design Slider.
 * Maps unified types to AntD types without using spread to avoid
 * incompatible props being passed through.
 */

'use client';

import { Slider as AntSlider } from 'antd';
import type { SliderProps } from '../../../../types/components/slider';

/**
 * Titan Slider - Ant Design implementation with unified SliderProps
 */
function TitanSlider({
  value,
  defaultValue,
  min,
  max,
  step,
  range,
  disabled,
  onChange,
  onChangeComplete,
  marks,
  dots,
  included,
  reverse,
  vertical,
  tooltip,
  className,
  style,
  id,
  name,
  autoFocus,
  tabIndex,
}: SliderProps) {
  return (
    <AntSlider
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      range={range}
      disabled={disabled}
      onChange={onChange}
      onChangeComplete={onChangeComplete}
      marks={marks}
      dots={dots}
      included={included}
      reverse={reverse}
      vertical={vertical}
      tooltip={tooltip}
      className={className}
      style={style}
      id={id}
      autoFocus={autoFocus}
      tabIndex={tabIndex}
      // Note: AntD Slider doesn't directly support 'name' attribute
      // It's included in the type for consistency across engines
    />
  );
}

TitanSlider.displayName = 'TitanSlider';

export default TitanSlider;
