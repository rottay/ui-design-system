'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the KanbanBoard pattern.
 * Renders a horizontally-scrollable board of drag-and-drop columns using
 * Ant Design's Card, Badge, and Button primitives. Supports WIP limits,
 * collapsible columns, custom card renderers, and inline add-item actions.
 *
 * @example
 * <KanbanBoard
 *   engine="classic"
 *   columns={[{ id: 'todo', title: 'To Do', items: tasks }]}
 *   renderCard={(task) => <Text>{task.name}</Text>}
 *   itemKey={(task) => task.id}
 *   onItemMove={(id, from, to, pos) => moveTask(id, from, to, pos)}
 * />
 */

import React, { useCallback, useRef, useState } from 'react';
import { Card, Button, Spin, Badge, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { KanbanBoardProps } from '../../contracts';

const { Text, Title } = Typography;

/**
 * Classic Kanban board built on Ant Design components.
 * Generic over `T` so any item shape can be used as long as `itemKey` returns a string.
 *
 * @param props - See {@link KanbanBoardProps} for full prop documentation.
 * @returns A horizontally-scrollable board with drag-and-drop columns.
 */
export default function ClassicKanbanBoard<T>(props: KanbanBoardProps<T>) {
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

  // Drag data is stored in both dataTransfer (for the browser DnD API) and React
  // state (for rendering drop indicators). The duplication is necessary because
  // dataTransfer is only readable inside the drop handler, not during dragOver.
  const [dragData, setDragData] = useState<{
    itemId: string;
    fromColumn: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    columnId: string;
    position: number;
  } | null>(null);

  // Set dataTransfer as plain text for cross-browser compatibility, and
  // mirror it in React state so dragOver handlers can read source info.
  const handleDragStart = useCallback(
    (e: React.DragEvent, item: T, columnId: string) => {
      const id = itemKey(item);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      setDragData({ itemId: id, fromColumn: columnId });
    },
    [itemKey]
  );

  // preventDefault is required on dragOver; without it, the browser reverts to
  // its default "no-drop" behavior and will never fire the drop event.
  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: string, position: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTarget({ columnId, position });
    },
    []
  );

  // On drop, delegate the actual reorder/move logic to the consumer via
  // onItemMove so the board stays controlled (data lives in the parent).
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

  // Reset drag state on end regardless of whether a valid drop occurred,
  // ensuring ghost opacity / indicators are always cleaned up.
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
          ...style,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {toolbar && <div style={{ marginBottom: 16 }}>{toolbar}</div>}
      <div
        style={{
          display: 'flex',
          gap: columnGap,
          overflowX: 'auto',
          paddingBottom: 8,
        }}
      >
        {columns.map((column) => {
          // WIP limits: when the column is at or over capacity, the badge
          // turns red to signal that further additions should be reconsidered.
          const isOverLimit =
            column.limit !== undefined && column.items.length >= column.limit;

          return (
            <div
              key={column.id}
              style={{
                minWidth: columnMinWidth,
                flex: column.collapsed ? '0 0 48px' : '1 1 0',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Column header -- uses a colored top border as a quick visual
                  lane identifier (e.g. red for "Blocked", green for "Done"). */}
              <Card
                size="small"
                style={{
                  marginBottom: 8,
                  borderTop: column.color
                    ? `3px solid ${column.color}`
                    : undefined,
                }}
                styles={{ body: { padding: '8px 12px' } }}
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
                      <Text strong>{column.title}</Text>
                      <Badge
                        count={column.items.length}
                        style={{
                          backgroundColor: isOverLimit ? 'var(--ds-color-error)' : 'var(--ds-color-border-secondary)',
                          color: isOverLimit ? 'var(--ds-color-text-on-primary)' : 'var(--ds-color-text-secondary)',
                        }}
                        overflowCount={999}
                      />
                      {column.limit !== undefined && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          / {column.limit}
                        </Text>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Column body */}
              {!column.collapsed && (
                <div
                  style={{
                    flex: 1,
                    background: 'var(--ds-color-bg-secondary)',
                    borderRadius: 6,
                    padding: 8,
                    minHeight: 100,
                  }}
                  onDragOver={(e) =>
                    handleDragOver(e, column.id, column.items.length)
                  }
                  onDrop={(e) => handleDrop(e, column.id, column.items.length)}
                >
                  {column.items.length === 0 && emptyColumn ? (
                    <div style={{ padding: 16, textAlign: 'center' }}>
                      {emptyColumn}
                    </div>
                  ) : (
                    // Each card acts as both a drag source and a drop target so
                    // users can reorder within a column or move between columns.
                    column.items.map((item, index) => (
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
                          // Show pointer when clickable, grab cursor otherwise
                          // to hint at drag capability.
                          cursor: onItemClick ? 'pointer' : 'grab',
                          // Dim the source card during drag to make the
                          // "picked up" state visually obvious.
                          opacity:
                            dragData?.itemId === itemKey(item) ? 0.4 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <Card size="small" hoverable>
                          {renderCard(item, column.id)}
                        </Card>
                      </div>
                    ))
                  )}

                  {onAddItem && (
                    <Button
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => onAddItem(column.id)}
                      style={{ marginTop: 4 }}
                    >
                      {addItemLabel}
                    </Button>
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
