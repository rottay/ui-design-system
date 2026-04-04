'use client';

/**
 * @fileoverview Modern (DaisyUI / Tailwind) engine for the FileManager pattern.
 * Renders a file/folder browser with list (table) and grid (card) views,
 * breadcrumb navigation, drag-and-drop upload, multi-select, rename, and bulk delete.
 * Uses DS token inline styles for buttons and Tailwind utilities for layout
 * -- no Ant Design dependency.
 *
 * @example
 * <ModernFileManager
 *   files={[{ id: '1', name: 'photo.jpg', type: 'file', mimeType: 'image/jpeg', size: 512000 }]}
 *   folders={[{ id: 'f1', name: 'Photos', type: 'folder' }]}
 *   viewMode="grid"
 *   onUpload={(files) => uploadFiles(files)}
 *   onNavigate={(folderId) => setCurrentFolder(folderId)}
 * />
 */

import React, { useCallback, useRef } from 'react';
import type { FileManagerProps, FileItem, FileSystemItem } from '../FileManager.types';

/**
 * Maps a file's MIME type to a DaisyUI text color class.
 * This provides quick visual differentiation between file categories
 * without requiring separate icon assets.
 */
function getFileIconStyle(item: FileItem): React.CSSProperties {
  const mime = item.mimeType || '';
  if (mime.startsWith('image/')) return { color: 'var(--ds-color-info)' };
  if (mime === 'application/pdf') return { color: 'var(--ds-color-error)' };
  if (mime.startsWith('text/')) return { color: 'var(--ds-color-success)' };
  // Fallback: muted color for unknown or binary files.
  return { color: 'var(--ds-color-text-secondary)' };
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
 * Modern (DaisyUI) FileManager engine.
 *
 * Supports list and grid views with responsive grid columns (2/4/6 breakpoints).
 * Selection is toggle-based via DaisyUI checkboxes. The entire content area
 * acts as a drag-and-drop upload zone.
 *
 * @param props - {@link FileManagerProps} -- files, folders, callbacks, and display options.
 * @returns The FileManager UI wrapped in a DaisyUI card.
 */
export default function ModernFileManager(props: FileManagerProps) {
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

  // Hidden file input is triggered by the Upload button click to open the native file picker.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge folders first, then files, so folders always appear at the top (OS convention).
  const items: FileSystemItem[] = [
    ...folders.map(f => ({ ...f, type: 'folder' as const })),
    ...files.map(f => ({ ...f, type: 'file' as const })),
  ];

  // Toggle selection: add if not selected, remove if already selected.
  // Parent manages the selectedItems array (controlled component).
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

  // Drag-and-drop handler. preventDefault is required to allow the drop event to fire.
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0 && onUpload) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  }, [onUpload]);

  // Loading state renders a centered DaisyUI spinner instead of the full layout
  // so skeleton proportions stay consistent regardless of content.
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid var(--ds-color-border)', borderTopColor: 'var(--ds-color-primary)', borderRadius: '50%', animation: 'ds-spin 0.6s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={`ds-pattern-file-manager ds-engine-modern ${className ?? ''}`} style={{ ...style, background: 'var(--ds-surface-card)', borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-elevation-1)' }}>
      <div style={{ padding: 16 }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ul>
              <li><a onClick={() => onNavigate?.(null)} className="cursor-pointer">Root</a></li>
              {currentPath.map((segment, i) => (
                <li key={segment}>
                  {i < currentPath.length - 1
                    ? <a onClick={() => onNavigate?.(segment)} className="cursor-pointer">{segment}</a>
                    : <span>{segment}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2">
            {selectedItems.length > 0 && onDelete && (
              <button style={{ background: 'var(--ds-color-error)', color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={() => onDelete(selectedItems)}>
                Delete ({selectedItems.length})
              </button>
            )}
            {onUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUploadChange}
                  data-testid="file-input"
                />
                <button style={{ background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                  Upload
                </button>
              </>
            )}
            <button
              style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, width: 32, padding: 0, fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => onViewModeChange?.(viewMode === 'grid' ? 'list' : 'grid')}
              title={viewMode === 'grid' ? 'Switch to list' : 'Switch to grid'}
            >
              {viewMode === 'grid' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Drop zone + content */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="min-h-[200px]"
        >
          {items.length === 0 ? (
            <div className="flex justify-center items-center py-12 opacity-50">
              {emptyMessage}
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* DaisyUI "active" class highlights the selected row background. */}
                  {items.map(item => (
                    <tr key={item.id} className={selectedItems.includes(item.id) ? 'active' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelect(item.id)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {/* Folders use an inline SVG folder icon; files use a renderFileIcon override or generic file SVG. */}
                          {item.type === 'folder' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: 'var(--ds-color-warning)' }} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                          ) : (
                            <span style={getFileIconStyle(item as FileItem)}>
                              {renderFileIcon ? renderFileIcon(item as FileItem) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              )}
                            </span>
                          )}
                          {item.type === 'folder' ? (
                            <a className="link link-hover cursor-pointer" onClick={() => onNavigate?.(item.id)}>
                              {item.name}
                            </a>
                          ) : (
                            <span>{item.name}</span>
                          )}
                        </div>
                      </td>
                      <td>{item.type === 'file' ? formatSize((item as FileItem).size) : '--'}</td>
                      <td>{formatDate(item.modifiedAt)}</td>
                      <td>
                        <div className="flex gap-1">
                          {onRename && (
                            <button
                              style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 24, padding: '0 8px', fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }}
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
                              style={{ background: 'transparent', color: 'var(--ds-color-error)', height: 24, padding: '0 8px', fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }}
                              onClick={() => onDelete([item.id])}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid view uses responsive columns: 2 on mobile, 4 on sm, 6 on md+.
               Selected items are highlighted with a primary ring and subtle background. */
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className="cursor-pointer transition-colors"
                  style={{
                    background: selectedItems.includes(item.id) ? 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)' : 'var(--ds-surface-card)',
                    borderRadius: 'var(--ds-radius-lg)',
                    padding: 12,
                    border: selectedItems.includes(item.id) ? '2px solid var(--ds-color-primary)' : '1px solid var(--ds-color-border)',
                  }}
                  onClick={() => item.type === 'folder' ? onNavigate?.(item.id) : handleSelect(item.id)}
                >
                  <div className="items-center text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12 }}>
                    <div className="text-3xl">
                      {item.type === 'folder' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" style={{ color: 'var(--ds-color-warning)' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" style={getFileIconStyle(item as FileItem)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs truncate w-full">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
