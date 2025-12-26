'use client';

/**
 * Dropdown - Titan Engine (Ant Design)
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
      destroyPopupOnHide,
      autoAdjustOverflow,
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
          destroyPopupOnHide={destroyPopupOnHide}
          autoAdjustOverflow={autoAdjustOverflow}
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
