/**
 * useAutoSave Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '../auto-save';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('starts with idle status and no dirty flag', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutoSave({ data: { name: 'test' }, onSave })
      );

      expect(result.current.status).toBe('idle');
      expect(result.current.lastSavedAt).toBeNull();
      expect(result.current.isDirty).toBe(false);
    });

    it('does not save on initial mount', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      renderHook(() => useAutoSave({ data: { name: 'test' }, onSave }));

      vi.advanceTimersByTime(5000);

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('Debounced Auto-Save', () => {
    it('saves after debounce period when data changes', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 1000 }),
        { initialProps: { data: { name: 'initial' } } }
      );

      // Change data
      rerender({ data: { name: 'updated' } });

      // Should be dirty but not yet saving
      expect(result.current.isDirty).toBe(true);
      expect(onSave).not.toHaveBeenCalled();

      // Advance past debounce (async version flushes microtasks so the
      // awaited onSave promise settles and React state updates flush)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      expect(onSave).toHaveBeenCalledWith({ name: 'updated' });
      expect(result.current.status).toBe('saved');
      expect(result.current.isDirty).toBe(false);
      expect(result.current.lastSavedAt).toBeInstanceOf(Date);
    });

    it('resets debounce timer on rapid changes', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 1000 }),
        { initialProps: { data: { text: 'a' } } }
      );

      // Rapid changes
      rerender({ data: { text: 'ab' } });
      vi.advanceTimersByTime(500);

      rerender({ data: { text: 'abc' } });
      vi.advanceTimersByTime(500);

      rerender({ data: { text: 'abcd' } });
      vi.advanceTimersByTime(500);

      // Should not have saved yet (each change resets the timer)
      expect(onSave).not.toHaveBeenCalled();

      // Advance past the final debounce
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({ text: 'abcd' });
    });

    it('uses default 1500ms debounce when not specified', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave }),
        { initialProps: { data: { v: 1 } } }
      );

      rerender({ data: { v: 2 } });

      // Not yet at default 1500ms
      vi.advanceTimersByTime(1400);
      expect(onSave).not.toHaveBeenCalled();

      // Past 1500ms
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deep Equality Skip', () => {
    it('does not save when data has not changed (deep equality)', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 500 }),
        { initialProps: { data: { name: 'same' } } }
      );

      // Rerender with a new object reference but same content
      rerender({ data: { name: 'same' } });

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Should not save because data is deeply equal to initial
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('Enabled Flag', () => {
    it('does not auto-save when enabled is false', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ data, enabled }) => useAutoSave({ data, onSave, debounceMs: 500, enabled }),
        { initialProps: { data: { v: 1 }, enabled: false } }
      );

      rerender({ data: { v: 2 }, enabled: false });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(onSave).not.toHaveBeenCalled();
    });

    it('resumes auto-saving when enabled changes to true', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ data, enabled }) => useAutoSave({ data, onSave, debounceMs: 500, enabled }),
        { initialProps: { data: { v: 1 }, enabled: false } }
      );

      // Change data while disabled
      rerender({ data: { v: 2 }, enabled: false });

      // Enable auto-save and data still differs
      rerender({ data: { v: 2 }, enabled: true });

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(onSave).toHaveBeenCalledWith({ v: 2 });
    });
  });

  describe('Force Save', () => {
    it('save() triggers immediate save bypassing debounce', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 5000 }),
        { initialProps: { data: { name: 'initial' } } }
      );

      // Change data
      rerender({ data: { name: 'changed' } });

      // Force save without waiting for debounce
      await act(async () => {
        await result.current.save();
      });

      expect(onSave).toHaveBeenCalledWith({ name: 'changed' });
      expect(result.current.status).toBe('saved');
    });
  });

  describe('Error Handling', () => {
    it('sets status to error when onSave fails', async () => {
      const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      const onError = vi.fn();

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, onError, debounceMs: 500 }),
        { initialProps: { data: { v: 1 } } }
      );

      rerender({ data: { v: 2 } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(result.current.status).toBe('error');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(result.current.lastSavedAt).toBeNull();
    });

    it('wraps non-Error throws into Error objects', async () => {
      const onSave = vi.fn().mockRejectedValue('string error');
      const onError = vi.fn();

      const { rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, onError, debounceMs: 500 }),
        { initialProps: { data: { v: 1 } } }
      );

      rerender({ data: { v: 2 } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Status Transitions', () => {
    it('transitions idle -> saving -> saved on successful save', async () => {
      let resolveSave: (() => void) | null = null;
      const onSave = vi.fn(
        () => new Promise<void>((resolve) => { resolveSave = resolve; })
      );

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, onSave, debounceMs: 500 }),
        { initialProps: { data: { v: 1 } } }
      );

      expect(result.current.status).toBe('idle');

      // Trigger change
      rerender({ data: { v: 2 } });

      // Advance past debounce to trigger save. The async version flushes
      // microtasks so executeSave() runs up to its first await (onSave),
      // which sets status to 'saving'.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(result.current.status).toBe('saving');

      // Resolve the save
      await act(async () => {
        resolveSave!();
      });

      expect(result.current.status).toBe('saved');
    });
  });
});
