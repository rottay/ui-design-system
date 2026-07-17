/**
 * useDraftSave Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDraftSave } from '../draft-save';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get _store() {
      return store;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useDraftSave', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('starts with initialData when no draft exists', () => {
      const { result } = renderHook(() =>
        useDraftSave({
          key: 'test-form',
          initialData: { name: '', email: '' },
        })
      );

      expect(result.current.data).toEqual({ name: '', email: '' });
      expect(result.current.hasDraft).toBe(false);
      expect(result.current.lastDraftAt).toBeNull();
    });
  });

  describe('Draft Persistence', () => {
    it('persists data to localStorage on setData', () => {
      const { result } = renderHook(() =>
        useDraftSave({
          key: 'persist-test',
          initialData: { title: '' },
        })
      );

      act(() => {
        result.current.setData({ title: 'My Draft' });
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(result.current.data).toEqual({ title: 'My Draft' });
      expect(result.current.hasDraft).toBe(true);
      expect(result.current.lastDraftAt).toBeInstanceOf(Date);
    });

    it('supports updater function in setData', () => {
      const { result } = renderHook(() =>
        useDraftSave({
          key: 'updater-test',
          initialData: { count: 0 },
        })
      );

      act(() => {
        result.current.setData((prev) => ({ count: prev.count + 1 }));
      });

      expect(result.current.data).toEqual({ count: 1 });

      act(() => {
        result.current.setData((prev) => ({ count: prev.count + 1 }));
      });

      expect(result.current.data).toEqual({ count: 2 });
    });

    it('uses ds-draft: prefix for storage key', () => {
      const { result } = renderHook(() =>
        useDraftSave({
          key: 'my-form',
          initialData: { v: 1 },
        })
      );

      act(() => {
        result.current.setData({ v: 2 });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ds-draft:my-form',
        expect.any(String)
      );
    });
  });

  describe('Draft Restoration', () => {
    it('auto-restores draft on mount when one exists', () => {
      // Pre-populate localStorage with a draft
      const draft = { data: { title: 'Restored Draft' }, savedAt: Date.now() };
      localStorageMock.setItem('ds-draft:restore-test', JSON.stringify(draft));
      vi.clearAllMocks();

      const { result } = renderHook(() =>
        useDraftSave({
          key: 'restore-test',
          initialData: { title: '' },
        })
      );

      expect(result.current.data).toEqual({ title: 'Restored Draft' });
      expect(result.current.hasDraft).toBe(true);
      expect(result.current.lastDraftAt).toBeInstanceOf(Date);
    });

    it('does not restore expired drafts', () => {
      // Draft saved 25 hours ago (past default 24h TTL)
      const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
      const draft = { data: { title: 'Old Draft' }, savedAt: twentyFiveHoursAgo };
      localStorageMock.setItem('ds-draft:expired-test', JSON.stringify(draft));
      vi.clearAllMocks();

      const { result } = renderHook(() =>
        useDraftSave({
          key: 'expired-test',
          initialData: { title: 'Fresh' },
        })
      );

      expect(result.current.data).toEqual({ title: 'Fresh' });
      expect(result.current.hasDraft).toBe(false);
    });

    it('respects custom TTL', () => {
      // Draft saved 2 hours ago
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      const draft = { data: { v: 1 }, savedAt: twoHoursAgo };
      localStorageMock.setItem('ds-draft:ttl-test', JSON.stringify(draft));
      vi.clearAllMocks();

      // TTL of 1 hour - draft should be expired
      const { result } = renderHook(() =>
        useDraftSave({
          key: 'ttl-test',
          initialData: { v: 0 },
          ttl: 1 * 60 * 60 * 1000,
        })
      );

      expect(result.current.data).toEqual({ v: 0 });
      expect(result.current.hasDraft).toBe(false);
    });

    it('restoreDraft() re-reads from localStorage', () => {
      const { result } = renderHook(() =>
        useDraftSave({
          key: 'manual-restore',
          initialData: { name: '' },
        })
      );

      // Manually write a draft to storage (simulate external update)
      const draft = { data: { name: 'External Draft' }, savedAt: Date.now() };
      localStorageMock.setItem('ds-draft:manual-restore', JSON.stringify(draft));

      act(() => {
        result.current.restoreDraft();
      });

      expect(result.current.data).toEqual({ name: 'External Draft' });
      expect(result.current.hasDraft).toBe(true);
    });
  });

  describe('Clear Draft', () => {
    it('removes draft from localStorage and resets to initialData', () => {
      // Pre-populate
      const draft = { data: { title: 'Draft' }, savedAt: Date.now() };
      localStorageMock.setItem('ds-draft:clear-test', JSON.stringify(draft));
      vi.clearAllMocks();

      const { result } = renderHook(() =>
        useDraftSave({
          key: 'clear-test',
          initialData: { title: '' },
        })
      );

      // Verify draft was restored
      expect(result.current.data).toEqual({ title: 'Draft' });
      expect(result.current.hasDraft).toBe(true);

      // Clear it
      act(() => {
        result.current.clearDraft();
      });

      expect(result.current.data).toEqual({ title: '' });
      expect(result.current.hasDraft).toBe(false);
      expect(result.current.lastDraftAt).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ds-draft:clear-test');
    });
  });

  describe('Corrupted Data Handling', () => {
    it('handles corrupted localStorage data gracefully', () => {
      // Write invalid JSON
      localStorageMock.setItem('ds-draft:corrupt-test', 'not-valid-json{{{');
      vi.clearAllMocks();

      const { result } = renderHook(() =>
        useDraftSave({
          key: 'corrupt-test',
          initialData: { safe: true },
        })
      );

      expect(result.current.data).toEqual({ safe: true });
      expect(result.current.hasDraft).toBe(false);
      // Should attempt to clean up the corrupted entry
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ds-draft:corrupt-test');
    });
  });

  describe('Multiple Instances', () => {
    it('different keys maintain independent drafts', () => {
      const { result: result1 } = renderHook(() =>
        useDraftSave({ key: 'form-a', initialData: { a: 1 } })
      );
      const { result: result2 } = renderHook(() =>
        useDraftSave({ key: 'form-b', initialData: { b: 2 } })
      );

      act(() => {
        result1.current.setData({ a: 10 });
      });

      expect(result1.current.data).toEqual({ a: 10 });
      expect(result2.current.data).toEqual({ b: 2 });
    });
  });
});
