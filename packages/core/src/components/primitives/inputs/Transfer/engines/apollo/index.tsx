'use client';

/**
 * Transfer - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { TransferProps, TransferItem } from '../../types';
import { TRANSFER_DEFAULTS } from '../../types';

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
}

const TransferListComponent: React.FC<TransferListProps> = ({
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
}) => {
  const filteredItems = useMemo(() => {
    if (!searchValue || !filterOption) return items;
    return items.filter((item) => filterOption(searchValue, item));
  }, [items, searchValue, filterOption]);

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        width: '200px',
        backgroundColor: '#fff',
        ...listStyle,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showSelectAll && (
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              disabled={disabled || selectableItems.length === 0}
            />
          )}
          <span style={{ fontWeight: 500 }}>{title}</span>
        </div>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {selectedKeys.size}/{items.length}
        </span>
      </div>

      {/* Search */}
      {showSearch && (
        <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder={locale?.searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>
      )}

      {/* Items */}
      <div style={{ flex: 1, overflow: 'auto', maxHeight: '240px', padding: '4px' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <label
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                cursor: item.disabled || disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.5 : 1,
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && !disabled) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <input
                type="checkbox"
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
          <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>
            {locale?.notFoundContent}
          </div>
        )}
      </div>
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

    const buttonStyle: React.CSSProperties = {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#3b82f6',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 500,
    };

    const disabledButtonStyle: React.CSSProperties = {
      ...buttonStyle,
      opacity: 0.5,
      cursor: 'not-allowed',
    };

    return (
      <div
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          ...style,
        }}
      >
        <TransferListComponent
          title={titles![0]}
          items={sourceItems}
          selectedKeys={sourceSelectedKeys}
          onSelectChange={handleSourceSelectChange}
          disabled={disabled}
          showSearch={showSearch}
          searchValue={sourceSearch}
          onSearch={handleSourceSearch}
          filterOption={filterOption}
          render={render}
          showSelectAll={showSelectAll}
          locale={locale}
          listStyle={listStyle}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            style={disabled || sourceSelectedKeys.size === 0 ? disabledButtonStyle : buttonStyle}
            disabled={disabled || sourceSelectedKeys.size === 0}
            onClick={() => handleMove('right')}
          >
            {operations![0]}
          </button>
          {!oneWay && (
            <button
              type="button"
              style={disabled || targetSelectedKeys.size === 0 ? disabledButtonStyle : buttonStyle}
              disabled={disabled || targetSelectedKeys.size === 0}
              onClick={() => handleMove('left')}
            >
              {operations![1]}
            </button>
          )}
        </div>

        <TransferListComponent
          title={titles![1]}
          items={targetItems}
          selectedKeys={targetSelectedKeys}
          onSelectChange={handleTargetSelectChange}
          disabled={disabled}
          showSearch={showSearch}
          searchValue={targetSearch}
          onSearch={handleTargetSearch}
          filterOption={filterOption}
          render={render}
          showSelectAll={showSelectAll}
          locale={locale}
          listStyle={listStyle}
        />
      </div>
    );
  }
);

Transfer.displayName = 'Transfer.Apollo';

export default Transfer;
