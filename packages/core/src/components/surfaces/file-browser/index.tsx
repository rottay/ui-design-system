'use client';

/**
 * FileBrowserSurface
 *
 * Full-page file management surface wrapping PatternFileManager inside
 * PageShellSurface. The surface owns the page chrome while delegating the
 * file browsing UI to the underlying pattern.
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
