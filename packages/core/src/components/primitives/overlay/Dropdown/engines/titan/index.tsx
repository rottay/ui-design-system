'use client';

/**
 * @fileoverview Dropdown Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Dropdown component.
 * Wraps Ant Design's Dropdown component with full feature parity.
 *
 * @remarks
 * The Titan engine provides:
 * - Direct passthrough to Ant Design Dropdown
 * - Full Ant Design menu styling and theming
 * - Native trigger handling (click, hover, contextMenu)
 * - All Ant Design placement and arrow options
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Dropdown, Button } from '@rottay/design-system';
 *
 * <Dropdown
 *   engine="titan"
 *   trigger={['click']}
 *   menu={{ items: [{ key: '1', label: 'Option' }] }}
 * >
 *   <Button>Ant Design Dropdown</Button>
 * </Dropdown>
 * ```
 *
 * @see {@link Dropdown} - The main engine-aware component
 * @module Dropdown/Engines/Titan
 * @category Overlay
 * @package @rottay/design-system
 */
import React from 'react';
import { Dropdown as AntDropdown } from 'antd';
import type { DropdownProps } from '../../types';

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (props, ref) => {
    const {
      menu,
      trigger,
      placement,
      open,
      onOpenChange,
      disabled,
      children,
      arrow,
      autoAdjustOverflow,
      getPopupContainer,
      className,
      overlayClassName,
      overlayStyle,
    } = props;


    return (
      <div ref={ref} className={className}>
        <AntDropdown
          menu={menu as any}
          trigger={Array.isArray(trigger) ? trigger : trigger ? [trigger] : undefined}
          placement={placement}
          open={open}
          onOpenChange={onOpenChange}
          disabled={disabled}
          arrow={arrow}
          autoAdjustOverflow={autoAdjustOverflow}
          getPopupContainer={getPopupContainer}
          overlayClassName={overlayClassName}
          overlayStyle={overlayStyle}
        >
          {children}
        </AntDropdown>
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown.Titan';

export default Dropdown;
