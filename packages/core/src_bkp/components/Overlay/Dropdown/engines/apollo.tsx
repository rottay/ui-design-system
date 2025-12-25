/**
 * Apollo Dropdown Engine
 *
 * Native HTML + Tailwind CSS dropdown implementation.
 * Zero external dependencies, minimal bundle size with CSS-only dropdown.
 */

'use client';

import { useState, useRef, useEffect, cloneElement, type ReactElement } from 'react';
import type { DropdownProps, DropdownMenuItem } from '../../../../types/components/dropdown';
import { cn } from '../../../../utils/cn';

// Placement to CSS class mapping for positioning
const placementClasses = {
  top: 'bottom-full left-0 mb-2',
  topLeft: 'bottom-full left-0 mb-2',
  topRight: 'bottom-full right-0 mb-2',
  bottom: 'top-full left-0 mt-2',
  bottomLeft: 'top-full left-0 mt-2',
  bottomRight: 'top-full right-0 mt-2',
  left: 'right-full top-0 mr-2',
  leftTop: 'right-full top-0 mr-2',
  leftBottom: 'right-full bottom-0 mr-2',
  right: 'left-full top-0 ml-2',
  rightTop: 'left-full top-0 ml-2',
  rightBottom: 'left-full bottom-0 ml-2',
};

/**
 * Renders a single menu item with support for icons, danger state, and nested items
 */
function MenuItem({
  item,
  onItemClick,
  level = 0,
}: {
  item: DropdownMenuItem;
  onItemClick: (item: DropdownMenuItem, event: React.MouseEvent) => void;
  level?: number;
}) {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Divider item
  if (item.divider) {
    return <div className="h-px bg-gray-200 my-1" />;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }

    if (!hasChildren) {
      onItemClick(item, e);
    }
  };

  const handleMouseEnter = () => {
    if (hasChildren) {
      setShowSubmenu(true);
    }
  };

  const handleMouseLeave = () => {
    if (hasChildren) {
      setShowSubmenu(false);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={cn(
          'w-full text-left px-4 py-2 text-sm flex items-center gap-2',
          'transition-colors duration-150',
          item.disabled
            ? 'text-gray-400 cursor-not-allowed'
            : item.danger
              ? 'text-red-600 hover:bg-red-50'
              : 'text-gray-700 hover:bg-gray-100',
          hasChildren && 'justify-between'
        )}
        onClick={handleClick}
        disabled={item.disabled}
        aria-label={item['aria-label']}
      >
        <span className="flex items-center gap-2">
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <span>{item.label}</span>
        </span>
        {hasChildren && (
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </button>

      {/* Submenu */}
      {hasChildren && showSubmenu && (
        <div
          className={cn(
            'absolute left-full top-0 ml-1',
            'min-w-[160px] bg-white rounded-md shadow-lg',
            'border border-gray-200 py-1',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {item.children?.map((child) => (
            <MenuItem
              key={child.key}
              item={child}
              onItemClick={onItemClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Apollo Dropdown - Native HTML + Tailwind implementation
 */
function ApolloDropdown({
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
  overlayStyle,
  disabled = false,
  arrow = false,
  zIndex = 1050,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        updateOpenState(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const updateOpenState = (newOpen: boolean) => {
    if (disabled) return;

    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen, { source: 'trigger' });
  };

  const handleMouseEnter = () => {
    if (trigger.includes('hover') && !disabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      updateOpenState(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger.includes('hover') && !disabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        updateOpenState(false);
      }, 100);
    }
  };

  const handleClick = () => {
    if (trigger.includes('click') && !disabled) {
      updateOpenState(!isOpen);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (trigger.includes('contextMenu') && !disabled) {
      e.preventDefault();
      updateOpenState(!isOpen);
    }
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

  // Add event handlers to child element
  const childWithHandlers = cloneElement(children as ReactElement, {
    onMouseEnter: trigger.includes('hover') ? handleMouseEnter : undefined,
    onMouseLeave: trigger.includes('hover') ? handleMouseLeave : undefined,
    onClick: trigger.includes('click') ? handleClick : (children as ReactElement).props.onClick,
    onContextMenu: trigger.includes('contextMenu')
      ? handleContextMenu
      : (children as ReactElement).props.onContextMenu,
    className: cn(
      (children as ReactElement).props.className,
      disabled && 'opacity-50 cursor-not-allowed'
    ),
  });

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block', className)}
      style={style}
      aria-label={ariaLabel}
    >
      {childWithHandlers}

      {/* Dropdown menu */}
      {isOpen && menu && menu.items && menu.items.length > 0 && (
        <div
          className={cn(
            'absolute min-w-[160px]',
            'bg-white rounded-md shadow-lg',
            'border border-gray-200 py-1',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            placementClasses[placement] ?? placementClasses.bottomLeft,
            overlayClassName,
            menu.className
          )}
          style={{
            zIndex,
            ...overlayStyle,
            ...menu.style,
          }}
          onMouseEnter={trigger.includes('hover') ? handleMouseEnter : undefined}
          onMouseLeave={trigger.includes('hover') ? handleMouseLeave : undefined}
        >
          {menu.items.map((item) => (
            <MenuItem key={item.key} item={item} onItemClick={handleItemClick} />
          ))}

          {/* Arrow indicator (optional) */}
          {arrow && (
            <div
              className={cn(
                'absolute w-2 h-2 bg-white border-gray-200',
                'transform rotate-45',
                placement.startsWith('bottom')
                  ? '-top-1 left-4 border-t border-l'
                  : placement.startsWith('top')
                    ? '-bottom-1 left-4 border-b border-r'
                    : placement.startsWith('left')
                      ? '-right-1 top-4 border-t border-r'
                      : '-left-1 top-4 border-b border-l'
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

ApolloDropdown.displayName = 'ApolloDropdown';

export default ApolloDropdown;
