'use client';

/**
 * KanbanBoard - Classic Engine (Ant Design)
 */

import React, { useCallback, useRef, useState } from 'react';
import { Card, Button, Spin, Badge, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { KanbanBoardProps } from '../../types';

const { Text, Title } = Typography;

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
              {/* Column header */}
              <Card
                size="small"
                style={{
                  marginBottom: 8,
                  borderTop: column.color
                    ? `3px solid ${column.color}`
                    : undefined,
                }}
                bodyStyle={{ padding: '8px 12px' }}
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
                          backgroundColor: isOverLimit ? '#ff4d4f' : '#d9d9d9',
                          color: isOverLimit ? '#fff' : '#595959',
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
                    background: '#fafafa',
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
                          cursor: onItemClick ? 'pointer' : 'grab',
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
