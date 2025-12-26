/**
 * Menu - Titan Engine (Ant Design)
 */

'use client';

import React, { useMemo } from 'react';
import { Menu as AntMenu } from 'antd';
import type { MenuProps as AntMenuProps } from 'antd';
import type { ItemType } from 'antd/es/menu/interface';
import type { MenuProps, MenuItem as MenuItemInterface, MenuSelectInfo, MenuClickInfo } from '../../types';
import { MENU_DEFAULTS } from '../../types';

/**
 * Convert our MenuItem to Ant Design's ItemType
 */
function convertMenuItems(items: MenuItemInterface[]): ItemType[] {
  return items.map((item) => {
    if (item.type === 'divider') {
      return {
        type: 'divider' as const,
        key: item.key,
      };
    }

    if (item.type === 'group') {
      return {
        type: 'group' as const,
        key: item.key,
        label: item.title || item.label,
        children: item.children ? convertMenuItems(item.children) : undefined,
      };
    }

    if (item.children && item.children.length > 0) {
      return {
        key: item.key,
        label: item.label,
        icon: item.icon,
        disabled: item.disabled,
        danger: item.danger,
        children: convertMenuItems(item.children),
      };
    }

    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      disabled: item.disabled,
      danger: item.danger,
    };
  });
}

export default function TitanMenu(props: MenuProps): React.ReactElement {
  const {
    items,
    mode = MENU_DEFAULTS.mode,
    selectedKeys,
    defaultSelectedKeys,
    openKeys,
    defaultOpenKeys,
    multiple = MENU_DEFAULTS.multiple,
    selectable = MENU_DEFAULTS.selectable,
    inlineCollapsed = MENU_DEFAULTS.inlineCollapsed,
    expandIcon,
    onSelect,
    onClick,
    onOpenChange,
    inlineIndent = MENU_DEFAULTS.inlineIndent,
    theme = MENU_DEFAULTS.theme,
    children,
    className,
    style,
  } = props;

  // Convert items to Ant Design format
  const antItems = useMemo(() => {
    return items ? convertMenuItems(items) : undefined;
  }, [items]);

  // Handle select event
  const handleSelect = (info: { key: string; selectedKeys: string[]; keyPath: string[] }) => {
    const selectInfo: MenuSelectInfo = {
      key: info.key,
      selectedKeys: info.selectedKeys,
      keyPath: info.keyPath,
    };
    onSelect?.(selectInfo);
  };

  // Handle click event
  const handleClick: AntMenuProps['onClick'] = (info) => {
    const clickInfo: MenuClickInfo = {
      key: info.key,
      keyPath: info.keyPath,
      domEvent: info.domEvent as React.MouseEvent<HTMLElement>,
    };
    onClick?.(clickInfo);
  };

  const antMenuProps: Partial<AntMenuProps> = {
    items: antItems,
    mode,
    selectedKeys,
    defaultSelectedKeys,
    openKeys,
    defaultOpenKeys,
    multiple,
    selectable,
    inlineCollapsed,
    expandIcon,
    onSelect: handleSelect as AntMenuProps['onSelect'],
    onClick: handleClick,
    onOpenChange,
    inlineIndent,
    theme,
    className: `rottay-menu rottay-menu--titan ${className || ''}`,
    style,
  };

  // If using children instead of items, render them
  if (children && !items) {
    return (
      <AntMenu {...antMenuProps}>
        {children}
      </AntMenu>
    );
  }

  return <AntMenu {...antMenuProps} />;
}

TitanMenu.displayName = 'TitanMenu';
