'use client';

/**
 * Switch - Titan Engine (Ant Design)
 */
import React from 'react';
import { Switch as AntSwitch } from 'antd';
import type { SwitchProps } from '../../types';

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (props, ref) => {
    const {
      checked,
      defaultChecked,
      disabled,
      loading,
      size,
      checkedChildren,
      unCheckedChildren,
      onChange,
      onClick,
      className,
      style,
      autoFocus,
      tabIndex,
      id,
      name: _name,
    } = props;

    // Map size to Ant Design size
    const antSize = size === 'large' ? 'default' : size === 'default' ? 'default' : 'small';

    const switchProps = {
      ref,
      checked,
      defaultChecked,
      disabled,
      loading,
      size: antSize,
      checkedChildren,
      unCheckedChildren,
      onChange,
      onClick,
      className,
      style,
      autoFocus,
      tabIndex,
      id,
    };

    return <AntSwitch {...switchProps as any} />;
  }
);

Switch.displayName = 'Switch.Titan';

export default Switch;
