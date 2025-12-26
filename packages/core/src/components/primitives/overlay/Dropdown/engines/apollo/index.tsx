'use client';

/**
 * Dropdown - Apollo Engine (Vanilla HTML/CSS)
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
          backgroundColor: '#e5e7eb',
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
          color: '#6b7280',
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
        color: item.danger ? '#ef4444' : 'inherit',
        textAlign: 'left',
        fontSize: '14px',
      }}
      onMouseEnter={(e) => {
        if (!item.disabled) {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
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
            zIndex: 1050,
            minWidth: '160px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
