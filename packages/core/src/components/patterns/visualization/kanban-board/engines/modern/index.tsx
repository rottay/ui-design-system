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
 * KEYBOARD MOVE (a11y): cards are real tab stops (`role="listitem"` inside
 * `role="list"`, `aria-roledescription` "Movable card"). Arrow keys move the
 * focused card — Up/Down reorders inside the column, Left/Right moves it to
 * the adjacent column (inline arrows mirror under RTL via the house
 * `isRtlContext` idiom) — through the same controlled `onItemMove` contract
 * as drag-and-drop; Enter/Space fires `onItemClick`. Every move (and every
 * blocked edge) is announced through a visually-hidden `aria-live="polite"`
 * region (`data-part="move-announcer"`); focus follows the card to its new
 * position once the parent re-renders. Column positions/headers speak, so
 * the interaction never depends on seeing the drag ghost.
 *
 * DROP GEOMETRY: beyond the column ring, the exact insertion point reads by
 * SHAPE — a primary insertion bar on the card the item would land before
 * (`data-drop-before`), or inside the column body's block-end edge when the
 * drop appends (`data-drop-at-end`).
 *
 * SCROLL AFFORDANCE: the board reports its overflow posture
 * (`data-scrollable-start` / `data-scrollable-end`, kept current by a
 * ResizeObserver + scroll listener) and the skin fades the clipped edges —
 * an intentional horizontal-scroll cue instead of silently cut columns.
 *
 * LOADING: the loading state is a SKELETON BOARD with the real footprint
 * (ghost columns, headers and cards pulsing on the canonical
 * `ds-foundation-pulse` cadence); the composed Spinner stays mounted
 * visually-hidden as the polite status announcer (its `rottay-spinner--
 * modern` class is a public test pin).
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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { KanbanBoardProps } from '../../contracts';
import ModernSpinner from '../../../../../primitives/feedback/spinner/engines/modern';
import ModernButton from '../../../../../primitives/inputs/button/engines/modern';
import ModernBadge from '../../../../../primitives/display/badge/engines/modern';
import ModernEmpty from '../../../../../primitives/display/empty/engines/modern';
import { ActionAddIcon } from '@/graphics/icons/semantic/generated/roles/action-add';
import { NavigationUpIcon } from '@/graphics/icons/semantic/generated/roles/navigation-up';
import { NavigationDownIcon } from '@/graphics/icons/semantic/generated/roles/navigation-down';
import { NavigationBackIcon } from '@/graphics/icons/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/semantic/generated/roles/navigation-forward';
import { useMediaQuery } from '@/infrastructure/runtime/responsive';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { useFlipLayout } from '@/graphics/motion/react/runtime';
import { interpolateTranslation } from '@/foundation/i18n/runtime/resolution/translation';

const ROOT_CLASS_NAME = 'ds-pattern-kanban-board ds-engine-modern';

/** A single card move expressed on the logical axes, so the pointer and the
    keyboard entrypoints share one protocol. */
type KanbanMoveIntent = 'prev-item' | 'next-item' | 'prev-column' | 'next-column';

/** Coarse pointers get no HTML5 drag events and no arrow keys, so the move
    protocol needs visible controls there (fine pointers keep drag + keys). */
const TOUCH_POINTER_QUERY = '(hover: none) and (pointer: coarse)';

/** Normalizes a consumer number|string layout value to a CSS length. */
function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/** Reading-direction probe (Tree primitive idiom): the nearest explicit
    `dir` wins; otherwise the document direction applies. */
function isRtlContext(el: HTMLElement): boolean {
  const scoped = el.closest('[dir]');
  if (scoped) return scoped.getAttribute('dir') === 'rtl';
  return document.documentElement.dir === 'rtl';
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
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? interpolateTranslation(floor, params);

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
  const emptyColumnLabel = tOr('kanbanBoard.empty_column', 'No items');
  const cardRoleLabel = tOr('kanbanBoard.card_role', 'Movable card');

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

  /* Keyboard-move announcements: the polite live region renders the last
     instruction result; `pendingFocusId` asks the post-render effect to
     return focus to the card that just re-parented. */
  const [announcement, setAnnouncement] = useState('');
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  /* Horizontal-scroll posture for the skin's edge-fade affordance. */
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [scrollEdges, setScrollEdges] = useState({ start: false, end: false });

  /* Touch move rail: HTML5 drag never fires on a coarse pointer and the arrow
     protocol needs a keyboard, so without these the board is read-only there. */
  const isCoarsePointer = useMediaQuery(TOUCH_POINTER_QUERY);
  const [boardIsRtl, setBoardIsRtl] = useState(false);

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
      e.stopPropagation();
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

  /* Keyboard move protocol (see the module docblock). Reuses the controlled
     onItemMove contract — the parent stays the source of truth — and the
     FLIP measure, so a keyboard move animates exactly like a drag move. */
  const applyMove = useCallback(
    (intent: KanbanMoveIntent, item: T, columnIndex: number, index: number) => {
      const column = columns[columnIndex];
      const id = itemKey(item);
      const crossesColumn = intent === 'prev-column' || intent === 'next-column';
      const toColumnIndex = crossesColumn
        ? columnIndex + (intent === 'prev-column' ? -1 : 1)
        : columnIndex;
      const toPosition = crossesColumn
        ? index
        : index + (intent === 'prev-item' ? -1 : 1);

      const blocked =
        toColumnIndex < 0 ||
        toColumnIndex >= columns.length ||
        (!crossesColumn && (toPosition < 0 || toPosition >= column.items.length)) ||
        (crossesColumn && columns[toColumnIndex].collapsed);
      if (blocked) {
        setAnnouncement(
          tOr('kanbanBoard.move_edge', 'Cannot move further in that direction')
        );
        return;
      }

      const target = columns[toColumnIndex];
      const position = crossesColumn ? target.items.length : toPosition;
      measure(); // same FLIP snapshot as a drag drop
      onItemMove(id, column.id, target.id, position);
      setPendingFocusId(id);
      setAnnouncement(
        crossesColumn
          ? tOr('kanbanBoard.move_column', 'Moved to {column}, position {position}', {
              column: target.title,
              position: position + 1,
            })
          : tOr('kanbanBoard.move_reorder', 'Moved to position {position} in {column}', {
              column: target.title,
              position: position + 1,
            })
      );
    },
    [columns, itemKey, onItemMove, measure, tOr]
  );

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, item: T, columnIndex: number, index: number) => {
      // renderCard is a consumer slot: a key pressed on a control INSIDE the
      // card belongs to that control, never to the move protocol.
      if (e.target !== e.currentTarget) return;

      if ((e.key === 'Enter' || e.key === ' ') && onItemClick) {
        e.preventDefault();
        onItemClick(item, columns[columnIndex].id);
        return;
      }

      const rtl = isRtlContext(e.currentTarget);
      let intent: KanbanMoveIntent;
      if (e.key === 'ArrowUp') intent = 'prev-item';
      else if (e.key === 'ArrowDown') intent = 'next-item';
      else if (e.key === 'ArrowLeft') intent = rtl ? 'next-column' : 'prev-column';
      else if (e.key === 'ArrowRight') intent = rtl ? 'prev-column' : 'next-column';
      else return;
      e.preventDefault();
      applyMove(intent, item, columnIndex, index);
    },
    [columns, onItemClick, applyMove]
  );

  /* Return focus to a keyboard-moved card once the parent's reorder has
     re-rendered the board (the card re-parents, so focus would otherwise
     fall back to the document body). */
  useEffect(() => {
    if (!pendingFocusId) return;
    const el = cardRefs.current.get(pendingFocusId);
    if (el) {
      el.focus();
      setPendingFocusId(null);
    }
  }, [columns, pendingFocusId]);

  /* The rail's inline arrows are glyphs, so their direction has to be read
     from the live tree (the same probe the arrow keys use). */
  useEffect(() => {
    const el = boardRef.current;
    if (el) setBoardIsRtl(isRtlContext(el));
  }, [isCoarsePointer, columns.length]);

  /* Keep the board's scroll-edge posture current: scroll listener for
     position, ResizeObserver for content/container size changes. */
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const update = () => {
      // Math.abs keeps the math honest in RTL (negative scrollLeft engines).
      const left = Math.abs(el.scrollLeft);
      setScrollEdges({
        start: left > 1,
        end: left + el.clientWidth < el.scrollWidth - 1,
      });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [loading, columns.length]);

  /* Touch move rail descriptors: the intent stays logical, only the inline
     glyph mirrors so the arrow points where the card will actually go. */
  const moveControls: ReadonlyArray<{
    intent: KanbanMoveIntent;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      intent: 'prev-item',
      label: tOr('kanbanBoard.move_up', 'Move up'),
      icon: <NavigationUpIcon decorative size={14} />,
    },
    {
      intent: 'next-item',
      label: tOr('kanbanBoard.move_down', 'Move down'),
      icon: <NavigationDownIcon decorative size={14} />,
    },
    {
      intent: 'prev-column',
      label: tOr('kanbanBoard.move_prev_column', 'Move to previous column'),
      icon: boardIsRtl ? (
        <NavigationForwardIcon decorative size={14} />
      ) : (
        <NavigationBackIcon decorative size={14} />
      ),
    },
    {
      intent: 'next-column',
      label: tOr('kanbanBoard.move_next_column', 'Move to next column'),
      icon: boardIsRtl ? (
        <NavigationBackIcon decorative size={14} />
      ) : (
        <NavigationForwardIcon decorative size={14} />
      ),
    },
  ];

  if (loading) {
    /* Skeleton board with the real footprint (ghost columns + cards); the
       composed Spinner stays mounted visually-hidden as the polite status
       announcer (public test pin: the `rottay-spinner--modern` class). */
    return (
      <div
        data-part="root"
        data-loading="true"
        className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
        style={style}
      >
        <div data-part="board" data-skeleton="true" aria-hidden="true">
          {[0, 1, 2].map((column) => (
            <div data-part="skeleton-column" key={column}>
              <div data-part="skeleton-header" />
              {[0, 1, 2].map((card) => (
                <div data-part="skeleton-card" key={card} />
              ))}
            </div>
          ))}
        </div>
        <span data-part="loading-status">
          <ModernSpinner size="lg" data-part="spinner" />
        </span>
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
      <div
        data-part="board"
        data-scrollable-start={scrollEdges.start}
        data-scrollable-end={scrollEdges.end}
        ref={boardRef}
      >
        {columns.map((column, columnIndex) => {
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
                      {/* The skin ellipsises at the column measure; the
                          tooltip is the only recovery for the clipped tail. */}
                      <span data-part="column-title" title={column.title}>
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
                  data-drop-at-end={isDropping && dropTarget?.position === column.items.length}
                  onDragOver={(e) =>
                    handleDragOver(e, column.id, column.items.length)
                  }
                  onDrop={(e) => handleDrop(e, column.id, column.items.length)}
                >
                  {column.items.length === 0 ? (
                    <div data-part="empty-column">
                      {emptyColumn ?? <ModernEmpty description={emptyColumnLabel} />}
                    </div>
                  ) : (
                    <div data-part="card-list" role="list" aria-label={column.title}>
                      {/* Each card is both a drag source (draggable) and a
                          drop target (onDragOver/onDrop) to allow reordering
                          within the same column or moving across columns —
                          and a keyboard move target (see handleCardKeyDown). */}
                      {column.items.map((item, index) => (
                        <div
                          data-part="card"
                          data-dragging={dragData?.itemId === itemKey(item)}
                          data-clickable={Boolean(onItemClick)}
                          data-drop-before={isDropping && dropTarget?.position === index}
                          key={itemKey(item)}
                          ref={(el: HTMLElement | null) => {
                            register(itemKey(item))(el);
                            if (el) cardRefs.current.set(itemKey(item), el);
                            else cardRefs.current.delete(itemKey(item));
                          }}
                          role="listitem"
                          aria-roledescription={cardRoleLabel}
                          tabIndex={0}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, item, column.id)
                          }
                          onDragOver={(e) => {
                            e.stopPropagation();
                            handleDragOver(e, column.id, index);
                          }}
                          onDrop={(e) => handleDrop(e, column.id, index)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onItemClick?.(item, column.id)}
                          onKeyDown={(e) =>
                            handleCardKeyDown(e, item, columnIndex, index)
                          }
                        >
                          <div data-part="card-content">
                            {renderCard(item, column.id)}
                          </div>
                          {/* Coarse-pointer move rail: the same controlled
                              protocol the arrow keys drive, on real Buttons. */}
                          {isCoarsePointer && (
                            <div
                              data-part="card-move"
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 'var(--ds-spacing-1, 4px)',
                                marginBlockStart: 'var(--ds-spacing-1, 4px)',
                              }}
                            >
                              {moveControls.map((control) => (
                                <ModernButton
                                  key={control.intent}
                                  variant="text"
                                  size="sm"
                                  data-part="card-move-button"
                                  data-move-intent={control.intent}
                                  aria-label={control.label}
                                  icon={control.icon}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    applyMove(control.intent, item, columnIndex, index);
                                  }}
                                />
                              ))}
                            </div>
                          )}
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
      {/* Keyboard-move announcer: visually hidden, always mounted so the
          live region exists before the first announcement. */}
      <div data-part="move-announcer" aria-live="polite" role="status">
        {announcement}
      </div>
    </div>
  );
}
