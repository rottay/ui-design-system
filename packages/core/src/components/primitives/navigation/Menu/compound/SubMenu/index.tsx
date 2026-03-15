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

import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { MenuSubMenuProps } from '../../types';

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
 * - Smooth expand/collapse animations with height transition
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
}: MenuSubMenuProps): React.ReactElement {
  // ========================================================================
  // State & Refs
  // ========================================================================

  /** Controls the open/closed state of the submenu */
  const [isOpen, setIsOpen] = useState(false);

  /** Reference to the content container for height calculation */
  const contentRef = useRef<HTMLUListElement>(null);

  /** Animated height value for smooth transitions */
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');

  // ========================================================================
  // Effects
  // ========================================================================

  /**
   * Updates the content height for smooth animation
   * when the open state or children change.
   */
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

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
   * Container styles for the submenu.
   */
  const subMenuStyle: CSSProperties = {
    listStyle: 'none',
    ...style,
  };

  /**
   * Title bar styles using CSS variables.
   */
  const titleStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-menu-item-gap, 8px)',
    padding: 'var(--ds-menu-item-padding, 8px 16px)',
    minHeight: 'var(--ds-menu-item-height, 40px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    color: 'var(--ds-menu-item-color, inherit)',
    backgroundColor: isOpen ? 'var(--ds-menu-submenu-bg, var(--ds-color-bg-secondary))' : 'transparent',
    borderRadius: 'var(--ds-menu-border-radius, 6px)',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  };

  /**
   * Expand icon container styles with rotation animation.
   */
  const iconContainerStyle: CSSProperties = {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s ease',
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  };

  /**
   * Content container styles with height animation.
   */
  const contentStyle: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    paddingLeft: 'var(--ds-menu-submenu-indent, 24px)',
    margin: 0,
    height: typeof contentHeight === 'number' ? `${contentHeight}px` : contentHeight,
    overflow: 'hidden',
    transition: 'height 0.2s ease',
  };

  // ========================================================================
  // Default Expand Icon
  // ========================================================================

  /**
   * Default chevron down icon for expand indicator.
   */
  const defaultExpandIcon = (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 4.5L6 8L9.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <li
      className={`rottay-menu-submenu ${isOpen ? 'rottay-menu-submenu--open' : ''} ${disabled ? 'rottay-menu-submenu--disabled' : ''} ${className}`}
      style={subMenuStyle}
      data-key={itemKey}
    >
      {/* Submenu title bar */}
      <div
        className="rottay-menu-submenu__title"
        style={titleStyle}
        onClick={handleTitleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-haspopup="true"
      >
        {/* Optional icon */}
        {icon && <span className="rottay-menu-submenu__icon">{icon}</span>}

        {/* Title label */}
        <span className="rottay-menu-submenu__label">{title}</span>

        {/* Expand/collapse icon */}
        <span className="rottay-menu-submenu__expand-icon" style={iconContainerStyle}>
          {expandIcon || defaultExpandIcon}
        </span>
      </div>

      {/* Nested content */}
      <ul
        ref={contentRef}
        className="rottay-menu-submenu__content"
        style={contentStyle}
        role="menu"
        aria-hidden={!isOpen}
      >
        {children}
      </ul>
    </li>
  );
}

MenuSubMenu.displayName = 'Menu.SubMenu';
