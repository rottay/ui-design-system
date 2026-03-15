import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type FileManagerPreset = 'standard' | 'dual-panel';

export type FileManagerViewMode = 'grid' | 'list';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  icon?: ReactNode;
  size?: string;
  modifiedAt?: string;
  modifiedBy?: string;
  starred?: boolean;
  thumbnail?: string;
  mimeType?: string;
  itemCount?: number;
}

export interface FileManagerNavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  children?: FileManagerNavItem[];
}

export interface FileManagerAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'default';
}

export interface FileManagerProps extends EngineAwareProps {
  preset?: FileManagerPreset;
  files: FileItem[];
  navItems?: FileManagerNavItem[];
  activeNavKey?: string;
  onNavSelect?: (key: string) => void;
  quickAccess?: FileManagerNavItem[];
  actions?: FileManagerAction[];
  viewMode?: FileManagerViewMode;
  onViewModeChange?: (mode: FileManagerViewMode) => void;
  onFileClick?: (file: FileItem) => void;
  onFileDoubleClick?: (file: FileItem) => void;
  suggestedFiles?: FileItem[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  title?: string;
  headerRight?: ReactNode;
  filterTabs?: Array<{ key: string; label: string; icon?: ReactNode }>;
  activeFilterTab?: string;
  onFilterTabChange?: (key: string) => void;
  loading?: boolean;
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
  // Interactive props
  onFileUpload?: (files: File[]) => void;
  onFileRename?: (fileId: string, newName: string) => void;
  onFileMove?: (fileId: string, targetFolderId: string) => void;
  onFileDelete?: (fileId: string) => void;
  onFileStar?: (fileId: string) => void;
  contextMenuItems?: Array<{ key: string; label: string; icon?: ReactNode; danger?: boolean }>;
  onContextMenuAction?: (actionKey: string, fileId: string) => void;
  uploadable?: boolean;
}

export const FILE_MANAGER_DEFAULTS: Partial<FileManagerProps> = {
  preset: 'standard',
  viewMode: 'grid',
  searchPlaceholder: 'Search',
  title: 'All files',
  emptyText: 'No files',
};
