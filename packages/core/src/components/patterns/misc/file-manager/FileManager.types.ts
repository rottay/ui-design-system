/**
 * @fileoverview Type definitions for the FileManager pattern component.
 * Defines {@link FileItem} and {@link FolderItem} data shapes, the
 * {@link FileSystemItem} discriminated union, and {@link FileManagerProps}
 * controlling grid/list views, selection, upload, navigation, and rename.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../foundation/types';

/**
 * Represents a single file entry in the file manager.
 *
 * Discriminated from {@link FolderItem} via the `type: 'file'` literal,
 * enabling type-safe narrowing on the {@link FileSystemItem} union.
 */
export interface FileItem {
  /** Unique identifier for this file. */
  id: string;

  /** Display name including file extension (e.g., `"report.pdf"`). */
  name: string;

  /**
   * Discriminant literal that marks this item as a file.
   * Used by the {@link FileSystemItem} union for type narrowing.
   */
  type: 'file';

  /** MIME type of the file (e.g., `"application/pdf"`). */
  mimeType?: string;

  /** File size in bytes. */
  size?: number;

  /** URL to a thumbnail preview image, if available. */
  thumbnail?: string;

  /** ISO 8601 timestamp of the last modification. */
  modifiedAt?: string;

  /** ISO 8601 timestamp of when the file was created. */
  createdAt?: string;

  /** ID of the parent folder, or `null` for root-level files. */
  parentId?: string | null;
}

/**
 * Represents a folder entry in the file manager.
 *
 * Discriminated from {@link FileItem} via the `type: 'folder'` literal.
 */
export interface FolderItem {
  /** Unique identifier for this folder. */
  id: string;

  /** Display name of the folder. */
  name: string;

  /**
   * Discriminant literal that marks this item as a folder.
   * Used by the {@link FileSystemItem} union for type narrowing.
   */
  type: 'folder';

  /** ID of the parent folder, or `null` for root-level folders. */
  parentId?: string | null;

  /** Number of direct children (files + subfolders) in this folder. */
  childCount?: number;

  /** ISO 8601 timestamp of the last modification. */
  modifiedAt?: string;

  /** ISO 8601 timestamp of when the folder was created. */
  createdAt?: string;
}

/**
 * Discriminated union of file and folder items.
 * Use the `type` field (`'file'` | `'folder'`) to narrow the type.
 */
export type FileSystemItem = FileItem | FolderItem;

/**
 * Props for the FileManager pattern component.
 *
 * Renders a file browser with grid/list view toggling, breadcrumb navigation,
 * multi-select, upload, delete, and rename capabilities. Files and folders
 * are provided as separate arrays to allow independent data fetching.
 *
 * @example
 * ```tsx
 * <FileManager
 *   files={files}
 *   folders={folders}
 *   currentPath={['Documents', 'Reports']}
 *   viewMode="grid"
 *   selectedItems={selected}
 *   onUpload={(files) => uploadFiles(files)}
 *   onDelete={(ids) => deleteItems(ids)}
 *   onNavigate={(folderId) => navigateTo(folderId)}
 *   onSelectionChange={(ids) => setSelected(ids)}
 * />
 * ```
 */
export interface FileManagerProps extends PatternBaseProps {
  /** List of file items to display in the current folder. */
  files: FileItem[];

  /** List of folder items to display in the current folder. */
  folders: FolderItem[];

  /**
   * Breadcrumb path segments for the current folder location.
   * Each element is a folder name, ordered root-first.
   */
  currentPath?: string[];

  /**
   * Display layout for items.
   * - `'grid'`: Thumbnail cards in a responsive grid.
   * - `'list'`: Compact rows with file details.
   */
  viewMode?: 'grid' | 'list';

  /** IDs of currently selected files and folders. */
  selectedItems?: string[];

  /** Callback fired when the user uploads files via drag-and-drop or picker. */
  onUpload?: (files: File[]) => void;

  /** Callback fired when items are deleted. Receives an array of item IDs. */
  onDelete?: (ids: string[]) => void;

  /** Callback fired when an item is renamed. */
  onRename?: (id: string, newName: string) => void;

  /**
   * Callback fired when navigating into a folder.
   * Pass `null` to navigate to the root level.
   */
  onNavigate?: (folderId: string | null) => void;

  /** Callback fired when the set of selected item IDs changes. */
  onSelectionChange?: (ids: string[]) => void;

  /** Callback fired when the user toggles between grid and list view. */
  onViewModeChange?: (mode: 'grid' | 'list') => void;

  /** Message displayed when the current folder contains no items. */
  emptyMessage?: string;

  /**
   * Custom renderer for file type icons.
   * Receives the file item and should return an icon or thumbnail node.
   */
  renderFileIcon?: (item: FileItem) => ReactNode;
}
