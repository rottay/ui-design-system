'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the ContextMenu overlay component.
 * Wraps Ant Design's Dropdown with `trigger={['contextMenu']}` to intercept
 * right-click events and display a themed menu with items, groups, and dividers.
 *
 * @example
 * ```tsx
 * <ClassicContextMenu
 *   items={[{ key: 'copy', label: 'Copy', shortcut: 'Ctrl+C' }]}
 *   trigger={<span>Right-click me</span>}
 *   onSelect={(key) => console.log(key)}
 * />
 * ```
 */

import React from 'react';
import { Dropdown as AntDropdown } from 'antd';
import type { ContextMenuProps, ContextMenuItem } from '../ContextMenu.types';

/**
 * Recursively converts the engine-agnostic ContextMenuItem tree into Ant Design's
 * menu item format. Handles dividers, groups (with nested children), shortcuts
 * rendered as a flex row, and danger/disabled states.
 */
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

/**
 * ContextMenu implementation backed by Ant Design's Dropdown primitive.
 *
 * Relies entirely on AntDropdown for positioning, animation, and keyboard
 * navigation. The menu is portalled to document.body to avoid clipping inside
 * overflow containers such as tables and scrollable panels.
 *
 * @param props - {@link ContextMenuProps} shared across all engines.
 * @returns A wrapper div containing the right-click trigger area.
 */
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

  // Build Ant-compatible menu descriptor with a global click handler
  const antMenu = {
    items: mapItemsToAnt(items),
    onClick: (info: { key: string }) => {
      onSelect?.(info.key);
    },
  };

  return (
    <div className={className}>
      {/* Portal target set to document.body to escape overflow:hidden ancestors */}
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
