'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the Dropdown overlay component.
 * Thin wrapper around Ant Design's Dropdown providing direct passthrough for menu,
 * trigger, placement, arrow, and popup-container options with no extra behaviour.
 *
 * @example
 * ```tsx
 * <Dropdown engine="classic" trigger={['click']}
 *   menu={{ items: [{ key: '1', label: 'Option' }] }}>
 *   <Button>Open Menu</Button>
 * </Dropdown>
 * ```
 */
import React from 'react';
import { Dropdown as AntDropdown } from 'antd';
import type { DropdownProps } from '../Dropdown.types';

/**
 * Dropdown implementation backed by Ant Design's Dropdown primitive.
 *
 * The trigger array is normalised to always be an array (Ant expects `string[]`).
 * The popup container defaults to `document.body` so the menu escapes any ancestor
 * with `overflow: hidden` -- common in table cells and card layouts.
 *
 * @param props - {@link DropdownProps} shared across all engines.
 * @returns A ref-forwarded wrapper div containing the AntDropdown.
 */
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


    // Default to document.body so the popup escapes overflow:hidden ancestors
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
