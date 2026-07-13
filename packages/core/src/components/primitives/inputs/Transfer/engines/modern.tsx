'use client';

/**
 * @fileoverview Transfer Modern Engine -- DaisyUI/Tailwind implementation for
 * the Rottay Design System. Builds a fully custom dual-panel transfer list
 * using Tailwind utility classes, with built-in search, pagination, and
 * select-all support.
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
import type { TransferProps, TransferItem } from '../Transfer.types';
import { TRANSFER_DEFAULTS } from '../Transfer.types';
import { useTranslation } from '../../../../../i18n';

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
  const { t } = useTranslation('components');
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
    <div data-part="panel" data-panel={side} className="flex flex-col rounded-lg overflow-hidden" style={{ width: 'var(--ds-transfer-list-width, 200px)', ...listStyle }}>
      {/* Header */}
      <div data-part="panel-header" className="flex items-center justify-between p-2 font-medium">
        {showSelectAll && (
          <input
            type="checkbox"
            data-part="panel-select-all"
            style={{ width: 16, height: 16, cursor: 'pointer' }}
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={handleSelectAll}
            disabled={disabled || selectableItems.length === 0}
          />
        )}
        <span className="font-medium ml-2">{title}</span>
        <span data-part="panel-count" className="text-sm">
          {selectedKeys.size}/{items.length}
        </span>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="p-2">
          <input
            type="text"
            data-part="panel-search"
            style={{ width: '100%', padding: '4px var(--ds-input-sm-padding-x, 10px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', transition: 'border-color var(--ds-motion-normal)' }}
            placeholder={locale?.searchPlaceholder || t('transfer.search_placeholder')}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Items */}
      <div data-part="panel-list" className="flex-1 overflow-auto max-h-60">
        {paginatedItems.length > 0 ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 4 }}>
            {paginatedItems.map((item) => (
              <li key={item.key}>
                <label
                  data-part="panel-item"
                  data-selected={selectedKeys.has(item.key) || undefined}
                  data-disabled={item.disabled || undefined}
                  className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    data-part="panel-item-checkbox"
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                    checked={selectedKeys.has(item.key)}
                    onChange={() => handleSelect(item.key)}
                    disabled={disabled || item.disabled}
                  />
                  <span className="flex-1">
                    {render ? render(item) : item.title}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <div data-part="panel-empty" className="p-4 text-center">
            {locale?.notFoundContent || t('transfer.not_found')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div data-part="panel-pagination" className="flex items-center justify-center gap-1 p-2">
          <button
            type="button"
            data-part="pagination-button"
            style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          <span className="text-xs">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            data-part="pagination-button"
            style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }}
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Modern (DaisyUI/Tailwind) engine for the Transfer component.
 *
 * Renders two `TransferList` panels (source and target) with directional
 * move buttons between them. Supports controlled and uncontrolled target
 * keys, search filtering with a configurable filter function, and pagination.
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
      <div ref={ref} data-part="root" className={`flex items-center gap-2 rottay-transfer rottay-transfer--modern ${className || ''}`} style={style}>
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

        <div data-part="operations" className="flex flex-col gap-2">
          <button
            type="button"
            data-part="move-button"
            data-direction="right"
            style={{ width: 'var(--ds-input-sm-height, 32px)', height: 'var(--ds-input-sm-height, 32px)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 'var(--ds-input-sm-font-size, 13px)', transition: 'all var(--ds-motion-normal)' }}
            disabled={disabled || sourceSelectedKeys.size === 0}
            onClick={() => handleMove('right')}
          >
            {operations![0]}
          </button>
          {!oneWay && (
            <button
              type="button"
              data-part="move-button"
              data-direction="left"
              style={{ width: 'var(--ds-input-sm-height, 32px)', height: 'var(--ds-input-sm-height, 32px)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 'var(--ds-input-sm-font-size, 13px)', transition: 'all var(--ds-motion-normal)' }}
              disabled={disabled || targetSelectedKeys.size === 0}
              onClick={() => handleMove('left')}
            >
              {operations![1]}
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
