'use client';

/**
 * @fileoverview Sortable List Hook - Rottay Design System
 * @description Generic drag-and-drop sortable list hook using the native HTML5
 * Drag and Drop API. Zero external dependencies.
 *
 * @remarks
 * The `useSortableList` hook provides everything needed to make an ordered list
 * reorderable via drag-and-drop:
 *
 * - **No dependencies** - Built entirely on the HTML5 DnD API
 * - **Visual feedback** - Dragged item is translucent; drop target receives a
 *   border indicator whose orientation matches the list direction
 * - **Immutable reorder** - `onReorder` receives a fresh array; the original is
 *   never mutated
 * - **Keyboard support** - Space to grab/drop, Arrow keys to move, Escape to cancel
 * - **ARIA** - `role="list"`, `role="listitem"`, `aria-grabbed`, `aria-label`
 * - **Direction** - Works for both vertical and horizontal lists
 *
 * @example Basic vertical list
 * ```tsx
 * import { useSortableList } from '@rottay/design-system';
 *
 * function SortableList({ items, onReorder }) {
 *   const { containerProps, getItemProps, isDragging } = useSortableList({
 *     items,
 *     onReorder,
 *     keyExtractor: (item) => item.id,
 *   });
 *
 *   return (
 *     <Box {...containerProps}>
 *       {items.map((item, index) => (
 *         <Box {...getItemProps(item, index)}>
 *           <Text>{item.name}</Text>
 *         </Box>
 *       ))}
 *     </Box>
 *   );
 * }
 * ```
 *
 * @module System/Hooks/DnD
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useRef, type DragEvent, type KeyboardEvent, type CSSProperties } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for the `useSortableList` hook.
 */
export interface UseSortableListOptions<T> {
  /** The ordered array of items to render. */
  items: T[];

  /**
   * Called with a new array whenever the user completes a reorder.
   * The original array is never mutated.
   */
  onReorder: (items: T[]) => void;

  /** Return a stable, unique string key for each item. */
  keyExtractor: (item: T) => string;

  /**
   * Layout direction of the list. Affects arrow-key bindings and the visual
   * drop indicator orientation.
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';

  /**
   * When `true`, dragging is disabled and items cannot be reordered.
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props to spread on the sortable container element.
 */
export interface SortableContainerProps {
  role: 'list';
  'aria-label': string;
}

/**
 * Props to spread on each sortable item element.
 */
export interface SortableItemProps {
  key: string;
  draggable: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  tabIndex: number;
  role: 'listitem';
  'aria-grabbed'?: boolean;
  'aria-roledescription': string;
  style: CSSProperties;
}

/**
 * Return type of the `useSortableList` hook.
 */
export interface UseSortableListReturn<T> {
  /** Props to spread on the container element. */
  containerProps: SortableContainerProps;

  /** Returns props to spread on each item element. */
  getItemProps: (item: T, index: number) => SortableItemProps;

  /** The index of the item currently being dragged, or `null`. */
  draggedIndex: number | null;

  /** The index of the current drop target, or `null`. */
  dragOverIndex: number | null;

  /** Whether a drag operation is in progress. */
  isDragging: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Reorder an array by moving the element at `fromIndex` to `toIndex`.
 * Returns a new array -- the original is not mutated.
 */
function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return list;
  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Generic drag-and-drop sortable list hook using the HTML5 DnD API.
 *
 * Provides `containerProps` and per-item `getItemProps` to turn any list into a
 * reorderable surface. Supports vertical and horizontal layouts, keyboard
 * reordering, and full ARIA semantics.
 *
 * @param options - Hook configuration
 * @returns Container props, item props factory, and drag state
 *
 * @example
 * ```tsx
 * const { containerProps, getItemProps } = useSortableList({
 *   items: tasks,
 *   onReorder: setTasks,
 *   keyExtractor: (t) => t.id,
 *   direction: 'vertical',
 * });
 * ```
 */
export function useSortableList<T>(
  options: UseSortableListOptions<T>
): UseSortableListReturn<T> {
  const {
    items,
    onReorder,
    keyExtractor,
    direction = 'vertical',
    disabled = false,
  } = options;

  // ---- State ----
  // Two parallel state pairs: one for mouse/touch drag (HTML5 DnD API),
  // one for keyboard drag. They are independent because the interaction
  // models differ, but both feed into the same isDragging flag.
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Keyboard grab: Space/Enter to grab, arrows to choose target, then
  // Space/Enter to drop or Escape to cancel.
  const [keyboardGrabbedIndex, setKeyboardGrabbedIndex] = useState<number | null>(null);
  const [keyboardTargetIndex, setKeyboardTargetIndex] = useState<number | null>(null);

  // Refs hold the latest items/onReorder without adding them to callback
  // deps, so handler functions remain stable across renders.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  // Unified dragging flag: true when either mouse or keyboard drag is active.
  const isDragging = draggedIndex !== null || keyboardGrabbedIndex !== null;

  // ---- Drag handlers ----
  // Each handler is a curried function (index) => (event) so that
  // getItemProps can bind the index at call time without creating
  // a new closure on every render for every item.
  const handleDragStart = useCallback(
    (index: number) => (e: DragEvent) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.effectAllowed = 'move';
      // text/plain fallback enables assistive tech that reads drag data.
      e.dataTransfer.setData('text/plain', String(index));
      setDraggedIndex(index);
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (index: number) => (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverIndex(index);
    },
    []
  );

  const handleDrop = useCallback(
    (index: number) => (e: DragEvent) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== index) {
        const newItems = reorder(itemsRef.current, draggedIndex, index);
        onReorderRef.current(newItems);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback(
    (_e: DragEvent) => {
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    []
  );

  // ---- Keyboard handlers ----
  // Keyboard reorder follows a two-phase interaction: first grab (Space/Enter),
  // then move with arrows and drop (Space/Enter) or cancel (Escape).
  // This matches common screen-reader drag-and-drop patterns.
  const handleKeyDown = useCallback(
    (index: number) => (e: KeyboardEvent) => {
      if (disabled) return;

      // Map arrow keys based on list direction so the same handler
      // works for both vertical and horizontal layouts.
      const prevKey = direction === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = direction === 'vertical' ? 'ArrowDown' : 'ArrowRight';

      // Phase 1: nothing grabbed yet -- Space/Enter initiates the grab.
      if (keyboardGrabbedIndex === null) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setKeyboardGrabbedIndex(index);
          setKeyboardTargetIndex(index);
        }
        return;
      }

      // Phase 2: item is grabbed -- handle movement, drop, or cancel.
      switch (e.key) {
        case prevKey: {
          e.preventDefault();
          setKeyboardTargetIndex((prev) => {
            if (prev === null) return null;
            return Math.max(0, prev - 1);
          });
          break;
        }
        case nextKey: {
          e.preventDefault();
          setKeyboardTargetIndex((prev) => {
            if (prev === null) return null;
            return Math.min(itemsRef.current.length - 1, prev + 1);
          });
          break;
        }
        case ' ':
        case 'Enter': {
          e.preventDefault();
          // Drop at current target
          if (keyboardGrabbedIndex !== null && keyboardTargetIndex !== null && keyboardGrabbedIndex !== keyboardTargetIndex) {
            const newItems = reorder(itemsRef.current, keyboardGrabbedIndex, keyboardTargetIndex);
            onReorderRef.current(newItems);
          }
          setKeyboardGrabbedIndex(null);
          setKeyboardTargetIndex(null);
          break;
        }
        case 'Escape': {
          e.preventDefault();
          // Cancel without reordering
          setKeyboardGrabbedIndex(null);
          setKeyboardTargetIndex(null);
          break;
        }
      }
    },
    [disabled, direction, keyboardGrabbedIndex, keyboardTargetIndex]
  );

  // ---- Container props ----
  const containerProps: SortableContainerProps = {
    role: 'list',
    'aria-label': 'Sortable list',
  };

  // ---- Item props factory ----
  // getItemProps computes all drag-related props for a single item,
  // including visual feedback styles and ARIA attributes. It is memoized
  // on the full set of drag state values so items only re-render when
  // drag state actually changes.
  const getItemProps = useCallback(
    (item: T, index: number): SortableItemProps => {
      const key = keyExtractor(item);
      const isBeingDragged = draggedIndex === index;
      const isDragTarget = dragOverIndex === index && draggedIndex !== index;
      const isKeyboardGrabbed = keyboardGrabbedIndex === index;
      const isKeyboardTarget = keyboardTargetIndex === index && keyboardGrabbedIndex !== null && keyboardGrabbedIndex !== index;

      // Visual feedback: dragged items become translucent, drop targets
      // get a directional border indicator using the DS primary color.
      const style: CSSProperties = {
        cursor: disabled ? 'default' : 'grab',
      };

      if (isBeingDragged) {
        style.opacity = 0.5;
      }

      if (isKeyboardGrabbed) {
        style.opacity = 0.5;
      }

      // Drop indicator border direction matches the list layout so
      // users see a visual "insert here" line in the correct axis.
      if (isDragTarget || isKeyboardTarget) {
        if (direction === 'vertical') {
          style.borderTop = '2px solid var(--ds-color-primary, #1677ff)';
        } else {
          style.borderLeft = '2px solid var(--ds-color-primary, #1677ff)';
        }
        style.transition = 'border 150ms ease';
      }

      return {
        key,
        draggable: !disabled,
        onDragStart: handleDragStart(index),
        onDragOver: handleDragOver(index),
        onDragEnd: handleDragEnd,
        onDrop: handleDrop(index),
        onKeyDown: handleKeyDown(index),
        tabIndex: 0,
        role: 'listitem' as const,
        'aria-grabbed': isBeingDragged || isKeyboardGrabbed || undefined,
        'aria-roledescription': 'sortable item',
        style,
      };
    },
    [
      keyExtractor,
      draggedIndex,
      dragOverIndex,
      keyboardGrabbedIndex,
      keyboardTargetIndex,
      direction,
      disabled,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
      handleDrop,
      handleKeyDown,
    ]
  );

  return {
    containerProps,
    getItemProps,
    draggedIndex,
    dragOverIndex,
    isDragging,
  };
}
