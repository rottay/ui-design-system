'use client';

/**
 * Hermes Transfer Engine
 *
 * DaisyUI implementation with unified props interface.
 */

import { useState, useCallback, useMemo } from 'react';
import type { TransferProps, TransferItem, TransferDirection } from '../types';
import {
  defaultTransferFilter,
  splitDataSource,
  getEnabledItemsCount,
} from '../../../../types/components/transfer';

/**
 * Hermes Transfer Component
 *
 * DaisyUI-styled transfer list.
 */
export default function HermesTransfer<T extends TransferItem = TransferItem>(
  props: TransferProps<T>
) {
  const {
    dataSource = [],
    targetKeys: controlledTargetKeys,
    selectedKeys: controlledSelectedKeys,
    disabled = false,
    showSearch = false,
    showSelectAll = true,
    oneWay = false,
    titles = ['Source', 'Target'],
    operations = ['>', '<'],
    filterOption,
    locale = {},
    render,
    onChange,
    onSelectChange,
    onSearch,
    className = '',
    style,
  } = props;

  // Internal state
  const [internalTargetKeys, setInternalTargetKeys] = useState<string[]>([]);
  const [leftSelectedKeys, setLeftSelectedKeys] = useState<string[]>([]);
  const [rightSelectedKeys, setRightSelectedKeys] = useState<string[]>([]);
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');

  const targetKeys = controlledTargetKeys ?? internalTargetKeys;

  // Split data into left and right
  const { leftDataSource, rightDataSource } = useMemo(
    () => splitDataSource(dataSource, targetKeys),
    [dataSource, targetKeys]
  );

  // Filter items based on search
  const filteredLeftData = useMemo(() => {
    if (!leftSearch) return leftDataSource;
    return leftDataSource.filter((item) =>
      filterOption
        ? filterOption(leftSearch, item, 'left')
        : defaultTransferFilter(leftSearch, item)
    );
  }, [leftDataSource, leftSearch, filterOption]);

  const filteredRightData = useMemo(() => {
    if (!rightSearch) return rightDataSource;
    return rightDataSource.filter((item) =>
      filterOption
        ? filterOption(rightSearch, item, 'right')
        : defaultTransferFilter(rightSearch, item)
    );
  }, [rightDataSource, rightSearch, filterOption]);

  // Handle selection
  const handleSelect = useCallback(
    (key: string, direction: TransferDirection, checked: boolean) => {
      if (direction === 'left') {
        const newKeys = checked
          ? [...leftSelectedKeys, key]
          : leftSelectedKeys.filter((k) => k !== key);
        setLeftSelectedKeys(newKeys);
        onSelectChange?.(newKeys, rightSelectedKeys);
      } else {
        const newKeys = checked
          ? [...rightSelectedKeys, key]
          : rightSelectedKeys.filter((k) => k !== key);
        setRightSelectedKeys(newKeys);
        onSelectChange?.(leftSelectedKeys, newKeys);
      }
    },
    [leftSelectedKeys, rightSelectedKeys, onSelectChange]
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (direction: TransferDirection, checked: boolean) => {
      const items = direction === 'left' ? filteredLeftData : filteredRightData;
      const enabledKeys = items.filter((item) => !item.disabled).map((item) => item.key);

      if (direction === 'left') {
        const newKeys = checked ? enabledKeys : [];
        setLeftSelectedKeys(newKeys);
        onSelectChange?.(newKeys, rightSelectedKeys);
      } else {
        const newKeys = checked ? enabledKeys : [];
        setRightSelectedKeys(newKeys);
        onSelectChange?.(leftSelectedKeys, newKeys);
      }
    },
    [filteredLeftData, filteredRightData, leftSelectedKeys, rightSelectedKeys, onSelectChange]
  );

  // Handle transfer
  const handleTransfer = useCallback(
    (direction: TransferDirection) => {
      let newTargetKeys: string[];
      let moveKeys: string[];

      if (direction === 'right') {
        moveKeys = leftSelectedKeys;
        newTargetKeys = [...targetKeys, ...moveKeys];
        setLeftSelectedKeys([]);
      } else {
        moveKeys = rightSelectedKeys;
        newTargetKeys = targetKeys.filter((key) => !moveKeys.includes(key));
        setRightSelectedKeys([]);
      }

      if (controlledTargetKeys === undefined) {
        setInternalTargetKeys(newTargetKeys);
      }
      onChange?.(newTargetKeys, direction, moveKeys);
    },
    [targetKeys, controlledTargetKeys, leftSelectedKeys, rightSelectedKeys, onChange]
  );

  // Handle search
  const handleSearch = useCallback(
    (direction: TransferDirection, value: string) => {
      if (direction === 'left') {
        setLeftSearch(value);
      } else {
        setRightSearch(value);
      }
      onSearch?.(direction, value);
    },
    [onSearch]
  );

  // Render item
  const renderItem = (item: T) => {
    if (render) {
      const result = render(item);
      if (typeof result === 'object' && result !== null && 'label' in result) {
        return (result as { label: React.ReactNode }).label;
      }
      return result;
    }
    return item.title;
  };

  // Render list
  const renderList = (
    direction: TransferDirection,
    items: T[],
    selectedKeys: string[],
    title: React.ReactNode,
    searchValue: string
  ) => {
    const enabledCount = getEnabledItemsCount(items);
    const isAllSelected = enabledCount > 0 && selectedKeys.length === enabledCount;
    const isIndeterminate = selectedKeys.length > 0 && selectedKeys.length < enabledCount;

    return (
      <div className="card bg-base-100 border border-base-300 w-64">
        {/* Header */}
        <div className="card-body p-3">
          <div className="flex items-center justify-between mb-2">
            {showSelectAll && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className={`checkbox checkbox-sm ${isIndeterminate ? 'checkbox-primary' : ''}`}
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  disabled={disabled || enabledCount === 0}
                  onChange={(e) => handleSelectAll(direction, e.target.checked)}
                />
                <span className="text-sm font-medium">{title}</span>
              </label>
            )}
            <span className="text-xs text-base-content/60">
              {selectedKeys.length}/{items.length} {locale.itemsUnit ?? 'items'}
            </span>
          </div>

          {/* Search */}
          {showSearch && (
            <input
              type="text"
              className="input input-sm input-bordered w-full mb-2"
              placeholder={locale.searchPlaceholder ?? 'Search...'}
              value={searchValue}
              onChange={(e) => handleSearch(direction, e.target.value)}
              disabled={disabled}
            />
          )}

          {/* Items */}
          <div className="max-h-60 overflow-auto">
            {items.length === 0 ? (
              <div className="text-center py-4 text-base-content/50 text-sm">
                {locale.notFoundContent ?? 'No items'}
              </div>
            ) : (
              <ul className="menu p-0 gap-0.5">
                {items.map((item) => (
                  <li key={item.key}>
                    <label
                      className={`flex items-center gap-2 p-2 rounded ${
                        item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${selectedKeys.includes(item.key) ? 'bg-base-200' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedKeys.includes(item.key)}
                        disabled={disabled || item.disabled}
                        onChange={(e) => handleSelect(item.key, direction, e.target.checked)}
                      />
                      <span className="flex-1 text-sm truncate">{renderItem(item)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex items-center gap-4 ${className}`} style={style}>
      {/* Left list */}
      {renderList('left', filteredLeftData, leftSelectedKeys, titles[0], leftSearch)}

      {/* Transfer buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={disabled || leftSelectedKeys.length === 0}
          onClick={() => handleTransfer('right')}
        >
          {operations[0]}
        </button>
        {!oneWay && (
          <button
            type="button"
            className="btn btn-sm btn-outline"
            disabled={disabled || rightSelectedKeys.length === 0}
            onClick={() => handleTransfer('left')}
          >
            {operations[1]}
          </button>
        )}
      </div>

      {/* Right list */}
      {renderList('right', filteredRightData, rightSelectedKeys, titles[1], rightSearch)}
    </div>
  );
}
