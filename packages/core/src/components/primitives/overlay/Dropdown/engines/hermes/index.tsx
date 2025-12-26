'use client';

/**
 * Dropdown - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DropdownProps, DropdownMenuItem } from '../../types';
import { DROPDOWN_DEFAULTS } from '../../types';

const MenuItem: React.FC<{
  item: DropdownMenuItem;
  onClick?: (key: string) => void;
}> = ({ item, onClick }) => {
  if (item.type === 'divider') {
    return <li className="divider my-1" />;
  }

  if (item.type === 'group') {
    return (
      <li className="menu-title">
        <span>{item.label}</span>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className={`flex items-center gap-2 ${item.disabled ? 'disabled' : ''} ${item.danger ? 'text-error' : ''}`}
        disabled={item.disabled}
        onClick={() => {
          item.onClick?.();
          onClick?.(item.key);
        }}
      >
        {item.icon}
        {item.label}
      </button>
    </li>
  );
};

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (props, ref) => {
    const {
      menu,
      trigger = DROPDOWN_DEFAULTS.trigger,
      placement = DROPDOWN_DEFAULTS.placement,
      open: controlledOpen,
      onOpenChange,
      disabled,
      children,
      className,
      overlayClassName,
      overlayStyle,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          handleOpenChange(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, handleOpenChange]);

    const triggerArray = Array.isArray(trigger) ? trigger : [trigger];

    const getPlacementClass = () => {
      switch (placement) {
        case 'top':
        case 'topLeft':
        case 'topRight':
          return 'dropdown-top';
        case 'bottomRight':
        case 'topRight':
          return 'dropdown-end';
        default:
          return '';
      }
    };

    const handleClick = () => {
      if (disabled) return;
      if (triggerArray.includes('click')) {
        handleOpenChange(!isOpen);
      }
    };

    const handleMouseEnter = () => {
      if (disabled) return;
      if (triggerArray.includes('hover')) {
        handleOpenChange(true);
      }
    };

    const handleMouseLeave = () => {
      if (disabled) return;
      if (triggerArray.includes('hover')) {
        handleOpenChange(false);
      }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
      if (disabled) return;
      if (triggerArray.includes('contextMenu')) {
        e.preventDefault();
        handleOpenChange(!isOpen);
      }
    };

    const handleItemClick = (key: string) => {
      menu?.onClick?.({ key });
      handleOpenChange(false);
    };

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`dropdown ${getPlacementClass()} ${isOpen ? 'dropdown-open' : ''} ${className || ''}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        <div tabIndex={0} role="button" className="cursor-pointer">
          {children}
        </div>
        {isOpen && menu?.items && (
          <ul
            tabIndex={0}
            className={`dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow ${overlayClassName || ''}`}
            style={overlayStyle}
          >
            {menu.items.map((item) => (
              <MenuItem key={item.key} item={item} onClick={handleItemClick} />
            ))}
          </ul>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown.Hermes';

export default Dropdown;
