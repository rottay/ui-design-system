'use client';

/**
 * @fileoverview Transfer Modern Engine -- custom dual-panel implementation for
 * the Rottay Design System, with built-in search, pagination, and select-all
 * support. No DaisyUI classes and no Tailwind utilities: every part is painted
 * by the modern skin (`skin/transfer.css`) keyed on `data-part`/`data-*`
 * hooks. Inline styles are reserved for the public `style`/`listStyle`
 * channels.
 *
 * @example
 * ```tsx
 * <Transfer engine="modern" dataSource={items} showSearch pagination={{ pageSize: 5 }} />
 * ```
 *
 * @module ModernTransfer
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useMemo, useCallback } from 'react';
import { VisuallyHidden } from '../../../../foundation';
import type { TransferProps, TransferItem } from '../../contracts';
import { TRANSFER_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ModernCheckbox } from '../../../../facade';
import { NavigationBackIcon } from '@/graphics/icons/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/semantic/generated/roles/navigation-forward';
import { ActionSearchIcon } from '@/graphics/icons/semantic/generated/roles/action-search';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { FeedbackEmptyIcon } from '@/graphics/icons/semantic/generated/roles/feedback-empty';

/** Catalog lookup with an honest English floor: a bare composition (no
 * I18nProvider above it -- direct engine renders, tests) must still render,
 * and a missing catalog key (the provider echoes it back) falls to English. */
function useTransferTranslation() {
  const i18n = useOptionalTranslation('components');
  return (key: string, fallback: string, params?: Record<string, string | number>): string => {
    const resolved = i18n?.t(key, params);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
}

interface TransferListProps {
  side: 'source' | 'target';
  title: React.ReactNode;
  items: TransferItem[];
  selectedKeys: Set<string>;
  onSelectChange: (keys: Set<string>) => void;
  disabled?: boolean;
  showSearch?: boolean;
  searchValue: string;
  onSearch: (value: string) => void;
  filterOption?: (input: string, item: TransferItem) => boolean;
  render?: (item: TransferItem) => React.ReactNode;
  showSelectAll?: boolean;
  locale?: TransferProps['locale'];
  listStyle?: React.CSSProperties;
  pagination?: boolean | { pageSize?: number };
  /** `false` drops the row/select-all checkboxes: the panel's selection has no
   *  consumer (the `oneWay` target), so offering it would be inert chrome. */
  selectable?: boolean;
  /** Per-row removal, the `oneWay` grammar's replacement for the missing
   *  bulk left-move button. Absent means rows carry no remove action. */
  onRemoveItem?: (item: TransferItem) => void;
}

/** Default number of items shown per page when pagination is enabled without
 *  an explicit pageSize. Matches the Ant Design Transfer default. */
const DEFAULT_PAGE_SIZE = 10;

/**
 * Internal panel component that renders one side (source or target) of the
 * Transfer. Includes optional search, select-all checkbox, paginated item
 * list, and an empty-state placeholder.
 */
const TransferList: React.FC<TransferListProps> = ({
  side,
  title,
  items,
  selectedKeys,
  onSelectChange,
  disabled,
  showSearch,
  searchValue,
  onSearch,
  filterOption,
  render,
  showSelectAll,
  locale,
  listStyle,
  pagination,
  selectable = true,
  onRemoveItem,
}) => {
  const tOr = useTransferTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!searchValue || !filterOption) return items;
    return items.filter((item) => filterOption(searchValue, item));
  }, [items, searchValue, filterOption]);

  // Reset to page 1 whenever the filtered item count changes (e.g., after
  // a search query narrows results) to prevent showing an empty page.
  const prevFilteredLength = React.useRef(filteredItems.length);
  React.useEffect(() => {
    if (filteredItems.length !== prevFilteredLength.current) {
      setCurrentPage(1);
      prevFilteredLength.current = filteredItems.length;
    }
  }, [filteredItems.length]);

  // Pagination logic
  const pageSize = pagination
    ? (typeof pagination === 'object' && pagination.pageSize ? pagination.pageSize : DEFAULT_PAGE_SIZE)
    : 0;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(filteredItems.length / pageSize)) : 1;
  const paginatedItems = pageSize > 0
    ? filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredItems;

  const selectableItems = filteredItems.filter((item) => !item.disabled);
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => selectedKeys.has(item.key));
  const someSelected = selectableItems.some((item) => selectedKeys.has(item.key));

  // Select-all toggles only the visible (filtered) scope; selections made outside it survive.
  const handleSelectAll = () => {
    const nextSelected = new Set(selectedKeys);
    for (const item of selectableItems) {
      if (allSelected) nextSelected.delete(item.key);
      else nextSelected.add(item.key);
    }
    onSelectChange(nextSelected);
  };

  const handleSelect = (key: string) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    onSelectChange(newSelected);
  };

  return (
    <div
      data-part="panel"
      data-panel={side}
      data-disabled={disabled || undefined}
      style={listStyle}
    >
      {/* Header */}
      <div data-part="panel-header">
        {showSelectAll && selectable && (
          /* The select-all control composes the Checkbox primitive (never a
             native input). The accessible name rides the primitive's own
             label slot (sr-only copy), and the wrapper keeps the public
             data-part + name contract for tests and tooling. */
          <span
            data-part="panel-select-all"
            data-disabled={disabled || selectableItems.length === 0 || undefined}
            aria-label={tOr('transfer.select_all', 'Select all')}
          >
            <ModernCheckbox
              size="sm"
              label={<VisuallyHidden>{tOr('transfer.select_all', 'Select all')}</VisuallyHidden>}
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={handleSelectAll}
              disabled={disabled || selectableItems.length === 0}
            />
          </span>
        )}
        <span data-part="panel-title" tabIndex={-1}>{title}</span>
        <span data-part="panel-count">
          {/* Count + governed unit (contract locale.itemUnit/itemsUnit,
              catalog-backed). Tabular numerals ride the skin. A panel with no
              selection reports its total alone -- a frozen "0/" numerator
              reads as a broken counter. */}
          {selectable ? `${selectedKeys.size}/` : ''}{items.length}{' '}
          {items.length === 1
            ? (locale?.itemUnit || tOr('transfer.item_unit', 'item'))
            : (locale?.itemsUnit || tOr('transfer.items_unit', 'items'))}
        </span>
      </div>

      {/* Search */}
      {showSearch && (
        <div>
          <span data-part="panel-search-icon" aria-hidden="true">
            <ActionSearchIcon decorative size={14} />
          </span>
          <input
            type="text"
            data-part="panel-search"
            placeholder={locale?.searchPlaceholder || tOr('transfer.search_placeholder', 'Search')}
            aria-label={locale?.searchPlaceholder || tOr('transfer.search_placeholder', 'Search')}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Items */}
      <div data-part="panel-list">
        {paginatedItems.length > 0 ? (
          /* A checkbox GROUP per panel (one real, named Checkbox primitive per
             row): valid APG without the nested-interactive trap a listbox of
             checkbox-bearing options would create. See the family ficha for
             the listbox conversion contract. A non-selectable panel is a plain
             list -- `group` would promise a control set that is not there. */
          <ul
            role={selectable ? 'group' : 'list'}
            aria-label={typeof title === 'string' ? title : undefined}
          >
            {paginatedItems.map((item) => (
              <li key={item.key}>
                <div
                  data-part="panel-item"
                  data-selectable={selectable ? undefined : 'false'}
                  data-selected={(selectable && selectedKeys.has(item.key)) || undefined}
                  data-disabled={disabled || item.disabled || undefined}
                >
                  {selectable ? (
                    <span
                      data-part="panel-item-checkbox"
                      data-disabled={disabled || item.disabled || undefined}
                    >
                      <ModernCheckbox
                        size="sm"
                        label={render ? render(item) : item.title}
                        checked={selectedKeys.has(item.key)}
                        onChange={() => handleSelect(item.key)}
                        disabled={disabled || item.disabled}
                      />
                    </span>
                  ) : (
                    <span data-part="panel-item-label">
                      {render ? render(item) : item.title}
                    </span>
                  )}
                  {onRemoveItem && (
                    <button
                      type="button"
                      data-part="panel-item-remove"
                      disabled={disabled || item.disabled}
                      aria-label={tOr('transfer.remove_item', `Remove ${item.title}`, {
                        item: item.title,
                      })}
                      onClick={(e) => {
                        // Removing this row unmounts the focused button, so focus must move first or it
                        // strands on <body> and a keyboard user loses their place.
                        const row = e.currentTarget.closest('li');
                        const neighbor = row?.nextElementSibling ?? row?.previousElementSibling;
                        // Removing the only row leaves no neighbour, so its panel title
                        // becomes the stable programmatic focus target.
                        const fallback = e.currentTarget
                          .closest('[data-part="panel"]')
                          ?.querySelector<HTMLElement>('[data-part="panel-title"]');
                        (neighbor?.querySelector<HTMLButtonElement>(
                          '[data-part="panel-item-remove"]',
                        ) ?? fallback)?.focus();
                        onRemoveItem(item);
                      }}
                    >
                      <ActionCloseIcon decorative size={12} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div data-part="panel-empty">
            <span data-part="panel-empty-icon" aria-hidden="true">
              <FeedbackEmptyIcon decorative size={20} />
            </span>
            {locale?.notFoundContent || tOr('transfer.not_found', 'No data')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div data-part="panel-pagination">
          <button
            type="button"
            data-part="pagination-button"
            disabled={disabled || currentPage <= 1}
            aria-label={tOr('pagination.previous', 'Previous page')}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <NavigationBackIcon decorative size={14} />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            data-part="pagination-button"
            disabled={disabled || currentPage >= totalPages}
            aria-label={tOr('pagination.next', 'Next page')}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <NavigationForwardIcon decorative size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Modern engine for the Transfer component.
 *
 * Renders two `TransferList` panels (source and target) with directional
 * move buttons between them. Supports controlled and uncontrolled target
 * keys, search filtering with a configurable filter function, and pagination.
 * All paint/geometry lives in the modern skin; the engine emits only
 * `data-part`/`data-*` hooks plus the public `style`/`listStyle` channels.
 *
 * @param props - Standardized TransferProps from the design system contract.
 * @param ref   - Forwarded ref attached to the outer flex container.
 * @returns A dual-panel transfer list with move controls.
 */
export const Transfer = React.forwardRef<HTMLDivElement, TransferProps>(
  (props, ref) => {
    const {
      dataSource,
      targetKeys: controlledTargetKeys,
      defaultTargetKeys = [],
      onChange,
      onSelectChange,
      onSearch,
      titles = TRANSFER_DEFAULTS.titles,
      operations = TRANSFER_DEFAULTS.operations,
      showSearch,
      filterOption,
      render,
      disabled,
      listStyle,
      locale = TRANSFER_DEFAULTS.locale,
      showSelectAll = TRANSFER_DEFAULTS.showSelectAll,
      oneWay,
      pagination,
      className,
      style,
    } = props;

    const tOr = useTransferTranslation();

    const [internalTargetKeys, setInternalTargetKeys] = useState<Set<string>>(
      new Set(defaultTargetKeys)
    );
    const [sourceSelectedKeys, setSourceSelectedKeys] = useState<Set<string>>(new Set());
    const [targetSelectedKeys, setTargetSelectedKeys] = useState<Set<string>>(new Set());
    const [sourceSearch, setSourceSearch] = useState('');
    const [targetSearch, setTargetSearch] = useState('');

    const isControlled = controlledTargetKeys !== undefined;
    const targetKeysSet = isControlled ? new Set(controlledTargetKeys) : internalTargetKeys;

    const sourceItems = dataSource.filter((item) => !targetKeysSet.has(item.key));
    const targetItems = dataSource.filter((item) => targetKeysSet.has(item.key));

    // When showSearch is on but the consumer did not provide a custom filter,
    // fall back to a case-insensitive title match for convenience.
    const effectiveFilterOption = filterOption ?? (showSearch
      ? (input: string, item: TransferItem) =>
          item.title.toLowerCase().includes(input.toLowerCase())
      : undefined
    );

    // Move selected items between panels. "right" adds source selections to
    // the target; "left" removes target selections back to source. Selections
    // are cleared on the moved side to prevent stale ghost selections.
    const handleMove = useCallback((direction: 'left' | 'right') => {
      const keysToMove = direction === 'right'
        ? Array.from(sourceSelectedKeys)
        : Array.from(targetSelectedKeys);

      let newTargetKeys: string[];
      if (direction === 'right') {
        newTargetKeys = [...Array.from(targetKeysSet), ...keysToMove];
      } else {
        newTargetKeys = Array.from(targetKeysSet).filter((key) => !keysToMove.includes(key));
      }

      if (!isControlled) {
        setInternalTargetKeys(new Set(newTargetKeys));
      }
      onChange?.(newTargetKeys, direction, keysToMove);

      // Clear selections after move so the user starts fresh. The consumer is
      // told: the keys it last received are gone from the panel they named, so
      // a mirror of `onSelectChange` left holding them would drive its own
      // enable/disable chrome off a selection the user can no longer see.
      if (direction === 'right') {
        setSourceSelectedKeys(new Set());
        onSelectChange?.([], Array.from(targetSelectedKeys));
      } else {
        setTargetSelectedKeys(new Set());
        onSelectChange?.(Array.from(sourceSelectedKeys), []);
      }
    }, [sourceSelectedKeys, targetSelectedKeys, targetKeysSet, isControlled, onChange, onSelectChange]);

    /**
     * `oneWay` removal. With the bulk left-move button gone, each target row
     * carries its own remove action -- otherwise the panel is a one-way trap
     * and its selection chrome has no consumer at all.
     */
    const handleRemoveTargetItem = useCallback((item: TransferItem) => {
      const newTargetKeys = Array.from(targetKeysSet).filter((key) => key !== item.key);
      if (!isControlled) {
        setInternalTargetKeys(new Set(newTargetKeys));
      }
      onChange?.(newTargetKeys, 'left', [item.key]);
      if (targetSelectedKeys.has(item.key)) {
        const nextSelected = new Set(targetSelectedKeys);
        nextSelected.delete(item.key);
        setTargetSelectedKeys(nextSelected);
        onSelectChange?.(Array.from(sourceSelectedKeys), Array.from(nextSelected));
      }
    }, [targetKeysSet, isControlled, onChange, onSelectChange, sourceSelectedKeys, targetSelectedKeys]);

    const handleSourceSelectChange = (keys: Set<string>) => {
      setSourceSelectedKeys(keys);
      onSelectChange?.(Array.from(keys), Array.from(targetSelectedKeys));
    };

    const handleTargetSelectChange = (keys: Set<string>) => {
      setTargetSelectedKeys(keys);
      onSelectChange?.(Array.from(sourceSelectedKeys), Array.from(keys));
    };

    const handleSourceSearch = (value: string) => {
      setSourceSearch(value);
      onSearch?.('left', value);
    };

    const handleTargetSearch = (value: string) => {
      setTargetSearch(value);
      onSearch?.('right', value);
    };

    return (
      <div
        ref={ref}
        data-part="root"
        data-disabled={disabled || undefined}
        className={`rottay-transfer rottay-transfer--modern ${className || ''}`}
        style={style}
      >
        <TransferList
          side="source"
          title={titles![0]}
          items={sourceItems}
          selectedKeys={sourceSelectedKeys}
          onSelectChange={handleSourceSelectChange}
          disabled={disabled}
          showSearch={showSearch}
          searchValue={sourceSearch}
          onSearch={handleSourceSearch}
          filterOption={effectiveFilterOption}
          render={render}
          showSelectAll={showSelectAll}
          locale={locale}
          listStyle={listStyle}
          pagination={pagination}
        />

        <div data-part="operations">
          <button
            type="button"
            data-part="move-button"
            data-direction="right"
            disabled={disabled || sourceSelectedKeys.size === 0}
            aria-label={tOr('transfer.move_to_target', 'Move to target')}
            onClick={() => handleMove('right')}
          >
            {operations![0] === TRANSFER_DEFAULTS.operations?.[0]
              ? <NavigationForwardIcon decorative size={16} />
              : operations![0]}
          </button>
          {!oneWay && (
            <button
              type="button"
              data-part="move-button"
              data-direction="left"
              disabled={disabled || targetSelectedKeys.size === 0}
              aria-label={tOr('transfer.move_to_source', 'Move to source')}
              onClick={() => handleMove('left')}
            >
              {operations![1] === TRANSFER_DEFAULTS.operations?.[1]
                ? <NavigationBackIcon decorative size={16} />
                : operations![1]}
            </button>
          )}
        </div>

        <TransferList
          side="target"
          title={titles![1]}
          items={targetItems}
          selectedKeys={targetSelectedKeys}
          onSelectChange={handleTargetSelectChange}
          disabled={disabled}
          showSearch={showSearch}
          searchValue={targetSearch}
          onSearch={handleTargetSearch}
          filterOption={effectiveFilterOption}
          render={render}
          showSelectAll={showSelectAll}
          locale={locale}
          listStyle={listStyle}
          pagination={pagination}
          /* oneWay: no left-move button exists, so target selection would be
             inert chrome. The panel drops its checkboxes and each row gets the
             per-item remove action instead (the antd oneWay grammar). */
          selectable={!oneWay}
          onRemoveItem={oneWay ? handleRemoveTargetItem : undefined}
        />
      </div>
    );
  }
);

Transfer.displayName = 'Transfer.Modern';

export default Transfer;
