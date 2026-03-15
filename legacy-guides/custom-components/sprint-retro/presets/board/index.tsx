'use client';

/**
 * SprintRetro - Board Preset
 * Full Mural-style retrospective board with canvas, sticky notes, toolbar, and share modal
 */

import { useState, useCallback } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SprintRetroProps, RetroNote, NoteColor } from '../../core';
import { SPRINT_RETRO_DEFAULTS, getNoteColors } from '../../core';
import {
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
} from '../../../helpers';

const ROTATION_ANGLES = [-2.5, 1.8, -1.2, 2.1, -0.8, 1.5, -1.9, 0.6];

/* ------------------------------------------------------------------ */
/*  SVG icon helpers (inline, no external deps)                       */
/* ------------------------------------------------------------------ */

const SvgIcon = ({ d, size = 16, color = 'currentColor' }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  undo:       <SvgIcon d="M3 10h13a4 4 0 0 1 0 8H3M3 10l4-4M3 10l4 4" />,
  redo:       <SvgIcon d="M21 10H8a4 4 0 0 0 0 8h13M21 10l-4-4M21 10l-4 4" />,
  square:     <SvgIcon d="M3 3h18v18H3z" />,
  type:       <SvgIcon d="M4 7V4h16v3M9 20h6M12 4v16" />,
  stickyNote: <SvgIcon d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" />,
  check:      <SvgIcon d="M20 6L9 17l-5-5" />,
  timer:      <SvgIcon d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" />,
  connector:  <SvgIcon d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />,
  chat:       <SvgIcon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  edit:       <SvgIcon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />,
  star:       <SvgIcon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  layers:     <SvgIcon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  grid:       <SvgIcon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  table:      <SvgIcon d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />,
  download:   <SvgIcon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  settings:   <SvgIcon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />,
  export:     <SvgIcon d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />,
  zoomIn:     <SvgIcon d="M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M11 8v6M8 11h6" />,
  zoomOut:    <SvgIcon d="M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35M8 11h6" />,
  close:      <SvgIcon d="M18 6L6 18M6 6l12 12" />,
  lock:       <SvgIcon d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />,
  share:      <SvgIcon d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />,
  plus:       <SvgIcon d="M12 5v14M5 12h14" />,
  minus:      <SvgIcon d="M5 12h14" />,
  thumbsUp:   <SvgIcon d="M14 9V5a3 3 0 0 0-6 0v4M5 11h3v10H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM10 21h6.3a2 2 0 0 0 1.94-1.52l1.29-5.15A2 2 0 0 0 17.6 12H14" />,
  trash:      <SvgIcon d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />,
  users:      <SvgIcon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  chevronDown:<SvgIcon d="M6 9l6 6 6-6" />,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const BoardSprintRetro = createPreset<SprintRetroProps>({
  name: 'SprintRetro.Board',
  render: ({ primitives, props, tokens, engine }: PresetContext<SprintRetroProps>) => {
    const { Box, Card, Stack, Spinner } = primitives;

    const NOTE_COLORS = getNoteColors(tokens);

    const {
      title = SPRINT_RETRO_DEFAULTS.title,
      teamName,
      columns,
      participants: rawParticipants = [],
      onAddNote,
      onEditNote,
      onDeleteNote,
      onVoteNote,
      onMoveNote,
      onShare,
      shareConfig,
      toolbar,
      zoomLevel = SPRINT_RETRO_DEFAULTS.zoomLevel ?? 100,
      onZoomChange,
      editable = SPRINT_RETRO_DEFAULTS.editable,
      loading,
      className,
      style,
    } = props;

    const participants = Array.isArray(rawParticipants) ? rawParticipants : [];

    const [shareOpen, setShareOpen] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteColor, setNewNoteColor] = useState<NoteColor>('yellow');
    const [sharePassword, setSharePassword] = useState('');
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [shareTab, setShareTab] = useState<'members' | 'visitors'>('visitors');
    const [expirationValue, setExpirationValue] = useState('never');
    const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

    const handleShareToggle = useCallback(() => {
      setShareOpen((prev) => !prev);
      onShare?.();
    }, [onShare]);

    const handleStartEdit = useCallback((note: RetroNote) => {
      if (!editable) return;
      setEditingNoteId(note.id);
      setEditingContent(note.content);
    }, [editable]);

    const handleSaveEdit = useCallback(() => {
      if (editingNoteId && editingContent.trim()) {
        onEditNote?.(editingNoteId, editingContent.trim());
      }
      setEditingNoteId(null);
      setEditingContent('');
    }, [editingNoteId, editingContent, onEditNote]);

    const handleAddNote = useCallback((columnId: string) => {
      if (newNoteContent.trim()) {
        onAddNote?.(columnId, { content: newNoteContent.trim(), color: newNoteColor });
        setNewNoteContent('');
        setAddingToColumn(null);
      }
    }, [newNoteContent, newNoteColor, onAddNote]);

    const handleSavePassword = useCallback(() => {
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    }, []);

    const handleZoom = useCallback((delta: number) => {
      const newLevel = Math.max(25, Math.min(200, zoomLevel + delta));
      onZoomChange?.(newLevel);
    }, [zoomLevel, onZoomChange]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400, ...style }}>
          <Spinner size="lg" />
        </Box>
      );
    }

    const facilitator = participants.find((p) => p.role === 'facilitator');
    const onlineCount = participants.filter((p) => p.online).length;
    const expirationOptions = shareConfig?.expirationOptions ?? [
      { value: 'never', label: 'Never expires' },
      { value: 'duration', label: 'Set a duration' },
      { value: 'date', label: 'Set an expiration date' },
    ];

    /* ---- Sidebar icons ---- */
    const sidebarTools = [
      { key: 'chat', icon: Icons.chat },
      { key: 'edit', icon: Icons.edit },
      { key: 'star', icon: Icons.star },
      { key: 'layers', icon: Icons.layers },
      { key: 'grid', icon: Icons.grid },
      { key: 'table', icon: Icons.table },
      { key: 'sticky', icon: Icons.stickyNote },
      { key: 'type', icon: Icons.type },
      { key: 'export', icon: Icons.export },
    ];

    /* ---- Default toolbar items ---- */
    const toolbarItems: NonNullable<typeof toolbar> = toolbar ?? [
      { key: 'undo', icon: Icons.undo, label: 'Undo' },
      { key: 'redo', icon: Icons.redo, label: 'Redo' },
      { key: 'divider1' },
      { key: 'shapes', icon: Icons.square, label: 'Shapes' },
      { key: 'text', icon: Icons.type, label: 'Text' },
      { key: 'sticky', icon: Icons.stickyNote, label: 'Sticky note' },
      { key: 'checkbox', icon: Icons.check, label: 'Checkbox' },
      { key: 'timer', icon: Icons.timer, label: 'Timer' },
      { key: 'connector', icon: Icons.connector, label: 'Connector' },
    ];

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '700px',
          background: tokens.colors.neutral[100],
          borderRadius: tokens.borderRadius.lg,
          overflow: 'hidden',
          fontFamily: 'inherit',
          position: 'relative',
          ...style,
        }}
      >
        {/* ===================== TOP TOOLBAR ===================== */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            background: tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {/* Left section */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: `${tokens.spacing[2]}px` }}>
            {/* Retro name dropdown */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${tokens.spacing[1]}px`,
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
                background: tokens.colors.neutral[100],
              }}
            >
              <span>{title}</span>
              {Icons.chevronDown}
            </Box>

            {/* Toolbar tools */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: `${tokens.spacing[2]}px` }}>
              {toolbarItems.map((item) =>
                item.key.startsWith('divider') ? (
                  <Box
                    key={item.key}
                    style={{
                      width: '1px',
                      height: '20px',
                      background: tokens.colors.neutral[300],
                      margin: `0 ${tokens.spacing[2]}px`,
                    }}
                  />
                ) : (
                  <Box
                    key={item.key}
                    onClick={item.onClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: `${tokens.spacing[7]}px`,
                      height: `${tokens.spacing[7]}px`,
                      borderRadius: tokens.borderRadius.md,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      color: item.active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                      background: item.active ? tokens.colors.primaryScale[50] : 'transparent',
                    }}
                  >
                    {item.icon}
                  </Box>
                )
              )}
            </Box>
          </Box>

          {/* Center section */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: `${tokens.spacing[3]}px` }}>
            {facilitator && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${tokens.spacing[2]}px`,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.xl,
                  background: tokens.colors.successScale[50],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.successScale[800],
                }}
              >
                <Box
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: tokens.borderRadius.full,
                    background: tokens.colors.successScale[500],
                  }}
                />
                Facilitator
              </Box>
            )}
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>All changes saved!</Box>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${tokens.spacing[1]}px`,
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}
            >
              {Icons.users}
              <span>{onlineCount || participants.length || 1}</span>
            </Box>
          </Box>

          {/* Right section */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: `${tokens.spacing[2]}px` }}>
            <Box
              onClick={handleShareToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${tokens.spacing[2]}px`,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                background: tokens.colors.errorScale[500],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                border: 'none',
              }}
            >
              {Icons.share}
              Share
            </Box>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${tokens.spacing[7]}px`,
                height: `${tokens.spacing[7]}px`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.neutral[500],
              }}
            >
              {Icons.download}
            </Box>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${tokens.spacing[7]}px`,
                height: `${tokens.spacing[7]}px`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.neutral[500],
              }}
            >
              {Icons.export}
            </Box>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${tokens.spacing[7]}px`,
                height: `${tokens.spacing[7]}px`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.neutral[500],
              }}
            >
              {Icons.settings}
            </Box>
            <Box
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.xl,
                background: tokens.colors.warningScale[50],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.warningScale[800],
              }}
            >
              Early access
            </Box>
          </Box>
        </Box>

        {/* ===================== MAIN AREA ===================== */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left sidebar */}
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: `${tokens.spacing[1]}px`,
              padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`,
              background: tokens.colors.common.white,
              borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
              width: `${tokens.spacing[9]}px`,
              flexShrink: 0,
              overflowY: 'auto',
            }}
          >
            {sidebarTools.map((tool) => (
              <Box
                key={tool.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: tokens.borderRadius.lg,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  color: tokens.colors.neutral[500],
                }}
              >
                {tool.icon}
              </Box>
            ))}
          </Box>

          {/* Canvas area */}
          <Box
            style={{
              flex: 1,
              overflow: 'auto',
              padding: `${tokens.spacing[7]}px`,
              background: `
                radial-gradient(circle, ${tokens.colors.neutral[300]} 1px, transparent 1px)
              `,
              backgroundSize: `${tokens.spacing[6]}px ${tokens.spacing[6]}px`,
              position: 'relative',
            }}
          >
            <Box
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top left',
                display: 'flex',
                gap: `${tokens.spacing[7]}px`,
                minWidth: 'max-content',
                padding: `${tokens.spacing[4]}px`,
              }}
            >
              {columns.map((column) => (
                <Box
                  key={column.id}
                  style={{
                    minWidth: '320px',
                    maxWidth: '400px',
                    flex: '1',
                  }}
                >
                  {/* Column header */}
                  <Box
                    style={{
                      marginBottom: `${tokens.spacing[4]}px`,
                      padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                      background: column.color ?? tokens.colors.common.white,
                      borderRadius: tokens.borderRadius.xl,
                      boxShadow: tokens.shadows.sm,
                    }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: `${tokens.spacing[2]}px`,
                        marginBottom: column.subtitle ? `${tokens.spacing[2]}px` : '0',
                      }}
                    >
                      {column.icon && (
                        <Box style={{ fontSize: tokens.typography.fontSize.xl }}>{column.icon}</Box>
                      )}
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[800],
                        }}
                      >
                        {column.title}
                      </Box>
                      <Box
                        style={{
                          marginLeft: 'auto',
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[400],
                          background: tokens.colors.neutral[100],
                          padding: `2px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.xl,
                        }}
                      >
                        {column.notes.length}
                      </Box>
                    </Box>
                    {column.subtitle && (
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[500],
                          lineHeight: tokens.typography.lineHeight.relaxed,
                        }}
                      >
                        {column.subtitle}
                      </Box>
                    )}
                  </Box>

                  {/* Notes grid */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverColumnId(column.id); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedNoteId && onMoveNote) {
                        onMoveNote(draggedNoteId, column.id);
                      }
                      setDraggedNoteId(null);
                      setDragOverColumnId(null);
                    }}
                    onDragLeave={() => setDragOverColumnId(null)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: `${tokens.spacing[3]}px`,
                      marginBottom: `${tokens.spacing[3]}px`,
                      minHeight: 60,
                      borderRadius: tokens.borderRadius.md,
                      border: dragOverColumnId === column.id ? `2px dashed ${tokens.colors.primaryScale[400]}` : '2px dashed transparent',
                      backgroundColor: dragOverColumnId === column.id ? tokens.colors.primaryScale[50] : 'transparent',
                      transition: `all ${tokens.motion.hover}`,
                      padding: tokens.spacing[1],
                    }}
                  >
                    {column.notes.map((note, noteIndex) => {
                      const colorSet = NOTE_COLORS[note.color ?? 'yellow'];
                      const rotation = ROTATION_ANGLES[noteIndex % ROTATION_ANGLES.length];
                      const isEditing = editingNoteId === note.id;
                      const isDragging = draggedNoteId === note.id;

                      return (
                        <div
                          key={note.id}
                          draggable={!!onMoveNote}
                          onDragStart={(e) => { setDraggedNoteId(note.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', note.id); }}
                          onDragEnd={() => { setDraggedNoteId(null); setDragOverColumnId(null); }}
                          style={{
                            background: colorSet.bg,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colorSet.border}`,
                            borderRadius: tokens.borderRadius.sm,
                            padding: `${tokens.spacing[4]}px`,
                            minHeight: '100px',
                            boxShadow: tokens.shadows.sm,
                            transform: `rotate(${rotation}deg)`,
                            transition: `all ${tokens.motion.hover}`,
                            cursor: onMoveNote ? 'grab' : (editable ? 'pointer' : 'default'),
                            opacity: isDragging ? 0.4 : 1,
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                          onClick={() => !isEditing && handleStartEdit(note)}
                        >
                          {isEditing ? (
                            <textarea
                              value={editingContent}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingContent(e.target.value)}
                              onBlur={(e) => {
                                handleSaveEdit();
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                              }}
                              onKeyDown={(e: React.KeyboardEvent) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit();
                                }
                                if (e.key === 'Escape') {
                                  setEditingNoteId(null);
                                }
                              }}
                              autoFocus
                              style={{
                                width: '100%',
                                minHeight: '60px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: tokens.typography.fontSize.sm,
                                lineHeight: '1.4',
                                fontFamily: 'inherit',
                                resize: 'none',
                                outline: 'none',
                                color: tokens.colors.neutral[800],
                                flex: 1,
                              }}
                            
                              onFocus={(e) => {
                                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                              }}
                            />
                          ) : (
                            <Box
                              style={{
                                fontSize: tokens.typography.fontSize.sm,
                                lineHeight: '1.4',
                                color: tokens.colors.neutral[800],
                                wordBreak: 'break-word',
                                flex: 1,
                              }}
                            >
                              {note.content}
                            </Box>
                          )}

                          {/* Footer with author, votes, and actions */}
                          <Box
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: `${tokens.spacing[3]}px`,
                              paddingTop: `${tokens.spacing[2]}px`,
                              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colorSet.border}40`,
                            }}
                          >
                            {note.author && (
                              <Box
                                style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.neutral[400],
                                  fontWeight: tokens.typography.fontWeight.medium,
                                }}
                              >
                                {note.author}
                              </Box>
                            )}
                            <Box
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: `${tokens.spacing[2]}px`,
                                marginLeft: 'auto',
                              }}
                            >
                              {/* Vote button */}
                              <Box
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  onVoteNote?.(note.id);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  cursor: 'pointer',
                                  transition: `all ${tokens.motion.hover}`,
                                  color: note.voted ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                                  fontSize: tokens.typography.fontSize.xs,
                                }}
                              >
                                {Icons.thumbsUp}
                                {(note.votes ?? 0) > 0 && <span>{note.votes}</span>}
                              </Box>

                              {/* Delete button */}
                              {editable && (
                                <Box
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    onDeleteNote?.(note.id);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: `all ${tokens.motion.hover}`,
                                    color: tokens.colors.neutral[300],
                                    fontSize: tokens.typography.fontSize.xs,
                                  }}
                                >
                                  {Icons.trash}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add note button / form */}
                  {editable && (
                    <>
                      {addingToColumn === column.id ? (
                        <Box
                          style={{
                            background: tokens.colors.common.white,
                            borderRadius: tokens.borderRadius.lg,
                            padding: `${tokens.spacing[3]}px`,
                            boxShadow: tokens.shadows.sm,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                          }}
                        >
                          <textarea
                            value={newNoteContent}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value)}
                            placeholder="Type your note..."
                            autoFocus
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddNote(column.id);
                              }
                              if (e.key === 'Escape') {
                                setAddingToColumn(null);
                                setNewNoteContent('');
                              }
                            }}
                            style={{
                              width: '100%',
                              minHeight: '60px',
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                              borderRadius: tokens.borderRadius.md,
                              padding: `${tokens.spacing[2]}px`,
                              fontSize: tokens.typography.fontSize.sm,
                              fontFamily: 'inherit',
                              resize: 'none',
                              outline: 'none',
                              marginBottom: `${tokens.spacing[2]}px`,
                            }}
                          
                            onFocus={(e) => {
                              e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                              e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                            }}
                          />
                          {/* Color picker */}
                          <Box
                            style={{
                              display: 'flex',
                              gap: `${tokens.spacing[2]}px`,
                              marginBottom: `${tokens.spacing[3]}px`,
                            }}
                          >
                            {(Object.keys(NOTE_COLORS) as NoteColor[]).map((color) => (
                              <Box
                                key={color}
                                onClick={() => setNewNoteColor(color)}
                                style={{
                                  width: `${tokens.spacing[5]}px`,
                                  height: `${tokens.spacing[5]}px`,
                                  borderRadius: tokens.borderRadius.full,
                                  background: NOTE_COLORS[color].bg,
                                  border: newNoteColor === color
                                    ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`
                                    : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${NOTE_COLORS[color].border}`,
                                  cursor: 'pointer',
                                  transition: `all ${tokens.motion.hover}`,
                                }}
                              />
                            ))}
                          </Box>
                          <Box style={{ display: 'flex', gap: `${tokens.spacing[2]}px`, justifyContent: 'flex-end' }}>
                            <Box
                              onClick={() => {
                                setAddingToColumn(null);
                                setNewNoteContent('');
                              }}
                              style={{
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                                borderRadius: tokens.borderRadius.md,
                                fontSize: tokens.typography.fontSize.xs,
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                color: tokens.colors.neutral[500],
                                background: tokens.colors.neutral[100],
                              }}
                            >
                              Cancel
                            </Box>
                            <Box
                              onClick={() => handleAddNote(column.id)}
                              style={{
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                                borderRadius: tokens.borderRadius.md,
                                fontSize: tokens.typography.fontSize.xs,
                                cursor: 'pointer',
                                transition: `all ${tokens.motion.hover}`,
                                color: tokens.colors.common.white,
                                background: tokens.colors.primaryScale[600],
                                fontWeight: tokens.typography.fontWeight.medium,
                              }}
                            >
                              Add note
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          onClick={() => setAddingToColumn(column.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: `${tokens.spacing[2]}px`,
                            padding: `${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.lg,
                            border: `2px dashed ${tokens.colors.neutral[300]}`,
                            color: tokens.colors.neutral[400],
                            fontSize: tokens.typography.fontSize.sm,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          {Icons.plus}
                          Add a sticky note
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ===================== BOTTOM BAR ===================== */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            background: tokens.colors.common.white,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
            flexShrink: 0,
          }}
        >
          {/* Participant avatars */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: `${tokens.spacing[1]}px` }}>
            {participants.slice(0, 5).map((participant, idx) => (
              <Box
                key={participant.id}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: tokens.borderRadius.full,
                  background: participant.avatar
                    ? `url(${participant.avatar}) center/cover`
                    : [tokens.colors.secondaryScale[500], tokens.colors.infoScale[400], tokens.colors.successScale[400], tokens.colors.warningScale[400], tokens.colors.errorScale[400]][idx % 5],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.common.white,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                  marginLeft: idx > 0 ? '-6px' : '0',
                  position: 'relative',
                  zIndex: participants.length - idx,
                }}
              >
                {!participant.avatar && participant.name.charAt(0).toUpperCase()}
                {participant.online && (
                  <Box
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: `${tokens.spacing[2]}px`,
                      height: `${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      background: tokens.colors.successScale[500],
                      border: `1.5px solid ${tokens.colors.common.white}`,
                    }}
                  />
                )}
              </Box>
            ))}
            {participants.length > 5 && (
              <Box
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: tokens.borderRadius.full,
                  background: tokens.colors.neutral[300],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.semibold,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                  marginLeft: '-6px',
                }}
              >
                +{participants.length - 5}
              </Box>
            )}
            <Box
              style={{
                width: '28px',
                height: '28px',
                borderRadius: tokens.borderRadius.full,
                background: tokens.colors.neutral[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.neutral[400],
                marginLeft: `${tokens.spacing[1]}px`,
              }}
            >
              {Icons.plus}
            </Box>
          </Box>

          {/* Center: Navigation text */}
          <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
            Navigation Settings
          </Box>

          {/* Zoom controls */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: `${tokens.spacing[2]}px` }}>
            <Box
              onClick={() => handleZoom(-10)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.neutral[500],
                background: tokens.colors.neutral[100],
              }}
            >
              {Icons.minus}
            </Box>

            {/* Zoom slider track */}
            <Box
              style={{
                position: 'relative',
                width: '100px',
                height: `${tokens.spacing[1]}px`,
                background: tokens.colors.neutral[300],
                borderRadius: tokens.borderRadius.sm,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                const newZoom = Math.round(25 + (pct / 100) * 175);
                onZoomChange?.(Math.max(25, Math.min(200, newZoom)));
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${((zoomLevel - 25) / 175) * 100}%`,
                  background: tokens.colors.primaryScale[600],
                  borderRadius: tokens.borderRadius.sm,
                }}
              />
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${((zoomLevel - 25) / 175) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${tokens.spacing[3]}px`,
                  height: `${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.full,
                  background: tokens.colors.primaryScale[600],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                  boxShadow: tokens.shadows.sm,
                }}
              />
            </Box>

            <Box
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                minWidth: '36px',
                textAlign: 'center',
              }}
            >
              {zoomLevel}%
            </Box>

            <Box
              onClick={() => handleZoom(10)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.neutral[500],
                background: tokens.colors.neutral[100],
              }}
            >
              {Icons.plus}
            </Box>
          </Box>
        </Box>

        {/* ===================== SHARE MODAL ===================== */}
        {shareOpen && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background: tokens.overlay?.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}
            onClick={() => setShareOpen(false)}
          >
            <Box
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                background: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.xl,
                width: '480px',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: tokens.shadows.lg,
              }}
            >
              {/* Modal header */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: `${tokens.spacing[3]}px` }}>
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[800],
                    }}
                  >
                    Share mural
                  </Box>
                  <Box
                    style={{
                      padding: `3px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.xl,
                      background: tokens.colors.successScale[50],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.successScale[800],
                    }}
                  >
                    You have access
                  </Box>
                </Box>
                <Box
                  onClick={() => setShareOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    color: tokens.colors.neutral[400],
                  }}
                >
                  {Icons.close}
                </Box>
              </Box>

              {/* Tabs */}
              <Box
                style={{
                  display: 'flex',
                  padding: `0 ${tokens.spacing[6]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}
              >
                <Box
                  onClick={() => setShareTab('members')}
                  style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    color: shareTab === 'members' ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    borderBottom: shareTab === 'members' ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                  }}
                >
                  Members {shareConfig?.memberCount != null && `(${shareConfig.memberCount})`}
                </Box>
                <Box
                  onClick={() => setShareTab('visitors')}
                  style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    color: shareTab === 'visitors' ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    borderBottom: shareTab === 'visitors' ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                  }}
                >
                  Visitors {shareConfig?.visitorCount != null && `(${shareConfig.visitorCount})`}
                </Box>
              </Box>

              {/* Content */}
              <Box style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px` }}>
                {shareTab === 'visitors' ? (
                  <>
                    {/* Password section */}
                    <Box style={{ marginBottom: `${tokens.spacing[6]}px` }}>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: `${tokens.spacing[2]}px`,
                          marginBottom: `${tokens.spacing[3]}px`,
                        }}
                      >
                        {Icons.lock}
                        <Box style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                          Add password
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', gap: `${tokens.spacing[2]}px`, alignItems: 'center', marginBottom: `${tokens.spacing[2]}px` }}>
                        <input
                          type="password"
                          value={sharePassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSharePassword(e.target.value);
                            setPasswordSaved(false);
                          }}
                          placeholder="Enter password"
                          style={{
                            flex: 1,
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.lg,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                            fontSize: tokens.typography.fontSize.sm,
                            outline: 'none',
                            fontFamily: 'inherit',
                          }}
                        
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                            e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                          }}
                        />
                        {passwordSaved && (
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: `${tokens.spacing[1]}px`,
                              color: tokens.colors.successScale[500],
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}
                          >
                            {Icons.check}
                            Saved
                          </Box>
                        )}
                      </Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginBottom: `${tokens.spacing[3]}px` }}>
                        Must have at least 8 characters
                      </Box>
                      <Box style={{ display: 'flex', gap: `${tokens.spacing[2]}px` }}>
                        <Box
                          onClick={handleSavePassword}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                            borderRadius: tokens.borderRadius.md,
                            background: tokens.colors.primaryScale[600],
                            color: tokens.colors.common.white,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          Save password
                        </Box>
                        {shareConfig?.hasPassword && (
                          <Box
                            style={{
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                              borderRadius: tokens.borderRadius.md,
                              background: tokens.colors.common.white,
                              color: tokens.colors.errorScale[500],
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[500]}`,
                            }}
                          >
                            Remove password
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Expiration section */}
                    <Box>
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                          marginBottom: `${tokens.spacing[3]}px`,
                        }}
                      >
                        Visitor link expiration
                      </Box>
                      <select
                        value={expirationValue}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExpirationValue(e.target.value)}
                        style={{
                          width: '100%',
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.lg,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                          fontSize: tokens.typography.fontSize.sm,
                          fontFamily: 'inherit',
                          outline: 'none',
                          background: tokens.colors.common.white,
                          color: tokens.colors.neutral[800],
                          marginBottom: `${tokens.spacing[3]}px`,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: `right ${tokens.spacing[3]}px center`,
                          paddingRight: '36px',
                        }}
                      >
                        {expirationOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <Box
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                          borderRadius: tokens.borderRadius.lg,
                          background: tokens.colors.primaryScale[600],
                          color: tokens.colors.common.white,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          textAlign: 'center',
                        }}
                      >
                        Save expiration
                      </Box>
                    </Box>
                  </>
                ) : (
                  /* Members tab */
                  <Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginBottom: `${tokens.spacing[4]}px` }}>
                      Share this mural with team members to collaborate in real time.
                    </Box>
                    <Box style={{ display: 'flex', gap: `${tokens.spacing[2]}px`, marginBottom: `${tokens.spacing[4]}px` }}>
                      <input
                        type="email"
                        placeholder="Add by email or name"
                        style={{
                          flex: 1,
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.lg,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                          fontSize: tokens.typography.fontSize.sm,
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                          e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                        }}
                      />
                      <Box
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                          borderRadius: tokens.borderRadius.lg,
                          background: tokens.colors.primaryScale[600],
                          color: tokens.colors.common.white,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        Invite
                      </Box>
                    </Box>

                    {/* Current members list */}
                    {participants.length > 0 && (
                      <Box
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: `${tokens.spacing[2]}px`,
                        }}
                      >
                        {participants.map((p) => (
                          <Box
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: `${tokens.spacing[3]}px`,
                              padding: `${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.lg,
                              background: tokens.colors.neutral[50],
                            }}
                          >
                            <Box
                              style={{
                                width: `${tokens.spacing[7]}px`,
                                height: `${tokens.spacing[7]}px`,
                                borderRadius: tokens.borderRadius.full,
                                background: p.avatar
                                  ? `url(${p.avatar}) center/cover`
                                  : tokens.colors.secondaryScale[500],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: tokens.typography.fontSize.sm,
                                color: tokens.colors.common.white,
                                fontWeight: tokens.typography.fontWeight.semibold,
                              }}
                            >
                              {!p.avatar && p.name.charAt(0).toUpperCase()}
                            </Box>
                            <Box style={{ flex: 1 }}>
                              <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                                {p.name}
                              </Box>
                              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                                {p.role === 'facilitator' ? 'Facilitator' : 'Participant'}
                              </Box>
                            </Box>
                            {p.online && (
                              <Box
                                style={{
                                  width: `${tokens.spacing[2]}px`,
                                  height: `${tokens.spacing[2]}px`,
                                  borderRadius: tokens.borderRadius.full,
                                  background: tokens.colors.successScale[500],
                                }}
                              />
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
