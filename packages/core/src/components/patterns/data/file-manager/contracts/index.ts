/**
 * @fileoverview Type definitions for the FileManager pattern component.
 * Defines {@link FileItem} and {@link FolderItem} data shapes, the
 * {@link FileSystemItem} discriminated union, the
 * {@link FileManagerPathSegment} breadcrumb segment, and
 * {@link PatternFileManagerProps} controlling grid/list views, selection,
 * upload, navigation, and rename. The package exports
 * {@link PatternFileManagerProps} under the public name `FileManagerProps`;
 * the {@link FileManagerProps} declared here is the string-path contract the
 * frozen Classic and Rustic implementations are compiled against.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

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
 * One folder in the breadcrumb trail: the stable id an ancestor crumb
 * navigates to and the label it shows.
 *
 * `id` is exactly what `onNavigate` receives when the crumb is activated. The
 * pattern never derives it from `name` and never looks it up in `folders`:
 * ancestors are not direct children of the current folder, so a lookup could
 * not find them, and two folders may share a name.
 *
 * An empty `id` is invalid. The whole FileManager is refused by name before
 * any crumb renders, so `onNavigate` can never receive `''`, a name or a
 * guessed id, and an empty id is never read as Root. Root is not a segment;
 * it keeps its own contract, `onNavigate(null)`.
 *
 * Only the Modern implementation renders object segments. The frozen Classic
 * and Rustic engines and custom component packs refuse a path that contains
 * one, in development and production; see {@link PatternFileManagerProps.currentPath}.
 *
 * @example
 * ```tsx
 * <PatternFileManager
 *   files={files}
 *   folders={folders}
 *   currentPath={[
 *     { id: 'fld_9f2', name: 'Documents' },
 *     { id: 'fld_a71', name: 'Reports' },
 *   ]}
 *   onNavigate={(folderId) => openFolder(folderId)} // 'fld_9f2' from the first crumb, null from Root
 * />
 * ```
 */
export interface FileManagerPathSegment {
  /** Stable, non-empty folder id handed to `onNavigate` by this segment's crumb. */
  readonly id: string;

  /**
   * Visible crumb label and, on an ancestor, the accessible name of its button.
   * Not an identifier: two segments may share a name. Supplying a non-empty,
   * visible name is the host's obligation; the pattern does not refuse or
   * replace it, so `''` leaves an ancestor button without an accessible name.
   */
  readonly name: string;
}

/**
 * Props for the FileManager pattern component, exported by the package as
 * `FileManagerProps`.
 *
 * Renders a file browser with grid/list view toggling, breadcrumb navigation,
 * multi-select, upload, delete, and rename capabilities. Files and folders
 * are provided as separate arrays to allow independent data fetching.
 *
 * @example
 * ```tsx
 * <PatternFileManager
 *   files={files}
 *   folders={folders}
 *   currentPath={[
 *     { id: 'fld_9f2', name: 'Documents' },
 *     { id: 'fld_a71', name: 'Reports' },
 *   ]}
 *   viewMode="grid"
 *   selectedItems={selected}
 *   onUpload={(files) => uploadFiles(files)}
 *   onDelete={(ids) => deleteItems(ids)}
 *   onNavigate={(folderId) => navigateTo(folderId)}
 *   onSelectionChange={(ids) => setSelected(ids)}
 * />
 * ```
 */
export interface PatternFileManagerProps extends PatternBaseProps {
  /** List of file items to display in the current folder. */
  files: FileItem[];

  /** List of folder items to display in the current folder. */
  folders: FolderItem[];

  /**
   * Breadcrumb trail from Root to the current folder, ordered root-first.
   * Root itself is not an element; the last element is the current folder.
   *
   * - A {@link FileManagerPathSegment} shows `name` and, as an ancestor,
   *   hands its supplied `id` to `onNavigate`. No lookup, no projection.
   * - **Deprecated: a string element.** It keeps its previous behaviour for
   *   one minor release: the string is both the label and the value an
   *   ancestor crumb hands to `onNavigate`. Known limitation: when the string
   *   is a folder name, `onNavigate` receives that name, not a folder id, and
   *   the pattern cannot resolve it, because ancestors are absent from
   *   `folders` and names may repeat. Migrate to segments. Removal requires a
   *   future major release and a release-owner decision.
   *
   * Strings and segments may be mixed; each element keeps its own behaviour.
   * Only the Modern engine renders segments. A path containing any non-string
   * element is refused by name, in development and production, on the frozen
   * Classic and Rustic engines (inside the component's error boundary) and on
   * the custom engine (before the component pack is resolved, so the nearest
   * ancestor error boundary receives it), because no component pack can prove
   * that it honors segments. A segment whose `id` is `''`, or an element that
   * is neither a string nor a segment with string `id` and `name`, is refused
   * by name on Modern too. Hosts recover by passing valid segments or a
   * string-only path, or by rendering on the Modern engine.
   */
  currentPath?: ReadonlyArray<string | FileManagerPathSegment>;

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
   * Callback fired when navigating to a folder.
   *
   * Receives the `id` of a folder row or card, the supplied `id` of an
   * ancestor {@link FileManagerPathSegment} crumb, a deprecated string
   * ancestor crumb verbatim, or `null` when Root is activated.
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

/**
 * String-path engine contract the frozen Classic and Rustic implementations
 * are compiled against. Not the public props: the package exports
 * {@link PatternFileManagerProps} as `FileManagerProps`.
 *
 * A frozen engine reaches this contract only through the string-path loader
 * adapter in `runtime`, which refuses any non-string element by name
 * instead of narrowing it away.
 */
export interface FileManagerProps extends Omit<PatternFileManagerProps, 'currentPath'> {
  /**
   * Breadcrumb path segments for the current folder location.
   * Each element is a folder name, ordered root-first.
   */
  currentPath?: string[];
}
