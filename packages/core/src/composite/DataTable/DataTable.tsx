import React, { useState } from 'react';
import { Table, Input, Button, Space, theme } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import type { DataTableProps } from './types';

/**
 * DataTable Component
 *
 * Enhanced table with search, filters, pagination, and export functionality.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   showSearch
 *   showExport
 *   onExport={handleExport}
 * />
 * ```
 */
export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
  showExport = false,
  exportButtonText = 'Export',
  onExport,
  showSelection = false,
  onSelectionChange,
  loading = false,
  ...rest
}: DataTableProps<T>) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Theme-specific styles for selection info
  const getSelectionInfoStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      marginBottom: '16px',
      border: `1px solid ${token.colorPrimaryBorder}`,
    };

    switch (template) {
      case 'spotify':
        return {
          ...baseStyles,
          background: 'rgba(29, 185, 84, 0.1)',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        };
      case 'stripe':
        return {
          ...baseStyles,
          background: '#F6F5FF',
          padding: '10px 16px',
          borderRadius: 6,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        };
      case 'notion':
        return {
          ...baseStyles,
          background: '#F7F6F3',
          padding: '8px 14px',
          borderRadius: 3,
          boxShadow: 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px',
        };
      case 'linear':
        return {
          ...baseStyles,
          background: '#F5F6FF',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05)',
        };
      default:
        return {
          ...baseStyles,
          background: token.colorPrimaryBg,
          padding: '8px 16px',
          borderRadius: 4,
        };
    }
  };

  // Theme-specific toolbar styles
  const getToolbarStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          marginBottom: 24,
        };
      case 'stripe':
        return {
          marginBottom: 20,
        };
      case 'notion':
        return {
          marginBottom: 16,
        };
      case 'linear':
        return {
          marginBottom: 24,
        };
      default:
        return {
          marginBottom: 16,
        };
    }
  };

  // Convert columns to Ant Design format
  const antdColumns = columns.map((col) => ({
    key: col.key,
    title: col.title,
    dataIndex: col.dataIndex || col.key,
    render: col.render,
    sorter: col.sorter,
    width: col.width,
    align: col.align,
  }));

  // Row selection config
  const rowSelection = showSelection
    ? {
        selectedRowKeys,
        onChange: (keys: React.Key[], rows: T[]) => {
          setSelectedRowKeys(keys);
          onSelectionChange?.(keys, rows);
        },
      }
    : undefined;

  return (
    <div>
      {/* Toolbar */}
      {(showSearch || showExport) && (
        <div
          style={{
            ...getToolbarStyles(),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Search */}
          {showSearch && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              onChange={(e) => onSearch?.(e.target.value)}
              style={{
                maxWidth: template === 'spotify' || template === 'linear' ? '350px' : '300px',
              }}
              allowClear
            />
          )}

          {/* Export Button */}
          {showExport && (
            <Button icon={<DownloadOutlined />} onClick={onExport}>
              {exportButtonText}
            </Button>
          )}
        </div>
      )}

      {/* Selection Info */}
      {showSelection && selectedRowKeys.length > 0 && (
        <div style={getSelectionInfoStyles()}>
          <Space>
            <span style={{
              fontWeight: template === 'spotify' || template === 'notion' ? 600 : 500,
              color: token.colorText,
            }}>
              {selectedRowKeys.length} item(s) selected
            </span>
            <Button
              size="small"
              type="link"
              onClick={() => {
                setSelectedRowKeys([]);
                onSelectionChange?.([], []);
              }}
            >
              Clear selection
            </Button>
          </Space>
        </div>
      )}

      {/* Table */}
      <Table
        {...rest}
        columns={antdColumns}
        dataSource={data}
        rowSelection={rowSelection}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          ...rest.pagination,
        }}
      />
    </div>
  );
};

DataTable.displayName = 'DataTable';
