'use client';

/**
 * @fileoverview useErrorHandler hook - Rottay Design System
 * @description React hook providing component-level access to the centralized
 * ErrorHandler for reporting errors and subscribing to error events.
 *
 * @module System/Errors/useErrorHandler
 * @category System
 * @package @rottay/design-system
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
  // useId generates a stable, unique ID per component instance. This is used
  // as the subscriber key so that each component's subscription is independent
  // and automatically cleaned up when the component unmounts.
  const subscriberId = useId();
  const errorHandler = ErrorHandler.getInstance();

  // Subscription is optional so components can use the hook only for reporting
  // without becoming long-lived listeners.
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
