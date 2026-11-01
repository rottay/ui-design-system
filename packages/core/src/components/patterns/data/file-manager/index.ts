'use client';

/**
 * @fileoverview FileManager pattern -- engine-aware file browser with folder
 * tree, file list, grid/list view modes, and upload support.
 *
 * Breadcrumb segments (`FileManagerPathSegment`) render on Modern only. The
 * frozen loaders pass through a string-path adapter and the custom engine is
 * guarded before the router, so a segment reaching either is refused by name.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { PatternFileManagerProps } from './contracts';
import { admitStringPathOnly, guardCustomObjectPath } from './runtime';

export type {
  PatternFileManagerProps as FileManagerProps,
  FileManagerPathSegment,
  FileItem,
  FolderItem,
  FileSystemItem,
} from './contracts';

const PatternFileManagerRouter = createEngineComponent<PatternFileManagerProps>('PatternFileManager', {
  classic: () => import('./engines/classic').then(admitStringPathOnly('classic')),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic').then(admitStringPathOnly('rustic')),
});

export const PatternFileManager = guardCustomObjectPath(PatternFileManagerRouter);
