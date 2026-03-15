'use client';

/**
 * useErrorHandler - React hook for error handling
 */
import { useCallback, useEffect, useId } from 'react';
import { ErrorHandler } from './ErrorHandler';
import {
  DSError,
  DSErrorInput,
  UseErrorHandlerOptions,
  UseErrorHandlerReturn,
} from './types';

/**
 * React hook for interacting with the error handler.
 * Provides methods to report errors and optionally subscribe to error events.
 *
 * @param options - Configuration options
 * @returns Error handling utilities
 *
 * @example
 * ```tsx
 * const { reportError, getErrorLog } = useErrorHandler({
 *   category: 'ASSET_LOAD',
 *   onError: (error) => console.log('Asset error:', error)
 * });
 *
 * // Report an error
 * reportError({
 *   code: 'AVATAR_IMAGE_LOAD_FAILED',
 *   message: 'Failed to load avatar image',
 *   category: ErrorCategory.ASSET_LOAD,
 *   severity: ErrorSeverity.WARNING,
 * });
 * ```
 */
export function useErrorHandler(
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn {
  const { category = 'all', onError } = options;
  const subscriberId = useId();
  const errorHandler = ErrorHandler.getInstance();

  // Subscribe to errors if callback provided
  useEffect(() => {
    if (onError) {
      return errorHandler.subscribe(subscriberId, onError, category);
    }
    return undefined;
  }, [errorHandler, subscriberId, onError, category]);

  const reportError = useCallback(
    (error: DSErrorInput): DSError => {
      return errorHandler.reportError(error);
    },
    [errorHandler]
  );

  const getErrorLog = useCallback(() => {
    return errorHandler.getErrorLog();
  }, [errorHandler]);

  const clearLog = useCallback(() => {
    errorHandler.clearLog();
  }, [errorHandler]);

  return {
    reportError,
    getErrorLog,
    clearLog,
  };
}
