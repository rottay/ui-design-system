'use client';

/**
 * @fileoverview TableToolbar — structures-tier lightweight one-row toolbar
 * with search, free-form slots, and a primary action.
 *
 * @description
 * Toolbar chrome that pairs with the `data-table` pattern and with list
 * views. Unlike the heavier `ListToolbar` pattern (two-row, requires
 * title/totalCount/viewMode/density and structured `FilterPillConfig[]`),
 * this family is deliberately slot-driven so consumers can drop in any
 * composition of status pills, selects, bulk-action toggles, and export
 * buttons without conforming to a structured filter shape.
 *
 * Use `TableToolbar` (chrome) when you want:
 *   - a single-row toolbar
 *   - free-form `filters` / `actions` / `leftContent` ReactNode slots
 *   - an optional search input (certified Input with its built-in
 *     `clearable` affordance wired to the search handler)
 *   - a primary action that supports either `href` or `onClick`
 *
 * Use `ListToolbar` (pattern, still in `components/patterns/`) when you
 * want the full two-row treatment with title, count, structured filter
 * pills, density control, view-mode toggle, and settings dropdown.
 *
 * COMPOSITION NOTES: the primary action renders through the certified
 * Button `href` contract (never an `<a>` wrapping a `<button>` — nested
 * interactives are invalid); the search clear is the Input primitive's own
 * `clearable` button. Every glyph is a governed semantic role from the icon
 * facade at a named size token — the toolbar is where supplier imports and
 * literal pixel glyph sizes historically crept in. The root stamps
 * `data-structure='table-toolbar'` as its always-present specificity hook
 * (the record/PT10 precedent), all static geometry lives in
 * `presentation/components/skin/table-toolbar/index.css`, and the modern engine's
 * elevation lives in `runtime/engines/modern/skin/table-toolbar.css`.
 *
 * KEYBOARD (APG toolbar, `action-dock` freeform precedent): the control
 * cluster is a `role='toolbar'` group. Its children are consumer ReactNodes,
 * so their tab stops stay the consumer's; the cluster adds direction-aware
 * ArrowLeft/ArrowRight plus Home/End movement across the focusable controls
 * it contains, which is what keeps a wide filter+action rail traversable
 * without a tab stop per control. The search field is a separate `search`
 * landmark and is deliberately outside the arrow model, so typing in it is
 * never intercepted.
 */

import type { KeyboardEvent as ReactKeyboardEvent, ReactElement } from 'react';

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionAddIcon } from '@/graphics/icons/semantic/generated/roles/action-add';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { ActionSearchIcon } from '@/graphics/icons/semantic/generated/roles/action-search';
import { Box, Button, Flex, Input } from '../../../../../primitives';
import type { TableToolbarProps } from '../../contracts';

/** Controls participating in the cluster's arrow-key model. */
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ARROW_KEYS = new Set(['ArrowRight', 'ArrowLeft', 'Home', 'End']);

/** Resolve writing direction from semantic markup before computed CSS (Tabs precedent). */
function elementDirection(element: HTMLElement): 'ltr' | 'rtl' {
  const directionOwner = element.closest<HTMLElement>('[dir]');
  if (directionOwner?.dir === 'rtl') return 'rtl';
  return getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
}

/** Border-relief vertical separator between toolbar sections */
function ToolbarDivider(): ReactElement {
  return (
    <Box
      data-part="divider"
      className="ds-table-toolbar__divider"
    />
  );
}

export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  isFiltered,
  onResetFilters,
  primaryAction,
  filters,
  actions,
  leftContent,
  actionsLabel,
}: TableToolbarProps): ReactElement {
  const i18n = useOptionalTranslation('components');
  /**
   * Catalog lookup with an honest English floor: when the provider is absent
   * or echoes the raw key (missing entry), the historical default wins.
   */
  const tOr = (key: string, fallback: string): string =>
    i18n?.tOr(key, fallback) ?? fallback;

  const resolvedSearchPlaceholder =
    searchPlaceholder ?? tOr('tableToolbar.searchPlaceholder', 'Search...');
  const resolvedSearchLabel = searchLabel ?? tOr('tableToolbar.searchLabel', 'Search');
  const resolvedActionsLabel =
    actionsLabel ?? tOr('tableToolbar.actionsLabel', 'Table actions');

  const hasControls = Boolean(filters || actions || primaryAction);

  const handleControlsKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (!ARROW_KEYS.has(event.key)) return;
    const container = event.currentTarget;
    const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    const isRtl = elementDirection(container) === 'rtl';
    const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const backwardKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
    let nextIndex: number | undefined;

    if (event.key === forwardKey) nextIndex = (currentIndex + 1) % items.length;
    else if (event.key === backwardKey)
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex === undefined || nextIndex === currentIndex) return;
    event.preventDefault();
    items[nextIndex]?.focus();
  };

  return (
    <Box
      data-part="root"
      data-structure="table-toolbar"
      className="ds-structure ds-table-toolbar"
    >
      <Flex align="center" gap={0} data-part="row" className="ds-table-toolbar__row">
        {/* Left: Search + leftContent */}
        <Flex align="center" gap={8} data-part="left" className="ds-table-toolbar__left">
          {onSearchChange && (
            <Box
              className="ds-table-toolbar__search-field"
              data-part="search-field"
              role="search"
              aria-label={resolvedSearchLabel}
            >
              <Input
                data-part="search-input"
                className="ds-table-toolbar__search-input"
                /* The glyph rides the primitive's own affix slot. Positioning
                   it absolutely over the field required a padding well on the
                   Input's shell, and the Input skin loads in a later layer —
                   its `padding-inline` shorthand resets that well without
                   naming it, leaving glyph and placeholder overlapping. */
                prefix={
                  <ActionSearchIcon
                    decorative
                    size="sm"
                    data-part="search-icon"
                    className="ds-table-toolbar__search-icon"
                  />
                }
                aria-label={resolvedSearchLabel}
                placeholder={resolvedSearchPlaceholder}
                value={search ?? ''}
                onChange={(value: string) => onSearchChange(value)}
                clearable
                onClear={() => onSearchChange('')}
              />
            </Box>
          )}

          {leftContent}
        </Flex>

        {/* Spacer */}
        <Box data-part="spacer" className="ds-table-toolbar__spacer" />

        {/* Right: Filters + Divider + Actions */}
        <Flex
          align="center"
          gap={0}
          data-part="controls"
          className="ds-table-toolbar__right"
          role={hasControls ? 'toolbar' : undefined}
          aria-label={hasControls ? resolvedActionsLabel : undefined}
          onKeyDown={hasControls ? handleControlsKeyDown : undefined}
        >
          {filters && (
            <Flex
              align="center"
              gap={8}
              wrap="wrap"
              data-part="filters"
              className="ds-table-toolbar__filters"
            >
              {filters}

              {isFiltered && onResetFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  data-part="clear-filters"
                  icon={<ActionCloseIcon decorative size="xs" />}
                  onClick={onResetFilters}
                >
                  {tOr('tableToolbar.clearFilters', 'Clear filters')}
                </Button>
              )}
            </Flex>
          )}

          {(actions || primaryAction) && <ToolbarDivider />}

          <Flex
            align="center"
            gap={8}
            data-part="actions"
            className="ds-table-toolbar__actions"
          >
            {actions}

            {primaryAction && (
              <Button
                data-part="primary-action"
                href={primaryAction.href}
                onClick={primaryAction.onClick}
                icon={primaryAction.icon ?? <ActionAddIcon decorative size="sm" />}
              >
                {primaryAction.label}
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

TableToolbar.displayName = 'TableToolbar';

export default TableToolbar;
