'use client';

/**
 * KanbanBoard - Modern Engine (DaisyUI / Tailwind)
 */

import React, { useCallback, useState } from 'react';
import type { KanbanBoardProps } from '../../types';

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
        className={`flex items-center justify-center min-h-[300px] ${className ?? ''}`}
        style={style}
      >
        <span className="loading loading-spinner loading-lg" />
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
          const isOverLimit =
            column.limit !== undefined && column.items.length >= column.limit;
          const isDropping = dropTarget?.columnId === column.id;

          return (
            <div
              key={column.id}
              className={`flex flex-col ${column.collapsed ? 'w-12' : 'flex-1'}`}
              style={{ minWidth: column.collapsed ? 48 : columnMinWidth }}
            >
              {/* Column header */}
              <div
                className="rounded-xl px-4 py-3 mb-2 bg-base-200"
                style={{
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
                        className={`badge badge-sm ${isOverLimit ? 'badge-error' : 'badge-ghost'}`}
                      >
                        {column.items.length}
                        {column.limit !== undefined && ` / ${column.limit}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Column body */}
              {!column.collapsed && (
                <div
                  className={`flex-1 rounded-xl p-2 min-h-[100px] transition-colors ${
                    isDropping
                      ? 'bg-primary/10 ring-2 ring-primary/30'
                      : 'bg-base-100'
                  }`}
                  onDragOver={(e) =>
                    handleDragOver(e, column.id, column.items.length)
                  }
                  onDrop={(e) => handleDrop(e, column.id, column.items.length)}
                >
                  {column.items.length === 0 && emptyColumn ? (
                    <div className="flex items-center justify-center p-6 text-base-content/50">
                      {emptyColumn}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
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
                          className={`card card-compact bg-base-100 shadow-sm hover:shadow-md transition-all rounded-lg border border-base-300 ${
                            onItemClick ? 'cursor-pointer' : 'cursor-grab'
                          } ${
                            dragData?.itemId === itemKey(item)
                              ? 'opacity-40'
                              : 'opacity-100'
                          }`}
                        >
                          <div className="card-body p-3">
                            {renderCard(item, column.id)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {onAddItem && (
                    <button
                      className="btn btn-ghost btn-sm btn-block mt-2 border-dashed border-base-300"
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
