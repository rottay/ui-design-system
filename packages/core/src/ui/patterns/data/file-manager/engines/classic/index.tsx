'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the FileManager pattern.
 * Renders a file/folder browser with list and grid views, breadcrumb navigation,
 * upload (click + drag-and-drop), multi-select, rename, and bulk delete.
 * Built on Ant Design's Table, Card, Breadcrumb, and Upload primitives.
 *
 * @example
 * <ClassicFileManager
 *   files={[{ id: '1', name: 'report.pdf', type: 'file', mimeType: 'application/pdf', size: 204800 }]}
 *   folders={[{ id: 'f1', name: 'Documents', type: 'folder' }]}
 *   currentPath={['Documents']}
 *   viewMode="list"
 *   onUpload={(files) => upload(files)}
 *   onNavigate={(folderId) => setFolder(folderId)}
 * />
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
import type { FileManagerProps, FileItem, FolderItem, FileSystemItem } from '../../contracts';

/**
 * Returns a visually distinct Ant Design icon based on file MIME type.
 * Thumbnails take priority so image files show their actual preview
 * instead of a generic icon.
 */
function getFileIcon(item: FileItem): React.ReactNode {
  // If the file has a thumbnail (e.g. image preview from the server), show that instead of an icon.
  if (item.thumbnail) {
    return <img src={item.thumbnail} alt={item.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />;
  }
  // Color-code by MIME family so users can visually distinguish file types at a glance.
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
  // Fallback: generic file icon in muted color for unknown MIME types.
  return <FileOutlined style={{ fontSize: 24, color: 'var(--ds-color-text-tertiary, #8c8c8c)' }} />;
}

/** Converts raw byte count to a human-friendly size string (B/KB/MB/GB). */
function formatSize(bytes?: number): string {
  if (bytes == null) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** Formats an ISO date string to a short locale-aware date (e.g. "Mar 15, 2026"). */
function formatDate(date?: string): string {
  if (!date) return '--';
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Classic (Ant Design) FileManager engine.
 *
 * Supports two view modes: a sortable Table ("list") and a grid of thumbnails ("grid").
 * Selection is toggle-based (checkbox per item). Folders always render before files
 * to match OS file explorer conventions.
 *
 * @param props - {@link FileManagerProps} -- files, folders, callbacks, and display options.
 * @returns The FileManager UI wrapped in an Ant Design Card.
 */
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

  // Hidden <input type="file"> is triggered programmatically by the Upload button
  // so we can use a styled button while still leveraging the native file picker.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge folders and files into a single array with a discriminator.
  // Folders render first so they always appear above files, matching OS convention.
  const items: FileSystemItem[] = [
    ...folders.map(f => ({ ...f, type: 'folder' as const })),
    ...files.map(f => ({ ...f, type: 'file' as const })),
  ];

  // Toggle an item's selection. Uses controlled selection via onSelectionChange,
  // so the parent owns the selected state array.
  const handleSelect = useCallback((id: string) => {
    if (!onSelectionChange) return;
    const isSelected = selectedItems.includes(id);
    if (isSelected) {
      onSelectionChange(selectedItems.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  }, [selectedItems, onSelectionChange]);

  // Reset the input value after read so the same file can be re-selected
  // (browsers skip onChange if the value hasn't changed).
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

  // Build breadcrumb trail. Each intermediate segment is clickable for navigation;
  // the last segment is plain text because the user is already there.
  const breadcrumbItems = [
    { title: <a onClick={() => onNavigate?.(null)}>Root</a>, key: 'root' },
    ...currentPath.map((segment, i) => ({
      title: i < currentPath.length - 1
        ? <a onClick={() => onNavigate?.(segment)}>{segment}</a>
        : segment,
      key: segment,
    })),
  ];

  // Ant Design Table column definitions for the "list" view mode.
  // Folders show a folder icon + clickable name; files show a MIME-based icon + plain name.
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
          {/* Folders always use a standard folder icon; files delegate to renderFileIcon or the default helper. */}
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
      // Per-row actions. Rename uses window.prompt as a lightweight inline rename;
      // delete wraps the single ID in an array to match the bulk-delete signature.
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

  // Grid view: each item is a fixed-width card. Clicking a folder navigates into it;
  // clicking a file toggles its selection. Selected items get a primary-colored border.
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

      {/* Drop zone wraps the entire content area. onDragOver must preventDefault
          so the browser treats this element as a valid drop target. */}
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
