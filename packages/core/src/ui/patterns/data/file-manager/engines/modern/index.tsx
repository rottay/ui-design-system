'use client';

/**
 * @fileoverview Modern engine for the FileManager pattern.
 * Renders a file/folder browser with list (table) and grid (card) views,
 * breadcrumb navigation, drag-and-drop upload, multi-select, rename, and bulk delete.
 *
 * The pattern COMPOSES public DS primitives — Button (toolbar/view/item
 * actions), Checkbox (row selection), Spinner (loading) and Empty (empty
 * state) — and never recreates a control with its own HTML/CSS. Geometry and
 * the pattern's own paint live in the unlayered modern file-manager skin,
 * keyed on the `data-part`/`data-*` contract this file stamps.
 *
 * The pattern is domain-agnostic: every own label (toolbar, breadcrumb root,
 * column headers, view toggle titles, rename prompt, empty floor) resolves
 * through the optional `components` i18n channel with an English floor.
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

import React, { useCallback, useRef, useState } from 'react';
import type { FileManagerProps, FileItem, FileSystemItem } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { LayoutGridIcon } from '@/graphics/icons/presentation/semantic/generated/roles/layout-grid';
import { LayoutListIcon } from '@/graphics/icons/presentation/semantic/generated/roles/layout-list';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernCheckbox from '../../../../../primitives/inputs/Checkbox/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import ModernEmpty from '../../../../../primitives/display/Empty/engines/modern';

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

/** Resolves the semantic kind channel the skin paints icons and rows with. */
function fileKindOf(item: FileSystemItem): 'folder' | 'image' | 'pdf' | 'text' | 'other' {
  if (item.type === 'folder') return 'folder';
  const mime = (item as FileItem).mimeType ?? '';
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('text/')) return 'text';
  return 'other';
}

/**
 * Modern FileManager engine.
 *
 * Supports list and grid views with container-query grid columns, toggle
 * selection via composed Checkbox primitives, and a content-area drop zone
 * with drag-over feedback. The single raw `<input type="file">` that stays is
 * deliberate: the public contract pins `data-testid="file-input"` on it (the
 * composed Upload primitive owns its own internal input and cannot forward a
 * caller testid), so this chrome-free, behavior-only input keeps the native
 * picker plumbing while the Upload BUTTON is a composed Button primitive.
 *
 * @param props - {@link FileManagerProps} -- files, folders, callbacks, and display options.
 * @returns The FileManager UI as a token-painted card surface.
 */
export default function ModernFileManager(props: FileManagerProps) {
  // Optional channel with an English floor: the manager renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

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
    emptyMessage: emptyMessageProp,
    renderFileIcon,
    loading,
    className,
    style,
  } = props;

  const copy = {
    root: tOr('fileManager.root', 'Root'),
    upload: tOr('fileManager.upload', 'Upload'),
    rename: tOr('fileManager.rename', 'Rename'),
    delete: tOr('fileManager.delete', 'Delete'),
    switchToList: tOr('fileManager.switchToList', 'Switch to list'),
    switchToGrid: tOr('fileManager.switchToGrid', 'Switch to grid'),
    newNamePrompt: tOr('fileManager.newNamePrompt', 'New name:'),
    empty: tOr('fileManager.empty', 'No files or folders'),
    columnName: tOr('fileManager.columnName', 'Name'),
    columnSize: tOr('fileManager.columnSize', 'Size'),
    columnModified: tOr('fileManager.columnModified', 'Modified'),
    columnActions: tOr('fileManager.columnActions', 'Actions'),
  };
  const emptyMessage = emptyMessageProp ?? copy.empty;

  // Hidden file input is triggered by the Upload button click to open the native file picker.
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Drag-over feedback state for the content-area drop zone.
  const [isDragOver, setIsDragOver] = useState(false);

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
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0 && onUpload) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  }, [onUpload]);

  // Grid cards are action surfaces: Enter/Space mirrors the click contract so
  // keyboard users can navigate folders and toggle selection.
  const handleGridCardKeyDown = useCallback((event: React.KeyboardEvent, item: FileSystemItem) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (item.type === 'folder') onNavigate?.(item.id);
    else handleSelect(item.id);
  }, [handleSelect, onNavigate]);

  // Loading state renders the composed Spinner primitive (ring, cadence and
  // paint are spinner.css-owned); the skin owns the centering frame.
  if (loading) {
    return (
      <div
        className={`ds-pattern-file-manager ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        data-view-mode={viewMode}
        style={style}
      >
        <ModernSpinner size="md" data-part="spinner" />
      </div>
    );
  }

  return (
    <div
      className={`ds-pattern-file-manager ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      data-view-mode={viewMode}
      style={{ ...style, background: 'var(--ds-surface-card)', borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-elevation-1)' }}
    >
      <div data-part="body">
        {/* Toolbar */}
        <div data-part="toolbar">
          <div data-part="breadcrumb">
            <ul>
              <li><a data-part="breadcrumb-link" data-action="navigate-root" onClick={() => onNavigate?.(null)} className="cursor-pointer">{copy.root}</a></li>
              {currentPath.map((segment, i) => (
                <li key={segment}>
                  {i < currentPath.length - 1
                    ? <a data-part="breadcrumb-link" data-action="navigate-folder" onClick={() => onNavigate?.(segment)} className="cursor-pointer">{segment}</a>
                    : <span data-part="breadcrumb-current">{segment}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div data-part="toolbar-actions">
            {selectedItems.length > 0 && onDelete && (
              <ModernButton
                variant="danger"
                size="sm"
                data-part="toolbar-action"
                data-action="delete-selected"
                onClick={() => onDelete(selectedItems)}
              >
                {tOr('fileManager.deleteSelected', 'Delete ({count})', { count: selectedItems.length })}
              </ModernButton>
            )}
            {onUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  data-part="file-input"
                  onChange={handleUploadChange}
                  data-testid="file-input"
                />
                <ModernButton
                  variant="primary"
                  size="sm"
                  data-part="toolbar-action"
                  data-action="upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {copy.upload}
                </ModernButton>
              </>
            )}
            <ModernButton
              variant="ghost"
              size="sm"
              data-part="view-toggle"
              data-action="toggle-view"
              data-view-mode={viewMode}
              icon={viewMode === 'grid'
                ? <LayoutListIcon decorative size={16} />
                : <LayoutGridIcon decorative size={16} />}
              onClick={() => onViewModeChange?.(viewMode === 'grid' ? 'list' : 'grid')}
              title={viewMode === 'grid' ? copy.switchToList : copy.switchToGrid}
            />
          </div>
        </div>

        {/* Drop zone + content */}
        <div
          data-part="content"
          data-drag-over={isDragOver ? 'true' : 'false'}
          onDragOver={e => { e.preventDefault(); if (onUpload) setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {items.length === 0 ? (
            <div data-part="empty">
              <ModernEmpty description={emptyMessage} />
            </div>
          ) : viewMode === 'list' ? (
            <div data-part="list-scroll">
              <table data-part="list-table">
                <thead>
                  <tr>
                    <th data-part="column-select" />
                    <th>{copy.columnName}</th>
                    <th>{copy.columnSize}</th>
                    <th>{copy.columnModified}</th>
                    <th>{copy.columnActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* DaisyUI "active" class highlights the selected row background. */}
                  {items.map(item => (
                    <tr
                      key={item.id}
                      className={selectedItems.includes(item.id) ? 'active' : ''}
                      data-part="row"
                      data-selected={selectedItems.includes(item.id)}
                      data-file-kind={fileKindOf(item)}
                    >
                      <td>
                        {/* Slot keeps the historical data-part; the composed
                            Checkbox (standalone indicator) owns the control. */}
                        <span data-part="checkbox">
                          <ModernCheckbox
                            size="sm"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelect(item.id)}
                          />
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {/* Folders use an inline SVG folder icon; files use a renderFileIcon override or generic file SVG. */}
                          {item.type === 'folder' ? (
                            <svg data-part="folder-icon" data-file-kind="folder" xmlns="http://www.w3.org/2000/svg" className="ds-file-manager__folder-icon" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                          ) : (
                            <span className="ds-file-manager__file-icon" data-part="file-icon" data-file-kind={fileKindOf(item)}>
                              {renderFileIcon ? renderFileIcon(item as FileItem) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              )}
                            </span>
                          )}
                          {item.type === 'folder' ? (
                            <a data-part="folder-link" data-action="navigate-folder" className="ds-file-manager__folder-link" onClick={() => onNavigate?.(item.id)}>
                              {item.name}
                            </a>
                          ) : (
                            <span data-part="file-name">{item.name}</span>
                          )}
                        </div>
                      </td>
                      <td>{item.type === 'file' ? formatSize((item as FileItem).size) : '--'}</td>
                      <td>{formatDate(item.modifiedAt)}</td>
                      <td>
                        <div className="flex gap-1">
                          {onRename && (
                            <ModernButton
                              variant="ghost"
                              size="xs"
                              data-part="item-action"
                              data-action="rename"
                              onClick={() => {
                                const newName = window.prompt(copy.newNamePrompt, item.name);
                                if (newName && newName !== item.name) onRename(item.id, newName);
                              }}
                            >
                              {copy.rename}
                            </ModernButton>
                          )}
                          {onDelete && (
                            <ModernButton
                              variant="ghost"
                              size="xs"
                              data-part="item-action"
                              data-action="delete"
                              onClick={() => onDelete([item.id])}
                            >
                              {copy.delete}
                            </ModernButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid view: columns come from the skin's container queries on the
               root (the composition defines the cut, not viewport breakpoints). */
            <div data-part="grid">
              {items.map(item => (
                <div
                  key={item.id}
                  data-part="grid-card"
                  data-selected={selectedItems.includes(item.id)}
                  data-file-kind={fileKindOf(item)}
                  className="ds-file-manager__grid-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => item.type === 'folder' ? onNavigate?.(item.id) : handleSelect(item.id)}
                  onKeyDown={(event) => handleGridCardKeyDown(event, item)}
                >
                  <div data-part="grid-card-body">
                    {item.type === 'folder' ? (
                      <svg data-part="folder-icon" data-file-kind="folder" xmlns="http://www.w3.org/2000/svg" className="ds-file-manager__folder-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    ) : (
                      <svg data-part="file-icon" data-file-kind={fileKindOf(item)} xmlns="http://www.w3.org/2000/svg" className="ds-file-manager__file-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span data-part="item-name">{item.name}</span>
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
