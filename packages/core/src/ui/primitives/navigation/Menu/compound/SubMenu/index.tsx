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

import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import type { MenuSubMenuProps } from '../../contracts';
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';

// ============================================================================
// MenuSubMenu Component
// ============================================================================

/**
 * Expandable submenu container component.
 *
 * @description
 * Renders an expandable submenu with smooth height animation.
 * Supports icons, disabled state, and custom expand icons.
 *
 * @remarks
 * - Smooth expand/collapse animation via a `grid-template-rows` track
 * - Full keyboard navigation (Enter, Space, Arrow keys)
 * - ARIA attributes for screen reader support
 * - Rotate animation on expand icon
 * - Uses CSS variables for theming consistency
 *
 * @param props - {@link MenuSubMenuProps}
 * @returns Rendered submenu element
 *
 * @example
 * ```tsx
 * <MenuSubMenu itemKey="nav" title="Navigation" icon={<MenuIcon />}>
 *   <MenuItem itemKey="home">Home</MenuItem>
 *   <MenuItem itemKey="about">About</MenuItem>
 * </MenuSubMenu>
 * ```
 */
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
  // ========================================================================
  // State
  // ========================================================================

  /** Controls the open/closed state of the submenu */
  const [isOpen, setIsOpen] = useState(false);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles click on the submenu title.
   * Toggles open state and calls optional callback.
   */
  const handleTitleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    setIsOpen(!isOpen);
    onTitleClick?.(e);
  };

  /**
   * Handles keyboard navigation for accessibility.
   * - Enter/Space: Toggle open state
   * - ArrowRight: Open submenu
   * - ArrowLeft: Close submenu
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
    if (e.key === 'ArrowRight' && !isOpen) {
      setIsOpen(true);
    }
    if (e.key === 'ArrowLeft' && isOpen) {
      setIsOpen(false);
    }
  };

  // ========================================================================
  // Styles
  // ========================================================================

  /**
   * Panel track styles: the grid-template-rows value is the only per-render
   * dynamic piece (0fr collapsed / 1fr expanded); `display:grid` and the
   * `transition`/reduced-motion rules live in menu-compounds.css on
   * `.rottay-menu-submenu__panel` (mirrors Collapse -- see
   * Collapse/engines/modern/index.tsx:26-37). Every other former inline
   * block (title row, expand-icon wrapper, content indent) was static paint
   * with raw `0.2s ease` durations and physical `marginLeft`/`paddingLeft`
   * properties: all of it now lives in menu-compounds.css on the compound
   * BEM classes, on governed motion channels and logical properties.
   */
  const panelStyle: CSSProperties = {
    gridTemplateRows: isOpen ? '1fr' : '0fr',
  };

  // ========================================================================
  // Default Expand Icon
  // ========================================================================

  /**
   * Governed disclosure icon: the semantic facade's `navigation.down` role
   * replaces the former local SVG chevron (axis-9 law: roles only, no local
   * SVG). `autoMirror: false` — a vertical arrow needs no RTL flip, and the
   * skin owns the open/closed rotation via `data-open`.
   */
  const defaultExpandIcon = <NavigationDownIcon decorative size={12} />;

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <li
      {...rest}
      className={`rottay-menu-submenu ${isOpen ? 'rottay-menu-submenu--open' : ''} ${disabled ? 'rottay-menu-submenu--disabled' : ''} ${className}`}
      style={style}
      data-key={itemKey}
    >
      {/* Submenu title bar */}
      <div
        className="rottay-menu-submenu__title"
        onClick={handleTitleClick}
        onKeyDown={handleKeyDown}
        role="button"
        data-part="trigger"
        data-open={isOpen}
        data-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-haspopup="true"
      >
        {/* Optional icon */}
        {icon && <span className="rottay-menu-submenu__icon" data-part="icon">{icon}</span>}

        {/* Title label */}
        <span className="rottay-menu-submenu__label" data-part="label">{title}</span>

        {/* Expand/collapse icon */}
        <span className="rottay-menu-submenu__expand-icon" data-part="arrow-icon">
          {expandIcon || defaultExpandIcon}
        </span>
      </div>

      {/* Panel: the grid-template-rows track (0fr collapsed / 1fr expanded).
          The nested `<ul role="menu">` stays the `data-part="panel"` element
          (the documented "submenu's flyout/nested list" contract); this div
          is a structural wrapper only, mirroring Collapse's outer/inner split
          -- see Collapse/engines/modern/index.tsx:26-37. The skin hides the
          collapsed content with `visibility: hidden` so its focusable rows
          leave the tab order while `aria-hidden` is set (the former grid-only
          collapse leaked them into keyboard navigation). */}
      <div className="rottay-menu-submenu__panel" data-open={isOpen} style={panelStyle}>
        <ul
          className="rottay-menu-submenu__content"
          role="menu"
          data-part="panel"
          aria-hidden={!isOpen}
        >
          {children}
        </ul>
      </div>
    </li>
  );
}

MenuSubMenu.displayName = 'Menu.SubMenu';
