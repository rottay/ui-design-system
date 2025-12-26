'use client';

/**
 * ColorPicker - Titan Engine (Ant Design)
 */
import React from 'react';
import { ColorPicker as AntColorPicker } from 'antd';
import type { ColorPickerProps } from '../../types';

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

ColorPicker.displayName = 'ColorPicker.Titan';

export default ColorPicker;
