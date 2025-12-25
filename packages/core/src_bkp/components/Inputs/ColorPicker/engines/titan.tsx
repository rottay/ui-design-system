/**
 * Titan ColorPicker Engine
 *
 * Adapter that converts unified ColorPickerProps to Ant Design ColorPicker.
 */

'use client';

import { ColorPicker as AntColorPicker } from 'antd';
import type { ColorPickerProps, ColorFormat } from '../../../../types/components/colorpicker';
import type { Color } from 'antd/es/color-picker';

/**
 * Convert AntD Color object to hex string
 */
function colorToString(color: Color | string | null): string | null {
  if (!color) return null;
  if (typeof color === 'string') return color;
  return color.toHexString();
}

/**
 * Titan ColorPicker - Ant Design implementation with unified ColorPickerProps
 */
function TitanColorPicker({
  value,
  defaultValue,
  disabled,
  format,
  showText,
  allowClear,
  disabledAlpha,
  size,
  trigger,
  placement,
  arrow,
  presets,
  open,
  popupClassName,
  getPopupContainer,
  onChange,
  onChangeComplete,
  onFormatChange,
  onOpenChange,
  onClear,
  className,
  style,
  panelRender,
  children,
}: ColorPickerProps) {
  // Handle onChange - convert AntD Color to string
  const handleChange = onChange
    ? (color: Color) => {
        onChange(colorToString(color));
      }
    : undefined;

  // Handle onChangeComplete
  const handleChangeComplete = onChangeComplete
    ? (color: Color) => {
        const colorStr = colorToString(color);
        if (colorStr) onChangeComplete(colorStr);
      }
    : undefined;

  // Handle onFormatChange
  const handleFormatChange = onFormatChange
    ? (newFormat: ColorFormat) => {
        onFormatChange(newFormat);
      }
    : undefined;

  // Handle onClear
  const handleClear = onClear
    ? () => {
        onClear();
        onChange?.(null);
      }
    : undefined;

  // Convert presets to AntD format
  const antPresets = presets?.map((preset) => ({
    label: preset.label,
    colors: preset.colors,
    defaultOpen: preset.defaultOpen,
  }));

  return (
    <AntColorPicker
      value={value ?? undefined}
      defaultValue={defaultValue ?? undefined}
      disabled={disabled}
      format={format}
      showText={showText}
      allowClear={allowClear}
      disabledAlpha={disabledAlpha}
      size={size}
      trigger={trigger}
      placement={placement}
      arrow={arrow}
      presets={antPresets}
      open={open}
      panelRender={panelRender}
      getPopupContainer={getPopupContainer}
      onChange={handleChange}
      onChangeComplete={handleChangeComplete}
      onFormatChange={handleFormatChange}
      onOpenChange={onOpenChange}
      onClear={handleClear}
      className={className}
      style={style}
      styles={popupClassName ? { popup: { className: popupClassName } } : undefined}
    >
      {children}
    </AntColorPicker>
  );
}

TitanColorPicker.displayName = 'TitanColorPicker';

export default TitanColorPicker;
