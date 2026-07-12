'use client';

/**
 * @fileoverview Transfer Rustic Engine -- pure vanilla HTML/CSS implementation
 * for the Rottay Design System. All styling uses CSS variables (`--ds-transfer-*`)
 * for full multi-tenant theming without any UI library dependency. Includes
 * search, pagination, select-all, and one-way transfer support.
 *
 * @example
 * ```tsx
 * <Transfer engine="rustic" dataSource={items} showSearch pagination />
 * ```
 *
 * @module RusticTransfer
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
 * Transfer. Uses only inline styles driven by CSS variables for theming.
 * Includes optional search, select-all, paginated item list, and empty state.
 */
const TransferListComponent: React.FC<TransferListProps> = ({
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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid var(--ds-transfer-border)`,
    borderRadius: 'var(--ds-transfer-radius)',
    width: 'var(--ds-transfer-width)',
    backgroundColor: 'var(--ds-transfer-bg)',
    fontFamily: 'var(--ds-font-family-base)',
    ...listStyle,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--ds-transfer-header-padding)',
    borderBottom: `2px solid var(--ds-transfer-header-border)`,
    backgroundColor: 'var(--ds-transfer-header-bg)',
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 'var(--ds-transfer-header-font-weight)' as React.CSSProperties['fontWeight'],
    fontSize: 'var(--ds-font-size-sm)',
  };

  const countStyle: React.CSSProperties = {
    fontSize: 'var(--ds-transfer-count-font-size)',
    color: 'var(--ds-transfer-count-color)',
  };

  const searchContainerStyle: React.CSSProperties = {
    padding: 'var(--ds-transfer-search-padding)',
    borderBottom: `1px solid var(--ds-transfer-header-border)`,
  };

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    border: `1px solid var(--ds-transfer-search-input-border)`,
    borderRadius: 'var(--ds-transfer-search-input-radius)',
    fontSize: 'var(--ds-font-size-sm)',
    outline: 'none',
    transition: 'border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const itemsContainerStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    maxHeight: 'var(--ds-transfer-list-max-height)',
    padding: '4px',
  };

  const getItemStyle = (): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: 'var(--ds-transfer-item-padding)',
    borderRadius: 'var(--ds-transfer-item-radius)',
    fontSize: 'var(--ds-font-size-sm)',
    transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s',
    borderLeft: '3px solid transparent',
  });

  const emptyStyle: React.CSSProperties = {
    padding: '16px',
    textAlign: 'center',
    color: 'var(--ds-transfer-empty-color)',
    fontSize: 'var(--ds-font-size-sm)',
  };

  const paginationContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px',
    borderTop: '1px solid var(--ds-transfer-header-border)',
  };

  const paginationButtonStyle = (isDisabled: boolean): React.CSSProperties => ({
    background: 'none',
    border: '1px solid var(--ds-transfer-border)',
    borderRadius: '4px',
    padding: '2px 8px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.4 : 1,
    fontSize: 'var(--ds-font-size-sm)',
    color: 'inherit',
    transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s, border-color 0.15s',
  });

  const paginationTextStyle: React.CSSProperties = {
    fontSize: 'var(--ds-transfer-count-font-size)',
    color: 'var(--ds-transfer-count-color)',
  };

  return (
    <div className="rottay-transfer__list" data-part="panel" data-panel={side} style={containerStyle}>
      {/* Header */}
      <div className="rottay-transfer__header" data-part="panel-header" style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showSelectAll && (
            <input
              type="checkbox"
              data-part="panel-select-all"
              checked={allSelected}
              onChange={handleSelectAll}
              disabled={disabled || selectableItems.length === 0}
            />
          )}
          <span style={titleStyle}>{title}</span>
        </div>
        <span data-part="panel-count" style={countStyle}>
          {selectedKeys.size}/{items.length}
        </span>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="rottay-transfer__search" style={searchContainerStyle}>
          <input
            type="text"
            data-part="panel-search"
            placeholder={locale?.searchPlaceholder || t('transfer.search_placeholder')}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            disabled={disabled}
            style={searchInputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--ds-color-primary, #1677ff)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 119, 255, 0.15), 0 0 8px rgba(22, 119, 255, 0.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      )}

      {/* Items */}
      <div className="rottay-transfer__items" data-part="panel-list" style={itemsContainerStyle}>
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item) => (
            <label
              key={item.key}
              className="rottay-transfer__item"
              data-part="panel-item"
              data-selected={selectedKeys.has(item.key) || undefined}
              data-disabled={item.disabled || undefined}
              style={{
                ...getItemStyle(),
                cursor: item.disabled || disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && !disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--ds-transfer-item-bg-hover)';
                  e.currentTarget.style.borderLeft = '3px solid var(--ds-color-primary, #1677ff)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderLeft = '3px solid transparent';
              }}
            >
              <input
                type="checkbox"
                data-part="panel-item-checkbox"
                checked={selectedKeys.has(item.key)}
                onChange={() => handleSelect(item.key)}
                disabled={disabled || item.disabled}
              />
              <span style={{ flex: 1 }}>
                {render ? render(item) : item.title}
              </span>
            </label>
          ))
        ) : (
          <div className="rottay-transfer__empty" data-part="panel-empty" style={emptyStyle}>
            {locale?.notFoundContent || t('transfer.not_found')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="rottay-transfer__pagination" data-part="panel-pagination" style={paginationContainerStyle}>
          <button
            type="button"
            data-part="pagination-button"
            style={paginationButtonStyle(currentPage <= 1)}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          <span style={paginationTextStyle}>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            data-part="pagination-button"
            style={paginationButtonStyle(currentPage >= totalPages)}
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
 * Rustic (vanilla HTML/CSS) engine for the Transfer component.
 *
 * Renders two `TransferListComponent` panels (source and target) with
 * directional move buttons between them. All visual chrome is driven by
 * `--ds-transfer-*` CSS variables, enabling full multi-tenant customization.
 * Hover/press micro-interactions are handled via inline event handlers.
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
      className = '',
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

    // Build class names
    const containerClasses = [
      'rottay-transfer',
      'rottay-transfer--rustic',
      disabled && 'rottay-transfer--disabled',
      className,
    ].filter(Boolean).join(' ');

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--ds-transfer-gap)',
      fontFamily: 'var(--ds-font-family-base)',
      ...style,
    };

    const buttonStyle: React.CSSProperties = {
      padding: 'var(--ds-transfer-button-padding)',
      border: 'none',
      borderRadius: 'var(--ds-transfer-button-radius)',
      backgroundColor: 'var(--ds-transfer-button-bg)',
      color: 'var(--ds-transfer-button-color)',
      cursor: 'pointer',
      fontWeight: 'var(--ds-font-weight-medium)' as React.CSSProperties['fontWeight'],
      fontSize: 'var(--ds-font-size-sm)',
      transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s',
    };

    const disabledButtonStyle: React.CSSProperties = {
      ...buttonStyle,
      opacity: 0.5,
      cursor: 'not-allowed',
    };

    const operationsContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    };

    return (
      <div
        ref={ref}
        data-part="root"
        className={containerClasses}
        style={containerStyle}
      >
        <TransferListComponent
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

        <div className="rottay-transfer__operations" data-part="operations" style={operationsContainerStyle}>
          <button
            type="button"
            className="rottay-transfer__button"
            data-part="move-button"
            data-direction="right"
            style={disabled || sourceSelectedKeys.size === 0 ? disabledButtonStyle : buttonStyle}
            disabled={disabled || sourceSelectedKeys.size === 0}
            onClick={() => handleMove('right')}
            onMouseEnter={(e) => {
              if (!disabled && sourceSelectedKeys.size > 0) {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseDown={(e) => {
              if (!disabled && sourceSelectedKeys.size > 0) {
                e.currentTarget.style.transform = 'scale(0.97)';
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
            }}
          >
            {operations![0]}
          </button>
          {!oneWay && (
            <button
              type="button"
              className="rottay-transfer__button"
              data-part="move-button"
              data-direction="left"
              style={disabled || targetSelectedKeys.size === 0 ? disabledButtonStyle : buttonStyle}
              disabled={disabled || targetSelectedKeys.size === 0}
              onClick={() => handleMove('left')}
              onMouseEnter={(e) => {
                if (!disabled && targetSelectedKeys.size > 0) {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onMouseDown={(e) => {
                if (!disabled && targetSelectedKeys.size > 0) {
                  e.currentTarget.style.transform = 'scale(0.97)';
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
              }}
            >
              {operations![1]}
            </button>
          )}
        </div>

        <TransferListComponent
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

Transfer.displayName = 'Transfer.Rustic';

export default Transfer;
