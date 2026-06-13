/**
 * useOptimisticUpdate Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticUpdate } from '../optimistic';

describe('useOptimisticUpdate', () => {
  describe('Initial State', () => {
    it('starts with null data, no error, and not pending', () => {
      const onMutate = vi.fn().mockResolvedValue({ id: 1 });
      const { result } = renderHook(() => useOptimisticUpdate({ onMutate }));

      expect(result.current.data).toBeNull();
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Optimistic Mutation', () => {
    it('applies optimistic data immediately before mutation resolves', async () => {
      let resolveMutation: ((value: { id: number; name: string }) => void) | null = null;
      const onMutate = vi.fn(
        () =>
          new Promise<{ id: number; name: string }>((resolve) => {
            resolveMutation = resolve;
          })
      );

      const { result } = renderHook(() => useOptimisticUpdate({ onMutate }));

      // Start the mutation (don't await)
      let mutatePromise: Promise<unknown>;
      act(() => {
        mutatePromise = result.current.mutate({ id: 1, name: 'Optimistic' });
      });

      // Data should be set optimistically right away
      expect(result.current.data).toEqual({ id: 1, name: 'Optimistic' });
      expect(result.current.isPending).toBe(true);

      // Resolve the mutation
      await act(async () => {
        resolveMutation!({ id: 1, name: 'Confirmed' });
        await mutatePromise;
      });

      expect(result.current.data).toEqual({ id: 1, name: 'Confirmed' });
      expect(result.current.isPending).toBe(false);
    });

    it('calls onSuccess when mutation succeeds', async () => {
      const onMutate = vi.fn().mockResolvedValue({ id: 1, saved: true });
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticUpdate({ onMutate, onSuccess })
      );

      await act(async () => {
        await result.current.mutate({ id: 1, saved: false });
      });

      expect(onSuccess).toHaveBeenCalledWith({ id: 1, saved: true });
    });

    it('passes optimistic data to onMutate', async () => {
      const onMutate = vi.fn().mockResolvedValue({ id: 1 });

      const { result } = renderHook(() => useOptimisticUpdate({ onMutate }));

      const optimistic = { id: 1, status: 'done' };
      await act(async () => {
        await result.current.mutate(optimistic);
      });

      expect(onMutate).toHaveBeenCalledWith(optimistic);
    });
  });

  describe('Error Handling and Rollback', () => {
    it('reverts to previous data on mutation failure', async () => {
      const onMutate = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticUpdate({ onMutate, onError })
      );

      // First: set initial data via a successful mutation
      onMutate.mockResolvedValueOnce({ id: 1, name: 'Original' });
      await act(async () => {
        await result.current.mutate({ id: 1, name: 'Original' });
      });

      expect(result.current.data).toEqual({ id: 1, name: 'Original' });

      // Second: fail the mutation
      onMutate.mockRejectedValueOnce(new Error('Server error'));
      await act(async () => {
        try {
          await result.current.mutate({ id: 1, name: 'Optimistic' });
        } catch {
          // expected
        }
      });

      // Should have rolled back to the original data
      expect(result.current.data).toEqual({ id: 1, name: 'Original' });
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Server error');
      expect(result.current.isPending).toBe(false);
    });

    it('calls onError with the error and rollback data', async () => {
      const onMutate = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticUpdate({ onMutate, onError })
      );

      // Set initial data
      onMutate.mockResolvedValueOnce({ id: 1, status: 'active' });
      await act(async () => {
        await result.current.mutate({ id: 1, status: 'active' });
      });

      // Fail the second mutation
      onMutate.mockRejectedValueOnce(new Error('Network error'));
      await act(async () => {
        try {
          await result.current.mutate({ id: 1, status: 'archived' });
        } catch {
          // expected
        }
      });

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        { id: 1, status: 'active' }
      );
    });

    it('wraps non-Error throws into Error objects', async () => {
      const onMutate = vi.fn().mockRejectedValue('string error');
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticUpdate({ onMutate, onError })
      );

      await act(async () => {
        try {
          await result.current.mutate({ id: 1 });
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('string error');
    });

    it('clears error on next successful mutation', async () => {
      const onMutate = vi.fn();

      const { result } = renderHook(() => useOptimisticUpdate({ onMutate }));

      // Fail first
      onMutate.mockRejectedValueOnce(new Error('fail'));
      await act(async () => {
        try {
          await result.current.mutate({ id: 1 });
        } catch {
          // expected
        }
      });

      expect(result.current.error).not.toBeNull();

      // Succeed second
      onMutate.mockResolvedValueOnce({ id: 1, ok: true });
      await act(async () => {
        await result.current.mutate({ id: 1, ok: true });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Manual Rollback', () => {
    it('rollback() restores previous data', async () => {
      const onMutate = vi.fn();

      const { result } = renderHook(() => useOptimisticUpdate({ onMutate }));

      // Set initial data
      onMutate.mockResolvedValueOnce({ id: 1, name: 'First' });
      await act(async () => {
        await result.current.mutate({ id: 1, name: 'First' });
      });

      // Start a mutation that we will manually roll back
      let resolveMutation: ((value: unknown) => void) | null = null;
      onMutate.mockImplementationOnce(
        () => new Promise((resolve) => { resolveMutation = resolve; })
      );

      let mutatePromise: Promise<unknown>;
      act(() => {
        mutatePromise = result.current.mutate({ id: 1, name: 'Optimistic' });
      });

      expect(result.current.data).toEqual({ id: 1, name: 'Optimistic' });

      // Manual rollback
      act(() => {
        result.current.rollback();
      });

      expect(result.current.data).toEqual({ id: 1, name: 'First' });

      await act(async () => {
        resolveMutation?.({ id: 1, name: 'ignored' });
        await mutatePromise;
      });
    });

    it('rollback() is a no-op when there is no previous data', () => {
      const onMutate = vi.fn().mockResolvedValue({ id: 1 });
      const { result } = renderHook(() => useOptimisticUpdate({ onMutate }));

      // Should not throw or change data
      act(() => {
        result.current.rollback();
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe('Rollback Delay', () => {
    it('delays onError callback when rollbackDelay is set', async () => {
      vi.useFakeTimers();

      const onMutate = vi.fn().mockRejectedValue(new Error('Delayed error'));
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticUpdate({ onMutate, onError, rollbackDelay: 500 })
      );

      await act(async () => {
        try {
          await result.current.mutate({ id: 1 });
        } catch {
          // expected
        }
      });

      // Error should be set on the hook state immediately
      expect(result.current.error).toBeInstanceOf(Error);
      // But onError callback should NOT have fired yet
      expect(onError).not.toHaveBeenCalled();

      // Advance time past the delay
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error), null);

      vi.useRealTimers();
    });
  });

  describe('Stale Mutation Handling', () => {
    it('ignores stale mutation results when a newer mutation is in flight', async () => {
      let resolveFirst: ((value: { id: number; version: string }) => void) | null = null;
      let resolveSecond: ((value: { id: number; version: string }) => void) | null = null;

      const onMutate = vi.fn()
        .mockImplementationOnce(
          () => new Promise<{ id: number; version: string }>((resolve) => { resolveFirst = resolve; })
        )
        .mockImplementationOnce(
          () => new Promise<{ id: number; version: string }>((resolve) => { resolveSecond = resolve; })
        );

      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useOptimisticUpdate({ onMutate, onSuccess })
      );

      // Start first mutation
      act(() => {
        result.current.mutate({ id: 1, version: 'v1' });
      });

      // Start second mutation before first resolves
      act(() => {
        result.current.mutate({ id: 1, version: 'v2' });
      });

      // Resolve the second (latest) mutation first
      await act(async () => {
        resolveSecond!({ id: 1, version: 'v2-confirmed' });
      });

      // Data should reflect the second mutation
      await waitFor(() => {
        expect(result.current.data).toEqual({ id: 1, version: 'v2-confirmed' });
      });

      // Resolve the first (stale) mutation
      await act(async () => {
        resolveFirst!({ id: 1, version: 'v1-confirmed' });
      });

      // Data should still reflect the second mutation, not the stale first
      expect(result.current.data).toEqual({ id: 1, version: 'v2-confirmed' });
    });
  });
});
