'use client';

/**
 * FileManager - Rustic Engine (Inline styles with --ds-* CSS variables)
 */

import React, { useCallback, useRef, type CSSProperties } from 'react';
import type { FileManagerProps, FileItem, FileSystemItem } from '../../types';

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

const containerStyle: CSSProperties = {
  border: '1px solid var(--ds-color-neutral-200, #e5e7eb)',
  borderRadius: 'var(--ds-radius-lg, 8px)',
  background: 'var(--ds-color-background, #fff)',
  overflow: 'hidden',
};

const toolbarStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderBottom: '1px solid var(--ds-color-neutral-200, #e5e7eb)',
};

const btnStyle: CSSProperties = {
  padding: '6px 14px',
  fontSize: 'var(--ds-font-size-sm, 13px)',
  borderRadius: 'var(--ds-radius-md, 6px)',
  border: '1px solid var(--ds-color-neutral-300, #d1d5db)',
  background: 'var(--ds-color-background, #fff)',
  color: 'var(--ds-color-text, #111)',
  cursor: 'pointer',
  fontWeight: 500,
};

const primaryBtnStyle: CSSProperties = {
  ...btnStyle,
  background: 'var(--ds-color-primary)',
  color: 'var(--ds-color-primary-foreground, #fff)',
  borderColor: 'var(--ds-color-primary)',
};

const dangerBtnStyle: CSSProperties = {
  ...btnStyle,
  color: 'var(--ds-color-error, #ef4444)',
  borderColor: 'var(--ds-color-error, #ef4444)',
};

export default function RusticFileManager(props: FileManagerProps) {
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

  if (loading) {
    return (
      <div className={className} style={{ ...containerStyle, textAlign: 'center', padding: 48, ...style }}>
        <span style={{ color: 'var(--ds-color-text-muted)' }}>Loading...</span>
      </div>
    );
  }

  const breadcrumbStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 'var(--ds-font-size-sm, 13px)',
    color: 'var(--ds-color-text-muted)',
  };

  const linkStyle: CSSProperties = {
    color: 'var(--ds-color-primary)',
    cursor: 'pointer',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
  };

  const rowStyle = (selected: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    borderBottom: '1px solid var(--ds-color-neutral-100, #f3f4f6)',
    background: selected ? 'var(--ds-color-primary-50, #eff6ff)' : undefined,
    cursor: 'pointer',
  });

  const gridCardStyle = (selected: boolean): CSSProperties => ({
    width: 110,
    padding: 12,
    textAlign: 'center',
    borderRadius: 'var(--ds-radius-md, 6px)',
    border: selected ? '2px solid var(--ds-color-primary)' : '2px solid transparent',
    cursor: 'pointer',
    background: selected ? 'var(--ds-color-primary-50, #eff6ff)' : undefined,
  });

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      {/* Toolbar */}
      <div style={toolbarStyle}>
        <div style={breadcrumbStyle}>
          <button style={linkStyle} onClick={() => onNavigate?.(null)}>Root</button>
          {currentPath.map((segment, i) => (
            <React.Fragment key={segment}>
              <span>/</span>
              {i < currentPath.length - 1 ? (
                <button style={linkStyle} onClick={() => onNavigate?.(segment)}>{segment}</button>
              ) : (
                <span style={{ color: 'var(--ds-color-text)' }}>{segment}</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selectedItems.length > 0 && onDelete && (
            <button style={dangerBtnStyle} onClick={() => onDelete(selectedItems)}>
              Delete ({selectedItems.length})
            </button>
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
              <button style={primaryBtnStyle} onClick={() => fileInputRef.current?.click()}>
                Upload
              </button>
            </>
          )}
          <button
            style={btnStyle}
            onClick={() => onViewModeChange?.(viewMode === 'grid' ? 'list' : 'grid')}
            title={viewMode === 'grid' ? 'Switch to list' : 'Switch to grid'}
          >
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        style={{ minHeight: 200 }}
      >
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--ds-color-text-muted)' }}>
            {emptyMessage}
          </div>
        ) : viewMode === 'list' ? (
          <div>
            {/* Header */}
            <div style={{ ...rowStyle(false), fontWeight: 600, fontSize: 'var(--ds-font-size-xs, 12px)', color: 'var(--ds-color-text-muted)', textTransform: 'uppercase' as const, cursor: 'default' }}>
              <div style={{ width: 24 }}></div>
              <div style={{ flex: 1 }}>Name</div>
              <div style={{ width: 80 }}>Size</div>
              <div style={{ width: 120 }}>Modified</div>
              <div style={{ width: 100 }}>Actions</div>
            </div>
            {items.map(item => (
              <div key={item.id} style={rowStyle(selectedItems.includes(item.id))}>
                <div style={{ width: 24 }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelect(item.id)}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>
                    {item.type === 'folder' ? '\uD83D\uDCC1' : renderFileIcon ? renderFileIcon(item as FileItem) : '\uD83D\uDCC4'}
                  </span>
                  {item.type === 'folder' ? (
                    <button style={linkStyle} onClick={() => onNavigate?.(item.id)}>{item.name}</button>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </div>
                <div style={{ width: 80, fontSize: 'var(--ds-font-size-sm, 13px)', color: 'var(--ds-color-text-muted)' }}>
                  {item.type === 'file' ? formatSize((item as FileItem).size) : '--'}
                </div>
                <div style={{ width: 120, fontSize: 'var(--ds-font-size-sm, 13px)', color: 'var(--ds-color-text-muted)' }}>
                  {formatDate(item.modifiedAt)}
                </div>
                <div style={{ width: 100, display: 'flex', gap: 4 }}>
                  {onRename && (
                    <button
                      style={{ ...linkStyle, fontSize: 'var(--ds-font-size-xs, 12px)' }}
                      onClick={() => {
                        const newName = window.prompt('New name:', item.name);
                        if (newName && newName !== item.name) onRename(item.id, newName);
                      }}
                    >
                      Rename
                    </button>
                  )}
                  {onDelete && (
                    <button
                      style={{ ...linkStyle, fontSize: 'var(--ds-font-size-xs, 12px)', color: 'var(--ds-color-error, #ef4444)' }}
                      onClick={() => onDelete([item.id])}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16 }}>
            {items.map(item => (
              <div
                key={item.id}
                style={gridCardStyle(selectedItems.includes(item.id))}
                onClick={() => item.type === 'folder' ? onNavigate?.(item.id) : handleSelect(item.id)}
              >
                <div style={{ fontSize: 32, marginBottom: 4 }}>
                  {item.type === 'folder' ? '\uD83D\uDCC1' : renderFileIcon ? renderFileIcon(item as FileItem) : '\uD83D\uDCC4'}
                </div>
                <div style={{ fontSize: 'var(--ds-font-size-xs, 12px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
