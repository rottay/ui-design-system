'use client';

/**
 * Transfer - Modern Engine (DaisyUI/Tailwind)
 *
 * Features:
 * - showSearch: search input at top of each panel, filters items
 * - pagination: page size + navigation controls at bottom of each panel
 * - titles: custom header text for left/right panels
 * - render: custom item render function
 * - notFoundContent: empty state (via locale.notFoundContent)
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { TransferProps, TransferItem } from '../Transfer.types';
import { TRANSFER_DEFAULTS } from '../Transfer.types';
import { useTranslation } from '../../../../../i18n';

interface TransferListProps {
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

const DEFAULT_PAGE_SIZE = 10;

const TransferList: React.FC<TransferListProps> = ({
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

  // Reset page on filter change
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
    <div className="flex flex-col border border-base-300 rounded-lg overflow-hidden" style={{ width: '200px', ...listStyle }}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-base-300 bg-base-200 font-medium">
        {showSelectAll && (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={handleSelectAll}
            disabled={disabled || selectableItems.length === 0}
          />
        )}
        <span className="font-medium ml-2">{title}</span>
        <span className="text-sm text-base-content/60">
          {selectedKeys.size}/{items.length}
        </span>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="p-2 border-b border-base-300">
          <input
            type="text"
            className="input input-sm input-bordered w-full focus:input-primary transition-all duration-200"
            placeholder={locale?.searchPlaceholder || t('transfer.search_placeholder')}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-auto max-h-60">
        {paginatedItems.length > 0 ? (
          <ul className="menu p-1">
            {paginatedItems.map((item) => (
              <li key={item.key}>
                <label
                  className={`flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-base-200/50 hover:border-l-2 hover:border-primary/50 ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
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
          <div className="p-4 text-center text-base-content/50">
            {locale?.notFoundContent || t('transfer.not_found')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 p-2 border-t border-base-300">
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          <span className="text-xs text-base-content/70">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-xs btn-ghost"
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

    // Default filter function when showSearch is enabled but no filterOption provided
    const effectiveFilterOption = filterOption ?? (showSearch
      ? (input: string, item: TransferItem) =>
          item.title.toLowerCase().includes(input.toLowerCase())
      : undefined
    );

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

      // Clear selections after move
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
      <div ref={ref} className={`flex items-center gap-2 ${className || ''}`} style={style}>
        <TransferList
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

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="btn btn-circle btn-sm btn-ghost hover:btn-primary transition-all duration-200 hover:scale-110"
            disabled={disabled || sourceSelectedKeys.size === 0}
            onClick={() => handleMove('right')}
          >
            {operations![0]}
          </button>
          {!oneWay && (
            <button
              type="button"
              className="btn btn-circle btn-sm btn-ghost hover:btn-primary transition-all duration-200 hover:scale-110"
              disabled={disabled || targetSelectedKeys.size === 0}
              onClick={() => handleMove('left')}
            >
              {operations![1]}
            </button>
          )}
        </div>

        <TransferList
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
