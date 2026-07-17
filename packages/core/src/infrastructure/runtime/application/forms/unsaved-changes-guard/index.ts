'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Stable contract identifier for surfaces that compose the shared unsaved
 * changes guard.
 */
export const UNSAVED_CHANGES_GUARD_CONTRACT = 'beforeunload-and-explicit-discard-confirm' as const;

/** Intent that attempted to leave or replace dirty work. */
export type UnsavedChangeGuardReason = 'navigation' | 'cancel' | 'back' | 'step-change' | 'command';

export interface UseUnsavedChangesGuardOptions {
  /** Whether the current surface contains changes that have not been saved. */
  isDirty: boolean;
  /** Message shown by the default browser confirmation. */
  message?: string;
  /** Optional app-owned confirmation UI adapter. */
  confirmDiscard?: (message: string, reason: UnsavedChangeGuardReason) => boolean;
  /** Called after discard is confirmed. */
  onDiscard?: (reason: UnsavedChangeGuardReason) => void;
  /** Called when a dirty action is rejected. */
  onBlocked?: (reason: UnsavedChangeGuardReason) => void;
}

export interface UseUnsavedChangesGuardReturn {
  contract: typeof UNSAVED_CHANGES_GUARD_CONTRACT;
  requestDiscard: (reason?: UnsavedChangeGuardReason) => boolean;
  guardAction: <TArgs extends unknown[], TResult>(
    action: (...args: TArgs) => TResult,
    reason?: UnsavedChangeGuardReason
  ) => (...args: TArgs) => TResult | undefined;
}

const DEFAULT_UNSAVED_CHANGES_MESSAGE = 'Discard unsaved changes? Your current changes will be lost.';

/**
 * Protects dirty work across browser unloads and explicit in-app actions.
 *
 * The hook is router-agnostic: apps pass navigation, cancel, back, wizard,
 * and command callbacks through `guardAction`, or call `requestDiscard`
 * before performing their own transition.
 */
export function useUnsavedChangesGuard({
  isDirty,
  message = DEFAULT_UNSAVED_CHANGES_MESSAGE,
  confirmDiscard,
  onDiscard,
  onBlocked,
}: UseUnsavedChangesGuardOptions): UseUnsavedChangesGuardReturn {
  const stateRef = useRef({
    isDirty,
    message,
    confirmDiscard,
    onDiscard,
    onBlocked,
  });

  stateRef.current = {
    isDirty,
    message,
    confirmDiscard,
    onDiscard,
    onBlocked,
  };

  useEffect(() => {
    if (!isDirty || typeof window === 'undefined') return undefined;

    const handleBeforeUnload = (event: BeforeUnloadEvent): string => {
      event.preventDefault();
      event.returnValue = stateRef.current.message;
      return stateRef.current.message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const requestDiscard = useCallback((reason: UnsavedChangeGuardReason = 'navigation'): boolean => {
    const current = stateRef.current;
    if (!current.isDirty) return true;

    const confirmed = current.confirmDiscard
      ? current.confirmDiscard(current.message, reason)
      : typeof window !== 'undefined' && window.confirm(current.message);

    if (confirmed) {
      current.onDiscard?.(reason);
      return true;
    }

    current.onBlocked?.(reason);
    return false;
  }, []);

  const guardAction = useCallback(
    <TArgs extends unknown[], TResult>(
        action: (...args: TArgs) => TResult,
        reason: UnsavedChangeGuardReason = 'navigation'
      ) =>
      (...args: TArgs): TResult | undefined => {
        if (!requestDiscard(reason)) return undefined;
        return action(...args);
      },
    [requestDiscard]
  );

  return {
    contract: UNSAVED_CHANGES_GUARD_CONTRACT,
    requestDiscard,
    guardAction,
  };
}
