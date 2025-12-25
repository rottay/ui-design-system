/**
 * Titan Dropdown Engine
 *
 * Adapter that converts unified DropdownProps to Ant Design Dropdown.
 */

'use client';

import { Dropdown as AntDropdown } from 'antd';
import type { DropdownProps } from '../../../../types/components/dropdown';

/**
 * Titan Dropdown - Ant Design implementation with unified DropdownProps
 */
function TitanDropdown({
  children,
  menu,
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  className,
  style,
  'aria-label': ariaLabel,
  placement,
  overlayClassName,
  overlayStyle,
  disabled,
  destroyPopupOnHide,
  arrow,
  zIndex,
  align,
  autoAdjustOverflow,
  getPopupContainer,
  onMouseEnter,
  onMouseLeave,
  dropdownRender,
}: DropdownProps) {
  // Convert unified menu structure to Ant Design menu format
  const antMenu = menu
    ? {
        items: menu.items?.map((item) => ({
          key: item.key,
          label: item.label,
          disabled: item.disabled,
          icon: item.icon,
          danger: item.danger,
          type: item.divider ? ('divider' as const) : undefined,
          children: item.children?.map((child) => ({
            key: child.key,
            label: child.label,
            disabled: child.disabled,
            icon: child.icon,
            danger: child.danger,
            onClick: child.onClick,
          })),
          onClick: item.onClick,
        })),
        onClick: menu.onClick,
        className: menu.className,
        style: menu.style,
      }
    : undefined;

  return (
    <AntDropdown
      menu={antMenu}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      className={className}
      style={style}
      aria-label={ariaLabel}
      placement={placement}
      overlayClassName={overlayClassName}
      overlayStyle={overlayStyle}
      disabled={disabled}
      destroyPopupOnHide={destroyPopupOnHide}
      arrow={arrow}
      autoAdjustOverflow={autoAdjustOverflow}
      align={align}
      getPopupContainer={getPopupContainer}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      dropdownRender={dropdownRender}
    >
      {children}
    </AntDropdown>
  );
}

TitanDropdown.displayName = 'TitanDropdown';

export default TitanDropdown;
