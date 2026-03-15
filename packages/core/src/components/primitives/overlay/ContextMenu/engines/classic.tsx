'use client';

/**
 * @fileoverview ContextMenu Classic Engine - Rottay Design System
 * @description Ant Design implementation of the ContextMenu component.
 * Uses Ant Design Dropdown with trigger='contextMenu'.
 *
 * @module ContextMenu/Engines/Classic
 * @category Overlay
 * @package @rottay/design-system
 */

import React from 'react';
import { Dropdown as AntDropdown } from 'antd';
import type { ContextMenuProps, ContextMenuItem } from '../ContextMenu.types';

function mapItemsToAnt(items: ContextMenuItem[]): any[] {
  return items.map((item) => {
    if (item.type === 'divider') {
      return { type: 'divider', key: item.key };
    }
    if (item.type === 'group') {
      return {
        type: 'group',
        key: item.key,
        label: item.label,
        children: item.children ? mapItemsToAnt(item.children) : undefined,
      };
    }
    return {
      key: item.key,
      label: item.shortcut ? (
        <span style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
          <span>{item.label}</span>
          <span style={{ color: 'var(--ds-color-text-secondary, #999)', fontSize: 12 }}>{item.shortcut}</span>
        </span>
      ) : item.label,
      icon: item.icon,
      disabled: item.disabled,
      danger: item.danger,
      children: item.children ? mapItemsToAnt(item.children) : undefined,
      onClick: item.onClick,
    };
  });
}

export default function ClassicContextMenu(props: ContextMenuProps): React.ReactElement {
  const {
    items,
    onSelect,
    trigger,
    disabled = false,
    className,
    overlayClassName,
    overlayStyle,
  } = props;

  const antMenu = {
    items: mapItemsToAnt(items),
    onClick: (info: { key: string }) => {
      onSelect?.(info.key);
    },
  };

  return (
    <div className={className}>
      <AntDropdown
        menu={antMenu}
        trigger={['contextMenu']}
        disabled={disabled}
        overlayClassName={overlayClassName}
        overlayStyle={overlayStyle}
        getPopupContainer={() => document.body}
      >
        <div>{trigger}</div>
      </AntDropdown>
    </div>
  );
}

ClassicContextMenu.displayName = 'ContextMenu.Classic';
