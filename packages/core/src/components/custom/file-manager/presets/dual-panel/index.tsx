'use client';

/**
 * FileManager - Dual Panel Preset
 * Left sidebar + center content + right detail panel for selected file
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { FileManagerProps, FileItem, FileManagerViewMode } from '../../core';
import { FILE_MANAGER_DEFAULTS } from '../../core';

export const DualPanelFileManager = createPreset<FileManagerProps>({
  name: 'FileManager.DualPanel',
  render: ({ primitives, props, tokens, engine }: PresetContext<FileManagerProps>) => {
    const { Box, Stack } = primitives;
    const {
      files,
      navItems = [],
      activeNavKey,
      onNavSelect,
      quickAccess = [],
      actions = [],
      viewMode: controlledViewMode,
      onViewModeChange,
      onFileClick,
      onFileDoubleClick,
      suggestedFiles = [],
      searchPlaceholder = FILE_MANAGER_DEFAULTS.searchPlaceholder,
      onSearch,
      title = FILE_MANAGER_DEFAULTS.title,
      headerRight,
      filterTabs = [],
      activeFilterTab,
      onFilterTabChange,
      loading,
      emptyText = FILE_MANAGER_DEFAULTS.emptyText,
      className,
      style,
      onFileUpload,
      onFileRename,
      onFileMove,
      onFileDelete,
      onFileStar,
      contextMenuItems = [],
      onContextMenuAction,
      uploadable: uploadableProp,
    } = props;

    const canUpload = uploadableProp ?? !!onFileUpload;

    const [searchQuery, setSearchQuery] = useState('');
    const [internalViewMode, setInternalViewMode] = useState<FileManagerViewMode>('grid');
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const viewMode = controlledViewMode ?? internalViewMode;

    // Upload drop zone
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounter = useRef(0);

    // Context menu
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);

    // Inline rename
    const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    // File drag to folder
    const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

    const handleSearch = (value: string) => {
      setSearchQuery(value);
      onSearch?.(value);
    };

    const handleViewModeChange = (mode: FileManagerViewMode) => {
      if (controlledViewMode === undefined) setInternalViewMode(mode);
      onViewModeChange?.(mode);
    };

    const handleFileClick = (file: FileItem) => {
      setSelectedFile(file);
      onFileClick?.(file);
    };

    const filteredFiles = onSearch
      ? files
      : files.filter((file) => !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const getMimeIcon = (file: FileItem) => {
      if (file.icon) return file.icon;
      if (file.type === 'folder') return '\u{1F4C1}';
      const ext = file.name.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'pdf': return '\u{1F4C4}';
        case 'doc': case 'docx': return '\u{1F4DD}';
        case 'xls': case 'xlsx': return '\u{1F4CA}';
        case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': return '\u{1F5BC}';
        case 'mp4': case 'mov': return '\u{1F3AC}';
        case 'zip': case 'rar': return '\u{1F4E6}';
        default: return '\u{1F4C4}';
      }
    };

    const getFileExtension = (name: string) => {
      const parts = name.split('.');
      return parts.length > 1 ? parts.pop()!.toUpperCase() : '';
    };

    // Upload handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      if (!canUpload) return;
      dragCounter.current++;
      if (e.dataTransfer.types.includes('Files')) setIsDragOver(true);
    }, [canUpload]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) setIsDragOver(false);
    }, []);

    const handleDragOverUpload = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      if (canUpload && e.dataTransfer.types.includes('Files')) e.dataTransfer.dropEffect = 'copy';
    }, [canUpload]);

    const handleDropUpload = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);
      if (!canUpload) return;
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) onFileUpload?.(droppedFiles);
    }, [canUpload, onFileUpload]);

    // Context menu
    const handleContextMenu = useCallback((e: React.MouseEvent, fileId: string) => {
      if (contextMenuItems.length === 0 && !onFileDelete && !onFileStar && !onFileRename) return;
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, fileId });
    }, [contextMenuItems.length, onFileDelete, onFileStar, onFileRename]);

    useEffect(() => {
      if (!contextMenu) return;
      const handleClick = () => setContextMenu(null);
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }, [contextMenu]);

    // Inline rename
    const startRename = useCallback((file: FileItem) => {
      if (!onFileRename) return;
      setRenamingFileId(file.id);
      setRenameValue(file.name);
    }, [onFileRename]);

    const commitRename = useCallback(() => {
      if (renamingFileId && renameValue.trim()) onFileRename?.(renamingFileId, renameValue.trim());
      setRenamingFileId(null);
      setRenameValue('');
    }, [renamingFileId, renameValue, onFileRename]);

    // File drag to folder
    const handleFileDragStart = useCallback((e: React.DragEvent, fileId: string) => {
      if (!onFileMove) return;
      setDraggedFileId(fileId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', fileId);
    }, [onFileMove]);

    const handleFolderDragOver = useCallback((e: React.DragEvent, folderId: string) => {
      if (!draggedFileId || !onFileMove) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverFolderId(folderId);
    }, [draggedFileId, onFileMove]);

    const handleFolderDrop = useCallback((e: React.DragEvent, folderId: string) => {
      e.preventDefault();
      if (draggedFileId && onFileMove && draggedFileId !== folderId) onFileMove(draggedFileId, folderId);
      setDraggedFileId(null);
      setDragOverFolderId(null);
    }, [draggedFileId, onFileMove]);

    // Default + custom context menu items
    const allContextMenuItems = [
      ...(onFileRename ? [{ key: '__rename', label: 'Rename', icon: undefined as undefined }] : []),
      ...(onFileStar ? [{ key: '__star', label: 'Toggle star', icon: undefined as undefined }] : []),
      ...contextMenuItems,
      ...(onFileDelete ? [{ key: '__delete', label: 'Delete', icon: undefined as undefined, danger: true }] : []),
    ];

    const handleContextMenuAction = useCallback((key: string, fileId: string) => {
      if (key === '__rename') { const file = files.find(f => f.id === fileId); if (file) startRename(file); }
      else if (key === '__star') onFileStar?.(fileId);
      else if (key === '__delete') onFileDelete?.(fileId);
      else onContextMenuAction?.(key, fileId);
      setContextMenu(null);
    }, [files, startRename, onFileStar, onFileDelete, onContextMenuAction]);

    const renderContextMenu = () => {
      if (!contextMenu || allContextMenuItems.length === 0) return null;
      return (
        <div style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 1000, backgroundColor: tokens.colors.common.white, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.md, boxShadow: tokens.shadows.lg, minWidth: 160, padding: `${tokens.spacing[1]}px 0` }}>
          {allContextMenuItems.map((item) => (
            <button key={item.key} onClick={() => handleContextMenuAction(item.key, contextMenu.fileId)} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: 'none', backgroundColor: 'transparent', color: item.danger ? tokens.colors.errorScale[600] : tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      );
    };

    return (
      <Box
        className={className}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOverUpload}
        onDrop={handleDropUpload}
        style={{ display: 'flex', height: '100%', backgroundColor: tokens.colors.common.white, position: 'relative', ...style }}
      >
        {/* Left Sidebar */}
        <Box style={{ width: 220, minWidth: 220, height: '100%', backgroundColor: tokens.colors.neutral[50], borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <Box style={{ padding: tokens.spacing[4], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Files</Box>
          </Box>
          <Box style={{ flex: 1, padding: tokens.spacing[2] }}>
            <Stack direction="vertical" spacing="none">
              {navItems.map((item) => {
                const isActive = item.key === activeNavKey;
                return (
                  <div key={item.key} onClick={() => onNavSelect?.(item.key)} style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent', color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700], fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing[0] }}>
                    {item.icon && <Box style={{ fontSize: tokens.typography.fontSize.lg, flexShrink: 0 }}>{item.icon}</Box>}
                    <Box style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</Box>
                    {item.badge !== undefined && <Box style={{ backgroundColor: tokens.colors.neutral[200], borderRadius: tokens.borderRadius.full, padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, minWidth: tokens.spacing[5], textAlign: 'center' }}>{item.badge}</Box>}
                  </div>
                );
              })}
            </Stack>
            {quickAccess.length > 0 && (
              <Box style={{ marginTop: tokens.spacing[4] }}>
                <Box style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick access</Box>
                <Stack direction="vertical" spacing="none">
                  {quickAccess.map((item) => (
                    <div key={item.key} onClick={() => onNavSelect?.(item.key)} style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[3], borderRadius: tokens.borderRadius.md, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm }}>
                      {item.icon && <Box style={{ fontSize: tokens.typography.fontSize.md, flexShrink: 0 }}>{item.icon}</Box>}
                      <Box style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</Box>
                    </div>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>

        {/* Center Content */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Box style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
              <input type="text" placeholder={searchPlaceholder} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]} ${tokens.spacing[3]} ${tokens.spacing[2]} ${tokens.spacing[9]}`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, outline: 'none', backgroundColor: tokens.colors.neutral[50] }} />
            </Box>
            {headerRight && <Box style={{ marginLeft: 'auto' }}>{headerRight}</Box>}
          </Box>

          <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[5] }}>
            {actions.length > 0 && (
              <Box style={{ marginBottom: tokens.spacing[5], display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
                {actions.map((action) => (
                  <button key={action.key} onClick={action.onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`, borderRadius: tokens.borderRadius.lg, border: action.variant === 'primary' ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: action.variant === 'primary' ? tokens.colors.primaryScale[600] : tokens.colors.common.white, color: action.variant === 'primary' ? tokens.colors.common.white : tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>
                    {action.icon && <span>{action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </Box>
            )}

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
                <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold }}>{title}</Box>
                {filterTabs.length > 0 && (
                  <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {filterTabs.map((tab) => (
                      <button key={tab.key} onClick={() => onFilterTabChange?.(tab.key)} style={{ padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`, borderRadius: tokens.borderRadius.full, border: 'none', backgroundColor: tab.key === activeFilterTab ? tokens.colors.neutral[900] : 'transparent', color: tab.key === activeFilterTab ? tokens.colors.common.white : tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>{tab.label}</button>
                    ))}
                  </Box>
                )}
              </Box>
              <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                <button onClick={() => handleViewModeChange('grid')} style={{ padding: tokens.spacing[2], border: 'none', borderRadius: tokens.borderRadius.md, backgroundColor: viewMode === 'grid' ? tokens.colors.neutral[200] : 'transparent', color: viewMode === 'grid' ? tokens.colors.neutral[900] : tokens.colors.neutral[400], cursor: 'pointer', fontSize: tokens.typography.fontSize.md }}>{'\u{25A6}'}</button>
                <button onClick={() => handleViewModeChange('list')} style={{ padding: tokens.spacing[2], border: 'none', borderRadius: tokens.borderRadius.md, backgroundColor: viewMode === 'list' ? tokens.colors.neutral[200] : 'transparent', color: viewMode === 'list' ? tokens.colors.neutral[900] : tokens.colors.neutral[400], cursor: 'pointer', fontSize: tokens.typography.fontSize.md }}>{'\u{2630}'}</button>
              </Box>
            </Box>

            {loading ? (
              <Box style={{ padding: tokens.spacing[10], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
            ) : filteredFiles.length === 0 ? (
              <Box style={{ padding: tokens.spacing[10], textAlign: 'center', color: tokens.colors.neutral[400] }}>{emptyText}</Box>
            ) : (
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: tokens.spacing[3] }}>
                {filteredFiles.map((file) => {
                  const isSelected = selectedFile?.id === file.id;
                  const isRenaming = renamingFileId === file.id;
                  const isDragged = draggedFileId === file.id;
                  const isDragTarget = file.type === 'folder' && dragOverFolderId === file.id;
                  return (
                    <div
                      key={file.id}
                      draggable={!!onFileMove}
                      onDragStart={(e) => handleFileDragStart(e, file.id)}
                      onDragEnd={() => { setDraggedFileId(null); setDragOverFolderId(null); }}
                      onDragOver={file.type === 'folder' ? (e) => handleFolderDragOver(e, file.id) : undefined}
                      onDrop={file.type === 'folder' ? (e) => handleFolderDrop(e, file.id) : undefined}
                      onDragLeave={file.type === 'folder' ? () => setDragOverFolderId(null) : undefined}
                      onClick={() => handleFileClick(file)}
                      onDoubleClick={() => isRenaming ? undefined : (onFileRename ? startRename(file) : onFileDoubleClick?.(file))}
                      onContextMenu={(e) => handleContextMenu(e, file.id)}
                      style={{
                        border: `2px solid ${isDragTarget ? tokens.colors.primaryScale[400] : isSelected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200]}`,
                        borderRadius: tokens.borderRadius.lg,
                        overflow: 'hidden',
                        cursor: onFileMove ? 'grab' : 'pointer',
                        backgroundColor: isDragTarget ? tokens.colors.primaryScale[50] : isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                        opacity: isDragged ? 0.4 : 1,
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <Box style={{ height: 90, backgroundColor: tokens.colors.neutral[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: file.type === 'folder' ? tokens.typography.fontSize['4xl'] : tokens.typography.fontSize['3xl'], position: 'relative' }}>
                        {file.thumbnail ? <img src={file.thumbnail} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getMimeIcon(file)}
                        {file.starred && <Box style={{ position: 'absolute', top: tokens.spacing[1], right: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[500] }}>{'\u{2605}'}</Box>}
                      </Box>
                      <Box style={{ padding: tokens.spacing[2] }}>
                        {isRenaming ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setRenamingFileId(null); setRenameValue(''); } }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '100%', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[400]}`, borderRadius: tokens.borderRadius.sm, padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, outline: 'none', fontFamily: 'inherit' }}
                          />
                        ) : (
                          <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</Box>
                        )}
                      </Box>
                    </div>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Detail Panel */}
        {selectedFile && (
          <Box style={{ width: 300, minWidth: 300, height: '100%', borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <Box style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{selectedFile.name}</Box>
              <button onClick={() => setSelectedFile(null)} style={{ padding: tokens.spacing[1], border: 'none', backgroundColor: 'transparent', color: tokens.colors.neutral[400], cursor: 'pointer', fontSize: tokens.typography.fontSize.lg, flexShrink: 0 }}>{'\u{2715}'}</button>
            </Box>
            <Box style={{ height: 200, backgroundColor: tokens.colors.neutral[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize['4xl'], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
              {selectedFile.thumbnail ? <img src={selectedFile.thumbnail} alt={selectedFile.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : getMimeIcon(selectedFile)}
            </Box>
            <Box style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', gap: tokens.spacing[2] }}>
              <button style={{ flex: 1, padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>Share</button>
              <button style={{ flex: 1, padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>Download</button>
            </Box>
            <Box style={{ padding: tokens.spacing[4] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[3] }}>Details</Box>
              <Stack direction="vertical" spacing="sm">
                <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Type</Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>{selectedFile.type === 'folder' ? 'Folder' : getFileExtension(selectedFile.name) || 'File'}</Box>
                </Box>
                {selectedFile.size && (
                  <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Size</Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>{selectedFile.size}</Box>
                  </Box>
                )}
                {selectedFile.type === 'folder' && selectedFile.itemCount !== undefined && (
                  <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Items</Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>{selectedFile.itemCount}</Box>
                  </Box>
                )}
                {selectedFile.modifiedAt && (
                  <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Modified</Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>{selectedFile.modifiedAt}</Box>
                  </Box>
                )}
                {selectedFile.modifiedBy && (
                  <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Modified by</Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>{selectedFile.modifiedBy}</Box>
                  </Box>
                )}
                <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Starred</Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: selectedFile.starred ? tokens.colors.warningScale[500] : tokens.colors.neutral[400] }}>{selectedFile.starred ? '\u{2605} Yes' : '\u{2606} No'}</Box>
                </Box>
              </Stack>
            </Box>
            <Box style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', marginBottom: tokens.spacing[3] }}>Activity</Box>
              <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], fontStyle: 'italic' }}>No recent activity</Box>
            </Box>
          </Box>
        )}

        {/* Upload drop zone overlay */}
        {isDragOver && canUpload && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: `${tokens.colors.primaryScale[50]}cc`,
            border: `3px dashed ${tokens.colors.primaryScale[400]}`,
            borderRadius: tokens.borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            pointerEvents: 'none',
          }}>
            <div style={{
              padding: `${tokens.spacing[6]}px ${tokens.spacing[10]}px`,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[2] }}>{'\u{1F4C2}'}</div>
              <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Drop files here</div>
              <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>Files will be uploaded to the current folder</div>
            </div>
          </div>
        )}

        {/* Context menu */}
        {renderContextMenu()}
      </Box>
    );
  },
});
