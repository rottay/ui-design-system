'use client';

/**
 * @fileoverview Modern (DaisyUI / Tailwind) engine for the FileManager pattern.
 * Renders a file/folder browser with list (table) and grid (card) views,
 * breadcrumb navigation, drag-and-drop upload, multi-select, rename, and bulk delete.
 * Uses DaisyUI component classes (card, table, btn, badge) and Tailwind utilities
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
function getFileIconClass(item: FileItem): string {
  const mime = item.mimeType || '';
  if (mime.startsWith('image/')) return 'text-info';
  if (mime === 'application/pdf') return 'text-error';
  if (mime.startsWith('text/')) return 'text-success';
  // Fallback: muted color for unknown or binary files.
  return 'text-base-content/50';
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
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-sm ds-pattern-file-manager ds-engine-modern ${className ?? ''}`} style={style}>
      <div className="card-body p-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="breadcrumbs text-sm">
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
              <button className="btn btn-error btn-sm" onClick={() => onDelete(selectedItems)}>
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
                <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()}>
                  Upload
                </button>
              </>
            )}
            <button
              className="btn btn-ghost btn-sm btn-square"
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
              <table className="table table-sm">
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
                          className="checkbox checkbox-sm"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelect(item.id)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {/* Folders use an inline SVG folder icon; files use a renderFileIcon override or generic file SVG. */}
                          {item.type === 'folder' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                          ) : (
                            <span className={getFileIconClass(item as FileItem)}>
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
                              className="btn btn-ghost btn-xs"
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
                              className="btn btn-ghost btn-xs text-error"
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
                  className={`card card-compact cursor-pointer hover:bg-base-200 transition-colors ${
                    selectedItems.includes(item.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => item.type === 'folder' ? onNavigate?.(item.id) : handleSelect(item.id)}
                >
                  <div className="card-body items-center text-center p-3">
                    <div className="text-3xl">
                      {item.type === 'folder' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-warning" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-9 w-9 ${getFileIconClass(item as FileItem)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
