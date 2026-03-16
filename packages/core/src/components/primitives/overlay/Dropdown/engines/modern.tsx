'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the Dropdown overlay component.
 * Uses DaisyUI `dropdown` and `menu` classes with a controlled/uncontrolled open
 * pattern, click-outside dismissal, and placement via DaisyUI modifier classes.
 *
 * @example
 * ```tsx
 * <Dropdown engine="modern" trigger={['click']}
 *   menu={{ items: [{ key: '1', label: 'Option' }] }}>
 *   <Button>Open Menu</Button>
 * </Dropdown>
 * ```
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DropdownProps, DropdownMenuItem } from '../Dropdown.types';
import { DROPDOWN_DEFAULTS } from '../Dropdown.types';

/** Renders a single menu item, divider, or group header using DaisyUI classes. */
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

/**
 * Dropdown implementation using DaisyUI dropdown and menu classes.
 *
 * Supports controlled and uncontrolled open state, three trigger modes (click,
 * hover, contextMenu), and DaisyUI placement modifiers (dropdown-top,
 * dropdown-end, dropdown-start). Click-outside dismissal is handled via a
 * global mousedown listener attached only while the menu is open.
 *
 * @param props - {@link DropdownProps} shared across all engines.
 * @returns A ref-forwarded DaisyUI dropdown container.
 */
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
      getPopupContainer,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    // Support both controlled (parent owns state) and uncontrolled modes
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Dismiss the dropdown when clicking anywhere outside its container
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

    // Translate the engine-agnostic placement prop (e.g. "topRight") into
    // DaisyUI modifier classes (e.g. "dropdown-top dropdown-end")
    const getPlacementClass = () => {
      if (!placement) return '';

      const verticalClass = placement.startsWith('top') ? 'dropdown-top' : '';
      const horizontalClass = placement.endsWith('Right') ? 'dropdown-end' :
                             placement.endsWith('Left') ? 'dropdown-start' : '';

      return `${verticalClass} ${horizontalClass}`.trim();
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

Dropdown.displayName = 'Dropdown.Modern';

export default Dropdown;
