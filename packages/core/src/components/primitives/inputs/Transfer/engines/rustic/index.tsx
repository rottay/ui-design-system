'use client';

/**
 * @fileoverview Transfer Rustic Engine - Rottay Design System
 * @description Pure vanilla HTML/CSS implementation of the Transfer component
 * using CSS variables for multi-tenant theming.
 *
 * @module RusticTransfer
 * @category Inputs
 * @package @rottay/design-system
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
    borderBottom: `1px solid var(--ds-transfer-header-border)`,
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
    transition: 'background-color 0.15s',
  });

  const emptyStyle: React.CSSProperties = {
    padding: '16px',
    textAlign: 'center',
    color: 'var(--ds-transfer-empty-color)',
    fontSize: 'var(--ds-font-size-sm)',
  };

  return (
    <div className="rottay-transfer__list" style={containerStyle}>
      {/* Header */}
      <div className="rottay-transfer__header" style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showSelectAll && (
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              disabled={disabled || selectableItems.length === 0}
            />
          )}
          <span style={titleStyle}>{title}</span>
        </div>
        <span style={countStyle}>
          {selectedKeys.size}/{items.length}
        </span>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="rottay-transfer__search" style={searchContainerStyle}>
          <input
            type="text"
            placeholder={locale?.searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            disabled={disabled}
            style={searchInputStyle}
          />
        </div>
      )}

      {/* Items */}
      <div className="rottay-transfer__items" style={itemsContainerStyle}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <label
              key={item.key}
              className="rottay-transfer__item"
              style={{
                ...getItemStyle(),
                cursor: item.disabled || disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && !disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--ds-transfer-item-bg-hover)';
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
          <div className="rottay-transfer__empty" style={emptyStyle}>
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
      transition: 'var(--ds-transition-fast)',
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
        className={containerClasses}
        style={containerStyle}
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

        <div className="rottay-transfer__operations" style={operationsContainerStyle}>
          <button
            type="button"
            className="rottay-transfer__button"
            style={disabled || sourceSelectedKeys.size === 0 ? disabledButtonStyle : buttonStyle}
            disabled={disabled || sourceSelectedKeys.size === 0}
            onClick={() => handleMove('right')}
          >
            {operations![0]}
          </button>
          {!oneWay && (
            <button
              type="button"
              className="rottay-transfer__button"
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

Transfer.displayName = 'Transfer.Rustic';

export default Transfer;
