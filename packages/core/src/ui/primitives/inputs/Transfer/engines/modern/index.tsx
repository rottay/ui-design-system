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
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { ActionSearchIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-search';
import { FeedbackEmptyIcon } from '@/graphics/icons/presentation/semantic/generated/roles/feedback-empty';

/** Catalog lookup with an honest English floor: a bare composition (no
 * I18nProvider above it -- direct engine renders, tests) must still render,
 * and a missing catalog key (the provider echoes it back) falls to English. */
function useTransferTranslation() {
  const i18n = useOptionalTranslation('components');
  return (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
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

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectChange(new Set());
    } else {
      onSelectChange(new Set(selectableItems.map((item) => item.key)));
    }
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
        {showSelectAll && (
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
        <span data-part="panel-title">{title}</span>
        <span data-part="panel-count">
          {/* Count + governed unit (contract locale.itemUnit/itemsUnit,
              catalog-backed). Tabular numerals ride the skin. */}
          {selectedKeys.size}/{items.length}{' '}
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
             the listbox conversion contract. */
          <ul role="group" aria-label={typeof title === 'string' ? title : undefined}>
            {paginatedItems.map((item) => (
              <li key={item.key}>
                <div
                  data-part="panel-item"
                  data-selected={selectedKeys.has(item.key) || undefined}
                  data-disabled={disabled || item.disabled || undefined}
                >
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

      // Clear selections after move so the user starts fresh
      if (direction === 'right') {
        setSourceSelectedKeys(new Set());
      } else {
        setTargetSelectedKeys(new Set());
      }
    }, [sourceSelectedKeys, targetSelectedKeys, targetKeysSet, isControlled, onChange]);

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
        />
      </div>
    );
  }
);

Transfer.displayName = 'Transfer.Modern';

export default Transfer;
