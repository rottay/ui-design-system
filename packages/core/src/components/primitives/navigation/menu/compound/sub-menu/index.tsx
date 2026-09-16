/**
 * @fileoverview Menu.SubMenu Compound Component - Rottay Design System
 * @description Expandable submenu container with nested menu items.
 * Part of the Menu compound component API for JSX composition.
 *
 * @remarks
 * The MenuSubMenu component creates an expandable/collapsible section within
 * the menu. It features smooth animations, keyboard navigation, and ARIA
 * attributes for accessibility. Uses CSS variables for consistent theming.
 *
 * @example Basic Usage
 * ```tsx
 * <Menu.SubMenu itemKey="products" title="Products" icon={<ShopIcon />}>
 *   <Menu.Item itemKey="electronics">Electronics</Menu.Item>
 *   <Menu.Item itemKey="clothing">Clothing</Menu.Item>
 *   <Menu.Item itemKey="accessories">Accessories</Menu.Item>
 * </Menu.SubMenu>
 * ```
 *
 * @example Nested Submenus
 * ```tsx
 * <Menu.SubMenu itemKey="settings" title="Settings">
 *   <Menu.SubMenu itemKey="appearance" title="Appearance">
 *     <Menu.Item itemKey="theme">Theme</Menu.Item>
 *     <Menu.Item itemKey="colors">Colors</Menu.Item>
 *   </Menu.SubMenu>
 *   <Menu.SubMenu itemKey="privacy" title="Privacy">
 *     <Menu.Item itemKey="data">Data Settings</Menu.Item>
 *     <Menu.Item itemKey="cookies">Cookie Preferences</Menu.Item>
 *   </Menu.SubMenu>
 * </Menu.SubMenu>
 * ```
 *
 * @example With Custom Expand Icon
 * ```tsx
 * <Menu.SubMenu
 *   itemKey="options"
 *   title="More Options"
 *   expandIcon={<ChevronRightIcon />}
 * >
 *   <Menu.Item itemKey="option1">Option 1</Menu.Item>
 *   <Menu.Item itemKey="option2">Option 2</Menu.Item>
 * </Menu.SubMenu>
 * ```
 *
 * @see {@link MenuSubMenuProps} for prop documentation
 * @see {@link Menu} for parent component
 *
 * @module Menu/Compound/SubMenu
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useId, useState } from 'react';
import type { MenuSubMenuProps } from '../../contracts';
import { NavigationDownIcon } from '@/graphics/icons/semantic/generated/roles/navigation-down';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { resolveNavigationIntent } from '@/components/primitives/runtime/collection/roving-focus';
import { useReadingDirectionIsRtl } from '@/infrastructure/runtime/i18n';

// ============================================================================
// MenuSubMenu Component
// ============================================================================

export function MenuSubMenu({
  itemKey,
  title,
  icon,
  disabled = false,
  onTitleClick,
  expandIcon,
  children,
  className = '',
  style,
  // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to the
  // submenu root element, BEFORE the engine's own stamps.
  ...rest
}: MenuSubMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const interaction = useInteractionState({ disabled });
  // The reading direction comes from the shared i18n authority; this family
  // measures nothing of its own.
  const directionIsRtl = useReadingDirectionIsRtl();
  const panelId = `menu-submenu-${useId().replace(/:/g, '')}`;

  const handleTitleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    setIsOpen(!isOpen);
    onTitleClick?.(e);
  };

  // The disclosure axis is the cross axis of a vertical menu, resolved by the
  // shared collection kernel so the forward key mirrors under RTL.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
      return;
    }
    const intent = resolveNavigationIntent(e.key, {
      orientation: 'horizontal',
      rtl: directionIsRtl,
    });
    if (intent === 'next' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    } else if (intent === 'previous' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const defaultExpandIcon = <NavigationDownIcon decorative size={12} />;

  return (
    <li {...rest} className={`ds-menu-submenu ${className}`.trim()} style={style} role="none" data-key={itemKey}>
      <div
        {...partAttributes('trigger', interaction.state)}
        {...interaction.handlers}
        onClick={handleTitleClick}
        onKeyDown={handleKeyDown}
        role="menuitem"
        data-open={isOpen}
        data-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-haspopup="menu"
        aria-controls={panelId}
      >
        {icon && <span data-part="icon">{icon}</span>}
        <span data-part="label">{title}</span>
        <span data-part="arrow-icon" aria-hidden="true">
          {expandIcon || defaultExpandIcon}
        </span>
      </div>
      {/* The track animates height through grid rows in the skin, keyed on
          data-open; the nested list stays the documented `panel` part. */}
      <div className="ds-menu-submenu__track" data-open={isOpen}>
        <ul id={panelId} role="menu" data-part="panel" aria-hidden={!isOpen}>
          {children}
        </ul>
      </div>
    </li>
  );
}

MenuSubMenu.displayName = 'Menu.SubMenu';
