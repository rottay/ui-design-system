'use client';

/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the Dropdown overlay component.
 * Uses inline CSS and the shared overlay positioning runtime
 * (`runtime/overlay/positioning`) for placement.
 *
 * Positioning: `useOverlayPosition` resolves the strategy per instance. The
 * `anchor-css` branch renders the menu inline and promotes it to the top layer
 * (popover + CSS anchor positioning); the `js` branch renders it through the
 * shared overlay portal at a measured fixed position. The trigger wrapper is
 * the anchor; the menu stamps `data-ds-position-strategy` for e2e/debug
 * observability.
 *
 * The menu keeps the `rottay-dropdown--rustic` scope class plus its
 * `data-part`/`data-placement`/`data-open` attributes so the unlayered rustic
 * dropdown skin (surface chrome + the `:hover` item background) still paints.
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
import type { DropdownProps, DropdownMenuItem, DropdownPlacement } from '../../contracts';
import { DROPDOWN_DEFAULTS } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
  type OverlayPlacement,
} from '../../../../runtime/overlay/positioning';

/**
 * The gap kept between the trigger and the menu. Transcribed from the legacy
 * measured placement (`rect.bottom + 4` / `rect.top - 4`); preserved so the
 * shared runtime renders the same 4px offset.
 */
const MENU_OFFSET = 4;

/**
 * Maps the Dropdown placement vocabulary onto the overlay runtime's
 * side-align vocabulary, reproducing the legacy rustic alignment exactly:
 * the bare and `*Left` values align the menu's near edge to the trigger's
 * left edge (`-start`); the `*Right` values align to the right edge (`-end`).
 */
const PLACEMENT_MAP: Record<DropdownPlacement, OverlayPlacement> = {
  top: 'top-start',
  topLeft: 'top-start',
  topRight: 'top-end',
  bottom: 'bottom-start',
  bottomLeft: 'bottom-start',
  bottomRight: 'bottom-end',
};

// Renders a single menu item, divider, or group header. Uses role="separator"
// for dividers per WAI-ARIA menu pattern. Resting chrome and the `:hover`
// background come from the unlayered rustic dropdown skin, keyed on the
// panel's scope class plus these `data-part`/`data-disabled` attributes.
const MenuItem: React.FC<{
  item: DropdownMenuItem;
  onClick?: (key: string) => void;
}> = ({ item, onClick }) => {
  if (item.type === 'divider') {
    return (
      <div
        role="separator"
        data-part="divider"
        style={{
          height: '1px',
          margin: '4px 0',
        }}
      />
    );
  }

  if (item.type === 'group') {
    return (
      <div
        data-part="group-label"
        style={{
          padding: '4px 12px',
          fontSize: '12px',
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
      data-part="item"
      data-tone={item.danger ? 'danger' : undefined}
      data-disabled={item.disabled ? 'true' : undefined}
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
        cursor: item.disabled ? 'not-allowed' : 'pointer',
        opacity: item.disabled ? 0.5 : 1,
        textAlign: 'left',
        fontSize: '14px',
      }}
    >
      {item.icon}
      {item.label}
    </button>
  );
};

/**
 * Dropdown implementation using pure inline CSS and the shared overlay
 * positioning runtime.
 *
 * The menu positions against the trigger through `useOverlayPosition`: the
 * `js` branch renders it through the shared overlay portal (escaping any
 * ancestor stacking context) at a measured fixed position; the `anchor-css`
 * branch renders it inline in the top layer. Supports controlled/uncontrolled
 * open state, three trigger modes (click, hover, contextMenu), and vertical/
 * horizontal placement via the shared placement prop.
 *
 * @param props - {@link DropdownProps} shared across all engines.
 * @returns A ref-forwarded inline-block trigger plus the positioned menu.
 */
export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (props, ref) => {
    const {
      menu,
      trigger = DROPDOWN_DEFAULTS.trigger,
      placement = DROPDOWN_DEFAULTS.placement as DropdownPlacement,
      open: controlledOpen,
      onOpenChange,
      disabled,
      children,
      className,
      style,
      overlayClassName,
      overlayStyle,
      autoAdjustOverflow,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    // The trigger wrapper is the anchor; the menu is the positioned overlay.
    // Both are tracked as state so the positioning runtime re-resolves when
    // the elements attach. The refs mirror that state for the click-outside
    // containment check, which needs the live node regardless of portalling.
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    // The inline top-layer menu must not join server markup, and the portal
    // needs a client container; gate both render paths on mount.
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
      triggerRef.current = node;
      setAnchorEl(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }, [ref]);

    const setMenuNodeRef = useCallback((node: HTMLDivElement | null) => {
      menuRef.current = node;
      setMenuEl(node);
    }, []);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // The menu element only exists while open, so element presence drives the
    // positioning lifecycle. `flip` honors the `autoAdjustOverflow` prop
    // (default on) -- the runtime reflows to the opposite side on overflow.
    const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
      anchor: anchorEl,
      overlay: menuEl,
      placement: PLACEMENT_MAP[placement],
      offset: MENU_OFFSET,
      flip: autoAdjustOverflow !== false,
    });

    // Close when clicking outside both the trigger and the (portalled) menu.
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

    const menuNode = (
      <div
        ref={setMenuNodeRef}
        role="menu"
        data-part="surface"
        data-open="true"
        data-placement={placement}
        data-ds-position-strategy={strategy}
        className={`rottay-dropdown--rustic ${overlayClassName || ''}`}
        style={{
          zIndex: 'var(--ds-dropdown-z-index, 1050)' as unknown as number,
          minWidth: 'var(--ds-dropdown-min-width, 160px)',
          padding: '4px 0',
          ...overlayStyle,
          // Positioning keys win over surface + consumer styles.
          ...positionStyle,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {menu?.items?.map((item) => (
          <MenuItem key={item.key} item={item} onClick={handleItemClick} />
        ))}
      </div>
    );

    const menuContent = isOpen && menu?.items && mounted
      ? strategy === 'anchor-css'
        ? menuNode
        : (
          <Portal>
            <OverlayPortalBoundary>{menuNode}</OverlayPortalBoundary>
          </Portal>
        )
      : null;

    return (
      <>
        <div
          ref={setTriggerRef}
          data-part="trigger"
          data-open={isOpen ? 'true' : 'false'}
          className={className}
          style={{ display: 'inline-block', ...style }}
          {...anchorAttrs}
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
