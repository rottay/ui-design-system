'use client';

/**
 * @fileoverview Switch Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Switch component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Switch component, providing
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
 * @example Using Classic Engine
 * ```tsx
 * import { Switch } from '@rottay/design-system';
 *
 * <Switch
 *   engine="classic"
 *   loading={isSaving}
 *   checkedChildren="Active"
 *   unCheckedChildren="Inactive"
 * />
 * ```
 *
 * @see {@link Switch} for the main component
 * @see {@link ModernSwitch} for DaisyUI implementation
 * @see {@link RusticSwitch} for vanilla implementation
 * @module ClassicSwitch
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import { Switch as AntSwitch } from 'antd';
import type { SwitchProps } from '../../contracts';

/**
 * Classic engine Switch -- wraps Ant Design's Switch component.
 *
 * Maps the DS `size` prop (small | default | large) to AntD's two-value
 * size enum (small | default), since AntD does not support a "large" toggle.
 * All other props are forwarded directly.
 *
 * @param props - {@link SwitchProps} unified switch props shared across engines.
 * @returns A ref-forwarding wrapper around `antd/Switch`.
 */
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

    // AntD only has 'default' and 'small'; collapse 'large' into 'default'
    const antSize = size === 'large' ? 'default' : size === 'default' ? 'default' : 'small';

    // Assemble props for AntD -- `name` is intentionally excluded (_name)
    // because AntD Switch does not accept a `name` attribute
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

    // Cast to `any` to bridge DS-level generics with AntD's internal typings
    return <AntSwitch {...switchProps as any} />;
  }
);

Switch.displayName = 'Switch.Classic';

export default Switch;
