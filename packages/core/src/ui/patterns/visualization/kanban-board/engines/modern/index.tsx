'use client';

/**
 * @fileoverview Modern (token-driven) engine for the KanbanBoard pattern.
 * Renders a horizontally-scrollable drag-and-drop board whose controls are
 * COMPOSED DS primitives — Button (add item), Badge (WIP count with
 * neutral/danger tone by limit state), Spinner (loading) and Empty (empty
 * board) — never recreations. Drop-target columns highlight with a
 * primary-tinted ring (shape, never a permanent dashed border and never a
 * vertical accent); the column-header state accent is consumer config DATA
 * riding the `--ds-kanban-column-accent` channel (a horizontal strip under
 * the header surface -- side rails are forbidden).
 *
 * Card moves use FLIP layout motion (useFlipLayout): a card re-parenting
 * across columns gets a coordinated transition instead of teleporting.
 * Geometry and paint live in the modern pattern-kanban-board skin; layout
 * numbers from the consumer (columnGap / columnMinWidth) ride quoted
 * custom-property channels. Own copy resolves through the optional
 * `components` i18n channel with an English floor.
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
import type { KanbanBoardProps } from '../../contracts';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernBadge from '../../../../../primitives/display/Badge/engines/modern';
import ModernEmpty from '../../../../../primitives/display/Empty/engines/modern';
import { ActionAddIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-add';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { useFlipLayout } from '@/graphics/motion/react/runtime';

const ROOT_CLASS_NAME = 'ds-pattern-kanban-board ds-engine-modern';

/** Normalizes a consumer number|string layout value to a CSS length. */
function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Modern Kanban board composed on DS primitives (see the module docblock).
 * Generic over `T` so any item shape can be used with a string key extractor.
 *
 * @param props - See {@link KanbanBoardProps} for full prop documentation.
 * @returns A flex-based board with DS token-styled columns and cards.
 */
export default function ModernKanbanBoard<T>(props: KanbanBoardProps<T>) {
  // Optional channel with an English floor: the board renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string): string => i18n?.tOr(key, floor) ?? floor;

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
    addItemLabel: addItemLabelProp,
    loading,
    className,
    style,
  } = props;

  const addItemLabel = addItemLabelProp ?? tOr('kanbanBoard.add_item', 'Add item');
  const emptyBoardLabel = tOr('kanbanBoard.empty_board', 'No columns');

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

  // FLIP layout motion for card moves: a card moving to a different column
  // re-parents in the DOM (React unmounts it from the old column's subtree
  // and mounts a new instance in the new one -- no shared fiber to
  // transition), so without this it teleports. measure() below captures the
  // dragged card's rect before onItemMove triggers the parent's reorder;
  // the hook inverts+plays once the new columns prop re-renders it.
  const { register, measure } = useFlipLayout<string>();

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
        measure(); // snapshot every registered card's rect before the parent's reorder
        onItemMove(dragData.itemId, dragData.fromColumn, columnId, position);
      }
      setDragData(null);
      setDropTarget(null);
    },
    [dragData, onItemMove, measure]
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
        data-part="root"
        data-loading="true"
        className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
        style={style}
      >
        <ModernSpinner size="lg" data-part="spinner" />
      </div>
    );
  }

  return (
    <div
      data-part="root"
      data-loading="false"
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      style={{
        /* Consumer layout numbers ride quoted channels; the skin applies
           them (gap between columns, per-column min width). */
        '--ds-kanban-column-gap': toCssLength(columnGap),
        '--ds-kanban-column-min-width': toCssLength(columnMinWidth),
        ...style,
      } as React.CSSProperties}
    >
      {toolbar && <div data-part="toolbar">{toolbar}</div>}
      {columns.length === 0 ? (
        /* Empty board: the composed Empty primitive owns the quiet hint. */
        <div data-part="empty-board">
          <ModernEmpty description={emptyBoardLabel} />
        </div>
      ) : (
      <div data-part="board">
        {columns.map((column) => {
          // WIP limit signals the team's WIP policy through the composed
          // Badge's danger tone (shape + number, never colour alone: the
          // count/limit text carries the state).
          const isOverLimit =
            column.limit !== undefined && column.items.length >= column.limit;
          // Track whether this column is the active drop target so we can
          // show a primary-tinted ring as a drop affordance.
          const isDropping = dropTarget?.columnId === column.id;

          return (
            <div
              data-part="column"
              data-collapsed={Boolean(column.collapsed)}
              data-over-limit={isOverLimit}
              data-dropping={isDropping}
              key={column.id}
            >
              {/* Column header: the state accent is consumer config DATA on a
                  quoted channel (horizontal strip, never a vertical rail). */}
              <div
                data-part="column-header"
                style={
                  column.color
                    ? ({ '--ds-kanban-column-accent': column.color } as React.CSSProperties)
                    : undefined
                }
              >
                {renderColumnHeader ? (
                  renderColumnHeader(column, column.items.length)
                ) : (
                  <div data-part="column-header-content">
                    <div data-part="column-title-row">
                      {column.icon}
                      <span data-part="column-title">
                        {column.title}
                      </span>
                      {/* WIP count: the composed Badge owns chrome; the tone
                          is the limit state (danger at/over capacity). */}
                      <ModernBadge
                        size="sm"
                        tone={isOverLimit ? 'danger' : 'neutral'}
                        data-part="wip-badge"
                        content={
                          column.limit !== undefined
                            ? `${column.items.length} / ${column.limit}`
                            : column.items.length
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Column body -- primary ring + tinted bg when this column is
                  the active drop target (skin-owned), so users can see
                  exactly where the item will land. */}
              {!column.collapsed && (
                <div
                  data-part="column-body"
                  data-dropping={isDropping}
                  data-empty={column.items.length === 0}
                  onDragOver={(e) =>
                    handleDragOver(e, column.id, column.items.length)
                  }
                  onDrop={(e) => handleDrop(e, column.id, column.items.length)}
                >
                  {column.items.length === 0 && emptyColumn ? (
                    <div data-part="empty-column">
                      {emptyColumn}
                    </div>
                  ) : (
                    <div data-part="card-list">
                      {/* Each card is both a drag source (draggable) and a
                          drop target (onDragOver/onDrop) to allow reordering
                          within the same column or moving across columns. */}
                      {column.items.map((item, index) => (
                        <div
                          data-part="card"
                          data-dragging={dragData?.itemId === itemKey(item)}
                          data-clickable={Boolean(onItemClick)}
                          key={itemKey(item)}
                          ref={register(itemKey(item))}
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
                        >
                          <div data-part="card-content">
                            {renderCard(item, column.id)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {onAddItem && (
                    <ModernButton
                      variant="dashed"
                      size="sm"
                      data-part="add-item"
                      icon={<ActionAddIcon decorative size={14} />}
                      onClick={() => onAddItem(column.id)}
                    >
                      {addItemLabel}
                    </ModernButton>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
