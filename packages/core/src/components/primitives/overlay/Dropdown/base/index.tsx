/**
 * Dropdown - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import type {
  DropdownProps,
  DropdownMenuItem,
  DropdownPlacement,
} from '../types';
import { DROPDOWN_DEFAULTS } from '../types';

/**
 * Calculate position for dropdown menu
 */
function calculatePosition(
  triggerRect: DOMRect,
  menuRect: DOMRect,
  placement: DropdownPlacement
): { top: number; left: number } {
  const gap = 4;
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = triggerRect.top - menuRect.height - gap;
      left = triggerRect.left + (triggerRect.width - menuRect.width) / 2;
      break;
    case 'topLeft':
      top = triggerRect.top - menuRect.height - gap;
      left = triggerRect.left;
      break;
    case 'topRight':
      top = triggerRect.top - menuRect.height - gap;
      left = triggerRect.right - menuRect.width;
      break;
    case 'bottom':
      top = triggerRect.bottom + gap;
      left = triggerRect.left + (triggerRect.width - menuRect.width) / 2;
      break;
    case 'bottomLeft':
      top = triggerRect.bottom + gap;
      left = triggerRect.left;
      break;
    case 'bottomRight':
      top = triggerRect.bottom + gap;
      left = triggerRect.right - menuRect.width;
      break;
  }

  return { top: top + window.scrollY, left: left + window.scrollX };
}

/**
 * Menu Item Component
 */
const MenuItem: React.FC<{
  item: DropdownMenuItem;
  onClick?: (key: string) => void;
  selectedKeys?: string[];
  selectable?: boolean;
}> = ({ item, onClick, selectedKeys = [], selectable }) => {
  if (item.type === 'divider') {
    return (
      <div
        className="rottay-dropdown-menu__divider"
        style={{
          height: '1px',
          backgroundColor: 'var(--dropdown-divider-color)',
          margin: 'var(--dropdown-divider-margin)',
        }}
      />
    );
  }

  if (item.type === 'group' && item.children) {
    return (
      <div className="rottay-dropdown-menu__group">
        <div
          className="rottay-dropdown-menu__group-title"
          style={{
            padding: 'var(--dropdown-item-padding)',
            color: 'var(--dropdown-group-title-color)',
            fontSize: 'var(--dropdown-group-title-font-size)',
            fontWeight: 'var(--dropdown-group-title-font-weight)',
          }}
        >
          {item.label}
        </div>
        {item.children.map((child) => (
          <MenuItem
            key={child.key}
            item={child}
            onClick={onClick}
            selectedKeys={selectedKeys}
            selectable={selectable}
          />
        ))}
      </div>
    );
  }

  const isSelected = selectedKeys.includes(item.key);
  const isDisabled = item.disabled;

  const handleClick = () => {
    if (!isDisabled) {
      item.onClick?.();
      onClick?.(item.key);
    }
  };

  return (
    <div
      className={`rottay-dropdown-menu__item ${isSelected ? 'rottay-dropdown-menu__item--selected' : ''} ${isDisabled ? 'rottay-dropdown-menu__item--disabled' : ''} ${item.danger ? 'rottay-dropdown-menu__item--danger' : ''}`}
      onClick={handleClick}
      role="menuitem"
      aria-disabled={isDisabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--dropdown-item-icon-gap)',
        padding: 'var(--dropdown-item-padding)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        color: item.danger
          ? 'var(--dropdown-danger-color)'
          : isDisabled
            ? 'var(--dropdown-disabled-color)'
            : 'var(--dropdown-item-color)',
        backgroundColor: isSelected
          ? 'var(--dropdown-selected-bg)'
          : 'transparent',
        borderRadius: 'var(--dropdown-item-border-radius)',
        transition: 'background-color 0.2s, color 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor =
            'var(--dropdown-item-hover-bg)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isSelected
          ? 'var(--dropdown-selected-bg)'
          : 'transparent';
      }}
    >
      {item.icon && (
        <span className="rottay-dropdown-menu__item-icon">{item.icon}</span>
      )}
      <span className="rottay-dropdown-menu__item-label">{item.label}</span>
    </div>
  );
};

/**
 * Base Dropdown component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseDropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (props, ref) => {
    const {
      menu,
      trigger = DROPDOWN_DEFAULTS.trigger,
      placement = DROPDOWN_DEFAULTS.placement!,
      open: controlledOpen,
      onOpenChange,
      disabled = DROPDOWN_DEFAULTS.disabled,
      children,
      arrow = DROPDOWN_DEFAULTS.arrow,
      destroyPopupOnHide = DROPDOWN_DEFAULTS.destroyPopupOnHide,
      className = '',
      style = {},
      overlayClassName = '',
      overlayStyle = {},
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const triggers = Array.isArray(trigger) ? trigger : [trigger];

    const updateOpen = useCallback(
      (newOpen: boolean) => {
        if (disabled) return;
        if (controlledOpen === undefined) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [controlledOpen, onOpenChange, disabled]
    );

    // Update position when open
    useEffect(() => {
      if (isOpen && triggerRef.current && menuRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const pos = calculatePosition(triggerRect, menuRect, placement);
        setPosition(pos);
      }
    }, [isOpen, placement]);

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node) &&
          menuRef.current &&
          !menuRef.current.contains(e.target as Node)
        ) {
          updateOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, updateOpen]);

    // Handle trigger events
    const handleClick = () => {
      if (triggers.includes('click')) {
        updateOpen(!isOpen);
      }
    };

    const handleMouseEnter = () => {
      if (triggers.includes('hover')) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        updateOpen(true);
      }
    };

    const handleMouseLeave = () => {
      if (triggers.includes('hover')) {
        timeoutRef.current = setTimeout(() => updateOpen(false), 100);
      }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
      if (triggers.includes('contextMenu')) {
        e.preventDefault();
        updateOpen(!isOpen);
      }
    };

    const handleMenuClick = (key: string) => {
      menu?.onClick?.({ key });
      if (!menu?.selectable) {
        updateOpen(false);
      }
    };

    // CSS variables for dropdown
    const dropdownVars = useMemo<React.CSSProperties>(
      () =>
        ({
          '--dropdown-bg': 'var(--color-bg-elevated, #fff)',
          '--dropdown-border-radius': 'var(--radius-md, 8px)',
          '--dropdown-shadow': 'var(--shadow-lg)',
          '--dropdown-padding': 'var(--spacing-1, 4px)',
          '--dropdown-min-width': '120px',
          '--dropdown-item-padding': 'var(--spacing-2, 8px) var(--spacing-3, 12px)',
          '--dropdown-item-border-radius': 'var(--radius-sm, 4px)',
          '--dropdown-item-color': 'var(--color-text-primary)',
          '--dropdown-item-hover-bg': 'var(--color-bg-hover)',
          '--dropdown-item-icon-gap': 'var(--spacing-2, 8px)',
          '--dropdown-selected-bg': 'var(--color-primary-100)',
          '--dropdown-disabled-color': 'var(--color-text-disabled)',
          '--dropdown-danger-color': 'var(--color-error)',
          '--dropdown-divider-color': 'var(--color-border)',
          '--dropdown-divider-margin': 'var(--spacing-1, 4px) 0',
          '--dropdown-group-title-color': 'var(--color-text-secondary)',
          '--dropdown-group-title-font-size': '0.75rem',
          '--dropdown-group-title-font-weight': '600',
        }) as React.CSSProperties,
      []
    );

    // Render menu
    const renderMenu = () => {
      if (!isOpen && destroyPopupOnHide) return null;
      if (!isOpen && !menuRef.current) return null;

      const menuElement = (
        <div
          ref={menuRef}
          className={`rottay-dropdown-menu ${overlayClassName}`}
          style={{
            ...dropdownVars,
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 1050,
            minWidth: 'var(--dropdown-min-width)',
            padding: 'var(--dropdown-padding)',
            backgroundColor: 'var(--dropdown-bg)',
            borderRadius: 'var(--dropdown-border-radius)',
            boxShadow: 'var(--dropdown-shadow)',
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transition: 'opacity 0.2s, visibility 0.2s',
            ...overlayStyle,
          }}
          role="menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {arrow && (
            <div
              className="rottay-dropdown-menu__arrow"
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                backgroundColor: 'var(--dropdown-bg)',
                transform: 'rotate(45deg)',
                top: placement.startsWith('bottom') ? -4 : undefined,
                bottom: placement.startsWith('top') ? -4 : undefined,
                left: '50%',
                marginLeft: -4,
              }}
            />
          )}
          {menu?.items.map((item) => (
            <MenuItem
              key={item.key}
              item={item}
              onClick={handleMenuClick}
              selectedKeys={menu.selectedKeys}
              selectable={menu.selectable}
            />
          ))}
        </div>
      );

      if (typeof document !== 'undefined') {
        return createPortal(menuElement, document.body);
      }
      return null;
    };

    return (
      <div
        ref={ref}
        className={`rottay-dropdown ${className}`}
        style={{ display: 'inline-block', ...style }}
      >
        <div
          ref={triggerRef}
          className="rottay-dropdown__trigger"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {children}
        </div>
        {renderMenu()}
      </div>
    );
  }
);

BaseDropdown.displayName = 'BaseDropdown';
