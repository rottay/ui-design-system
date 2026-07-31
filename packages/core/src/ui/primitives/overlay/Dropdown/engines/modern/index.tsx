'use client';

/**
 * Modern Dropdown engine.
 *
 * The engine is deliberately independent from utility-framework and DaisyUI
 * classes. Its public visual contract is the `data-part` / `data-*` anatomy
 * painted by the Modern skin, so brand and tenant tokens remain the only
 * source of visual tenor.
 */
import React, {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { DropdownProps, DropdownMenuItem, DropdownPlacement } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { DROPDOWN_DEFAULTS } from '../../contracts';
import { usePresence } from '@/graphics/motion/react/runtime';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';

const MOTION_DURATION = 'var(--ds-motion-fast)';
const MOTION_EASING = 'var(--ds-motion-ease-out)';
const SURFACE_GAP = 8;

/**
 * Measured popup geometry in PHYSICAL host-content coordinates.
 *
 * Portal geometry is computed from getBoundingClientRect (viewport space) and
 * is therefore physical in the same sense as the block-axis `top`: it is
 * measured, not declared. Placement SEMANTICS stay logical -- `*Left`/`*Right`
 * mirror under `dir="rtl"` inside updatePortalPosition -- while the in-tree
 * fallback below declares logical `inset-inline-*` properties so the browser
 * mirrors it for free.
 */
type PopupPosition = { top: number; left: number };

/**
 * In-tree (non-portal) placement, declared with LOGICAL inline properties:
 * `*Left` anchors the reading-start edge and mirrors to the physical right
 * under `dir="rtl"` (and vice versa). The centred variant keeps physical
 * `left: 50%` + `translate: -50% 0` -- centring is direction-neutral, and a
 * logical `inset-inline-start: 50%` would misplace the surface in RTL because
 * the -50% self-translate does not mirror.
 */
function inTreePlacementStyle(placement: DropdownPlacement): React.CSSProperties {
  const isTop = placement.startsWith('top');
  const isRight = placement.endsWith('Right');
  const isLeft = placement.endsWith('Left');

  return {
    ...(isTop
      ? { bottom: `calc(100% + ${SURFACE_GAP}px)` }
      : { top: `calc(100% + ${SURFACE_GAP}px)` }),
    ...(isRight
      ? { insetInlineEnd: 0 }
      : isLeft
        ? { insetInlineStart: 0 }
        : { left: '50%', translate: '-50% 0' }),
  };
}

/**
 * Logical reading direction of the trigger context (nearest `[dir]` owner,
 * falling back to the computed style). Popover's readLocaleContext precedent.
 */
function readTriggerDirection(anchor: HTMLElement): 'ltr' | 'rtl' {
  const directionOwner = anchor.closest<HTMLElement>('[dir]');
  if (directionOwner?.dir === 'rtl') return 'rtl';
  return window.getComputedStyle(anchor).direction === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * Stamp the menu-button disclosure semantics on the consumer's trigger
 * ELEMENT (Popover's describeTrigger precedent). A role-less wrapper span
 * may not carry `aria-haspopup`/`aria-expanded` (axe `aria-allowed-attr`,
 * critical), so the attributes are cloned onto the child where a compatible
 * role lives. Non-element children (text nodes, fragments) receive nothing:
 * there is no valid host for them.
 */
function describeTrigger(
  children: ReactNode,
  surfaceId: string,
  open: boolean,
  disabled: boolean,
): ReactNode {
  if (!isValidElement(children) || children.type === React.Fragment) {
    return children;
  }

  return cloneElement(
    children as ReactElement<{
      'aria-controls'?: string;
      'aria-expanded'?: boolean;
      'aria-haspopup'?: 'menu';
      'aria-disabled'?: boolean;
    }>,
    {
      'aria-controls': surfaceId,
      'aria-expanded': open,
      'aria-haspopup': 'menu',
      'aria-disabled': disabled || undefined,
    },
  );
}

/**
 * APG menu keyboard contract for one menu level: ArrowUp/ArrowDown cycle the
 * enabled items of THIS <ul> (wrapping), Home/End jump to the edges. Events
 * bubbling out of a nested submenu are ignored by the ancestor handler (the
 * target's closest role="menu" is the nested list), so each level navigates
 * its own items. Items stay natively tabbable buttons; this adds directional
 * movement without changing the tab order.
 */
function handleMenuKeyDown(event: React.KeyboardEvent<HTMLUListElement>): void {
  const { key } = event;
  if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
  const menu = event.currentTarget;
  const target = event.target as HTMLElement | null;
  if (!target || target.closest('[role="menu"]') !== menu) return;
  const items = Array.from(
    menu.querySelectorAll<HTMLElement>(
      ':scope > [data-part="item-shell"] > [data-part="item"]:not(:disabled)',
    ),
  );
  if (items.length === 0) return;
  event.preventDefault();
  const currentIndex = items.indexOf(target.closest('[data-part="item"]') as HTMLElement);
  let nextIndex = 0;
  if (key === 'Home') nextIndex = 0;
  else if (key === 'End') nextIndex = items.length - 1;
  else if (currentIndex >= 0) {
    nextIndex = (currentIndex + (key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
  }
  items[nextIndex]?.focus();
}

const MenuItem: React.FC<{
  item: DropdownMenuItem;
  selectedKeys: string[];
  selectable: boolean;
  onClick: (key: string) => void;
  depth?: number;
}> = ({ item, selectedKeys, selectable, onClick, depth = 0 }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);

  if (item.type === 'divider') {
    return <li role="separator" data-part="divider" data-depth={depth} />;
  }

  if (item.type === 'group') {
    return (
      <li role="presentation" data-part="group-label" data-depth={depth}>
        <span>{item.label}</span>
      </li>
    );
  }

  const hasChildren = Boolean(item.children?.length);
  const isSelected = selectable && selectedKeys.includes(item.key);

  const activate = () => {
    if (item.disabled) return;
    if (hasChildren) {
      setSubmenuOpen((current) => !current);
      return;
    }
    item.onClick?.();
    onClick(item.key);
  };

  return (
    <li
      role="none"
      data-part="item-shell"
      data-depth={depth}
      data-has-children={hasChildren ? 'true' : undefined}
      data-submenu-open={submenuOpen ? 'true' : undefined}
      onMouseEnter={() => hasChildren && setSubmenuOpen(true)}
      onMouseLeave={() => hasChildren && setSubmenuOpen(false)}
    >
      <button
        type="button"
        role="menuitem"
        data-part="item"
        data-tone={item.danger ? 'danger' : 'neutral'}
        data-disabled={item.disabled ? 'true' : undefined}
        data-selected={isSelected ? 'true' : undefined}
        aria-disabled={item.disabled || undefined}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        aria-expanded={hasChildren ? submenuOpen : undefined}
        disabled={item.disabled}
        onClick={(event) => {
          event.stopPropagation();
          activate();
        }}
        onKeyDown={(event) => {
          // Submenu keys are LOGICAL: forward opens, backward closes. Forward
          // is ArrowRight in LTR and ArrowLeft in RTL (Tabs precedent), so the
          // reading direction is resolved from the item's context -- nearest
          // `[dir]` owner first (Popover precedent), computed style as a
          // fallback.
          const isRtl =
            event.currentTarget.closest<HTMLElement>('[dir]')?.dir === 'rtl' ||
            window.getComputedStyle(event.currentTarget).direction === 'rtl';
          const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
          const backwardKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
          if (event.key === forwardKey && hasChildren) {
            event.preventDefault();
            setSubmenuOpen(true);
          }
          if (event.key === backwardKey && hasChildren) {
            event.preventDefault();
            setSubmenuOpen(false);
          }
          if (event.key === 'Escape' && hasChildren) {
            event.stopPropagation();
            setSubmenuOpen(false);
          }
        }}
      >
        <span data-part="selection-indicator" aria-hidden="true">
          {isSelected ? <StatusSuccessIcon decorative size={13} /> : null}
        </span>
        {item.icon ? <span data-part="icon">{item.icon}</span> : null}
        <span data-part="label">{item.label}</span>
        {hasChildren ? (
          <span data-part="submenu-indicator" aria-hidden="true">
            <NavigationForwardIcon decorative size={12} />
          </span>
        ) : null}
      </button>

      {hasChildren && submenuOpen ? (
        <ul role="menu" data-part="submenu" aria-orientation="vertical" onKeyDown={handleMenuKeyDown}>
          {item.children?.map((child) => (
            <MenuItem
              key={child.key}
              item={child}
              selectedKeys={selectedKeys}
              selectable={selectable}
              onClick={onClick}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>((props, forwardedRef) => {
  const {
    menu,
    trigger = DROPDOWN_DEFAULTS.trigger,
    placement = DROPDOWN_DEFAULTS.placement ?? 'bottomLeft',
    open: controlledOpen,
    onOpenChange,
    disabled = false,
    children,
    arrow = false,
    autoAdjustOverflow = true,
    className,
    style,
    overlayClassName,
    overlayStyle,
    getPopupContainer,
  } = props;

  const [internalOpen, setInternalOpen] = useState(false);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const hasItems = Boolean(menu?.items?.length);
  const containerRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { shouldRender, dataState, ref: presenceRef } = usePresence(isOpen && hasItems);
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  // Links the consumer's trigger element to the surface (aria-controls).
  const surfaceId = useId();

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  // Tracked as STATE, not only as a ref: the surface is measured to place it,
  // and inside `<Portal>` it mounts one commit after `portalHost` resolves.
  // A ref alone cannot re-trigger the positioning effect when that happens, so
  // the effect would run against a surface that does not exist yet, bail, and
  // leave the menu parked at `visibility: hidden`. Same posture Popover, Select
  // and Tour already use for their measured surfaces.
  const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);
  const setSurfaceRef = useCallback((node: HTMLDivElement | null) => {
    surfaceRef.current = node;
    setSurfaceEl(node);
    presenceRef(node);
  }, [presenceRef]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (disabled && nextOpen) return;
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [disabled, isControlled, onOpenChange]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleHoverClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => handleOpenChange(false), 110);
  }, [clearCloseTimer, handleOpenChange]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    if (!shouldRender || !getPopupContainer || !containerRef.current) {
      setPortalHost(null);
      return;
    }
    setPortalHost(getPopupContainer(containerRef.current));
  }, [getPopupContainer, shouldRender]);

  const updatePortalPosition = useCallback(() => {
    if (!portalHost || !containerRef.current || !surfaceRef.current) return;

    const triggerRect = containerRef.current.getBoundingClientRect();
    const hostRect = portalHost.getBoundingClientRect();
    const surfaceRect = surfaceRef.current.getBoundingClientRect();
    const scrollLeft = portalHost === document.body ? window.scrollX : portalHost.scrollLeft;
    const scrollTop = portalHost === document.body ? window.scrollY : portalHost.scrollTop;
    const hostWidth = portalHost === document.body ? window.innerWidth : portalHost.clientWidth;
    const hostHeight = portalHost === document.body ? window.innerHeight : portalHost.clientHeight;
    const isTop = placement.startsWith('top');
    const isRight = placement.endsWith('Right');
    const isLeft = placement.endsWith('Left');

    // Placement semantics are LOGICAL: `*Left` aligns the surface's
    // reading-start edge with the trigger's reading-start edge. Portal
    // geometry is measured in physical viewport coordinates, so under RTL the
    // alignment mirrors (Popover's toPhysicalPlacement precedent) while the
    // stamped coordinates and the clamp below stay physical.
    const mirrorInline = readTriggerDirection(containerRef.current) === 'rtl';
    const alignPhysicalEnd = mirrorInline ? isLeft : isRight;
    const alignPhysicalStart = mirrorInline ? isRight : isLeft;

    let left = triggerRect.left - hostRect.left + scrollLeft;
    if (alignPhysicalEnd) left += triggerRect.width - surfaceRect.width;
    else if (!alignPhysicalStart) left += (triggerRect.width - surfaceRect.width) / 2;

    let top = triggerRect.bottom - hostRect.top + scrollTop + SURFACE_GAP;
    if (isTop) top = triggerRect.top - hostRect.top + scrollTop - surfaceRect.height - SURFACE_GAP;

    if (autoAdjustOverflow) {
      const minimum = SURFACE_GAP;
      const maximumLeft = Math.max(minimum, scrollLeft + hostWidth - surfaceRect.width - SURFACE_GAP);
      left = Math.min(Math.max(left, scrollLeft + minimum), maximumLeft);

      const maximumTop = Math.max(minimum, scrollTop + hostHeight - surfaceRect.height - SURFACE_GAP);
      top = Math.min(Math.max(top, scrollTop + minimum), maximumTop);
    }

    setPopupPosition({ top, left });
  }, [autoAdjustOverflow, placement, portalHost]);

  useLayoutEffect(() => {
    if (!portalHost || !shouldRender || !surfaceEl) return undefined;
    updatePortalPosition();
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updatePortalPosition)
      : null;
    if (containerRef.current) observer?.observe(containerRef.current);
    observer?.observe(surfaceEl);
    window.addEventListener('resize', updatePortalPosition);
    window.addEventListener('scroll', updatePortalPosition, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updatePortalPosition);
      window.removeEventListener('scroll', updatePortalPosition, true);
    };
  }, [portalHost, shouldRender, surfaceEl, updatePortalPosition]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !surfaceRef.current?.contains(target)) {
        handleOpenChange(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      handleOpenChange(false);
      // Premium bar: Escape returns focus to the trigger. The natural host is
      // the first focusable descendant of the trigger CONTENT (never a menu
      // item -- the in-tree surface also lives inside this container and is
      // about to unmount); the container itself is the programmatic fallback
      // (tabIndex -1 keeps it out of the tab order).
      const container = containerRef.current;
      const triggerContent = container?.querySelector<HTMLElement>('[data-part="trigger-content"]');
      const focusTarget =
        triggerContent?.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? container;
      focusTarget?.focus();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleOpenChange, isOpen]);

  const handleItemClick = (key: string) => {
    menu?.onClick?.({ key });
    handleOpenChange(false);
  };

  const surface = shouldRender ? (
    <div
      ref={setSurfaceRef}
      id={surfaceId}
      data-part="surface"
      data-state={dataState}
      data-open={dataState === 'open' ? 'true' : 'false'}
      data-placement={placement}
      data-arrow={arrow ? 'true' : undefined}
      className={['rottay-dropdown__surface', overlayClassName].filter(Boolean).join(' ')}
      style={{
        position: 'absolute',
        zIndex: 'var(--ds-z-dropdown)',
        ...(portalHost
          ? (popupPosition ?? { visibility: 'hidden' })
          : inTreePlacementStyle(placement)),
        // Direction-aware choreography: a surface opening ABOVE the trigger
        // travels from below (and exits downward), mirroring the bottom
        // placement's travel. Keyframes live in the modern skin.
        animation: `${
          dataState === 'open'
            ? placement.startsWith('top')
              ? 'ds-dropdown-popover-enter-top-modern'
              : 'ds-dropdown-popover-enter-modern'
            : placement.startsWith('top')
              ? 'ds-dropdown-popover-exit-top-modern'
              : 'ds-dropdown-popover-exit-modern'
        } ${MOTION_DURATION} ${MOTION_EASING} both`,
        ...overlayStyle,
      }}
      onClick={(event) => event.stopPropagation()}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={() => triggers.includes('hover') && scheduleHoverClose()}
    >
      {arrow ? <span data-part="arrow" aria-hidden="true" /> : null}
      <ul role="menu" data-part="menu" aria-orientation="vertical" onKeyDown={handleMenuKeyDown}>
        {menu?.items?.map((item) => (
          <MenuItem
            key={item.key}
            item={item}
            selectedKeys={menu.selectedKeys ?? []}
            selectable={Boolean(menu.selectable)}
            onClick={handleItemClick}
          />
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <div
      ref={setContainerRef}
      data-part="trigger"
      data-open={isOpen ? 'true' : 'false'}
      data-placement={placement}
      data-disabled={disabled ? 'true' : undefined}
      className={['rottay-dropdown', 'rottay-dropdown--modern', className].filter(Boolean).join(' ')}
      style={{ position: 'relative', display: 'inline-flex', ...style }}
      // Programmatic-focus fallback for the Escape contract only; -1 keeps the
      // container out of the tab order.
      tabIndex={-1}
      onClick={(event) => {
        if (disabled || surfaceRef.current?.contains(event.target as Node)) return;
        if (triggers.includes('click')) handleOpenChange(!isOpen);
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          handleOpenChange(true);
        }
        if (event.key === 'Escape') handleOpenChange(false);
      }}
      onMouseEnter={() => {
        clearCloseTimer();
        if (!disabled && triggers.includes('hover')) handleOpenChange(true);
      }}
      onMouseLeave={() => {
        if (!disabled && triggers.includes('hover')) scheduleHoverClose();
      }}
      onContextMenu={(event) => {
        if (disabled || !triggers.includes('contextMenu')) return;
        event.preventDefault();
        handleOpenChange(!isOpen);
      }}
    >
      {/* The disclosure semantics are cloned onto the consumer's trigger
          ELEMENT (describeTrigger): this role-less wrapper may not carry
          aria-haspopup/aria-expanded (axe aria-allowed-attr). */}
      <span data-part="trigger-content">
        {describeTrigger(children, surfaceId, isOpen, disabled)}
      </span>
      {/* `getPopupContainer` picks the host; it reaches the shared substrate as
          an explicit container rather than a private `createPortal`. Precedence
          then handles the rest: a host that never attached (or was detached
          since) falls back to the top-layer host / `#rottay-portal-root`
          instead of rendering the menu into a node that paints nowhere.
          Without `getPopupContainer` the surface stays in-tree, unchanged. */}
      {portalHost && surface ? <Portal container={portalHost}>{surface}</Portal> : surface}
    </div>
  );
});

Dropdown.displayName = 'Dropdown.Modern';

export default Dropdown;
