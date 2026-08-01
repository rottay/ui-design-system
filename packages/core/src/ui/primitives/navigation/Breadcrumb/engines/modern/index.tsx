/**
 * @fileoverview Breadcrumb Modern Engine
 * @description Self-contained, token-driven breadcrumb navigation.
 */

'use client';

import React from 'react';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { BreadcrumbProps, BreadcrumbItem } from '../../contracts';
import { BREADCRUMB_OVERFLOW_DEFAULTS } from '../../contracts';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
// Cross-family composition goes through the primitives facade tier — never a
// sibling-direct import (Button.Icon's ModernTooltip precedent).
import { Dropdown, type DropdownMenuItem } from '../../../../facade';

/**
 * Shape shared by a collapsed `BreadcrumbItem` (hidden behind the overflow
 * trigger) and a `BreadcrumbItem.menu` entry: both map onto a
 * `DropdownMenuItem` the same way.
 */
type CollapsibleCrumb = {
  key: string;
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
};

/**
 * Maps a hidden crumb or a per-item menu entry onto the public Dropdown's
 * menu-item contract.
 *
 * @remarks
 * `DropdownMenuItem` has no `href` -- the shared Dropdown menu is click-only
 * -- so an entry with `href` still "navigates" through a synthesized handler
 * that assigns `window.location.href`. This is a full navigation, not a
 * client-side route transition. An entry that also needs SPA routing should
 * reach for `onClick` instead, the same convention the crumb's own `onClick`
 * already follows.
 */
function toDropdownMenuItem(entry: CollapsibleCrumb): DropdownMenuItem {
  return {
    key: entry.key,
    label: entry.label,
    icon: entry.icon,
    onClick: () => {
      entry.onClick?.();
      if (entry.href) {
        window.location.href = entry.href;
      }
    },
  };
}

/** One entry in the unified render sequence the `<ol>` maps over. */
type RenderSlot =
  | { type: 'item'; item: BreadcrumbItem }
  | { type: 'legacy-ellipsis' }
  | { type: 'overflow-trigger'; hidden: BreadcrumbItem[] };

/**
 * Modern breadcrumbs render their own anatomy instead of delegating visual
 * behavior to DaisyUI. This keeps separators, interaction and tenant styling
 * deterministic across applications.
 *
 * Interaction contract: items with `href` render as anchors; items with only
 * `onClick` render as real buttons (keyboard-reachable, correct role); the
 * current page and the truncation ellipsis stay inert spans.
 *
 * Collapse contract: `overflow`, when present, governs collapse entirely
 * (`maxItems` is ignored); when absent, the legacy `maxItems` collapse
 * renders exactly as before -- an inert `<li role="note">` ellipsis,
 * byte-identical to the pre-`overflow` behavior. The NEW overflow path
 * replaces that inert ellipsis with a real trigger button
 * (`data-part="overflow-trigger"`) composing the public Dropdown, so the
 * hidden items stay reachable with their label/href/onClick honored. Either
 * way, any VISIBLE item carrying its own `.menu` composes the same Dropdown
 * per-item, independent of which collapse path (or none) is active.
 */
export default function ModernBreadcrumb(props: BreadcrumbProps): React.ReactElement {
  const commonTranslation = useOptionalTranslation('common');
  // `breadcrumb.expand_hidden` lives in the `components` catalog -- this
  // family's other chrome copy below lives in `common` -- so it needs its
  // own namespace lookup, with the same floor idiom.
  const componentsTranslation = useOptionalTranslation('components');
  const { items, separator, maxItems, overflow, className = '', style } = props;
  const rootRef = React.useRef<HTMLElement | null>(null);

  // Localized chrome copy with an English floor: a missing catalogue entry
  // echoes the full key back, which must never reach an aria-label.
  const tOr = (key: string, fallback: string): string => {
    const resolved = commonTranslation?.t(key);
    if (!resolved || resolved === key || resolved === `common.${key}`) return fallback;
    return resolved;
  };
  const tComponentsOr = (key: string, fallback: string): string => {
    const resolved = componentsTranslation?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  const navLabel = tOr('breadcrumb', 'Breadcrumb');
  const ellipsisLabel = tOr('breadcrumb_more_items', 'More pages');
  const expandHiddenLabel = tComponentsOr('breadcrumb.expand_hidden', 'Show hidden items');

  // ---------------------------------------------------------------------
  // Collapse: overflow governs entirely when present; maxItems keeps
  // working alone otherwise (see the class remarks above).
  // ---------------------------------------------------------------------
  const keepFirst = overflow?.keepFirst ?? BREADCRUMB_OVERFLOW_DEFAULTS.keepFirst;
  const keepLast = overflow?.keepLast ?? BREADCRUMB_OVERFLOW_DEFAULTS.keepLast;
  const shouldCollapseViaOverflow =
    Boolean(overflow) &&
    items.length > overflow!.maxVisible &&
    items.length > keepFirst + keepLast;

  let slots: RenderSlot[];
  let isTruncated: boolean;

  if (shouldCollapseViaOverflow) {
    const startItems = items.slice(0, keepFirst);
    const endItems = items.slice(items.length - keepLast);
    const hiddenItems = items.slice(keepFirst, items.length - keepLast);
    slots = [
      ...startItems.map((item): RenderSlot => ({ type: 'item', item })),
      { type: 'overflow-trigger', hidden: hiddenItems },
      ...endItems.map((item): RenderSlot => ({ type: 'item', item })),
    ];
    isTruncated = true;
  } else if (!overflow && maxItems && maxItems >= 3 && items.length > maxItems) {
    // Legacy path, unchanged: first item, an inert ellipsis, then the tail.
    slots = [
      { type: 'item', item: items[0] },
      { type: 'legacy-ellipsis' },
      ...items.slice(-(maxItems - 2)).map((item): RenderSlot => ({ type: 'item', item })),
    ];
    isTruncated = true;
  } else {
    slots = items.map((item): RenderSlot => ({ type: 'item', item }));
    isTruncated = false;
  }

  const separatorNode = separator ?? <NavigationForwardIcon decorative size={12} />;
  // The true last item is always current, regardless of which collapse path
  // rendered it (a key comparison rather than "last slot index" keeps this
  // correct even if a caller sets `keepLast: 0`).
  const lastItemKey = items[items.length - 1]?.key;

  // Overflow safety (P2): when the trail clips horizontally (no maxItems, a
  // narrow viewport, or long labels under the per-label cap), the CURRENT
  // location must be the visible edge on first paint -- it is always the
  // trail's inline end. Scroll geometry is physical, so the direction comes
  // from the computed style (RTL follows the negative scrollLeft model).
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || root.scrollWidth <= root.clientWidth) return;
    const maxScroll = root.scrollWidth - root.clientWidth;
    root.scrollLeft =
      window.getComputedStyle(root).direction === 'rtl' ? -maxScroll : maxScroll;
  }, [items, maxItems, overflow]);

  return (
    <nav
      ref={rootRef}
      className={`rottay-breadcrumb-shell rottay-breadcrumb-shell--modern ${className}`.trim()}
      style={style}
      data-part="root"
      data-truncated={isTruncated || undefined}
      data-count={slots.length}
      aria-label={navLabel}
    >
      <ol data-part="list">
        {slots.map((slot, index) => {
          const separatorEl = index > 0 && (
            <li data-part="separator" aria-hidden="true">
              {separatorNode}
            </li>
          );

          if (slot.type === 'legacy-ellipsis') {
            return (
              <React.Fragment key="breadcrumb-ellipsis">
                {separatorEl}
                <li data-part="item" data-ellipsis="true">
                  <span
                    data-part="crumb"
                    data-current="false"
                    role="note"
                    aria-label={ellipsisLabel}
                  >
                    <span data-part="label">…</span>
                  </span>
                </li>
              </React.Fragment>
            );
          }

          if (slot.type === 'overflow-trigger') {
            return (
              <React.Fragment key="breadcrumb-overflow-trigger">
                {separatorEl}
                <li data-part="item" data-ellipsis="true">
                  {/* `getPopupContainer` portals the menu to `document.body`:
                      the root's `overflow-x: auto` also computes
                      `overflow-y` to `auto` per spec, so an in-tree surface
                      would be clipped by the trail's own scrollport. */}
                  <Dropdown
                    trigger="click"
                    menu={{ items: slot.hidden.map(toDropdownMenuItem) }}
                    getPopupContainer={() => document.body}
                  >
                    <button
                      type="button"
                      data-part="overflow-trigger"
                      aria-label={expandHiddenLabel}
                    >
                      <span aria-hidden="true">…</span>
                    </button>
                  </Dropdown>
                </li>
              </React.Fragment>
            );
          }

          const item = slot.item;
          const isCurrent = item.key === lastItemKey;
          const labelTitle = typeof item.label === 'string' ? item.label : undefined;

          const crumbElement =
            item.href && !isCurrent ? (
              <a
                href={item.href}
                onClick={item.onClick}
                data-part="crumb"
                data-current="false"
                data-clickable="true"
              >
                {item.icon && <span data-part="icon">{item.icon}</span>}
                <span data-part="label" title={labelTitle}>{item.label}</span>
              </a>
            ) : item.onClick && !isCurrent ? (
              <button
                type="button"
                onClick={item.onClick}
                data-part="crumb"
                data-current="false"
                data-clickable="true"
              >
                {item.icon && <span data-part="icon">{item.icon}</span>}
                <span data-part="label" title={labelTitle}>{item.label}</span>
              </button>
            ) : (
              <span
                data-part="crumb"
                data-current={isCurrent ? 'true' : 'false'}
                aria-current={isCurrent ? 'page' : undefined}
                /* The CURRENT page is inert: a span wiring onClick would be a
                   keyboard-invisible click target, and its quiet-underline
                   affordance would contradict aria-current="page" -- so a
                   current item's onClick is deliberately dropped here. */
              >
                {item.icon && <span data-part="icon">{item.icon}</span>}
                <span data-part="label" title={labelTitle}>{item.label}</span>
              </span>
            );

          const itemMenu = item.menu;

          return (
            <React.Fragment key={item.key}>
              {separatorEl}
              <li data-part="item">
                {itemMenu && itemMenu.length > 0 ? (
                  // Per-item menu: the crumb itself is the trigger (Dropdown
                  // clones aria-haspopup/aria-expanded onto it); same
                  // scrollport-clipping rationale as the overflow trigger.
                  <Dropdown
                    trigger="click"
                    menu={{ items: itemMenu.map(toDropdownMenuItem) }}
                    getPopupContainer={() => document.body}
                  >
                    {crumbElement}
                  </Dropdown>
                ) : (
                  crumbElement
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

ModernBreadcrumb.displayName = 'ModernBreadcrumb';
