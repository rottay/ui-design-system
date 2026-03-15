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
      <div ref={ref} className={className} style={style}>
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
