'use client';

/**
 * SprintRetro - Compact Preset
 * A simpler list-based retrospective view with columns, card lists, voting, and add-note forms
 */

import { useState, useCallback } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SprintRetroProps, RetroNote, NoteColor } from '../../core';
import { SPRINT_RETRO_DEFAULTS, getNoteColors } from '../../core';

const AVAILABLE_COLORS: NoteColor[] = ['yellow', 'green', 'pink', 'blue', 'orange', 'purple', 'white'];

export const CompactSprintRetro = createPreset<SprintRetroProps>({
  name: 'SprintRetro.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<SprintRetroProps>) => {
    const { Box, Card, Stack, Spinner } = primitives;

    const NOTE_COLOR_MAP = getNoteColors(tokens);

    const {
      title = SPRINT_RETRO_DEFAULTS.title,
      teamName,
      columns,
      participants = [],
      onAddNote,
      onEditNote,
      onDeleteNote,
      onVoteNote,
      onMoveNote,
      onShare,
      editable = SPRINT_RETRO_DEFAULTS.editable,
      loading,
      className,
      style,
    } = props;

    const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteColor, setNewNoteColor] = useState<NoteColor>('yellow');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

    const handleAddNote = useCallback((columnId: string) => {
      if (newNoteContent.trim()) {
        onAddNote?.(columnId, { content: newNoteContent.trim(), color: newNoteColor });
        setNewNoteContent('');
        setNewNoteColor('yellow');
        setAddingToColumn(null);
      }
    }, [newNoteContent, newNoteColor, onAddNote]);

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

    if (loading) {
      return (
        <Box className={className} style={{
          boxShadow: tokens.shadows.md, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300, ...style }}>
          <Spinner size="lg" />
        </Box>
      );
    }

    const onlineCount = participants.filter((p) => p.online).length;

    return (
      <Box
        className={className}
        style={{
          fontFamily: 'inherit',
          background: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Header */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            background: tokens.colors.neutral[50],
          }}
        >
          <Box>
            <Box
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[800],
              }}
            >
              {title}
            </Box>
            {teamName && (
              <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: '2px' }}>
                {teamName}
              </Box>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: `${tokens.spacing[3]}px` }}>
            {/* Online indicator */}
            {participants.length > 0 && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${tokens.spacing[2]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}
              >
                <Box
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: tokens.borderRadius.full,
                    background: tokens.colors.successScale[500],
                  }}
                />
                {onlineCount} online
              </Box>
            )}
            {/* Participant avatars */}
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              {participants.slice(0, 4).map((p, idx) => (
                <Box
                  key={p.id}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: tokens.borderRadius.full,
                    background: p.avatar
                      ? `url(${p.avatar}) center/cover`
                      : [tokens.colors.secondaryScale[500], tokens.colors.infoScale[400], tokens.colors.successScale[400], tokens.colors.warningScale[400]][idx % 4],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.common.white,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    border: `2px solid ${tokens.colors.common.white}`,
                    marginLeft: idx > 0 ? '-6px' : '0',
                  }}
                >
                  {!p.avatar && p.name.charAt(0).toUpperCase()}
                </Box>
              ))}
              {participants.length > 4 && (
                <Box
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: tokens.borderRadius.full,
                    background: tokens.colors.neutral[300],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    fontWeight: tokens.typography.fontWeight.semibold,
                    border: `2px solid ${tokens.colors.common.white}`,
                    marginLeft: '-6px',
                  }}
                >
                  +{participants.length - 4}
                </Box>
              )}
            </Box>
            {/* Share button */}
            {onShare && (
              <Box
                onClick={onShare}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  background: tokens.colors.errorScale[500],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                }}
              >
                Share
              </Box>
            )}
          </Box>
        </Box>

        {/* Columns */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            gap: '0',
            minHeight: '400px',
          }}
        >
          {columns.map((column, colIdx) => (
            <Box
              key={column.id}
              style={{
                borderRight: colIdx < columns.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Column header */}
              <Box
                style={{
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  background: column.color ? `${column.color}10` : tokens.colors.neutral[50],
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: `${tokens.spacing[2]}px` }}>
                    {column.icon && <Box style={{ fontSize: tokens.typography.fontSize.md }}>{column.icon}</Box>}
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                      }}
                    >
                      {column.title}
                    </Box>
                  </Box>
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      background: tokens.colors.neutral[200],
                      padding: `2px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.xl,
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    {column.notes.length}
                  </Box>
                </Box>
                {column.subtitle && (
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      marginTop: `${tokens.spacing[2]}px`,
                      lineHeight: 1.4,
                    }}
                  >
                    {column.subtitle}
                  </Box>
                )}
              </Box>

              {/* Notes list */}
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
                  flex: 1,
                  padding: `${tokens.spacing[3]}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${tokens.spacing[2]}px`,
                  overflowY: 'auto',
                  minHeight: 40,
                  borderRadius: tokens.borderRadius.md,
                  border: dragOverColumnId === column.id ? `2px dashed ${tokens.colors.primaryScale[400]}` : '2px dashed transparent',
                  backgroundColor: dragOverColumnId === column.id ? tokens.colors.primaryScale[50] : 'transparent',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {column.notes.map((note) => {
                  const colors = NOTE_COLOR_MAP[note.color ?? 'yellow'];
                  const isEditing = editingNoteId === note.id;
                  const isDragging = draggedNoteId === note.id;

                  return (
                    <div
                      key={note.id}
                      draggable={!!onMoveNote}
                      onDragStart={(e) => { setDraggedNoteId(note.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', note.id); }}
                      onDragEnd={() => { setDraggedNoteId(null); setDragOverColumnId(null); }}
                      style={{
                        background: colors.bg,
                        borderRadius: tokens.borderRadius.xl,
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        borderLeft: `3px solid ${colors.accent}`,
                        transition: `all ${tokens.motion.hover}`,
                        cursor: onMoveNote ? 'grab' : (editable ? 'pointer' : 'default'),
                        opacity: isDragging ? 0.4 : 1,
                      }}
                      onClick={() => !isEditing && handleStartEdit(note)}
                    >
                      {isEditing ? (
                        <textarea
                          value={editingContent}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingContent(e.target.value)}
                          onBlur={handleSaveEdit}
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
                            minHeight: '40px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: tokens.typography.fontSize.sm,
                            lineHeight: '1.4',
                            fontFamily: 'inherit',
                            resize: 'none',
                            outline: 'none',
                            color: tokens.colors.neutral[800],
                          }}
                        />
                      ) : (
                        <Box
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            lineHeight: '1.5',
                            color: tokens.colors.neutral[800],
                            wordBreak: 'break-word',
                          }}
                        >
                          {note.content}
                        </Box>
                      )}

                      {/* Footer */}
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: `${tokens.spacing[2]}px`,
                        }}
                      >
                        {note.author && (
                          <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                            {note.author}
                          </Box>
                        )}
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: `${tokens.spacing[3]}px`,
                            marginLeft: 'auto',
                          }}
                        >
                          {/* Vote */}
                          <Box
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onVoteNote?.(note.id);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: `${tokens.spacing[1]}px`,
                              cursor: 'pointer',
                              padding: `2px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.md,
                              background: note.voted ? tokens.colors.primaryScale[50] : 'transparent',
                              color: note.voted ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400],
                              fontSize: tokens.typography.fontSize.xs,
                              transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 9V5a3 3 0 0 0-6 0v4M5 11h3v10H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM10 21h6.3a2 2 0 0 0 1.94-1.52l1.29-5.15A2 2 0 0 0 17.6 12H14" />
                            </svg>
                            {(note.votes ?? 0) > 0 && (
                              <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>{note.votes}</span>
                            )}
                          </Box>

                          {/* Delete */}
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
                                color: tokens.colors.neutral[300],
                                padding: '2px',
                                borderRadius: tokens.borderRadius.sm,
                                transition: `all ${tokens.motion.hover}`,
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              </svg>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </div>
                  );
                })}

                {column.notes.length === 0 && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: `${tokens.spacing[7]}px ${tokens.spacing[4]}px`,
                      color: tokens.colors.neutral[300],
                      fontSize: tokens.typography.fontSize.sm,
                      fontStyle: 'italic',
                    }}
                  >
                    No notes yet
                  </Box>
                )}
              </div>

              {/* Add note section */}
              {editable && (
                <Box style={{ padding: `${tokens.spacing[3]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                  {addingToColumn === column.id ? (
                    <Box>
                      <textarea
                        value={newNoteContent}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value)}
                        placeholder="Write your note..."
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
                          minHeight: '50px',
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                          borderRadius: tokens.borderRadius.lg,
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          fontSize: tokens.typography.fontSize.sm,
                          fontFamily: 'inherit',
                          resize: 'none',
                          outline: 'none',
                          marginBottom: `${tokens.spacing[2]}px`,
                        }}
                      />
                      {/* Color picker */}
                      <Box style={{ display: 'flex', gap: `${tokens.spacing[1]}px`, marginBottom: `${tokens.spacing[2]}px` }}>
                        {AVAILABLE_COLORS.map((color) => (
                          <Box
                            key={color}
                            onClick={() => setNewNoteColor(color)}
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: tokens.borderRadius.full,
                              background: NOTE_COLOR_MAP[color].accent,
                              border: newNoteColor === color
                                ? `2px solid ${tokens.colors.primaryScale[600]}`
                                : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              transform: newNoteColor === color ? 'scale(1.2)' : 'scale(1)',
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
                            color: tokens.colors.common.white,
                            background: tokens.colors.primaryScale[600],
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}
                        >
                          Add
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
                        padding: `${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.lg,
                        border: `1px dashed ${tokens.colors.neutral[300]}`,
                        color: tokens.colors.neutral[400],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Add note
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
