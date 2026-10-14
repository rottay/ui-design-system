/**
 * Tests for the useErrorHandler hook: reporting through the shared singleton,
 * category-scoped subscriptions with cleanup on unmount, and log clearing.
 */
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCategory, ErrorSeverity } from '@/foundation/contracts/runtime/errors';
import { ErrorHandler } from '../../../../runtime/handler';
import { useErrorHandler } from '..';

describe('useErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.resetInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports errors through the shared handler instance', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.reportError({
        code: 'HOOK-001',
        message: 'Hook reported error',
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.ERROR,
      });
    });

    expect(result.current.getErrorLog()).toHaveLength(1);
    expect(result.current.getErrorLog()[0]?.code).toBe('HOOK-001');
  });

  it('subscribes to category-specific events and unsubscribes on cleanup', async () => {
    const onError = vi.fn();
    const { unmount } = renderHook(() =>
      useErrorHandler({
        category: ErrorCategory.NETWORK,
        onError,
      })
    );

    act(() => {
      ErrorHandler.getInstance().reportError({
        code: 'HOOK-002',
        message: 'Network issue',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.WARNING,
      });
    });

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));

    unmount();

    act(() => {
      ErrorHandler.getInstance().reportError({
        code: 'HOOK-003',
        message: 'Second network issue',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.WARNING,
      });
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('exposes a clearLog helper bound to the singleton handler', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    const { result } = renderHook(() => useErrorHandler(), { wrapper });

    act(() => {
      result.current.reportError({
        code: 'HOOK-004',
        message: 'Clear me',
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.INFO,
      });
    });

    expect(result.current.getErrorLog()).toHaveLength(1);

    act(() => {
      result.current.clearLog();
    });

    expect(result.current.getErrorLog()).toHaveLength(0);
  });
});
