/**
 * Titan Checkbox Engine
 *
 * Adapter that converts unified CheckboxProps to Ant Design Checkbox.
 * Since AntD Checkbox uses a different event type (CheckboxChangeEvent),
 * this adapter converts between the unified interface and AntD.
 */

'use client';

import { Checkbox as AntCheckbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { CheckboxProps } from '../../../../types/components/checkbox';

/**
 * Titan Checkbox - Ant Design implementation with unified CheckboxProps
 */
function TitanCheckbox({
  checked,
  defaultChecked,
  disabled,
  indeterminate,
  onChange,
  children,
  className,
  style,
  name,
  id,
  value,
  autoFocus,
}: CheckboxProps) {
  // Convert unified onChange to AntD onChange
  const handleChange = onChange
    ? (e: CheckboxChangeEvent) => {
        // Create a minimal synthetic event compatible with ChangeEvent<HTMLInputElement>
        const syntheticEvent = {
          target: {
            checked: e.target.checked,
            value: e.target.value,
            name: e.target.name,
            type: 'checkbox',
          },
          currentTarget: {
            checked: e.target.checked,
            value: e.target.value,
            name: e.target.name,
            type: 'checkbox',
          },
          nativeEvent: e.nativeEvent,
          preventDefault: () => e.preventDefault?.(),
          stopPropagation: () => e.stopPropagation?.(),
          persist: () => {},
          bubbles: true,
          cancelable: true,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: true,
          timeStamp: Date.now(),
          type: 'change',
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
        };
        // Cast to unknown first to satisfy TypeScript
        onChange(syntheticEvent as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    : undefined;

  return (
    <AntCheckbox
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      indeterminate={indeterminate}
      onChange={handleChange}
      className={className}
      style={style}
      name={name}
      id={id}
      value={value}
      autoFocus={autoFocus}
    >
      {children}
    </AntCheckbox>
  );
}

TitanCheckbox.displayName = 'TitanCheckbox';

export default TitanCheckbox;
