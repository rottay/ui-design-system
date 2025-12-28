'use client';

/**
 * @fileoverview Switch Titan Engine - Rottay Design System
 * @description Ant Design implementation of the Switch component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Titan engine wraps Ant Design's Switch component, providing
 * enterprise-grade toggle functionality with built-in loading states
 * and rich customization options.
 *
 * **Ant Design Features Utilized:**
 * - AntSwitch component with all props
 * - Built-in loading spinner
 * - Size variants (small, default)
 * - checkedChildren/unCheckedChildren slots
 *
 * **Prop Mapping:**
 * - `size`: 'large' → 'default', 'default' → 'default', 'small' → 'small'
 * - All other props passed directly to AntSwitch
 *
 * **Note:**
 * Ant Design Switch doesn't have a 'large' size, so both 'large' and
 * 'default' map to Ant Design's 'default' size.
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Switch } from '@rottay/design-system';
 *
 * <Switch
 *   engine="titan"
 *   loading={isSaving}
 *   checkedChildren="Active"
 *   unCheckedChildren="Inactive"
 * />
 * ```
 *
 * @see {@link Switch} for the main component
 * @see {@link HermesSwitch} for DaisyUI implementation
 * @see {@link ApolloSwitch} for vanilla implementation
 * @module TitanSwitch
 * @category Inputs
 * @package @rottay/design-system
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
