import React, { useState, useEffect, useMemo } from 'react';
import { Table, Input, Button, Space, Dropdown, Checkbox, Card, theme, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  EyeOutlined,
  FileExcelOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import type { DataTableProps, DataTableState, DensitySize } from './types';

/**
 * DataTable Component - Enhanced
 *
 * Feature-rich table with 10+ advanced capabilities:
 * 1. ✅ Sorting by column (ASC/DESC/None)
 * 2. 📄 Export to CSV/Excel
 * 3. 👁️ Show/Hide columns
 * 4. ☑️ Bulk actions
 * 5. 📦 Expandable rows
 * 6. 🎨 Density modes (Compact/Default/Comfortable)
 * 7. 📍 Sticky header
 * 8. 💾 Save table state to localStorage
 * 9. 🔄 Refresh button
 * 10. 📱 Responsive mode (cards on mobile)
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   showSearch
 *   enableCSVExport
 *   showColumnToggle
 *   showDensityToggle
 *   stickyHeader
 *   saveState
 *   stateKey="my-table"
 *   responsive
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
  // New features
  enableCSVExport = false,
  enableExcelExport = false,
  exportFilename = 'export',
  showColumnToggle = false,
  bulkActions = [],
  expandable,
  showDensityToggle = false,
  defaultDensity = 'default',
  stickyHeader = false,
  stickyOffset = 0,
  saveState = false,
  stateKey,
  showRefresh = false,
  onRefresh,
  responsive = false,
  responsiveBreakpoint = 768,
  renderCard,
  ...rest
}: DataTableProps<T>) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Load initial state from localStorage
  const loadState = (): DataTableState => {
    if (saveState && stateKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`datatable-${stateKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved DataTable state');
        }
      }
    }
    return {
      hiddenColumns: columns.filter(col => col.defaultVisible === false).map(col => col.key),
      density: defaultDensity,
      pageSize: rest.pagination === false ? data.length : (rest.pagination?.defaultPageSize || 10),
      currentPage: 1,
    };
  };

  const [tableState, setTableState] = useState<DataTableState>(loadState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (saveState && stateKey && typeof window !== 'undefined') {
      localStorage.setItem(`datatable-${stateKey}`, JSON.stringify(tableState));
    }
  }, [tableState, saveState, stateKey]);

  // Handle responsive mode
  useEffect(() => {
    if (!responsive) return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < responsiveBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [responsive, responsiveBreakpoint]);

  // Export to CSV
  const exportToCSV = () => {
    const visibleColumns = columns.filter(col => !tableState.hiddenColumns.includes(col.key));
    const headers = visibleColumns.map(col => col.title).join(',');
    const rows = data.map(row =>
      visibleColumns.map(col => {
        const value = row[col.dataIndex || col.key];
        // Escape commas and quotes
        const escaped = String(value || '').replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFilename}.csv`;
    link.click();
  };

  // Export to Excel (simple CSV with .xlsx extension)
  const exportToExcel = () => {
    const visibleColumns = columns.filter(col => !tableState.hiddenColumns.includes(col.key));
    const headers = visibleColumns.map(col => col.title).join('\t');
    const rows = data.map(row =>
      visibleColumns.map(col => {
        const value = row[col.dataIndex || col.key];
        return String(value || '');
      }).join('\t')
    );
    const tsv = [headers, ...rows].join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFilename}.xls`;
    link.click();
  };

  // Toggle column visibility
  const toggleColumn = (key: string) => {
    setTableState(prev => ({
      ...prev,
      hiddenColumns: prev.hiddenColumns.includes(key)
        ? prev.hiddenColumns.filter(k => k !== key)
        : [...prev.hiddenColumns, key],
    }));
  };

  // Change density
  const changeDensity = (density: DensitySize) => {
    setTableState(prev => ({ ...prev, density }));
  };

  // Theme-specific styles
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

  const getToolbarStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return { marginBottom: 24 };
      case 'stripe':
        return { marginBottom: 20 };
      case 'notion':
        return { marginBottom: 16 };
      case 'linear':
        return { marginBottom: 24 };
      default:
        return { marginBottom: 16 };
    }
  };

  // Filter visible columns
  const visibleColumns = useMemo(() =>
    columns.filter(col => !tableState.hiddenColumns.includes(col.key)),
    [columns, tableState.hiddenColumns]
  );

  // Convert columns to Ant Design format
  const antdColumns = visibleColumns.map((col) => ({
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
          setSelectedRows(rows);
          onSelectionChange?.(keys, rows);
        },
      }
    : undefined;

  // Density size mapping
  const densityToSize = {
    compact: 'small' as const,
    default: 'middle' as const,
    comfortable: 'large' as const,
  };

  // Column toggle menu
  const columnToggleMenu: MenuProps = {
    items: columns
      .filter(col => col.hideable !== false)
      .map(col => ({
        key: col.key,
        label: (
          <Checkbox
            checked={!tableState.hiddenColumns.includes(col.key)}
            onChange={() => toggleColumn(col.key)}
          >
            {col.title}
          </Checkbox>
        ),
      })),
  };

  // Density toggle menu
  const densityMenu: MenuProps = {
    items: [
      {
        key: 'compact',
        label: 'Compact',
        onClick: () => changeDensity('compact'),
      },
      {
        key: 'default',
        label: 'Default',
        onClick: () => changeDensity('default'),
      },
      {
        key: 'comfortable',
        label: 'Comfortable',
        onClick: () => changeDensity('comfortable'),
      },
    ],
  };

  // Export menu
  const exportMenu: MenuProps = {
    items: [
      ...(enableCSVExport ? [{
        key: 'csv',
        label: 'Export CSV',
        icon: <FileExcelOutlined />,
        onClick: exportToCSV,
      }] : []),
      ...(enableExcelExport ? [{
        key: 'excel',
        label: 'Export Excel',
        icon: <FileExcelOutlined />,
        onClick: exportToExcel,
      }] : []),
      ...(onExport ? [{
        key: 'custom',
        label: exportButtonText,
        icon: <DownloadOutlined />,
        onClick: onExport,
      }] : []),
    ],
  };

  // Bulk actions menu
  const bulkActionsMenu: MenuProps = {
    items: bulkActions.map(action => ({
      key: action.key,
      label: action.label,
      icon: action.icon,
      danger: action.danger,
      disabled: action.disabled?.(selectedRowKeys, selectedRows),
      onClick: () => action.onClick(selectedRowKeys, selectedRows),
    })),
  };

  // Responsive card view
  if (responsive && isMobile) {
    return (
      <div>
        {/* Mobile Toolbar */}
        <div style={{ marginBottom: 16 }}>
          {showSearch && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              onChange={(e) => onSearch?.(e.target.value)}
              style={{ marginBottom: 12 }}
              allowClear
            />
          )}
          {showRefresh && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
              block
            >
              Refresh
            </Button>
          )}
        </div>

        {/* Cards */}
        {data.map((record, index) => (
          <Card
            key={record.key || index}
            style={{ marginBottom: 12 }}
            size="small"
          >
            {renderCard ? renderCard(record, index) : (
              <div>
                {visibleColumns.map(col => (
                  <div key={col.key} style={{ marginBottom: 8 }}>
                    <strong>{col.title}:</strong>{' '}
                    {col.render
                      ? col.render(record[col.dataIndex || col.key], record, index)
                      : record[col.dataIndex || col.key]
                    }
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div>
      {/* Toolbar */}
      {(showSearch || showExport || showRefresh || showColumnToggle || showDensityToggle || enableCSVExport || enableExcelExport) && (
        <div
          style={{
            ...getToolbarStyles(),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Left side - Search */}
          <div style={{ flex: '1 1 300px', minWidth: 200 }}>
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
          </div>

          {/* Right side - Actions */}
          <Space wrap>
            {showRefresh && (
              <Tooltip title="Refresh data">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  loading={loading}
                />
              </Tooltip>
            )}

            {showDensityToggle && (
              <Dropdown menu={densityMenu} trigger={['click']}>
                <Tooltip title="Density">
                  <Button icon={<ColumnHeightOutlined />} />
                </Tooltip>
              </Dropdown>
            )}

            {showColumnToggle && (
              <Dropdown menu={columnToggleMenu} trigger={['click']}>
                <Tooltip title="Show/Hide columns">
                  <Button icon={<EyeOutlined />} />
                </Tooltip>
              </Dropdown>
            )}

            {(enableCSVExport || enableExcelExport || showExport) && exportMenu.items && exportMenu.items.length > 0 && (
              <Dropdown menu={exportMenu} trigger={['click']}>
                <Button icon={<DownloadOutlined />}>
                  Export
                </Button>
              </Dropdown>
            )}
          </Space>
        </div>
      )}

      {/* Selection Info & Bulk Actions */}
      {showSelection && selectedRowKeys.length > 0 && (
        <div style={getSelectionInfoStyles()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  setSelectedRows([]);
                  onSelectionChange?.([], []);
                }}
              >
                Clear selection
              </Button>
            </Space>

            {bulkActions.length > 0 && (
              <Space>
                {bulkActions.slice(0, 2).map(action => (
                  <Button
                    key={action.key}
                    size="small"
                    icon={action.icon}
                    danger={action.danger}
                    disabled={action.disabled?.(selectedRowKeys, selectedRows)}
                    onClick={() => action.onClick(selectedRowKeys, selectedRows)}
                  >
                    {action.label}
                  </Button>
                ))}
                {bulkActions.length > 2 && (
                  <Dropdown menu={bulkActionsMenu} trigger={['click']}>
                    <Button size="small" icon={<MoreOutlined />} />
                  </Dropdown>
                )}
              </Space>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <Table
        {...rest}
        columns={antdColumns}
        dataSource={data}
        rowSelection={rowSelection}
        loading={loading}
        size={densityToSize[tableState.density]}
        sticky={stickyHeader ? { offsetHeader: stickyOffset } : undefined}
        expandable={expandable}
        pagination={
          rest.pagination === false
            ? false
            : {
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                pageSize: tableState.pageSize,
                current: tableState.currentPage,
                onChange: (page, pageSize) => {
                  setTableState(prev => ({
                    ...prev,
                    currentPage: page,
                    pageSize: pageSize,
                  }));
                },
                ...rest.pagination,
              }
        }
      />
    </div>
  );
};

DataTable.displayName = 'DataTable';
