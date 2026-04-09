'use client';

/**
 * @fileoverview Rustic (Vanilla / CSS variables) engine for the KanbanBoard pattern.
 * Uses zero third-party UI libraries -- all styling is expressed through inline
 * styles referencing `--ds-*` design-token CSS variables. This makes the engine
 * fully themeable without any build-time CSS framework dependency. Animations
 * use the tenant's personality tokens for easing and duration.
 *
 * @example
 * <KanbanBoard
 *   engine="rustic"
 *   columns={[{ id: 'in-progress', title: 'In Progress', items: tickets, limit: 5 }]}
 *   renderCard={(ticket) => <span>{ticket.summary}</span>}
 *   itemKey={(ticket) => ticket.id}
 *   onItemMove={(id, from, to, pos) => moveTicket(id, from, to, pos)}
 * />
 */

import React, { useCallback, useState } from 'react';
import type { KanbanBoardProps } from '../KanbanBoard.types';

// Easing and duration pulled from design-system personality tokens so each
// tenant's animation feel is preserved. The fallback values match a smooth
// deceleration curve and a 300ms entrance, suitable for most brands.
const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

/**
 * Rustic Kanban board using only inline styles and `--ds-*` CSS variables.
 * Generic over `T` so any item shape can be used with a string key extractor.
 *
 * @param props - See {@link KanbanBoardProps} for full prop documentation.
 * @returns A themeable, framework-free kanban board.
 */
export default function RusticKanbanBoard<T>(props: KanbanBoardProps<T>) {
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

  // Drag data mirrors what is stored in dataTransfer because the browser's
  // DnD API does not expose dataTransfer contents during dragOver. We also
  // track the drop target so we can swap the column border to a dashed
  // primary indicator when the user hovers a potential destination.
  const [dragData, setDragData] = useState<{
    itemId: string;
    fromColumn: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    columnId: string;
    position: number;
  } | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, item: T, columnId: string) => {
      const id = itemKey(item);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      setDragData({ itemId: id, fromColumn: columnId });
    },
    [itemKey]
  );

  // preventDefault is required on dragOver to mark the element as a valid
  // drop target; the browser defaults to "no-drop" otherwise.
  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: string, position: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTarget({ columnId, position });
    },
    []
  );

  // Actual reordering logic is delegated to the parent via onItemMove
  // so this component stays controlled and stateless regarding item data.
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

  // Always reset on drag end regardless of drop validity to avoid
  // stale visual states (ghost opacity, rotated cards).
  const handleDragEnd = useCallback(() => {
    setDragData(null);
    setDropTarget(null);
  }, []);

  if (loading) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
          color: 'var(--ds-color-text-muted)',
          fontSize: 14,
          ...style,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {toolbar && (
        <div style={{ marginBottom: 16 }}>{toolbar}</div>
      )}
      <div
        style={{
          display: 'flex',
          gap: columnGap,
          overflowX: 'auto',
          paddingBottom: 8,
        }}
      >
        {columns.map((column) => {
          // WIP limit badge turns error red when at or over capacity,
          // following the traffic-light metaphor users expect in kanban tools.
          const isOverLimit =
            column.limit !== undefined && column.items.length >= column.limit;
          // Active drop target gets a dashed primary border to differentiate
          // it from passive columns during a drag operation.
          const isDropping = dropTarget?.columnId === column.id;

          return (
            <div
              key={column.id}
              style={{
                minWidth: column.collapsed ? 48 : columnMinWidth,
                flex: column.collapsed ? '0 0 48px' : '1 1 0',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: '10px 14px',
                  marginBottom: 8,
                  borderRadius: 'var(--ds-radius-sm, 4px)',
                  background: 'var(--ds-color-bg-secondary, var(--ds-color-neutral-50))',
                  borderTop: column.color
                    ? `3px solid ${column.color}`
                    : '3px solid var(--ds-color-border-secondary, var(--ds-color-border-primary))',
                  borderBottom: '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
                }}
              >
                {renderColumnHeader ? (
                  renderColumnHeader(column, column.items.length)
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {column.icon}
                      <span
                        style={{
                          fontWeight: 'var(--ds-typography-heading-font-weight, 600)' as unknown as number,
                          fontSize: 13,
                          letterSpacing: 'var(--ds-typography-heading-letter-spacing, 0.01em)',
                          color: 'var(--ds-color-text-primary, var(--ds-color-text))',
                        }}
                      >
                        {column.title}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 22,
                          height: 22,
                          borderRadius: 11,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '0 6px',
                          background: isOverLimit
                            ? 'var(--ds-color-error, var(--ds-color-danger))'
                            : 'var(--ds-color-border-secondary, var(--ds-color-border-primary))',
                          color: isOverLimit
                            ? 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))'
                            : 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))',
                        }}
                      >
                        {column.items.length}
                        {column.limit !== undefined && ` / ${column.limit}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Column body -- border and background animate between idle
                  and drop-target states using the tenant's personality tokens
                  so the transition feels consistent with the brand. */}
              {!column.collapsed && (
                <div
                  style={{
                    flex: 1,
                    borderRadius: 'var(--ds-radius-sm, 4px)',
                    padding: 8,
                    minHeight: 100,
                    // Swap to primary-tinted background + dashed border when
                    // this column is the active drop target.
                    background: isDropping
                      ? 'var(--ds-color-primary-50, var(--ds-color-bg-muted))'
                      : 'var(--ds-color-bg-primary, var(--ds-color-background))',
                    border: isDropping
                      ? '2px dashed var(--ds-color-primary)'
                      : '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
                    transition: `background ${RUSTIC_DURATION} ${RUSTIC_EASING}, border ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
                  }}
                  onDragOver={(e) =>
                    handleDragOver(e, column.id, column.items.length)
                  }
                  onDrop={(e) => handleDrop(e, column.id, column.items.length)}
                >
                  {column.items.length === 0 && emptyColumn ? (
                    <div
                      style={{
                        padding: 24,
                        textAlign: 'center',
                        color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))',
                      }}
                    >
                      {emptyColumn}
                    </div>
                  ) : (
                    // Each card is simultaneously a drag source and a drop
                    // target, enabling both cross-column moves and intra-column
                    // reordering via the same DnD event pipeline.
                    column.items.map((item, index) => {
                      const isDragging = dragData?.itemId === itemKey(item);
                      return (
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
                          style={{
                            marginBottom: 8,
                            padding: 12,
                            borderRadius: 'var(--ds-radius-sm, 4px)',
                            background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
                            border: '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
                            boxShadow: 'var(--ds-card-shadow, var(--ds-shadow-sm))',
                            cursor: isDragging ? 'grabbing' : onItemClick ? 'pointer' : 'grab',
                            // Slight rotation + scale on drag gives a physical
                            // "picked up" feel, reinforcing the direct-manipulation
                            // metaphor without needing a drag preview image.
                            opacity: isDragging ? 0.6 : 1,
                            transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'translateY(0)',
                            transition: `opacity ${RUSTIC_DURATION} ${RUSTIC_EASING}, transform ${RUSTIC_DURATION} ${RUSTIC_EASING}, box-shadow ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
                          }}
                          // Direct DOM manipulation for hover because CSS :hover
                          // cannot reference CSS variables conditionally on drag
                          // state, and we need to suppress the lift when dragging.
                          onMouseEnter={(e) => {
                            if (!isDragging) {
                              const el = e.currentTarget as HTMLDivElement;
                              el.style.boxShadow = 'var(--ds-card-shadow-hover, var(--ds-shadow-md))';
                              el.style.transform = 'var(--ds-card-hover-transform, translateY(-2px))';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isDragging) {
                              const el = e.currentTarget as HTMLDivElement;
                              el.style.boxShadow = 'var(--ds-card-shadow, none)';
                              el.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          {renderCard(item, column.id)}
                        </div>
                      );
                    })
                  )}

                  {/* Add-item button uses a dashed border to visually
                      differentiate it from cards. Hover state transitions to
                      primary color so it feels interactive but stays
                      unobtrusive at rest. */}
                  {onAddItem && (
                    <button
                      onClick={() => onAddItem(column.id)}
                      style={{
                        width: '100%',
                        marginTop: 4,
                        padding: '8px 0',
                        border:
                          '1px dashed var(--ds-color-border-secondary, var(--ds-color-border-primary))',
                        borderRadius: 'var(--ds-radius-sm, 4px)',
                        background: 'transparent',
                        color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))',
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.borderColor = 'var(--ds-color-primary)';
                        el.style.color = 'var(--ds-color-primary)';
                        el.style.background = 'var(--ds-color-primary-50, var(--ds-color-bg-muted))';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.borderColor = 'var(--ds-color-border-secondary, var(--ds-color-border-primary))';
                        el.style.color = 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))';
                        el.style.background = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
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
