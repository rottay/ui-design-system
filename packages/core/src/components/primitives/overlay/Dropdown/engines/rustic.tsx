'use client';

/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the Dropdown overlay component.
 * Uses inline CSS with portal rendering (createPortal to document.body) for proper
 * z-index stacking, and getBoundingClientRect-based placement calculation.
 *
 * @example
 * ```tsx
 * <Dropdown engine="rustic" trigger={['click']}
 *   menu={{ items: [{ key: '1', label: 'Option' }] }}>
 *   <Button>Open Menu</Button>
 * </Dropdown>
 * ```
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { DropdownProps, DropdownMenuItem } from '../Dropdown.types';
import { DROPDOWN_DEFAULTS } from '../Dropdown.types';

// Renders a single menu item, divider, or group header. Uses role="separator"
// for dividers per WAI-ARIA menu pattern. Hover effects are applied via
// inline style mutations because the rustic engine avoids external CSS.
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

/**
 * Dropdown implementation using pure inline CSS and React portals.
 *
 * The menu is portalled to `document.body` so it escapes any ancestor stacking
 * context. Position is recalculated from the trigger's `getBoundingClientRect()`
 * every time the menu opens or placement changes. Supports controlled/uncontrolled
 * open state, three trigger modes (click, hover, contextMenu), and vertical/
 * horizontal placement via the shared placement prop.
 *
 * @param props - {@link DropdownProps} shared across all engines.
 * @returns A ref-forwarded inline-block trigger plus a portal-rendered menu.
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
      style,
      overlayClassName,
      overlayStyle,
      getPopupContainer,
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

    // Recalculate menu position from the trigger's bounding rect whenever
    // the menu opens or the placement prop changes
    useEffect(() => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let top = rect.bottom + window.scrollY + 4;
        let left = rect.left + window.scrollX;

        // Handle vertical placement
        switch (placement) {
          case 'top':
          case 'topLeft':
          case 'topRight':
            top = rect.top + window.scrollY - 4;
            break;
        }

        // Handle horizontal alignment
        switch (placement) {
          case 'topRight':
          case 'bottomRight':
            left = rect.right + window.scrollX - (menuRef.current?.offsetWidth || 0);
            break;
          case 'topLeft':
          case 'bottomLeft':
            // left already set correctly
            break;
        }

        setPosition({ top, left });
      }
    }, [isOpen, placement]);

    // Close when clicking outside both the trigger and the portal menu
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

Dropdown.displayName = 'Dropdown.Rustic';

export default Dropdown;
