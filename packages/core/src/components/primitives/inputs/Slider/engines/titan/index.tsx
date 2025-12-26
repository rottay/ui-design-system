'use client';

/**
 * Slider - Titan Engine (Ant Design)
 */
import React, { CSSProperties } from 'react';
import { Slider as AntSlider } from 'antd';
import type { SliderProps } from '../../types';

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      onChange,
      onChangeComplete,
      min,
      max,
      step,
      range,
      marks,
      included,
      disabled,
      vertical,
      reverse,
      tooltip,
      keyboard,
      dots,
      trackStyle,
      railStyle,
      handleStyle,
      className,
      style,
    } = props;

    const sliderProps = {
      value,
      defaultValue,
      onChange,
      onChangeComplete,
      min,
      max,
      step,
      range,
      marks,
      included,
      disabled,
      vertical,
      reverse,
      tooltip,
      keyboard,
      dots,
      styles: {
        track: trackStyle as CSSProperties,
        rail: railStyle,
        handle: handleStyle as CSSProperties,
      },
    };

    return (
      <div ref={ref} className={className} style={style}>
        <AntSlider {...sliderProps as any} />
      </div>
    );
  }
);

Slider.displayName = 'Slider.Titan';

export default Slider;
