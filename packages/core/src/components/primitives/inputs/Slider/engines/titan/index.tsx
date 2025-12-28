'use client';

/**
 * @fileoverview Slider Titan Engine - Rottay Design System
 * @description Ant Design implementation of the Slider component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Titan engine wraps Ant Design's Slider component, providing
 * enterprise-grade range selection with tooltips, marks, and full
 * keyboard accessibility.
 *
 * **Ant Design Features Utilized:**
 * - Full Slider component with all props
 * - Tooltip with custom formatter
 * - Marks with custom styling
 * - Range mode (dual handles)
 * - Vertical and reverse orientations
 * - Dots at step intervals
 * - Custom styles via styles prop
 *
 * **Prop Mapping:**
 * - `trackStyle`/`railStyle`/`handleStyle` → `styles` object
 * - All other props passed directly
 *
 * @example Using Titan Engine
 * ```tsx
 * <Slider
 *   engine="titan"
 *   range
 *   marks={{ 0: '0°C', 100: '100°C' }}
 *   tooltip={{ formatter: (v) => `${v}°C` }}
 * />
 * ```
 *
 * @see {@link Slider} for the main component
 * @see {@link HermesSlider} for DaisyUI implementation
 * @see {@link ApolloSlider} for vanilla implementation
 * @module TitanSlider
 * @category Inputs
 * @package @rottay/design-system
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
