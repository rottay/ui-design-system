'use client';

/**
 * FileManager - Classic Engine (Ant Design)
 */

import React, { useCallback, useRef } from 'react';
import { Table, Button, Space, Breadcrumb, Card, Upload, Checkbox, Tooltip, Dropdown } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { FileManagerProps, FileItem, FolderItem, FileSystemItem } from '../FileManager.types';

function getFileIcon(item: FileItem): React.ReactNode {
  if (item.thumbnail) {
    return <img src={item.thumbnail} alt={item.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />;
  }
  const mime = item.mimeType || '';
  if (mime.startsWith('image/')) {
    return <FileImageOutlined style={{ fontSize: 24, color: 'var(--ds-color-primary-500, #1677ff)' }} />;
  }
  if (mime === 'application/pdf') {
    return <FilePdfOutlined style={{ fontSize: 24, color: 'var(--ds-color-error-600, #dc2626)' }} />;
  }
  if (mime.startsWith('text/')) {
    return <FileTextOutlined style={{ fontSize: 24, color: 'var(--ds-color-success-600, #16a34a)' }} />;
  }
  return <FileOutlined style={{ fontSize: 24, color: 'var(--ds-color-text-tertiary, #8c8c8c)' }} />;
}

function formatSize(bytes?: number): string {
  if (bytes == null) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(date?: string): string {
  if (!date) return '--';
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ClassicFileManager(props: FileManagerProps) {
  const {
    files,
    folders,
    currentPath = [],
    viewMode = 'list',
    selectedItems = [],
    onUpload,
    onDelete,
    onRename,
    onNavigate,
    onSelectionChange,
    onViewModeChange,
    emptyMessage = 'No files or folders',
    renderFileIcon,
    loading,
    className,
    style,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const items: FileSystemItem[] = [
    ...folders.map(f => ({ ...f, type: 'folder' as const })),
    ...files.map(f => ({ ...f, type: 'file' as const })),
  ];

  const handleSelect = useCallback((id: string) => {
    if (!onSelectionChange) return;
    const isSelected = selectedItems.includes(id);
    if (isSelected) {
      onSelectionChange(selectedItems.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  }, [selectedItems, onSelectionChange]);

  const handleUploadChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpload) {
      onUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0 && onUpload) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  }, [onUpload]);

  const breadcrumbItems = [
    { title: <a onClick={() => onNavigate?.(null)}>Root</a>, key: 'root' },
    ...currentPath.map((segment, i) => ({
      title: i < currentPath.length - 1
        ? <a onClick={() => onNavigate?.(segment)}>{segment}</a>
        : segment,
      key: segment,
    })),
  ];

  const columns = [
    {
      title: '',
      dataIndex: 'id',
      key: 'select',
      width: 40,
      render: (_: unknown, record: FileSystemItem) => (
        <Checkbox
          checked={selectedItems.includes(record.id)}
          onChange={() => handleSelect(record.id)}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: FileSystemItem) => (
        <Space>
          {record.type === 'folder'
            ? <FolderOutlined style={{ fontSize: 18, color: 'var(--ds-color-warning-500, #faad14)' }} />
            : renderFileIcon
              ? renderFileIcon(record as FileItem)
              : getFileIcon(record as FileItem)}
          {record.type === 'folder' ? (
            <a onClick={() => onNavigate?.(record.id)}>{record.name}</a>
          ) : (
            <span>{record.name}</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Size',
      key: 'size',
      width: 100,
      render: (_: unknown, record: FileSystemItem) =>
        record.type === 'file' ? formatSize((record as FileItem).size) : '--',
    },
    {
      title: 'Modified',
      dataIndex: 'modifiedAt',
      key: 'modifiedAt',
      width: 140,
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: FileSystemItem) => (
        <Space size="small">
          {onRename && (
            <Tooltip title="Rename">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  const newName = window.prompt('New name:', record.name);
                  if (newName && newName !== record.name) onRename(record.id, newName);
                }}
              />
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete([record.id])}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const gridItems = items.map(item => (
    <div
      key={item.id}
      onClick={() => item.type === 'folder' ? onNavigate?.(item.id) : handleSelect(item.id)}
      style={{
        width: 120,
        padding: 12,
        textAlign: 'center',
        borderRadius: 8,
        border: selectedItems.includes(item.id)
          ? '2px solid var(--ds-color-primary-500, #1677ff)'
          : '2px solid transparent',
        cursor: 'pointer',
        background: selectedItems.includes(item.id) ? 'var(--ds-color-primary-50, #e6f7ff)' : undefined,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>
        {item.type === 'folder'
          ? <FolderOutlined style={{ color: 'var(--ds-color-warning-500, #faad14)' }} />
          : renderFileIcon
            ? renderFileIcon(item as FileItem)
            : getFileIcon(item as FileItem)}
      </div>
      <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.name}
      </div>
    </div>
  ));

  return (
    <Card
      className={`ds-pattern-file-manager ds-engine-classic ${className ?? ''}`}
      style={style}
      loading={loading}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Breadcrumb items={breadcrumbItems} />
        <Space>
          {selectedItems.length > 0 && onDelete && (
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(selectedItems)}>
              Delete ({selectedItems.length})
            </Button>
          )}
          {onUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleUploadChange}
                data-testid="file-input"
              />
              <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
                Upload
              </Button>
            </>
          )}
          <Button
            icon={viewMode === 'grid' ? <UnorderedListOutlined /> : <AppstoreOutlined />}
            onClick={() => onViewModeChange?.(viewMode === 'grid' ? 'list' : 'grid')}
          />
        </Space>
      </div>

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        style={{ minHeight: 200 }}
      >
        {items.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 48,
              color: 'var(--ds-color-text-secondary, rgba(0,0,0,0.45))',
            }}
          >
            {emptyMessage}
          </div>
        ) : viewMode === 'list' ? (
          <Table
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {gridItems}
          </div>
        )}
      </div>
    </Card>
  );
}
