'use client';

/**
 * FileManager - Pattern Component
 *
 * Engine-aware file browser with folder tree, file list, and upload support.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { FileManagerProps } from './types';

export type { FileManagerProps, FileItem, FolderItem, FileSystemItem } from './types';

export const PatternFileManager = createEngineComponent<FileManagerProps>(
  'PatternFileManager',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
