'use client';

/**
 * @fileoverview ColorPicker Classic Engine - Rottay Design System
 * @description Ant Design implementation of the ColorPicker component providing
 * full-featured color selection with gradient picker, format switching, and presets.
 *
 * @remarks
 * The Classic engine leverages Ant Design's ColorPicker for:
 * - **Full color panel**: Gradient picker with saturation/brightness
 * - **Alpha channel**: Native transparency slider support
 * - **Format switching**: Built-in HEX/RGB/HSB format switcher
 * - **Preset palettes**: Native preset group support
 * - **Accessibility**: Full keyboard navigation and ARIA support
 *
 * This is the most feature-complete engine for color selection.
 *
 * @example Basic usage
 * ```tsx
 * <ColorPicker engine="classic" defaultValue="#1677ff" showText />
 * ```
 *
 * @example With format switcher
 * ```tsx
 * <ColorPicker engine="classic" format="rgb" onFormatChange={setFormat} />
 * ```
 *
 * @see {@link ColorPicker} - Main component
 * @see {@link ColorPickerProps} - Component props
 * @module ColorPicker/Engines/Classic
 * @category Inputs
 * @package @rottay/design-system
 */
import React from 'react';
import { ColorPicker as AntColorPicker } from 'antd';
import type { ColorPickerProps } from '../ColorPicker.types';

/**
 * Classic engine ColorPicker -- wraps Ant Design's full-featured ColorPicker.
 *
 * Passes all DS props through to AntD with minimal transformation. Several
 * props are cast to `any` because the DS types use a simplified `Color`
 * interface while AntD's internal `Color` class carries additional methods.
 * The outer `<div>` receives the forwarded ref for measurement/portal anchoring.
 *
 * @param props - {@link ColorPickerProps} unified color picker props shared across engines.
 * @returns A ref-forwarding wrapper around `antd/ColorPicker`.
 */
export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      onChange,
      format,
      onFormatChange,
      presets,
      showText,
      size,
      disabled,
      allowClear,
      trigger,
      open,
      onOpenChange,
      disabledAlpha,
      placement,
      className,
      style,
      panelRender,
    } = props;

    return (
      // Outer div anchors the forwarded ref; AntD renders a Popover internally
      <div ref={ref} className={className} style={style}>
        {/*
         * Several casts to `any` are needed because AntD's Color type has
         * richer internals (metaColor, etc.) than the DS Color interface.
         * At runtime the values are fully compatible.
         */}
        <AntColorPicker
          value={value as any}
          defaultValue={defaultValue}
          onChange={onChange as any}
          format={format}
          onFormatChange={onFormatChange as any}
          presets={presets}
          showText={showText as any}
          size={size}
          disabled={disabled}
          allowClear={allowClear}
          trigger={trigger}
          open={open}
          onOpenChange={onOpenChange}
          disabledAlpha={disabledAlpha}
          placement={placement}
          panelRender={panelRender}
        />
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker.Classic';

export default ColorPicker;
