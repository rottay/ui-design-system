'use client';

/**
 * @fileoverview Modern engine for the FileManager pattern.
 * Renders a file/folder browser with list (table) and grid (card) views,
 * breadcrumb navigation, drag-and-drop upload, multi-select, rename, and bulk delete.
 *
 * The pattern COMPOSES public DS primitives — Button (toolbar/view/item
 * actions), Checkbox (row selection), Spinner (loading), Empty (empty
 * state) and Breadcrumb (navigation trail — the hand-rolled ul/li with a
 * CSS `li + li::before` separator is retired; the certified primitive owns
 * the nav landmark, the governed auto-mirroring separator icon, real
 * buttons for clickable crumbs and `aria-current` on the current one) — and
 * never recreates a control with its own HTML/CSS. File/folder glyphs are
 * the governed semantic icon roles (`content.folder` / `content.file`),
 * never raw inline SVG. Geometry and the pattern's own paint live in the
 * unlayered modern file-manager skin, keyed on the `data-part`/`data-*`
 * contract this file stamps.
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
import { ContentFolderIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-folder';
import { ContentFileIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-file';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernCheckbox from '../../../../../primitives/inputs/Checkbox/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import ModernEmpty from '../../../../../primitives/display/Empty/engines/modern';
import ModernBreadcrumb from '../../../../../primitives/navigation/Breadcrumb/engines/modern';

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
            {/* Composed Breadcrumb primitive (P76): the last item is the
                current one by contract (inert, aria-current="page"); every
                earlier crumb carries an onClick and renders as a real
                button. When the path is empty, Root IS the current crumb. */}
            <ModernBreadcrumb
              items={[
                {
                  key: '__root__',
                  label: copy.root,
                  onClick: onNavigate && currentPath.length > 0 ? () => onNavigate(null) : undefined,
                },
                ...currentPath.map((segment, i) => ({
                  key: `path-${i}`,
                  label: segment,
                  onClick:
                    onNavigate && i < currentPath.length - 1
                      ? () => onNavigate(segment)
                      : undefined,
                })),
              ]}
            />
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
              <table
                data-part="list-table"
                aria-label={tOr('fileManager.listLabel', 'Files and folders')}
              >
                <thead>
                  <tr>
                    {/* Visually empty header cell still announces its purpose
                        to AT (the per-row Checkboxes live under it). */}
                    <th
                      data-part="column-select"
                      scope="col"
                      aria-label={tOr('fileManager.columnSelect', 'Select')}
                    />
                    <th scope="col">{copy.columnName}</th>
                    <th scope="col" data-part="column-size">{copy.columnSize}</th>
                    <th scope="col">{copy.columnModified}</th>
                    <th scope="col">{copy.columnActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Selection paint keys on data-selected alone — no utility
                      class dependency; the composed Checkbox carries the same
                      state to AT, so the fill is never the only cue. */}
                  {items.map(item => (
                    <tr
                      key={item.id}
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
                            aria-label={tOr('fileManager.selectItem', 'Select {name}', { name: item.name })}
                          />
                        </span>
                      </td>
                      <td>
                        <div data-part="name-cell">
                          {/* Folders and files use the governed semantic icon
                              roles; files keep the renderFileIcon override. */}
                          {item.type === 'folder' ? (
                            <span className="ds-file-manager__folder-icon" data-part="folder-icon" data-file-kind="folder">
                              <ContentFolderIcon decorative size={20} />
                            </span>
                          ) : (
                            <span className="ds-file-manager__file-icon" data-part="file-icon" data-file-kind={fileKindOf(item)}>
                              {renderFileIcon ? renderFileIcon(item as FileItem) : (
                                <ContentFileIcon decorative size={20} />
                              )}
                            </span>
                          )}
                          {item.type === 'folder' ? (
                            /* Composed Button primitive (link variant): the
                               folder entry keeps its real-button semantics
                               (type=button, Enter/Space, focus ring) while the
                               skin owns the link affordance. The caller
                               data-part wins the root anatomy part (P-79), so
                               the primitive's own chrome stays out of this
                               paint. */
                            <ModernButton
                              variant="link"
                              size="sm"
                              shape="default"
                              htmlType="button"
                              data-part="folder-link"
                              data-action="navigate-folder"
                              className="ds-file-manager__folder-link"
                              title={item.name}
                              onClick={() => onNavigate?.(item.id)}
                            >
                              {item.name}
                            </ModernButton>
                          ) : (
                            <span data-part="file-name" title={item.name}>{item.name}</span>
                          )}
                        </div>
                      </td>
                      <td data-part="size-cell">{item.type === 'file' ? formatSize((item as FileItem).size) : '--'}</td>
                      <td data-part="date-cell">{formatDate(item.modifiedAt)}</td>
                      <td>
                        <div data-part="item-actions">
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
                  aria-pressed={item.type === 'file' ? selectedItems.includes(item.id) : undefined}
                  onClick={() => item.type === 'folder' ? onNavigate?.(item.id) : handleSelect(item.id)}
                  onKeyDown={(event) => handleGridCardKeyDown(event, item)}
                >
                  <div data-part="grid-card-body">
                    {item.type === 'folder' ? (
                      <span className="ds-file-manager__folder-icon" data-part="folder-icon" data-file-kind="folder">
                        <ContentFolderIcon decorative size={36} />
                      </span>
                    ) : (
                      <span className="ds-file-manager__file-icon" data-part="file-icon" data-file-kind={fileKindOf(item)}>
                        {renderFileIcon ? renderFileIcon(item as FileItem) : (
                          <ContentFileIcon decorative size={36} />
                        )}
                      </span>
                    )}
                    <span data-part="item-name" title={item.name}>{item.name}</span>
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
