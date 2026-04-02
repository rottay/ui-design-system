'use client';

/**
 * @fileoverview FileBrowserSurface -- full-page file management shell.
 * @description Wraps PatternFileManager inside PageShellSurface. The surface owns
 * page chrome and toolbar actions; the pattern owns the file browsing UI.
 */

import React from 'react';
import { PatternFileManager } from '../../patterns';
import type { FileItem, FolderItem } from '../../patterns';
import type { FileBrowserSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { SurfaceActionBar } from '../shared';

export interface FileBrowserSurfaceProps {
  config: FileBrowserSurfaceConfig;
  loading?: boolean;
}

export function FileBrowserSurface({
  config,
  loading = false,
}: FileBrowserSurfaceProps): React.ReactElement {
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />;

  // The pattern requires discriminated union types (FileItem / FolderItem).
  // We use type predicates to narrow from the surface config's types into
  // the pattern's discriminated union instead of casting with `as`.
  const allItems = [...config.behavior.files, ...config.behavior.folders];
  const files = allItems.filter((i): i is FileItem => i.type === 'file');
  const folders = allItems.filter((i): i is FolderItem => i.type === 'folder');

  return (
    <PageShellSurface
      chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
      actions={actionsNode}
      loading={loading}
    >
      <PatternFileManager
        files={files}
        folders={folders}
        currentPath={config.behavior.currentPath}
        viewMode={config.visual.viewMode}
        selectedItems={config.behavior.selectedItems}
        onUpload={config.behavior.onUpload}
        onDelete={config.behavior.onDelete}
        onNavigate={config.behavior.onNavigate}
        onSelectionChange={config.behavior.onSelectionChange}
        onViewModeChange={config.behavior.onViewModeChange}
        onRename={config.behavior.onRename}
        renderFileIcon={config.presentation.renderFileIcon}
        emptyMessage="No files or folders found."
      />
    </PageShellSurface>
  );
}
