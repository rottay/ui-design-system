'use client';

/**
 * @fileoverview Dropdown Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Dropdown component.
 * Wraps Ant Design's Dropdown component with full feature parity.
 *
 * @remarks
 * The Classic engine provides:
 * - Direct passthrough to Ant Design Dropdown
 * - Full Ant Design menu styling and theming
 * - Native trigger handling (click, hover, contextMenu)
 * - All Ant Design placement and arrow options
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Dropdown, Button } from '@rottay/design-system';
 *
 * <Dropdown
 *   engine="classic"
 *   trigger={['click']}
 *   menu={{ items: [{ key: '1', label: 'Option' }] }}
 * >
 *   <Button>Ant Design Dropdown</Button>
 * </Dropdown>
 * ```
 *
 * @see {@link Dropdown} - The main engine-aware component
 * @module Dropdown/Engines/Classic
 * @category Overlay
 * @package @rottay/design-system
 */
import React from 'react';
import { Dropdown as AntDropdown } from 'antd';
import type { DropdownProps } from '../Dropdown.types';

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


    // Default to document.body to avoid clipping inside overflow containers (tables, cards, etc.)
    const defaultGetPopupContainer = () => document.body;

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
          getPopupContainer={getPopupContainer || defaultGetPopupContainer}
          overlayClassName={overlayClassName}
          overlayStyle={overlayStyle}
        >
          {children}
        </AntDropdown>
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown.Classic';

export default Dropdown;
