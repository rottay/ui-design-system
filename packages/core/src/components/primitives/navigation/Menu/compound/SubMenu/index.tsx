/**
 * Menu.SubMenu - Compound Component
 * Expandable submenu with nested items
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { MenuSubMenuProps } from '../../types';

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
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLUListElement>(null);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  const handleTitleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    setIsOpen(!isOpen);
    onTitleClick?.(e);
  };

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

  const subMenuStyle: CSSProperties = {
    listStyle: 'none',
    ...style,
  };

  const titleStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--menu-item-gap, 8px)',
    padding: 'var(--menu-item-padding, 8px 16px)',
    minHeight: 'var(--menu-item-height, 40px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    color: 'var(--menu-item-color, inherit)',
    backgroundColor: isOpen ? 'var(--menu-submenu-bg, rgba(0, 0, 0, 0.02))' : 'transparent',
    borderRadius: 'var(--menu-border-radius, 6px)',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  };

  const iconContainerStyle: CSSProperties = {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s ease',
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  };

  const contentStyle: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    paddingLeft: 'var(--menu-submenu-indent, 24px)',
    margin: 0,
    height: typeof contentHeight === 'number' ? `${contentHeight}px` : contentHeight,
    overflow: 'hidden',
    transition: 'height 0.2s ease',
  };

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

  return (
    <li
      className={`rottay-menu-submenu ${isOpen ? 'rottay-menu-submenu--open' : ''} ${disabled ? 'rottay-menu-submenu--disabled' : ''} ${className}`}
      style={subMenuStyle}
      data-key={itemKey}
    >
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
        {icon && <span className="rottay-menu-submenu__icon">{icon}</span>}
        <span className="rottay-menu-submenu__label">{title}</span>
        <span className="rottay-menu-submenu__expand-icon" style={iconContainerStyle}>
          {expandIcon || defaultExpandIcon}
        </span>
      </div>
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
