'use client';

/**
 * @fileoverview Modern (token-driven) engine for the KanbanBoard pattern.
 * Renders a horizontally-scrollable drag-and-drop board using card structural classes,
 * badge, and button utility classes. Drop-target columns highlight with a
 * primary-tinted ring to give users clear visual feedback during drag.
 *
 * @example
 * <KanbanBoard
 *   engine="modern"
 *   columns={[{ id: 'backlog', title: 'Backlog', items: stories }]}
 *   renderCard={(story) => <span>{story.title}</span>}
 *   itemKey={(story) => story.id}
 *   onItemMove={(id, from, to, pos) => reorder(id, from, to, pos)}
 * />
 */

import React, { useCallback, useState } from 'react';
import type { KanbanBoardProps } from '../KanbanBoard.types';
import { pillBadgeSmStyle, spinnerStyle } from '../../_internal/engines/modern/styles';

/**
 * Modern Kanban board built on Tailwind utility classes with DS token styling.
 * Generic over `T` so any item shape can be used with a string key extractor.
 *
 * @param props - See {@link KanbanBoardProps} for full prop documentation.
 * @returns A flex-based board with DS token-styled columns and cards.
 */
export default function ModernKanbanBoard<T>(props: KanbanBoardProps<T>) {
  const {
    columns,
    renderCard,
    renderColumnHeader,
    toolbar,
    onItemMove,
    onItemClick,
    emptyColumn,
    itemKey,
    columnGap = 16,
    columnMinWidth = 280,
    onAddItem,
    addItemLabel = 'Add item',
    loading,
    className,
    style,
  } = props;

  // Two pieces of drag state: `dragData` mirrors what we put in dataTransfer
  // (needed because the browser API restricts reading dataTransfer during
  // dragOver), and `dropTarget` tracks which column is being hovered so we
  // can highlight it with a ring indicator.
  const [dragData, setDragData] = useState<{
    itemId: string;
    fromColumn: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    columnId: string;
    position: number;
  } | null>(null);

  // Store item ID in both dataTransfer (for the native DnD pipeline) and
  // React state (for rendering hover indicators during dragOver).
  const handleDragStart = useCallback(
    (e: React.DragEvent, item: T, columnId: string) => {
      const id = itemKey(item);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      setDragData({ itemId: id, fromColumn: columnId });
    },
    [itemKey]
  );

  // preventDefault on dragOver is mandatory -- without it the browser
  // defaults to "not droppable" and will never fire the drop event.
  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: string, position: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTarget({ columnId, position });
    },
    []
  );

  // Delegate actual data mutation to the parent via onItemMove so the
  // board remains a controlled component (data source of truth is external).
  const handleDrop = useCallback(
    (e: React.DragEvent, columnId: string, position: number) => {
      e.preventDefault();
      if (dragData) {
        onItemMove(dragData.itemId, dragData.fromColumn, columnId, position);
      }
      setDragData(null);
      setDropTarget(null);
    },
    [dragData, onItemMove]
  );

  // Always clean up drag state on end, even if the drop landed outside a
  // valid target, to avoid stale ghost opacity on cards.
  const handleDragEnd = useCallback(() => {
    setDragData(null);
    setDropTarget(null);
  }, []);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[300px] ${className ?? ''}`}
        style={style}
      >
        <span style={spinnerStyle(32)} />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {toolbar && <div className="mb-4">{toolbar}</div>}
      <div
        className="flex overflow-x-auto pb-2"
        style={{ gap: columnGap }}
      >
        {columns.map((column) => {
          // WIP limit uses DS error token (red) when at or over capacity to
          // signal that further additions violate the team's WIP policy.
          const isOverLimit =
            column.limit !== undefined && column.items.length >= column.limit;
          // Track whether this column is the active drop target so we can
          // show a primary-tinted ring as a drop affordance.
          const isDropping = dropTarget?.columnId === column.id;

          return (
            <div
              key={column.id}
              className={`flex flex-col ${column.collapsed ? 'w-12' : 'flex-1'}`}
              style={{ minWidth: column.collapsed ? 48 : columnMinWidth }}
            >
              {/* Column header */}
              <div
                className="rounded-xl px-4 py-3 mb-2"
                style={{
                  background: 'var(--ds-surface-inset)',
                  borderTop: column.color
                    ? `3px solid ${column.color}`
                    : undefined,
                }}
              >
                {renderColumnHeader ? (
                  renderColumnHeader(column, column.items.length)
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {column.icon}
                      <span className="font-semibold text-sm">
                        {column.title}
                      </span>
                      <div
                        style={{
                          ...pillBadgeSmStyle,
                          ...(isOverLimit
                            ? { background: 'color-mix(in srgb, var(--ds-color-error) 15%, transparent)', color: 'var(--ds-color-error)' }
                            : { background: 'var(--ds-surface-panel)', color: 'var(--ds-color-text-secondary)' }),
                        }}
                      >
                        {column.items.length}
                        {column.limit !== undefined && ` / ${column.limit}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Column body -- uses a primary ring + tinted bg when this
                  column is the active drop target so users can see exactly
                  where the item will land. */}
              {!column.collapsed && (
                <div
                  className={`flex-1 rounded-xl p-2 min-h-[100px] transition-colors ${
                    isDropping ? 'ring-2' : ''
                  }`}
                  style={{
                    background: isDropping
                      ? 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)'
                      : 'var(--ds-surface-card)',
                    '--tw-ring-color': isDropping
                      ? 'color-mix(in srgb, var(--ds-color-primary) 30%, transparent)'
                      : undefined,
                  } as React.CSSProperties}
                  onDragOver={(e) =>
                    handleDragOver(e, column.id, column.items.length)
                  }
                  onDrop={(e) => handleDrop(e, column.id, column.items.length)}
                >
                  {column.items.length === 0 && emptyColumn ? (
                    <div className="flex items-center justify-center p-6" style={{ color: 'var(--ds-color-text-secondary)' }}>
                      {emptyColumn}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {/* Each card is both a drag source (draggable) and a
                          drop target (onDragOver/onDrop) to allow reordering
                          within the same column or moving across columns. */}
                      {column.items.map((item, index) => (
                        <div
                          key={itemKey(item)}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, item, column.id)
                          }
                          onDragOver={(e) =>
                            handleDragOver(e, column.id, index)
                          }
                          onDrop={(e) => handleDrop(e, column.id, index)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onItemClick?.(item, column.id)}
                          className={`hover:shadow-md transition-all rounded-lg border ${
                            // Pointer cursor signals clickable cards; grab
                            // cursor signals draggable-only cards.
                            onItemClick ? 'cursor-pointer' : 'cursor-grab'
                          } ${
                            // Dim the source card to 40% opacity while it is
                            // being dragged so the user sees the "picked up" state.
                            dragData?.itemId === itemKey(item)
                              ? 'opacity-40'
                              : 'opacity-100'
                          }`}
                          style={{ background: 'var(--ds-surface-card)', borderColor: 'var(--ds-color-border)', boxShadow: 'var(--ds-elevation-1)', borderRadius: 'var(--ds-radius-lg)' }}
                        >
                          <div style={{ padding: 12 }}>
                            {renderCard(item, column.id)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {onAddItem && (
                    <button
                      style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: '1px dashed var(--ds-color-border)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', marginTop: 8 }}
                      onClick={() => onAddItem(column.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      {addItemLabel}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
