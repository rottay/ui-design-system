'use client';

/**
 * @fileoverview Slider Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Slider component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Slider component, providing
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
 * @example Using Classic Engine
 * ```tsx
 * <Slider
 *   engine="classic"
 *   range
 *   marks={{ 0: '0°C', 100: '100°C' }}
 *   tooltip={{ formatter: (v) => `${v}°C` }}
 * />
 * ```
 *
 * @see {@link Slider} for the main component
 * @see {@link ModernSlider} for DaisyUI implementation
 * @see {@link RusticSlider} for vanilla implementation
 * @module ClassicSlider
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { CSSProperties } from 'react';
import { Slider as AntSlider } from 'antd';
import type { SliderProps } from '../Slider.types';

/**
 * Classic engine Slider -- thin wrapper around Ant Design's Slider.
 *
 * Destructures DS-level style props (`trackStyle`, `railStyle`, `handleStyle`)
 * and remaps them into Ant Design's `styles` object, since AntD v5 deprecated
 * the top-level style props in favour of a single `styles` bag.
 *
 * A wrapping `<div>` is used so the forwarded ref attaches to a real DOM node
 * rather than the internal AntD component instance.
 *
 * @param props - {@link SliderProps} unified slider props shared across engines.
 * @returns A ref-forwarding wrapper around `antd/Slider`.
 */
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

    // Re-map DS-level style shortcuts into AntD v5's consolidated `styles` prop.
    // Cast to CSSProperties because the DS types allow broader style-like objects.
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
      // Outer div receives the forwarded ref and pass-through layout props
      <div ref={ref} className={className} style={style}>
        {/* Spread as `any` to avoid TS conflicts between DS and AntD generic overloads */}
        <AntSlider {...sliderProps as any} />
      </div>
    );
  }
);

Slider.displayName = 'Slider.Classic';

export default Slider;
