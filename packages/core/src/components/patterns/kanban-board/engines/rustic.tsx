'use client';

/**
 * KanbanBoard - Rustic Engine (Inline styles with CSS variables)
 */

import React, { useCallback, useState } from 'react';
import type { KanbanBoardProps } from '../KanbanBoard.types';

const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

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

  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: string, position: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTarget({ columnId, position });
    },
    []
  );

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
          const isOverLimit =
            column.limit !== undefined && column.items.length >= column.limit;
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

              {/* Column body */}
              {!column.collapsed && (
                <div
                  style={{
                    flex: 1,
                    borderRadius: 'var(--ds-radius-sm, 4px)',
                    padding: 8,
                    minHeight: 100,
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
                            opacity: isDragging ? 0.6 : 1,
                            transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'translateY(0)',
                            transition: `opacity ${RUSTIC_DURATION} ${RUSTIC_EASING}, transform ${RUSTIC_DURATION} ${RUSTIC_EASING}, box-shadow ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
                          }}
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
