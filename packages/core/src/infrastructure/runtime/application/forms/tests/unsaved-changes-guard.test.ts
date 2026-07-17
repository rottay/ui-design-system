import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UNSAVED_CHANGES_GUARD_CONTRACT, useUnsavedChangesGuard } from '../unsaved-changes-guard';

describe('useUnsavedChangesGuard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes the stable shared contract and bypasses confirmation when clean', () => {
    const confirmDiscard = vi.fn(() => false);
    const onDiscard = vi.fn();
    const onBlocked = vi.fn();
    const { result } = renderHook(() =>
      useUnsavedChangesGuard({
        isDirty: false,
        confirmDiscard,
        onDiscard,
        onBlocked,
      })
    );

    expect(result.current.contract).toBe(UNSAVED_CHANGES_GUARD_CONTRACT);
    expect(result.current.requestDiscard('back')).toBe(true);
    expect(confirmDiscard).not.toHaveBeenCalled();
    expect(onDiscard).not.toHaveBeenCalled();
    expect(onBlocked).not.toHaveBeenCalled();
  });

  it('confirms dirty discard with message and reason, then reports the outcome', () => {
    const confirmDiscard = vi.fn(() => true);
    const onDiscard = vi.fn();
    const { result } = renderHook(() =>
      useUnsavedChangesGuard({
        isDirty: true,
        message: 'Leave this wizard?',
        confirmDiscard,
        onDiscard,
      })
    );

    expect(result.current.requestDiscard('step-change')).toBe(true);
    expect(confirmDiscard).toHaveBeenCalledWith('Leave this wizard?', 'step-change');
    expect(onDiscard).toHaveBeenCalledWith('step-change');
  });

  it('blocks a rejected discard and uses navigation as the default reason', () => {
    const confirmDiscard = vi.fn(() => false);
    const onBlocked = vi.fn();
    const { result } = renderHook(() => useUnsavedChangesGuard({ isDirty: true, confirmDiscard, onBlocked }));

    expect(result.current.requestDiscard()).toBe(false);
    expect(confirmDiscard).toHaveBeenCalledWith(
      'Discard unsaved changes? Your current changes will be lost.',
      'navigation'
    );
    expect(onBlocked).toHaveBeenCalledWith('navigation');
  });

  it('falls back to window.confirm and guards action arguments and return values', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const action = vi.fn((value: number) => value * 2);
    const { result } = renderHook(() => useUnsavedChangesGuard({ isDirty: true }));

    const guarded = result.current.guardAction(action, 'command');
    expect(guarded(4)).toBe(8);
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledWith(4);
  });

  it('does not execute a guarded action after confirmation is rejected', () => {
    const action = vi.fn();
    const { result } = renderHook(() =>
      useUnsavedChangesGuard({
        isDirty: true,
        confirmDiscard: () => false,
      })
    );

    expect(result.current.guardAction(action, 'cancel')()).toBeUndefined();
    expect(action).not.toHaveBeenCalled();
  });

  it('registers beforeunload only while dirty and removes the same listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { rerender, unmount } = renderHook(({ isDirty }) => useUnsavedChangesGuard({ isDirty }), {
      initialProps: { isDirty: false },
    });

    expect(addSpy.mock.calls.some(([eventName]) => eventName === 'beforeunload')).toBe(false);

    act(() => rerender({ isDirty: true }));
    const handler = addSpy.mock.calls.find(([eventName]) => eventName === 'beforeunload')?.[1];
    expect(handler).toBeTypeOf('function');

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', handler);
  });

  it('prevents browser unload while dirty', () => {
    const { unmount } = renderHook(() => useUnsavedChangesGuard({ isDirty: true, message: 'Keep editing?' }));
    const event = new Event('beforeunload', { cancelable: true });

    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);

    unmount();
  });
});
