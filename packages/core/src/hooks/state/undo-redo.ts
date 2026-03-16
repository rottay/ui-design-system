'use client';

/**
 * @fileoverview useUndoRedo Hook - Rottay Design System
 * @description React hook for managing state with full undo/redo history.
 * Provides configurable history depth, custom equality checks, and
 * keyboard shortcut handlers ready for useGlobalShortcut integration.
 *
 * @remarks
 * Features:
 * - Configurable max history size (default 50)
 * - Custom equality check to prevent duplicate entries
 * - undo()/redo() navigate the history stack
 * - canUndo/canRedo booleans for disabling UI buttons
 * - setState supports both direct values and updater functions
 * - Truncates future states when a new action is performed mid-history
 * - reset() clears all history, optionally to a new initial state
 * - keyboardHandlers ready for useGlobalShortcut integration
 *
 * @example Basic usage
 * ```tsx
 * const { state, setState, undo, redo, canUndo, canRedo } = useUndoRedo({
 *   initialState: { name: '', email: '' },
 * });
 *
 * // Update state (pushes to history)
 * setState({ ...state, name: 'John' });
 *
 * // Navigate history
 * undo();
 * redo();
 * ```
 *
 * @example With keyboard shortcuts
 * ```tsx
 * const { keyboardHandlers, ...undoRedo } = useUndoRedo({
 *   initialState: initialDocument,
 * });
 *
 * useGlobalShortcuts([
 *   { key: 'mod+z', handler: keyboardHandlers.onUndo, description: 'Undo', category: 'Edit' },
 *   { key: 'mod+shift+z', handler: keyboardHandlers.onRedo, description: 'Redo', category: 'Edit' },
 * ]);
 * ```
 *
 * @example With custom equality
 * ```tsx
 * const undoRedo = useUndoRedo({
 *   initialState: complexObject,
 *   isEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
 *   maxHistory: 100,
 * });
 * ```
 *
 * @module System/Hooks/State/UndoRedo
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for the `useUndoRedo` hook.
 */
export interface UseUndoRedoOptions<T> {
  /** The initial state value. Also used as the default for reset(). */
  initialState: T;
  /** Maximum number of history entries to keep. @default 50 */
  maxHistory?: number;
  /** Custom equality function to prevent duplicate consecutive entries. */
  isEqual?: (a: T, b: T) => boolean;
}

/**
 * Return type of the `useUndoRedo` hook.
 */
export interface UseUndoRedoReturn<T> {
  /** The current state value. */
  state: T;
  /** Update the state. Accepts a new value or an updater function. */
  setState: (newState: T | ((prev: T) => T)) => void;
  /** Move back one step in history. No-op if canUndo is false. */
  undo: () => void;
  /** Move forward one step in history. No-op if canRedo is false. */
  redo: () => void;
  /** Whether there are previous states to undo to. */
  canUndo: boolean;
  /** Whether there are future states to redo to. */
  canRedo: boolean;
  /** The full history array (past states + current + future states). */
  history: T[];
  /** The current index within the history array. */
  historyIndex: number;
  /** Reset history. Optionally provide a new initial state. */
  reset: (newState?: T) => void;
  /** Handler functions ready for useGlobalShortcut integration. */
  keyboardHandlers: {
    onUndo: () => void;
    onRedo: () => void;
  };
}

// ============================================================================
// Internal state shape
// ============================================================================

interface UndoRedoState<T> {
  history: T[];
  index: number;
}

// ============================================================================
// Default equality
// ============================================================================

function defaultIsEqual<T>(a: T, b: T): boolean {
  return a === b;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * React hook for managing state with full undo/redo history.
 *
 * Tracks all state changes in a bounded history array and provides
 * navigation controls. When a new state is set while in the middle
 * of the history (after undoing), all future entries are discarded.
 *
 * @param options - Hook configuration
 * @returns State, history navigation, and keyboard handler functions
 *
 * @example
 * ```tsx
 * function Editor() {
 *   const { state, setState, undo, redo, canUndo, canRedo } = useUndoRedo({
 *     initialState: '',
 *     maxHistory: 100,
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={undo} disabled={!canUndo}>Undo</button>
 *       <button onClick={redo} disabled={!canRedo}>Redo</button>
 *       <textarea
 *         value={state}
 *         onChange={(e) => setState(e.target.value)}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useUndoRedo<T>(
  options: UseUndoRedoOptions<T>
): UseUndoRedoReturn<T> {
  const {
    initialState,
    maxHistory = 50,
    isEqual = defaultIsEqual,
  } = options;

  // History and index are stored as a single state object rather than two separate
  // useState calls. This is critical because undo/redo must atomically update
  // both the history array and the index pointer. With separate states, a render
  // could see an updated index but a stale history array.
  const [undoRedoState, setUndoRedoState] = useState<UndoRedoState<T>>(() => ({
    history: [initialState],
    index: 0,
  }));

  // Keep refs for stable access in callbacks
  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;

  const maxHistoryRef = useRef(maxHistory);
  maxHistoryRef.current = maxHistory;

  const initialStateRef = useRef(initialState);
  initialStateRef.current = initialState;

  // Derived values
  const { history, index: historyIndex } = undoRedoState;
  const state = history[historyIndex];
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Push a new state entry, truncating future and enforcing max size
  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setUndoRedoState((prev) => {
        const currentState = prev.history[prev.index];
        const resolvedState =
          typeof newState === 'function'
            ? (newState as (prev: T) => T)(currentState)
            : newState;

        // Skip if equal to current state
        if (isEqualRef.current(currentState, resolvedState)) {
          return prev;
        }

        // Standard undo behavior: setting new state while in the middle of the
        // history discards all "future" entries. This matches how text editors
        // work -- you can't redo after making a new edit.
        const truncated = prev.history.slice(0, prev.index + 1);

        truncated.push(resolvedState);

        // Trim from the oldest end so the most recent states are always kept.
        const max = maxHistoryRef.current;
        if (truncated.length > max) {
          const trimmed = truncated.slice(truncated.length - max);
          return { history: trimmed, index: trimmed.length - 1 };
        }

        return { history: truncated, index: truncated.length - 1 };
      });
    },
    []
  );

  // Navigate backward in history
  const undo = useCallback(() => {
    setUndoRedoState((prev) => {
      if (prev.index <= 0) return prev;
      return { ...prev, index: prev.index - 1 };
    });
  }, []);

  // Navigate forward in history
  const redo = useCallback(() => {
    setUndoRedoState((prev) => {
      if (prev.index >= prev.history.length - 1) return prev;
      return { ...prev, index: prev.index + 1 };
    });
  }, []);

  // Reset to initial state or a new provided state
  const reset = useCallback(
    (newState?: T) => {
      const resetState = newState !== undefined ? newState : initialStateRef.current;
      setUndoRedoState({
        history: [resetState],
        index: 0,
      });
    },
    []
  );

  // Keyboard handlers use a ref-based pattern so their identity is stable
  // across renders. This matters because useGlobalShortcut registers handlers
  // by reference, and changing the reference would cause unnecessary
  // re-registrations.
  const keyboardHandlers = useRef({
    onUndo: () => {
      setUndoRedoState((prev) => {
        if (prev.index <= 0) return prev;
        return { ...prev, index: prev.index - 1 };
      });
    },
    onRedo: () => {
      setUndoRedoState((prev) => {
        if (prev.index >= prev.history.length - 1) return prev;
        return { ...prev, index: prev.index + 1 };
      });
    },
  }).current;

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    historyIndex,
    reset,
    keyboardHandlers,
  };
}
