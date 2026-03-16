'use client';

/**
 * @fileoverview FileBrowserSurface -- full-page file management shell.
 * @description Wraps PatternFileManager inside PageShellSurface. The surface owns
 * page chrome and toolbar actions; the pattern owns the file browsing UI.
 */

import React from 'react';
import { PatternFileManager } from '../../patterns';
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

  // Files and folders are mapped separately because the pattern requires
  // discriminated union types (`type: 'file'` vs `type: 'folder'`). The
  // surface config uses a looser string type, so we narrow here with a cast
  // to satisfy the pattern's contract.
  const files = config.behavior.files.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type as 'file',
    mimeType: f.mimeType,
    size: f.size,
    thumbnail: f.thumbnail,
    modifiedAt: f.modifiedAt,
    createdAt: f.createdAt,
    parentId: f.parentId,
  }));

  const folders = config.behavior.folders.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type as 'folder',
    parentId: f.parentId,
    childCount: f.childCount,
    modifiedAt: f.modifiedAt,
    createdAt: f.createdAt,
  }));

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
