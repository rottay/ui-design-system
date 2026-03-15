/**
 * useUndoRedo Hook Tests
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from './undo-redo';

describe('useUndoRedo', () => {
  describe('Initial State', () => {
    it('starts with the provided initial state', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'hello' })
      );

      expect(result.current.state).toBe('hello');
      expect(result.current.history).toEqual(['hello']);
      expect(result.current.historyIndex).toBe(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('works with object initial state', () => {
      const initial = { name: 'test', count: 0 };
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: initial })
      );

      expect(result.current.state).toEqual({ name: 'test', count: 0 });
    });

    it('works with null initial state', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: null })
      );

      expect(result.current.state).toBeNull();
    });
  });

  describe('setState', () => {
    it('updates state and pushes to history', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'a' })
      );

      act(() => {
        result.current.setState('b');
      });

      expect(result.current.state).toBe('b');
      expect(result.current.history).toEqual(['a', 'b']);
      expect(result.current.historyIndex).toBe(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('accepts an updater function', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 10 })
      );

      act(() => {
        result.current.setState((prev) => prev + 5);
      });

      expect(result.current.state).toBe(15);
      expect(result.current.history).toEqual([10, 15]);
    });

    it('skips duplicate entries with default equality', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'same' })
      );

      act(() => {
        result.current.setState('same');
      });

      expect(result.current.history).toEqual(['same']);
      expect(result.current.historyIndex).toBe(0);
    });

    it('skips duplicate entries with custom equality', () => {
      const { result } = renderHook(() =>
        useUndoRedo({
          initialState: { id: 1, name: 'Alice' },
          isEqual: (a, b) => a.id === b.id && a.name === b.name,
        })
      );

      act(() => {
        // Different object reference, same values
        result.current.setState({ id: 1, name: 'Alice' });
      });

      expect(result.current.history).toHaveLength(1);
    });

    it('truncates future states when setting from mid-history', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'a' })
      );

      // Build up history: a -> b -> c -> d
      act(() => { result.current.setState('b'); });
      act(() => { result.current.setState('c'); });
      act(() => { result.current.setState('d'); });

      expect(result.current.history).toEqual(['a', 'b', 'c', 'd']);
      expect(result.current.historyIndex).toBe(3);

      // Undo twice: back to 'b'
      act(() => { result.current.undo(); });
      act(() => { result.current.undo(); });

      expect(result.current.state).toBe('b');
      expect(result.current.historyIndex).toBe(1);

      // Set new state: should truncate c, d
      act(() => {
        result.current.setState('e');
      });

      expect(result.current.history).toEqual(['a', 'b', 'e']);
      expect(result.current.historyIndex).toBe(2);
      expect(result.current.canRedo).toBe(false);
    });

    it('multiple sequential updates build correct history', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 0 })
      );

      act(() => { result.current.setState(1); });
      act(() => { result.current.setState(2); });
      act(() => { result.current.setState(3); });
      act(() => { result.current.setState(4); });
      act(() => { result.current.setState(5); });

      expect(result.current.history).toEqual([0, 1, 2, 3, 4, 5]);
      expect(result.current.historyIndex).toBe(5);
      expect(result.current.state).toBe(5);
    });
  });

  describe('undo', () => {
    it('moves back one step in history', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'a' })
      );

      act(() => { result.current.setState('b'); });
      act(() => { result.current.setState('c'); });

      act(() => {
        result.current.undo();
      });

      expect(result.current.state).toBe('b');
      expect(result.current.historyIndex).toBe(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(true);
    });

    it('is a no-op when at the beginning of history', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'only' })
      );

      act(() => {
        result.current.undo();
      });

      expect(result.current.state).toBe('only');
      expect(result.current.historyIndex).toBe(0);
    });

    it('can undo all the way to initial state', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'init' })
      );

      act(() => { result.current.setState('a'); });
      act(() => { result.current.setState('b'); });
      act(() => { result.current.setState('c'); });

      // Undo 3 times
      act(() => { result.current.undo(); });
      act(() => { result.current.undo(); });
      act(() => { result.current.undo(); });

      expect(result.current.state).toBe('init');
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });
  });

  describe('redo', () => {
    it('moves forward one step in history', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'a' })
      );

      act(() => { result.current.setState('b'); });
      act(() => { result.current.setState('c'); });
      act(() => { result.current.undo(); });
      act(() => { result.current.undo(); });

      act(() => {
        result.current.redo();
      });

      expect(result.current.state).toBe('b');
      expect(result.current.historyIndex).toBe(1);
      expect(result.current.canRedo).toBe(true);
    });

    it('is a no-op when at the end of history', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'a' })
      );

      act(() => { result.current.setState('b'); });

      act(() => {
        result.current.redo();
      });

      expect(result.current.state).toBe('b');
      expect(result.current.historyIndex).toBe(1);
    });

    it('can redo all the way to the latest state', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'a' })
      );

      act(() => { result.current.setState('b'); });
      act(() => { result.current.setState('c'); });

      // Undo all
      act(() => { result.current.undo(); });
      act(() => { result.current.undo(); });

      expect(result.current.state).toBe('a');

      // Redo all
      act(() => { result.current.redo(); });
      act(() => { result.current.redo(); });

      expect(result.current.state).toBe('c');
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('maxHistory', () => {
    it('trims history from the beginning when exceeding max', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 0, maxHistory: 3 })
      );

      act(() => { result.current.setState(1); });
      act(() => { result.current.setState(2); });
      act(() => { result.current.setState(3); });

      // History should be capped at 3: [1, 2, 3]
      expect(result.current.history).toHaveLength(3);
      expect(result.current.history).toEqual([1, 2, 3]);
      expect(result.current.state).toBe(3);
      expect(result.current.historyIndex).toBe(2);
    });

    it('still allows undo within the remaining history', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 0, maxHistory: 3 })
      );

      act(() => { result.current.setState(1); });
      act(() => { result.current.setState(2); });
      act(() => { result.current.setState(3); });
      act(() => { result.current.setState(4); });

      // History: [2, 3, 4]
      expect(result.current.history).toHaveLength(3);
      expect(result.current.history).toEqual([2, 3, 4]);

      act(() => { result.current.undo(); });
      expect(result.current.state).toBe(3);

      act(() => { result.current.undo(); });
      expect(result.current.state).toBe(2);

      // Cannot undo further
      expect(result.current.canUndo).toBe(false);
    });

    it('defaults to 50 entries', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 0 })
      );

      // Push 60 states
      for (let i = 1; i <= 60; i++) {
        act(() => { result.current.setState(i); });
      }

      expect(result.current.history).toHaveLength(50);
      expect(result.current.state).toBe(60);
      // Earliest state should be 11 (60 - 50 + 1)
      expect(result.current.history[0]).toBe(11);
    });
  });

  describe('reset', () => {
    it('clears history and returns to initial state', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'start' })
      );

      act(() => { result.current.setState('a'); });
      act(() => { result.current.setState('b'); });
      act(() => { result.current.setState('c'); });

      act(() => {
        result.current.reset();
      });

      expect(result.current.state).toBe('start');
      expect(result.current.history).toEqual(['start']);
      expect(result.current.historyIndex).toBe(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('accepts a new initial state', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'old' })
      );

      act(() => { result.current.setState('a'); });

      act(() => {
        result.current.reset('brand-new');
      });

      expect(result.current.state).toBe('brand-new');
      expect(result.current.history).toEqual(['brand-new']);
    });

    it('resets with undefined uses original initialState', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 42 })
      );

      act(() => { result.current.setState(100); });

      act(() => {
        result.current.reset(undefined);
      });

      expect(result.current.state).toBe(42);
    });
  });

  describe('keyboardHandlers', () => {
    it('onUndo performs undo', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'a' })
      );

      act(() => { result.current.setState('b'); });

      act(() => {
        result.current.keyboardHandlers.onUndo();
      });

      expect(result.current.state).toBe('a');
    });

    it('onRedo performs redo', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 'a' })
      );

      act(() => { result.current.setState('b'); });
      act(() => { result.current.undo(); });

      act(() => {
        result.current.keyboardHandlers.onRedo();
      });

      expect(result.current.state).toBe('b');
    });

    it('handlers are stable references across renders', () => {
      const { result, rerender } = renderHook(() =>
        useUndoRedo({ initialState: 'a' })
      );

      const handlers1 = result.current.keyboardHandlers;

      act(() => { result.current.setState('b'); });
      rerender();

      const handlers2 = result.current.keyboardHandlers;

      expect(handlers1.onUndo).toBe(handlers2.onUndo);
      expect(handlers1.onRedo).toBe(handlers2.onRedo);
    });
  });

  describe('Complex Workflows', () => {
    it('undo, set new state, verify future is truncated', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 1 })
      );

      // 1 -> 2 -> 3 -> 4 -> 5
      for (let i = 2; i <= 5; i++) {
        act(() => { result.current.setState(i); });
      }

      // Undo to 3
      act(() => { result.current.undo(); });
      act(() => { result.current.undo(); });
      expect(result.current.state).toBe(3);

      // Set new branch: 3 -> 10
      act(() => { result.current.setState(10); });

      expect(result.current.history).toEqual([1, 2, 3, 10]);
      expect(result.current.state).toBe(10);
      expect(result.current.canRedo).toBe(false);

      // Can still undo the whole thing
      act(() => { result.current.undo(); });
      act(() => { result.current.undo(); });
      act(() => { result.current.undo(); });
      expect(result.current.state).toBe(1);
      expect(result.current.canUndo).toBe(false);
    });

    it('works with array state', () => {
      const { result } = renderHook(() =>
        useUndoRedo<string[]>({ initialState: [] })
      );

      act(() => { result.current.setState(['a']); });
      act(() => { result.current.setState(['a', 'b']); });
      act(() => { result.current.setState(['a', 'b', 'c']); });

      expect(result.current.state).toEqual(['a', 'b', 'c']);

      act(() => { result.current.undo(); });
      expect(result.current.state).toEqual(['a', 'b']);

      act(() => { result.current.undo(); });
      expect(result.current.state).toEqual(['a']);
    });

    it('updater function receives correct previous state after undo', () => {
      const { result } = renderHook(() =>
        useUndoRedo({ initialState: 0 })
      );

      act(() => { result.current.setState(10); });
      act(() => { result.current.setState(20); });

      // Undo to 10
      act(() => { result.current.undo(); });
      expect(result.current.state).toBe(10);

      // Use updater: should receive 10 as prev
      act(() => {
        result.current.setState((prev) => prev + 5);
      });

      expect(result.current.state).toBe(15);
      expect(result.current.history).toEqual([0, 10, 15]);
    });
  });
});
