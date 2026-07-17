'use client';

/**
 * @fileoverview FileManager pattern -- engine-aware file browser with folder
 * tree, file list, grid/list view modes, and upload support.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { FileManagerProps } from './contracts';

export type { FileManagerProps, FileItem, FolderItem, FileSystemItem } from './contracts';

export const PatternFileManager = createEngineComponent<FileManagerProps>(
  'PatternFileManager',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
