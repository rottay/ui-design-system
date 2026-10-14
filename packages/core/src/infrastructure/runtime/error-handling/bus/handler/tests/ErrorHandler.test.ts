/**
 * Tests for the ErrorHandler singleton: reporting, subscriptions,
 * log trimming, immutable snapshots, and dev-mode console routing.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorHandler } from '..';
import { ErrorCategory, ErrorSeverity } from '@/foundation/contracts/runtime/errors';

function createError(code: string, category: ErrorCategory = ErrorCategory.UNKNOWN) {
  return {
    code,
    message: `${code} message`,
    category,
    severity: ErrorSeverity.ERROR,
  };
}

describe('ErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.resetInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a singleton instance', () => {
    expect(ErrorHandler.getInstance()).toBe(ErrorHandler.getInstance());
  });

  it('reports errors, adds timestamps, and exposes the latest error log', () => {
    const handler = ErrorHandler.getInstance();
    const error = handler.reportError(createError('E-001', ErrorCategory.THEME));

    expect(error.timestamp).toBeInstanceOf(Date);
    expect(handler.getLastError()?.code).toBe('E-001');
    expect(handler.getErrorsByCategory(ErrorCategory.THEME)).toHaveLength(1);
  });

  it('notifies category-specific and global subscribers without double-firing', () => {
    const handler = ErrorHandler.getInstance();
    const themeSubscriber = vi.fn();
    const allSubscriber = vi.fn();

    handler.subscribe('theme', themeSubscriber, ErrorCategory.THEME);
    handler.subscribe('all', allSubscriber, 'all');

    handler.reportError(createError('E-002', ErrorCategory.THEME));

    expect(themeSubscriber).toHaveBeenCalledTimes(1);
    expect(allSubscriber).toHaveBeenCalledTimes(1);
  });

  it('supports unsubscribe semantics', () => {
    const handler = ErrorHandler.getInstance();
    const subscriber = vi.fn();
    const unsubscribe = handler.subscribe('tenant', subscriber, ErrorCategory.TENANT);

    unsubscribe();
    handler.reportError(createError('E-003', ErrorCategory.TENANT));

    expect(subscriber).not.toHaveBeenCalled();
  });

  it('trims the in-memory log to the last 100 errors', () => {
    const handler = ErrorHandler.getInstance();

    for (let index = 0; index < 105; index += 1) {
      handler.reportError(createError(`E-${index}`));
    }

    const log = handler.getErrorLog();
    expect(log).toHaveLength(100);
    expect(log[0]?.code).toBe('E-5');
    expect(log.at(-1)?.code).toBe('E-104');
  });

  it('returns immutable snapshots and clears the log when requested', () => {
    const handler = ErrorHandler.getInstance();
    handler.reportError(createError('E-004'));

    const snapshot = handler.getErrorLog();
    expect(() => {
      (snapshot as unknown as Array<{ code: string }>).push({ code: 'mutate' });
    }).toThrow();

    handler.clearLog();
    expect(handler.getErrorLog()).toHaveLength(0);
    expect(handler.getLastError()).toBeUndefined();
  });

  it('logs with severity-specific console methods in development', () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    const handler = ErrorHandler.getInstance();
    handler.reportError({ ...createError('E-005'), severity: ErrorSeverity.ERROR });
    handler.reportError({ ...createError('E-006'), severity: ErrorSeverity.WARNING });
    handler.reportError({ ...createError('E-007'), severity: ErrorSeverity.INFO });

    expect(errorSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();

    process.env.NODE_ENV = env;
  });
});
