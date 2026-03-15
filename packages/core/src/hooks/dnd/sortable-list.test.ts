/**
 * useSortableList Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSortableList } from './index';

// ============================================================================
// Helpers
// ============================================================================

interface TestItem {
  id: string;
  name: string;
}

function makeItems(count: number): TestItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }));
}

const keyExtractor = (item: TestItem) => item.id;

/**
 * Create a minimal synthetic DragEvent with the fields our hook uses.
 */
function makeDragEvent(overrides: Partial<DragEvent> = {}): DragEvent {
  return {
    preventDefault: vi.fn(),
    dataTransfer: {
      effectAllowed: 'uninitialized',
      dropEffect: 'none',
      setData: vi.fn(),
    },
    ...overrides,
  } as unknown as DragEvent;
}

/**
 * Create a minimal synthetic KeyboardEvent.
 */
function makeKeyboardEvent(key: string, overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as KeyboardEvent;
}

// ============================================================================
// Tests
// ============================================================================

describe('useSortableList', () => {
  const items = makeItems(4);
  let onReorder: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onReorder = vi.fn();
  });

  // --------------------------------------------------------------------------
  // Initial State
  // --------------------------------------------------------------------------

  describe('Initial State', () => {
    it('starts with no active drag', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      expect(result.current.draggedIndex).toBeNull();
      expect(result.current.dragOverIndex).toBeNull();
      expect(result.current.isDragging).toBe(false);
    });

    it('provides container props with correct ARIA', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      expect(result.current.containerProps.role).toBe('list');
      expect(result.current.containerProps['aria-label']).toBe('Sortable list');
    });
  });

  // --------------------------------------------------------------------------
  // Item Props
  // --------------------------------------------------------------------------

  describe('getItemProps', () => {
    it('returns correct key from keyExtractor', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      const props = result.current.getItemProps(items[1], 1);
      expect(props.key).toBe('item-1');
    });

    it('sets draggable to true when not disabled', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      const props = result.current.getItemProps(items[0], 0);
      expect(props.draggable).toBe(true);
    });

    it('sets draggable to false when disabled', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor, disabled: true })
      );

      const props = result.current.getItemProps(items[0], 0);
      expect(props.draggable).toBe(false);
    });

    it('sets role to listitem', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      const props = result.current.getItemProps(items[0], 0);
      expect(props.role).toBe('listitem');
    });

    it('sets cursor to grab when enabled', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      const props = result.current.getItemProps(items[0], 0);
      expect(props.style.cursor).toBe('grab');
    });

    it('sets cursor to default when disabled', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor, disabled: true })
      );

      const props = result.current.getItemProps(items[0], 0);
      expect(props.style.cursor).toBe('default');
    });

    it('has aria-roledescription for accessibility', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      const props = result.current.getItemProps(items[0], 0);
      expect(props['aria-roledescription']).toBe('sortable item');
    });
  });

  // --------------------------------------------------------------------------
  // Drag and Drop Reorder
  // --------------------------------------------------------------------------

  describe('Drag and Drop Reorder', () => {
    it('sets draggedIndex on drag start', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      act(() => {
        const props = result.current.getItemProps(items[1], 1);
        props.onDragStart(makeDragEvent());
      });

      expect(result.current.draggedIndex).toBe(1);
      expect(result.current.isDragging).toBe(true);
    });

    it('applies opacity to dragged item', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      // Start dragging item 1
      act(() => {
        result.current.getItemProps(items[1], 1).onDragStart(makeDragEvent());
      });

      // Re-get props for the dragged item
      const draggedProps = result.current.getItemProps(items[1], 1);
      expect(draggedProps.style.opacity).toBe(0.5);
      expect(draggedProps['aria-grabbed']).toBe(true);
    });

    it('sets dragOverIndex on drag over', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      act(() => {
        result.current.getItemProps(items[0], 0).onDragStart(makeDragEvent());
      });

      act(() => {
        result.current.getItemProps(items[2], 2).onDragOver(makeDragEvent());
      });

      expect(result.current.dragOverIndex).toBe(2);
    });

    it('applies border indicator on drop target (vertical)', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor, direction: 'vertical' })
      );

      // Start dragging item 0
      act(() => {
        result.current.getItemProps(items[0], 0).onDragStart(makeDragEvent());
      });

      // Drag over item 2
      act(() => {
        result.current.getItemProps(items[2], 2).onDragOver(makeDragEvent());
      });

      const targetProps = result.current.getItemProps(items[2], 2);
      expect(targetProps.style.borderTop).toContain('2px solid');
    });

    it('applies border indicator on drop target (horizontal)', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor, direction: 'horizontal' })
      );

      act(() => {
        result.current.getItemProps(items[0], 0).onDragStart(makeDragEvent());
      });

      act(() => {
        result.current.getItemProps(items[2], 2).onDragOver(makeDragEvent());
      });

      const targetProps = result.current.getItemProps(items[2], 2);
      expect(targetProps.style.borderLeft).toContain('2px solid');
    });

    it('calls onReorder with reordered array on drop', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      // Drag item 0 and drop on item 2
      act(() => {
        result.current.getItemProps(items[0], 0).onDragStart(makeDragEvent());
      });

      act(() => {
        result.current.getItemProps(items[2], 2).onDrop(makeDragEvent());
      });

      expect(onReorder).toHaveBeenCalledTimes(1);
      const reordered = onReorder.mock.calls[0][0] as TestItem[];
      expect(reordered.map((i) => i.id)).toEqual([
        'item-1',
        'item-2',
        'item-0',
        'item-3',
      ]);
    });

    it('does not mutate the original array', () => {
      const original = [...items];
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      act(() => {
        result.current.getItemProps(items[0], 0).onDragStart(makeDragEvent());
      });

      act(() => {
        result.current.getItemProps(items[2], 2).onDrop(makeDragEvent());
      });

      // Original array should be unchanged
      expect(items).toEqual(original);
    });

    it('does not call onReorder when dropping on same index', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      act(() => {
        result.current.getItemProps(items[1], 1).onDragStart(makeDragEvent());
      });

      act(() => {
        result.current.getItemProps(items[1], 1).onDrop(makeDragEvent());
      });

      expect(onReorder).not.toHaveBeenCalled();
    });

    it('resets drag state on drag end', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      act(() => {
        result.current.getItemProps(items[0], 0).onDragStart(makeDragEvent());
      });

      expect(result.current.isDragging).toBe(true);

      act(() => {
        result.current.getItemProps(items[0], 0).onDragEnd(makeDragEvent());
      });

      expect(result.current.draggedIndex).toBeNull();
      expect(result.current.dragOverIndex).toBeNull();
      expect(result.current.isDragging).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Disabled State
  // --------------------------------------------------------------------------

  describe('Disabled', () => {
    it('prevents drag start when disabled', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor, disabled: true })
      );

      const e = makeDragEvent();
      act(() => {
        result.current.getItemProps(items[0], 0).onDragStart(e);
      });

      expect(e.preventDefault).toHaveBeenCalled();
      expect(result.current.draggedIndex).toBeNull();
    });

    it('ignores keyboard grab when disabled', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor, disabled: true })
      );

      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      expect(result.current.isDragging).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Keyboard Support
  // --------------------------------------------------------------------------

  describe('Keyboard Support', () => {
    it('grabs an item with Space key', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      act(() => {
        result.current.getItemProps(items[1], 1).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      expect(result.current.isDragging).toBe(true);
    });

    it('grabs an item with Enter key', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent('Enter')
        );
      });

      expect(result.current.isDragging).toBe(true);
    });

    it('moves item down with ArrowDown in vertical mode', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor, direction: 'vertical' })
      );

      // Grab item 0
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      // Move down
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent('ArrowDown')
        );
      });

      // Drop with Space
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      expect(onReorder).toHaveBeenCalledTimes(1);
      const reordered = onReorder.mock.calls[0][0] as TestItem[];
      expect(reordered[0].id).toBe('item-1');
      expect(reordered[1].id).toBe('item-0');
    });

    it('moves item right with ArrowRight in horizontal mode', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor, direction: 'horizontal' })
      );

      // Grab item 0
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      // Move right
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent('ArrowRight')
        );
      });

      // Drop
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      expect(onReorder).toHaveBeenCalledTimes(1);
      const reordered = onReorder.mock.calls[0][0] as TestItem[];
      expect(reordered[0].id).toBe('item-1');
      expect(reordered[1].id).toBe('item-0');
    });

    it('does not move past the start of the list', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      // Grab item 0
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      // Try to move up (should stay at 0)
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent('ArrowUp')
        );
      });

      // Drop - should be same position, so no reorder
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      expect(onReorder).not.toHaveBeenCalled();
    });

    it('does not move past the end of the list', () => {
      const lastIndex = items.length - 1;
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      // Grab last item
      act(() => {
        result.current.getItemProps(items[lastIndex], lastIndex).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      // Try to move down (should stay at last)
      act(() => {
        result.current.getItemProps(items[lastIndex], lastIndex).onKeyDown(
          makeKeyboardEvent('ArrowDown')
        );
      });

      // Drop - same position, so no reorder
      act(() => {
        result.current.getItemProps(items[lastIndex], lastIndex).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      expect(onReorder).not.toHaveBeenCalled();
    });

    it('cancels drag with Escape', () => {
      const { result } = renderHook(() =>
        useSortableList({ items, onReorder, keyExtractor })
      );

      // Grab item 0
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent(' ')
        );
      });

      expect(result.current.isDragging).toBe(true);

      // Move down
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent('ArrowDown')
        );
      });

      // Cancel
      act(() => {
        result.current.getItemProps(items[0], 0).onKeyDown(
          makeKeyboardEvent('Escape')
        );
      });

      expect(result.current.isDragging).toBe(false);
      expect(onReorder).not.toHaveBeenCalled();
    });
  });
});
