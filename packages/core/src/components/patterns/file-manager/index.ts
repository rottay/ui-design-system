'use client';

/**
 * @fileoverview FileManager pattern -- engine-aware file browser with folder
 * tree, file list, grid/list view modes, and upload support.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { FileManagerProps } from './FileManager.types';

export type { FileManagerProps, FileItem, FolderItem, FileSystemItem } from './FileManager.types';

export const PatternFileManager = createEngineComponent<FileManagerProps>(
  'PatternFileManager',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
