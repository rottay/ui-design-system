'use client';

/**
 * @fileoverview Dropdown Apollo Engine - Rottay Design System
 * @description Apollo (Pure HTML/CSS) implementation of the Dropdown component.
 * Uses inline CSS styles with portal rendering for proper z-index stacking.
 *
 * @remarks
 * The Apollo engine provides:
 * - Pure inline CSS with absolute positioning
 * - Portal rendering to document.body
 * - Custom trigger handling for click, hover, contextMenu
 * - Click-outside dismissal via event listeners
 * - Placement calculation based on trigger element rect
 *
 * Implementation details:
 * - MenuItem component renders items, dividers, and groups
 * - Hover effects via onMouseEnter/onMouseLeave
 * - Danger items styled with red color (#ef4444)
 * - Menu positioned absolutely based on trigger getBoundingClientRect()
 * - Uses createPortal for proper overlay stacking
 *
 * This implementation is ideal for:
 * - Embedded applications without CSS framework dependencies
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility scenarios
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Dropdown, Button } from '@rottay/design-system';
 *
 * // Pure inline CSS dropdown
 * <Dropdown
 *   engine="apollo"
 *   trigger={['click']}
 *   menu={{ items: [{ key: '1', label: 'Option' }] }}
 * >
 *   <Button>Vanilla Dropdown</Button>
 * </Dropdown>
 * ```
 *
 * @see {@link Dropdown} - The main engine-aware component
 * @module Dropdown/Engines/Apollo
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { DropdownProps, DropdownMenuItem } from '../../types';
import { DROPDOWN_DEFAULTS } from '../../types';

const MenuItem: React.FC<{
  item: DropdownMenuItem;
  onClick?: (key: string) => void;
}> = ({ item, onClick }) => {
  if (item.type === 'divider') {
    return (
      <div
        role="separator"
        style={{
          height: '1px',
          backgroundColor: 'var(--ds-dropdown-divider-color, var(--ds-color-neutral-200, #e5e7eb))',
          margin: '4px 0',
        }}
      />
    );
  }

  if (item.type === 'group') {
    return (
      <div
        style={{
          padding: '4px 12px',
          fontSize: '12px',
          color: 'var(--ds-dropdown-group-color, var(--ds-color-neutral-500, #6b7280))',
          fontWeight: 500,
        }}
      >
        {item.label}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={() => {
        item.onClick?.();
        onClick?.(item.key);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '8px 12px',
        border: 'none',
        background: 'transparent',
        cursor: item.disabled ? 'not-allowed' : 'pointer',
        opacity: item.disabled ? 0.5 : 1,
        color: item.danger ? 'var(--ds-dropdown-danger-color, var(--ds-color-error-500, #ef4444))' : 'inherit',
        textAlign: 'left',
        fontSize: '14px',
      }}
      onMouseEnter={(e) => {
        if (!item.disabled) {
          e.currentTarget.style.backgroundColor = 'var(--ds-dropdown-item-hover-bg, var(--ds-color-neutral-100, #f3f4f6))';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {item.icon}
      {item.label}
    </button>
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
      style,
      overlayClassName,
      overlayStyle,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const triggerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Calculate position
    useEffect(() => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let top = rect.bottom + window.scrollY + 4;
        let left = rect.left + window.scrollX;

        if (placement?.includes('top')) {
          top = rect.top + window.scrollY - 4;
        }
        if (placement?.includes('Right')) {
          left = rect.right + window.scrollX;
        }

        setPosition({ top, left });
      }
    }, [isOpen, placement]);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          menuRef.current &&
          !menuRef.current.contains(target)
        ) {
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

    const menuContent = isOpen && menu?.items && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={menuRef}
          role="menu"
          className={overlayClassName}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 'var(--ds-dropdown-z-index, 1050)' as unknown as number,
            minWidth: 'var(--ds-dropdown-min-width, 160px)',
            backgroundColor: 'var(--ds-dropdown-bg, #fff)',
            borderRadius: 'var(--ds-dropdown-radius, 8px)',
            boxShadow: 'var(--ds-dropdown-shadow, 0 4px 12px rgba(0, 0, 0, 0.15))',
            padding: '4px 0',
            transform: placement?.includes('top') ? 'translateY(-100%)' : undefined,
            ...overlayStyle,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {menu.items.map((item) => (
            <MenuItem key={item.key} item={item} onClick={handleItemClick} />
          ))}
        </div>,
        document.body
      )
    ) : null;

    return (
      <>
        <div
          ref={(node) => {
            (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className={className}
          style={{ display: 'inline-block', ...style }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
        >
          {children}
        </div>
        {menuContent}
      </>
    );
  }
);

Dropdown.displayName = 'Dropdown.Apollo';

export default Dropdown;
