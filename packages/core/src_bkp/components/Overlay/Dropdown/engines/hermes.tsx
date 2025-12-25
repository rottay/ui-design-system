/**
 * Hermes Dropdown Engine
 *
 * DaisyUI dropdown implementation with unified DropdownProps.
 */

'use client';

import { useState, useEffect, cloneElement, type ReactElement } from 'react';
import type { DropdownProps, DropdownMenuItem } from '../../../../types/components/dropdown';
import { cn } from '../../../../utils/cn';

// Map unified placement to DaisyUI position classes
const placementClasses = {
  top: 'dropdown-top',
  topLeft: 'dropdown-top dropdown-start',
  topRight: 'dropdown-top dropdown-end',
  bottom: 'dropdown-bottom',
  bottomLeft: 'dropdown-bottom dropdown-start',
  bottomRight: 'dropdown-bottom dropdown-end',
  left: 'dropdown-left',
  leftTop: 'dropdown-left dropdown-start',
  leftBottom: 'dropdown-left dropdown-end',
  right: 'dropdown-right',
  rightTop: 'dropdown-right dropdown-start',
  rightBottom: 'dropdown-right dropdown-end',
};

/**
 * Renders a single menu item with support for icons, danger state, and dividers
 */
function MenuItem({
  item,
  onItemClick,
}: {
  item: DropdownMenuItem;
  onItemClick: (item: DropdownMenuItem, event: React.MouseEvent) => void;
}) {
  // Divider item
  if (item.divider) {
    return <li className="divider my-0" />;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }

    onItemClick(item, e);
  };

  // Submenu support
  if (item.children && item.children.length > 0) {
    return (
      <li className={cn(item.disabled && 'disabled')}>
        <details>
          <summary className={cn(item.danger && 'text-error')}>
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </summary>
          <ul className="p-2 bg-base-100 rounded-lg shadow-lg">
            {item.children.map((child) => (
              <MenuItem key={child.key} item={child} onItemClick={onItemClick} />
            ))}
          </ul>
        </details>
      </li>
    );
  }

  return (
    <li className={cn(item.disabled && 'disabled')}>
      <button
        type="button"
        onClick={handleClick}
        disabled={item.disabled}
        aria-label={item['aria-label']}
        className={cn(item.danger && 'text-error')}
      >
        {item.icon && <span>{item.icon}</span>}
        {item.label}
      </button>
    </li>
  );
}

/**
 * Hermes Dropdown - DaisyUI implementation with unified DropdownProps
 */
function HermesDropdown({
  children,
  menu,
  open,
  defaultOpen = false,
  onOpenChange,
  trigger = ['click'],
  className,
  style,
  'aria-label': ariaLabel,
  placement = 'bottomLeft',
  overlayClassName,
  disabled = false,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const updateOpenState = (newOpen: boolean) => {
    if (disabled) return;

    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen, { source: 'trigger' });
  };

  const handleItemClick = (item: DropdownMenuItem, event: React.MouseEvent) => {
    const keyPath = [item.key];

    // Call item-specific onClick
    if (item.onClick) {
      item.onClick({
        key: item.key,
        keyPath,
        domEvent: event,
      });
    }

    // Call menu-level onClick
    if (menu?.onClick) {
      menu.onClick({
        key: item.key,
        keyPath,
        domEvent: event,
      });
    }

    // Close dropdown after clicking an item (unless it has children)
    if (!item.children || item.children.length === 0) {
      updateOpenState(false);
    }
  };

  // Handle blur for click-based dropdowns
  const handleBlur = () => {
    if (trigger.includes('click')) {
      // Small delay to allow click events to fire
      setTimeout(() => {
        updateOpenState(false);
      }, 150);
    }
  };

  const handleMouseEnter = () => {
    if (trigger.includes('hover') && !disabled) {
      updateOpenState(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger.includes('hover') && !disabled) {
      updateOpenState(false);
    }
  };

  const handleClick = () => {
    if (trigger.includes('click') && !disabled) {
      updateOpenState(!isOpen);
    }
  };

  // DaisyUI uses details/summary or tabindex approach
  const placementClass = placementClasses[placement] ?? placementClasses.bottomLeft;

  // Determine if we use hover or click
  const useHover = trigger.includes('hover');

  // Build dropdown classes
  const dropdownClasses = cn(
    'dropdown',
    placementClass,
    isOpen && 'dropdown-open',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  // Add event handlers to child element for hover
  const childWithHandlers = cloneElement(children as ReactElement, {
    onMouseEnter: useHover ? handleMouseEnter : undefined,
    onMouseLeave: useHover ? handleMouseLeave : undefined,
    onClick: trigger.includes('click') ? handleClick : (children as ReactElement).props.onClick,
    tabIndex: 0,
    role: 'button',
  });

  return (
    <div
      className={dropdownClasses}
      style={style}
      aria-label={ariaLabel}
      onMouseEnter={useHover ? handleMouseEnter : undefined}
      onMouseLeave={useHover ? handleMouseLeave : undefined}
      onBlur={handleBlur}
    >
      {childWithHandlers}

      {/* Dropdown menu */}
      {menu && menu.items && menu.items.length > 0 && (
        <ul
          tabIndex={0}
          className={cn(
            'dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg',
            overlayClassName,
            menu.className
          )}
          style={menu.style}
        >
          {menu.items.map((item) => (
            <MenuItem key={item.key} item={item} onItemClick={handleItemClick} />
          ))}
        </ul>
      )}
    </div>
  );
}

HermesDropdown.displayName = 'HermesDropdown';

export default HermesDropdown;
