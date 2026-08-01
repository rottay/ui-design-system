/**
 * @fileoverview Menu Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Menu component.
 * Part of the Rottay Design System's multi-engine architecture.
 *
 * @remarks
 * The engine stamps anatomy (`data-part` hooks), hierarchy (`data-level` +
 * the `--rottay-menu-level`/`--rottay-menu-inline-indent` custom-property
 * data channel — configuration, not paint) and interaction state
 * (`data-selected`, `data-open`, `data-disabled`, `data-tone`); the modern
 * skin (`modern/skin/menu.css`) owns 100% of layout and paint. No inline
 * style objects beyond the two custom properties, no DaisyUI classes, no
 * Tailwind utilities. The `BaseComponentProps` passthrough (id / aria-* /
 * data-* / data-testid + the caller-owned `data-part` hook, P-79) spreads on
 * the root BEFORE the engine's stamps so the skin contract always lands last.
 *
 * Keyboard contract (owned by the shared roving-focus kernel): the menu is a
 * SINGLE tab stop. The K3-B model — every enabled row its own tab stop — made
 * Tab walk the whole menu, which `role="menu"` forbids; the panels here are
 * inline `role="group"` children of one menu rather than separate popups, so
 * all visible enabled rows form ONE roving collection in semantic order and
 * exactly one of them is tabbable. Enter/Space activates. Orientation-aware
 * arrows move focus with wrap-around (vertical/inline: Up/Down; horizontal:
 * Left/Right, mirrored under RTL by the kernel's logical mapping, never by a
 * key-name flip here), Home/End jump to the first/last row, the forward arrow
 * on a closed submenu trigger opens it (vertical: Right in LTR / Left in RTL;
 * horizontal: Down) and the back arrow closes an open trigger or, on a row
 * nested inside a panel, returns focus to the parent trigger. Focus stays
 * on the trigger when a submenu opens (inline disclosure, not a popup).
 * Typeahead is NOT implemented: the contract declares no axis for it (see
 * the batch-33 ficha).
 *
 * @example
 * ```tsx
 * import { Menu } from '@rottay/design-system';
 *
 * // Use Modern engine explicitly
 * <Menu
 *   engine="modern"
 *   items={menuItems}
 *   mode="vertical"
 *   theme="light"
 * />
 *
 * // Or via EngineProvider
 * <EngineProvider engine="modern">
 *   <Menu items={menuItems} mode="horizontal" />
 * </EngineProvider>
 * ```
 *
 * @see {@link MenuProps} for prop documentation
 * @see {@link Menu} for main component
 *
 * @module Menu/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { MenuProps, MenuItem as MenuItemInterface, MenuSelectInfo, MenuClickInfo } from '../../contracts';
import { MENU_DEFAULTS } from '../../contracts';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import {
  resolveNavigationIntent,
  resolveNavigationTarget,
  resolveReadingDirectionIsRtl,
  useRovingFocus,
  type CollectionOrientation,
  type RovingFocus,
} from '@/ui/primitives/runtime/collection/roving-focus';

// ============================================================================
// Render context
// ============================================================================

/**
 * Everything the recursive renderer needs, carried as one owner instead of a
 * positional parameter list that grows with each contract axis.
 */
interface MenuRenderContext {
  onItemClick: (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => void;
  onSubmenuToggle: (key: string, nextOpen: boolean) => void;
  selectedKeys: string[];
  openKeys: string[];
  inlineIndent: number;
  expandIcon?: React.ReactNode;
  roving: RovingFocus;
  /**
   * The axis the submenu disclosure owns: always the CROSS axis of the menu,
   * so the kernel and the disclosure can never claim the same key.
   */
  disclosureAxis: CollectionOrientation;
}

/**
 * The rows a keyboard user can reach, in semantic order — derived from the
 * item tree and `openKeys` rather than from a DOM query, so the collection is
 * known during render. Closed submenus contribute nothing because their panels
 * do not mount; group panels always do.
 */
function collectNavigableRows(
  items: MenuItemInterface[],
  openKeys: string[]
): { ids: string[]; disabledIds: string[] } {
  const ids: string[] = [];
  const disabledIds: string[] = [];

  const walk = (nodes: MenuItemInterface[]): void => {
    for (const node of nodes) {
      if (node.type === 'divider') {
        continue;
      }

      if (node.type === 'group') {
        if (node.children) walk(node.children);
        continue;
      }

      ids.push(node.key);
      if (node.disabled) {
        disabledIds.push(node.key);
      }

      if (node.children && node.children.length > 0 && openKeys.includes(node.key)) {
        walk(node.children);
      }
    }
  };

  walk(items);

  return { ids, disabledIds };
}

// ============================================================================
// Hierarchy data channel (custom properties are configuration, never paint)
// ============================================================================

/**
 * The per-item nesting data the skin's indentation calc reads. Custom
 * properties carry NO paint property (background/border/color/shadow), so
 * this is the one sanctioned inline channel (the Watermark/Stories
 * precedent): the level is runtime data CSS cannot derive.
 */
function getLevelStyleVars(level: number, inlineIndent: number): CSSProperties {
  return {
    ['--rottay-menu-level' as string]: String(level),
    ['--rottay-menu-inline-indent' as string]: `${inlineIndent}px`,
  };
}

// ============================================================================
// MenuItemRow Component
// ============================================================================

/**
 * A single menu item row. The skin paints hover/active/focus/danger/disabled
 * from the data hooks; the engine only stamps them.
 */
function MenuItemRow({
  item,
  isSelected,
  level,
  parentKey,
  context,
}: {
  item: MenuItemInterface;
  isSelected: boolean;
  level: number;
  parentKey?: string;
  context: MenuRenderContext;
}) {
  const isChild = level > 0;
  const { onItemClick, inlineIndent, roving, disclosureAxis } = context;
  const rovingProps = roving.getItemProps(item.key);

  return (
    <li key={item.key} data-part="row" role="none">
      <a
        role="menuitem"
        data-part="item"
        data-selected={isSelected}
        data-disabled={item.disabled || undefined}
        data-tone={item.danger ? 'danger' : undefined}
        data-level={isChild ? 'child' : 'top'}
        ref={rovingProps.ref}
        tabIndex={rovingProps.tabIndex}
        onFocus={rovingProps.onFocus}
        style={getLevelStyleVars(level, inlineIndent)}
        aria-disabled={item.disabled || undefined}
        aria-current={isSelected ? 'page' : undefined}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
            e.preventDefault();
            onItemClick(item.key, [item.key], e as unknown as React.MouseEvent<HTMLElement>);
            return;
          }

          // Cross-axis back key: a row inside a panel returns focus to its
          // parent trigger. The panel stays open — inline disclosure.
          if (
            parentKey &&
            resolveNavigationIntent(e.key, {
              orientation: disclosureAxis,
              rtl: roving.resolveIsRtl(e.currentTarget),
            }) === 'previous'
          ) {
            e.preventDefault();
            roving.setActive(parentKey, { focus: true });
            return;
          }

          rovingProps.onKeyDown(e);
        }}
        onClick={(e) => {
          e.preventDefault();
          if (!item.disabled) {
            onItemClick(item.key, [item.key], e as React.MouseEvent<HTMLElement>);
          }
        }}
      >
        {item.icon && <span data-part="icon">{item.icon}</span>}
        <span data-part="label">{item.label}</span>
      </a>
    </li>
  );
}

// ============================================================================
// SubmenuRow Component
// ============================================================================

/**
 * A submenu row with a fully controlled inline disclosure: the trigger is a
 * `div[role="menuitem"]` with `aria-expanded` (a `<summary>` computes as a
 * button, which is an unallowed owned child of `role="menu"` — axe
 * `aria-required-children`), and the group panel only mounts while open so
 * closed submenus never leak items into the accessibility tree.
 */
function SubmenuRow({
  item,
  level,
  isOpen,
  parentKey,
  context,
}: {
  item: MenuItemInterface;
  level: number;
  isOpen: boolean;
  parentKey?: string;
  context: MenuRenderContext;
}) {
  const { onSubmenuToggle, selectedKeys, inlineIndent, expandIcon, roving, disclosureAxis } = context;
  const rovingProps = roving.getItemProps(item.key);
  const hadSelectedDescendantRef = useRef(false);

  const hasSelectedDescendant =
    item.children?.some(function hasSelected(child) {
      if (selectedKeys.includes(child.key)) {
        return true;
      }

      return child.children?.some(hasSelected) ?? false;
    }) ?? false;

  useEffect(() => {
    if (hasSelectedDescendant && !hadSelectedDescendantRef.current && !isOpen) {
      onSubmenuToggle(item.key, true);
    }
    hadSelectedDescendantRef.current = hasSelectedDescendant;
  }, [hasSelectedDescendant, isOpen, item.key, onSubmenuToggle]);

  return (
    <li key={item.key} data-part="row" role="none">
      <div
        style={getLevelStyleVars(level, inlineIndent)}
        data-part="trigger"
        role="menuitem"
        data-disabled={item.disabled || undefined}
        data-level={level > 0 ? 'child' : 'top'}
        ref={rovingProps.ref}
        tabIndex={rovingProps.tabIndex}
        onFocus={rovingProps.onFocus}
        aria-disabled={item.disabled || undefined}
        aria-expanded={isOpen}
        data-open={isOpen ? 'true' : undefined}
        data-selected-descendant={hasSelectedDescendant ? 'true' : undefined}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
            e.preventDefault();
            onSubmenuToggle(item.key, !isOpen);
            return;
          }

          // APG disclosure arrows, resolved on the CROSS axis so the kernel
          // and the disclosure never claim the same key: forward opens a
          // closed submenu (vertical: Right in LTR / Left in RTL; horizontal
          // menubar: Down), back closes an open one, and on a closed nested
          // trigger back returns focus to the parent trigger. Focus stays on
          // the trigger when a submenu opens — inline disclosure, not a popup
          // handoff. The direction comes from the collection's single
          // capture, never from a key-name flip here.
          const disclosure = resolveNavigationIntent(e.key, {
            orientation: disclosureAxis,
            rtl: roving.resolveIsRtl(e.currentTarget),
          });

          if (!item.disabled) {
            if (disclosure === 'next' && !isOpen) {
              e.preventDefault();
              onSubmenuToggle(item.key, true);
              return;
            }

            if (disclosure === 'previous') {
              if (isOpen) {
                e.preventDefault();
                onSubmenuToggle(item.key, false);
                return;
              }

              if (parentKey) {
                e.preventDefault();
                roving.setActive(parentKey, { focus: true });
                return;
              }
            }
          }

          rovingProps.onKeyDown(e);
        }}
        onClick={(e) => {
          e.preventDefault();
          if (!item.disabled) {
            onSubmenuToggle(item.key, !isOpen);
          }
        }}
      >
        {item.icon && <span data-part="icon">{item.icon}</span>}
        <span data-part="label">{item.label}</span>
        {/* Directional disclosure icon (the contract's `expandIcon` axis
            overrides the governed default chevron; the skin rotates the
            wrapper either way) */}
        <span data-part="arrow-icon" aria-hidden="true">
          {expandIcon ?? <NavigationForwardIcon decorative size={12} />}
        </span>
      </div>
      {isOpen && (
        <ul role="group" data-part="panel">
          {renderModernMenuItems(item.children || [], context, level + 1, item.key)}
        </ul>
      )}
    </li>
  );
}

// ============================================================================
// Render Helper
// ============================================================================

/**
 * Renders menu items recursively for the modern skin.
 *
 * @param items - Array of menu item configurations
 * @param context - Shared render context (callbacks, state, roving collection)
 * @param level - Current nesting level
 * @param parentKey - Key of the enclosing submenu trigger, for the back key.
 *   A group is presentational and passes its own parent through.
 * @returns Rendered menu item nodes
 *
 * @internal
 */
function renderModernMenuItems(
  items: MenuItemInterface[],
  context: MenuRenderContext,
  level: number = 0,
  parentKey?: string
): React.ReactNode {
  return items.map((item) => {
    // Divider
    if (item.type === 'divider') {
      return <li key={item.key} data-part="divider" role="separator" />;
    }

    // Group
    if (item.type === 'group') {
      return (
        <li key={item.key} data-part="group" role="presentation">
          <div data-part="group-label">{item.title || item.label}</div>
          {item.children && (
            <ul role="group" data-part="panel">
              {renderModernMenuItems(item.children, context, level + 1, parentKey)}
            </ul>
          )}
        </li>
      );
    }

    // Submenu with children
    if (item.children && item.children.length > 0) {
      return (
        <SubmenuRow
          key={item.key}
          item={item}
          level={level}
          isOpen={context.openKeys.includes(item.key)}
          parentKey={parentKey}
          context={context}
        />
      );
    }

    // Regular leaf item
    return (
      <MenuItemRow
        key={item.key}
        item={item}
        isSelected={context.selectedKeys.includes(item.key)}
        level={level}
        parentKey={parentKey}
        context={context}
      />
    );
  });
}

// ============================================================================
// ModernMenu Component
// ============================================================================

/**
 * Token-driven implementation of the Menu component.
 *
 * @description
 * Renders the Menu component using design-system tokens and the modern skin
 * for a Linear/Vercel-quality sidebar navigation experience.
 *
 * @remarks
 * - Uses DS color tokens (--ds-color-primary, --ds-color-error, --ds-color-text-*)
 * - Fully framed active items without decorative side rails
 * - Layered hover/focus states with smooth transitions
 * - Proper hierarchy with indented child items (logical properties, RTL-safe)
 * - Danger and disabled treatments
 * - Keyboard accessible with focus-visible ring
 *
 * @param props - {@link MenuProps}
 * @returns Rendered ModernMenu component
 *
 * @example
 * ```tsx
 * <ModernMenu
 *   items={menuItems}
 *   mode="horizontal"
 *   selectedKeys={['dashboard']}
 *   onSelect={handleSelect}
 * />
 * ```
 */
export default function ModernMenu(props: MenuProps): React.ReactElement {
  const {
    items,
    mode = MENU_DEFAULTS.mode,
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys = [],
    openKeys: controlledOpenKeys,
    defaultOpenKeys = [],
    multiple = MENU_DEFAULTS.multiple,
    selectable = MENU_DEFAULTS.selectable,
    inlineCollapsed = MENU_DEFAULTS.inlineCollapsed,
    onSelect,
    onClick,
    onOpenChange,
    theme = MENU_DEFAULTS.theme,
    children,
    className = '',
    style,
    inlineIndent = MENU_DEFAULTS.inlineIndent,
    expandIcon,
    'data-part': dataPart,
    engine: _engine,
    // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to
    // the root element. It spreads BEFORE the engine's own stamps so the
    // skin and keyboard contracts (data-part default, role, aria-orientation,
    // data-mode/data-collapsed/data-has-selection) always land last (the Card
    // modern idiom; contracts promise BaseComponentProps pass-through).
    ...rest
  } = props;

  // ========================================================================
  // State Management
  // ========================================================================

  /** Internal state for uncontrolled selection mode */
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);

  /** Internal state for uncontrolled submenu expansion mode */
  const [internalOpenKeys, setInternalOpenKeys] = useState<string[]>(defaultOpenKeys);

  /** Use controlled or uncontrolled state */
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
  const openKeys = controlledOpenKeys ?? internalOpenKeys;

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles submenu expansion state.
   * Keeps the modern engine aligned with the Menu openKeys contract.
   */
  const handleSubmenuToggle = useCallback(
    (key: string, nextOpen: boolean) => {
      const alreadyOpen = openKeys.includes(key);

      if ((nextOpen && alreadyOpen) || (!nextOpen && !alreadyOpen)) {
        return;
      }

      const nextOpenKeys = nextOpen ? [...openKeys, key] : openKeys.filter((openKey) => openKey !== key);

      if (controlledOpenKeys === undefined) {
        setInternalOpenKeys(nextOpenKeys);
      }

      onOpenChange?.(nextOpenKeys);
    },
    [openKeys, controlledOpenKeys, onOpenChange]
  );

  /**
   * Handles menu item click events.
   * Manages selection state and triggers callbacks.
   */
  const handleItemClick = useCallback(
    (key: string, keyPath: string[], e: React.MouseEvent<HTMLElement>) => {
      // Fire click callback first
      const clickInfo: MenuClickInfo = {
        key,
        keyPath,
        domEvent: e,
      };
      onClick?.(clickInfo);

      // Handle selection if selectable
      if (selectable) {
        let newSelectedKeys: string[];

        if (multiple) {
          newSelectedKeys = selectedKeys.includes(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key];
        } else {
          newSelectedKeys = [key];
        }

        // Only update internal state when running in uncontrolled mode
        if (controlledSelectedKeys === undefined) {
          setInternalSelectedKeys(newSelectedKeys);
        }

        const selectInfo: MenuSelectInfo = {
          key,
          selectedKeys: newSelectedKeys,
          keyPath,
        };
        onSelect?.(selectInfo);
      }
    },
    [selectedKeys, multiple, selectable, controlledSelectedKeys, onClick, onSelect]
  );

  // ========================================================================
  // Keyboard Navigation (roving collection owned by the shared kernel)
  // ========================================================================

  /** The axis the menu itself navigates; the disclosure takes the other one. */
  const orientation: CollectionOrientation = mode === 'horizontal' ? 'horizontal' : 'vertical';
  const disclosureAxis: CollectionOrientation = mode === 'horizontal' ? 'vertical' : 'horizontal';

  const navigableRows = collectNavigableRows(items ?? [], openKeys);

  const roving = useRovingFocus({
    ids: navigableRows.ids,
    orientation,
    disabledIds: navigableRows.disabledIds,
  });

  /**
   * COMPOUND-PATH LAW: rows passed as `children` belong to the compound
   * components, which stamp their own tab model, so the engine cannot register
   * them with the kernel and reads the collection from the DOM here instead.
   * The DECISION model stays the kernel's (key → intent → target), so this
   * path never opens a second reading-direction model. It is attached only
   * when the engine is not rendering `items`.
   */
  const handleCompoundKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      const root = e.currentTarget;
      const row = (e.target as HTMLElement).closest("[data-part='item'], [data-part='trigger']");
      if (!row || !root.contains(row)) return;

      const rtl = resolveReadingDirectionIsRtl(root);
      const intent = resolveNavigationIntent(e.key, { orientation, rtl });

      if (intent === null) {
        // Cross-axis back key: a panel row returns focus to its parent trigger.
        if (resolveNavigationIntent(e.key, { orientation: disclosureAxis, rtl }) !== 'previous') {
          return;
        }

        const parentTrigger = row
          .closest("[data-part='panel']")
          ?.parentElement?.querySelector(
            ":scope > [data-part='trigger']:not([data-disabled])"
          ) as HTMLElement | null;
        if (!parentTrigger) return;

        e.preventDefault();
        parentTrigger.focus();
        return;
      }

      const rows = Array.from(
        root.querySelectorAll(
          "[data-part='item']:not([data-disabled]), [data-part='trigger']:not([data-disabled])"
        )
      ) as HTMLElement[];
      const index = rows.indexOf(row as HTMLElement);
      if (index === -1) return;

      e.preventDefault();
      rows[resolveNavigationTarget(intent, { index, length: rows.length, wrap: true })]?.focus();
    },
    [orientation, disclosureAxis]
  );

  // ========================================================================
  // Render
  // ========================================================================

  const renderContext: MenuRenderContext = {
    onItemClick: handleItemClick,
    onSubmenuToggle: handleSubmenuToggle,
    selectedKeys,
    openKeys,
    inlineIndent,
    expandIcon,
    roving,
    disclosureAxis,
  };

  return (
    <ul
      {...rest}
      className={`rottay-menu rottay-menu--modern rottay-menu--${theme} ${className}`.trim()}
      style={style}
      role="menu"
      aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
      data-part={dataPart ?? 'root'}
      data-mode={mode}
      data-collapsed={inlineCollapsed || undefined}
      data-has-selection={selectedKeys.length > 0 || undefined}
      onKeyDown={items ? undefined : handleCompoundKeyDown}
    >
      {items ? renderModernMenuItems(items, renderContext) : children}
    </ul>
  );
}

ModernMenu.displayName = 'ModernMenu';
