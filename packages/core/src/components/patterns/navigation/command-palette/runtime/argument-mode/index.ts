'use client';

/**
 * @fileoverview Argument-mode state machine for the CommandPalette engines.
 *
 * Selecting a `CommandItem` with a `parameter` moves the palette from
 * `search` to `argument` mode: the engine renders a breadcrumb chip with the
 * pending item's label, the input collects the argument, Enter confirms
 * (validated), and Escape pops back to search with the previous query
 * restored. All three engines share this hook so the mode transitions stay
 * identical; each engine owns only its rendering of the chip/prompt/error
 * anatomy parts.
 */

import { useCallback, useState } from 'react';
import type { CommandItem, CommandPaletteMode } from '../../contracts';

interface ArgumentModeState {
  pendingItem: CommandItem | null;
  value: string;
  error: string | null;
  savedQuery: string;
}

const IDLE_STATE: ArgumentModeState = {
  pendingItem: null,
  value: '',
  error: null,
  savedQuery: '',
};

export interface UseCommandArgumentModeReturn {
  /** Current palette interaction mode. */
  mode: CommandPaletteMode;
  /** The parameterized item awaiting its argument (argument mode only). */
  pendingItem: CommandItem | null;
  /** Current argument input value. */
  argumentValue: string;
  /** Validation error from the last rejected confirm, cleared on edit. */
  argumentError: string | null;
  /** Enter argument mode for `item`, remembering `currentQuery` for Escape restore. */
  enterArgumentMode: (item: CommandItem, currentQuery: string) => void;
  /** Update the argument value (clears any validation error). */
  setArgumentValue: (value: string) => void;
  /**
   * Validate and submit the argument. Returns true when accepted (the engine
   * should close the palette); false keeps argument mode open with the error.
   */
  confirmArgument: () => boolean;
  /** Leave argument mode without submitting. Returns the query to restore. */
  cancelArgument: () => string;
  /** Hard reset (palette closed/reopened). */
  resetArgumentMode: () => void;
}

/**
 * Shared argument-mode state for CommandPalette engines. See the fileoverview
 * for the interaction contract.
 */
export function useCommandArgumentMode(): UseCommandArgumentModeReturn {
  const [state, setState] = useState<ArgumentModeState>(IDLE_STATE);

  const enterArgumentMode = useCallback((item: CommandItem, currentQuery: string) => {
    setState({ pendingItem: item, value: '', error: null, savedQuery: currentQuery });
  }, []);

  const setArgumentValue = useCallback((value: string) => {
    setState((prev) => (prev.pendingItem ? { ...prev, value, error: null } : prev));
  }, []);

  // Submission runs outside the setState updater: updaters may re-execute
  // under StrictMode, which would double-fire onSubmit.
  const confirmArgument = useCallback((): boolean => {
    if (!state.pendingItem) return false;
    const validationError = state.pendingItem.parameter?.validate?.(state.value) ?? null;
    if (validationError !== null) {
      setState((prev) => (prev.pendingItem ? { ...prev, error: validationError } : prev));
      return false;
    }
    // onSubmit is the parameterized contract; onSelect is the fallback so
    // an item missing it is still actionable rather than a dead end.
    if (state.pendingItem.onSubmit) {
      state.pendingItem.onSubmit(state.value);
    } else {
      state.pendingItem.onSelect();
    }
    setState(IDLE_STATE);
    return true;
  }, [state]);

  const cancelArgument = useCallback((): string => {
    const restored = state.savedQuery;
    setState(IDLE_STATE);
    return restored;
  }, [state.savedQuery]);

  const resetArgumentMode = useCallback(() => {
    setState(IDLE_STATE);
  }, []);

  return {
    mode: state.pendingItem ? 'argument' : 'search',
    pendingItem: state.pendingItem,
    argumentValue: state.value,
    argumentError: state.error,
    enterArgumentMode,
    setArgumentValue,
    confirmArgument,
    cancelArgument,
    resetArgumentMode,
  };
}
