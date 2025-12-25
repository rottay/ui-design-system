/**
 * Titan Switch Engine
 *
 * Adapter that converts unified SwitchProps to Ant Design Switch.
 */

'use client';

import { Switch as AntSwitch } from 'antd';
import type { SwitchProps } from '../../../../types/components/switch';

/**
 * Titan Switch - Ant Design implementation with unified SwitchProps
 */
function TitanSwitch({
  checked,
  defaultChecked,
  disabled,
  onChange,
  className,
  style,
  id,
  size,
  loading,
  checkedChildren,
  unCheckedChildren,
  onClick,
  autoFocus,
  title,
}: SwitchProps) {
  // Map unified size to AntD size (AntD only has default and small)
  const antSize = size === 'large' ? undefined : size === 'small' ? 'small' : undefined;

  // Handle onChange - simplify to just checked value
  const handleChange = onChange
    ? (newChecked: boolean) => {
        onChange(newChecked);
      }
    : undefined;

  // Handle onClick - AntD accepts both mouse and keyboard events
  // We only call the unified onClick handler for mouse events
  const handleClick = onClick
    ? (newChecked: boolean, event: React.MouseEvent | React.KeyboardEvent) => {
        // Only forward mouse events to unified handler
        if ('button' in event) {
          onClick(newChecked, event as React.MouseEvent);
        }
      }
    : undefined;

  return (
    <AntSwitch
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={handleChange}
      className={className}
      style={style}
      id={id}
      size={antSize}
      loading={loading}
      checkedChildren={checkedChildren}
      unCheckedChildren={unCheckedChildren}
      onClick={handleClick}
      autoFocus={autoFocus}
      title={title}
    />
  );
}

TitanSwitch.displayName = 'TitanSwitch';

export default TitanSwitch;
