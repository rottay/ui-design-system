/**
 * Titan Menu Engine
 *
 * Adapter that converts unified MenuProps to Ant Design Menu.
 */

'use client';

import { Menu as AntMenu } from 'antd';
import type { MenuProps, MenuItem } from '../../../../types/components/menu';

/**
 * Maps unified MenuItem to AntD ItemType
 * AntD expects a specific format with some differences from our unified type
 */
function mapMenuItems(items: MenuItem[] | undefined): any[] | undefined {
  if (!items) return undefined;

  return items.map((item) => {
    // Handle divider type
    if (item.type === 'divider') {
      return { type: 'divider', key: item.key };
    }

    // Handle group type
    if (item.type === 'group') {
      return {
        type: 'group',
        label: item.label,
        key: item.key,
        children: item.children ? mapMenuItems(item.children) : undefined,
      };
    }

    // Regular menu item
    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      disabled: item.disabled,
      danger: item.danger,
      title: item.title,
      children: item.children ? mapMenuItems(item.children) : undefined,
      'aria-label': item['aria-label'],
    };
  });
}

/**
 * Titan Menu - Ant Design implementation with unified MenuProps
 */
function TitanMenu({
  items,
  selectedKeys,
  defaultSelectedKeys,
  openKeys,
  defaultOpenKeys,
  onSelect,
  onClick,
  onOpenChange,
  onDeselect,
  className,
  style,
  id,
  mode = 'vertical',
  theme = 'light',
  selectable = true,
  multiple = false,
  inlineCollapsed,
  inlineIndent = 24,
  triggerSubMenuAction = 'hover',
  expandIcon,
  'aria-label': ariaLabel,
}: MenuProps) {
  // Map unified items to AntD format
  const antdItems = mapMenuItems(items);

  // Wrap callbacks to match unified MenuInfo interface
  const handleClick = onClick
    ? (info: any) => {
        const menuInfo = {
          key: info.key,
          keyPath: info.keyPath,
          item: info.item,
          domEvent: info.domEvent,
        };
        onClick(menuInfo);
      }
    : undefined;

  const handleSelect = onSelect
    ? (info: any) => {
        const menuInfo = {
          key: info.key,
          keyPath: info.keyPath,
          item: info.item,
          domEvent: info.domEvent,
        };
        onSelect(menuInfo);
      }
    : undefined;

  const handleDeselect = onDeselect
    ? (info: any) => {
        const menuInfo = {
          key: info.key,
          keyPath: info.keyPath,
          item: info.item,
          domEvent: info.domEvent,
        };
        onDeselect(menuInfo);
      }
    : undefined;

  return (
    <AntMenu
      items={antdItems}
      selectedKeys={selectedKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      openKeys={openKeys}
      defaultOpenKeys={defaultOpenKeys}
      onSelect={handleSelect}
      onClick={handleClick}
      onOpenChange={onOpenChange}
      onDeselect={handleDeselect}
      className={className}
      style={style}
      id={id}
      mode={mode}
      theme={theme}
      selectable={selectable}
      multiple={multiple}
      inlineCollapsed={inlineCollapsed}
      inlineIndent={inlineIndent}
      triggerSubMenuAction={triggerSubMenuAction}
      expandIcon={expandIcon}
      aria-label={ariaLabel}
    />
  );
}

TitanMenu.displayName = 'TitanMenu';

export default TitanMenu;
