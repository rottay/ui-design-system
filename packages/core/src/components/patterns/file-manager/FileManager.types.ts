/**
 * FileManager - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

export interface FileItem {
  id: string;
  name: string;
  type: 'file';
  mimeType?: string;
  size?: number;
  thumbnail?: string;
  modifiedAt?: string;
  createdAt?: string;
  parentId?: string | null;
}

export interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  parentId?: string | null;
  childCount?: number;
  modifiedAt?: string;
  createdAt?: string;
}

export type FileSystemItem = FileItem | FolderItem;

export interface FileManagerProps extends PatternBaseProps {
  /** List of files to display */
  files: FileItem[];
  /** List of folders to display */
  folders: FolderItem[];
  /** Current folder path for breadcrumb navigation */
  currentPath?: string[];
  /** View mode */
  viewMode?: 'grid' | 'list';
  /** Currently selected item IDs */
  selectedItems?: string[];
  /** Called when a file is uploaded */
  onUpload?: (files: File[]) => void;
  /** Called when an item is deleted */
  onDelete?: (ids: string[]) => void;
  /** Called when an item is renamed */
  onRename?: (id: string, newName: string) => void;
  /** Called when navigating to a folder */
  onNavigate?: (folderId: string | null) => void;
  /** Called when selection changes */
  onSelectionChange?: (ids: string[]) => void;
  /** Called when view mode changes */
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom file icon renderer */
  renderFileIcon?: (item: FileItem) => ReactNode;
}
