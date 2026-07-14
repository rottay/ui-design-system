'use client';

/**
 * @fileoverview Rustic (Vanilla / CSS variables) engine for the FileManager pattern.
 * Renders a file/folder browser with a token-driven engine skin and inline layout,
 * making it framework-agnostic (no Ant Design or Tailwind dependency). Supports list
 * and grid views, breadcrumb navigation, drag-and-drop upload, multi-select, rename,
 * and bulk delete.
 *
 * @example
 * <RusticFileManager
 *   files={[{ id: '1', name: 'data.csv', type: 'file', mimeType: 'text/csv', size: 8192 }]}
 *   folders={[{ id: 'f1', name: 'Exports', type: 'folder' }]}
 *   viewMode="list"
 *   onUpload={(files) => handleUpload(files)}
 *   onDelete={(ids) => handleDelete(ids)}
 * />
 */

import React, { useCallback, useRef, type CSSProperties } from 'react';
import type { FileManagerProps, FileItem, FileSystemItem } from '../FileManager.types';

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

// ---------------------------------------------------------------------------
// Static layout objects.
// ---------------------------------------------------------------------------

const containerStyle: CSSProperties = {
  overflow: 'hidden',
};

const toolbarStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
};

const btnStyle: CSSProperties = {
  padding: '6px 14px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
  cursor: 'pointer',
  fontWeight: 500,
};

// Primary and danger button variants share the same layout metrics.
const primaryBtnStyle: CSSProperties = {
  ...btnStyle,
};

const dangerBtnStyle: CSSProperties = {
  ...btnStyle,
};

/**
 * Rustic (Vanilla) FileManager engine.
 *
 * Uses a token-driven skin for paint and inline layout metrics. No external CSS
 * framework is required. Grid and list views are built
 * with plain flexbox, and breadcrumb segments use styled `<button>` elements
 * to remain semantically accessible.
 *
 * @param props - {@link FileManagerProps} -- files, folders, callbacks, and display options.
 * @returns The FileManager UI as a bordered container div.
 */
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

  // Hidden file input triggered programmatically for native file picker access.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folders are placed first so they visually precede files (standard OS convention).
  const items: FileSystemItem[] = [
    ...folders.map(f => ({ ...f, type: 'folder' as const })),
    ...files.map(f => ({ ...f, type: 'file' as const })),
  ];

  // Toggle selection on/off for a single item. The parent owns the selected state.
  const handleSelect = useCallback((id: string) => {
    if (!onSelectionChange) return;
    const isSelected = selectedItems.includes(id);
    if (isSelected) {
      onSelectionChange(selectedItems.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  }, [selectedItems, onSelectionChange]);

  // File input value must be reset to empty string after selection so the browser's
  // change event fires even when re-selecting the same file.
  const handleUploadChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpload) {
      onUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  }, [onUpload]);

  // Drag-and-drop handler. preventDefault on dragOver is required for drop to work.
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0 && onUpload) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  }, [onUpload]);

  if (loading) {
    return (
      <div
        className={`ds-pattern-file-manager ds-engine-rustic ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        data-view-mode={viewMode}
        style={{ ...containerStyle, textAlign: 'center', padding: 48, ...style }}
      >
        <span className="ds-file-manager__loading-label" data-part="loading-label">Loading...</span>
      </div>
    );
  }

  // Breadcrumb and link styles are defined inside the component because
  // they reference the same --ds-* variables but are only used in the toolbar.
  const breadcrumbStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 'var(--ds-font-size-sm, 14px)',
  };

  // Link layout keeps the clickable controls aligned and inheriting the
  // container font; the engine skin owns their native paint resets.
  const linkStyle: CSSProperties = {
    cursor: 'pointer',
    textDecoration: 'none',
    padding: 0,
    font: 'inherit',
  };

  // Row and grid card layout factories keep sizing stable across states.
  const rowStyle = (_selected: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    cursor: 'pointer',
  });

  const gridCardStyle = (_selected: boolean): CSSProperties => ({
    width: 110,
    padding: 12,
    textAlign: 'center',
    cursor: 'pointer',
  });

  return (
    <div
      className={`ds-pattern-file-manager ds-engine-rustic ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      data-view-mode={viewMode}
      style={{ ...containerStyle, ...style }}
    >
      {/* Toolbar */}
      <div className="ds-file-manager__toolbar" data-part="toolbar" style={toolbarStyle}>
        <div className="ds-file-manager__breadcrumb" data-part="breadcrumb" style={breadcrumbStyle}>
          <button className="ds-file-manager__breadcrumb-link" data-part="breadcrumb-link" data-action="navigate-root" style={linkStyle} onClick={() => onNavigate?.(null)}>Root</button>
          {currentPath.map((segment, i) => (
            <React.Fragment key={segment}>
              <span>/</span>
              {i < currentPath.length - 1 ? (
                <button className="ds-file-manager__breadcrumb-link" data-part="breadcrumb-link" data-action="navigate-folder" style={linkStyle} onClick={() => onNavigate?.(segment)}>{segment}</button>
              ) : (
                <span className="ds-file-manager__breadcrumb-current" data-part="breadcrumb-current">{segment}</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selectedItems.length > 0 && onDelete && (
            <button className="ds-file-manager__toolbar-action" data-part="toolbar-action" data-action="delete-selected" style={dangerBtnStyle} onClick={() => onDelete(selectedItems)}>
              Delete ({selectedItems.length})
            </button>
          )}
          {onUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                data-part="file-input"
                style={{ display: 'none' }}
                onChange={handleUploadChange}
                data-testid="file-input"
              />
              <button className="ds-file-manager__toolbar-action" data-part="toolbar-action" data-action="upload" style={primaryBtnStyle} onClick={() => fileInputRef.current?.click()}>
                Upload
              </button>
            </>
          )}
          <button
            className="ds-file-manager__view-toggle"
            data-part="view-toggle"
            data-action="toggle-view"
            data-view-mode={viewMode}
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
        data-part="content"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        style={{ minHeight: 200 }}
      >
        {items.length === 0 ? (
          <div className="ds-file-manager__empty" data-part="empty" style={{ textAlign: 'center', padding: 48 }}>
            {emptyMessage}
          </div>
        ) : viewMode === 'list' ? (
          <div>
            {/* Column headers styled as an uppercase label row. cursor:default overrides
                the pointer cursor from rowStyle since headers are not interactive. */}
            <div className="ds-file-manager__column-header" data-part="column-header" data-selected={false} style={{ ...rowStyle(false), fontWeight: 600, fontSize: 'var(--ds-font-size-xs, 12px)', textTransform: 'uppercase' as const, cursor: 'default' }}>
              <div style={{ width: 24 }}></div>
              <div style={{ flex: 1 }}>Name</div>
              <div style={{ width: 80 }}>Size</div>
              <div style={{ width: 120 }}>Modified</div>
              <div style={{ width: 100 }}>Actions</div>
            </div>
            {items.map(item => (
              <div
                className="ds-file-manager__row"
                key={item.id}
                data-part="row"
                data-selected={selectedItems.includes(item.id)}
                data-file-kind={item.type === 'folder' ? 'folder' : (item as FileItem).mimeType?.startsWith('image/') ? 'image' : (item as FileItem).mimeType === 'application/pdf' ? 'pdf' : (item as FileItem).mimeType?.startsWith('text/') ? 'text' : 'other'}
                style={rowStyle(selectedItems.includes(item.id))}
              >
                <div style={{ width: 24 }}>
                  <input
                    data-part="checkbox"
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelect(item.id)}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    data-part={item.type === 'folder' ? 'folder-icon' : 'file-icon'}
                    data-file-kind={item.type === 'folder' ? 'folder' : (item as FileItem).mimeType?.startsWith('image/') ? 'image' : (item as FileItem).mimeType === 'application/pdf' ? 'pdf' : (item as FileItem).mimeType?.startsWith('text/') ? 'text' : 'other'}
                    style={{ fontSize: 16 }}
                  >
                    {item.type === 'folder' ? '\uD83D\uDCC1' : renderFileIcon ? renderFileIcon(item as FileItem) : '\uD83D\uDCC4'}
                  </span>
                  {item.type === 'folder' ? (
                    <button className="ds-file-manager__folder-link" data-part="folder-link" data-action="navigate-folder" style={linkStyle} onClick={() => onNavigate?.(item.id)}>{item.name}</button>
                  ) : (
                    <span data-part="file-name">{item.name}</span>
                  )}
                </div>
                <div className="ds-file-manager__file-size" data-part="file-size" style={{ width: 80, fontSize: 'var(--ds-font-size-sm, 14px)' }}>
                  {item.type === 'file' ? formatSize((item as FileItem).size) : '--'}
                </div>
                <div className="ds-file-manager__modified-at" data-part="modified-at" style={{ width: 120, fontSize: 'var(--ds-font-size-sm, 14px)' }}>
                  {formatDate(item.modifiedAt)}
                </div>
                <div style={{ width: 100, display: 'flex', gap: 4 }}>
                  {onRename && (
                    <button
                      className="ds-file-manager__item-action"
                      data-part="item-action"
                      data-action="rename"
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
                      className="ds-file-manager__item-action"
                      data-part="item-action"
                      data-action="delete"
                      style={{ ...linkStyle, fontSize: 'var(--ds-font-size-xs, 12px)' }}
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
                className="ds-file-manager__grid-card"
                key={item.id}
                data-part="grid-card"
                data-selected={selectedItems.includes(item.id)}
                data-file-kind={item.type === 'folder' ? 'folder' : (item as FileItem).mimeType?.startsWith('image/') ? 'image' : (item as FileItem).mimeType === 'application/pdf' ? 'pdf' : (item as FileItem).mimeType?.startsWith('text/') ? 'text' : 'other'}
                style={gridCardStyle(selectedItems.includes(item.id))}
                onClick={() => item.type === 'folder' ? onNavigate?.(item.id) : handleSelect(item.id)}
              >
                <div
                  data-part={item.type === 'folder' ? 'folder-icon' : 'file-icon'}
                  data-file-kind={item.type === 'folder' ? 'folder' : (item as FileItem).mimeType?.startsWith('image/') ? 'image' : (item as FileItem).mimeType === 'application/pdf' ? 'pdf' : (item as FileItem).mimeType?.startsWith('text/') ? 'text' : 'other'}
                  style={{ fontSize: 32, marginBottom: 4 }}
                >
                  {item.type === 'folder' ? '\uD83D\uDCC1' : renderFileIcon ? renderFileIcon(item as FileItem) : '\uD83D\uDCC4'}
                </div>
                <div data-part="item-name" style={{ fontSize: 'var(--ds-font-size-xs, 12px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
