/**
 * @fileoverview Error handling barrel - Rottay Design System
 * @description Public entry point exporting the ErrorHandler singleton, useErrorHandler
 * hook, error categories, severity levels, and related type definitions.
 *
 * @module System/Errors
 * @category System
 * @package @rottay/design-system
 */

// Types
export {
  ErrorCategory,
  ErrorSeverity,
  type DSError,
  type DSErrorInput,
  type ErrorSubscriber,
  type UseErrorHandlerOptions,
  type UseErrorHandlerReturn,
} from './types';

// Handler
export { ErrorHandler } from './ErrorHandler';

// Hook
export { useErrorHandler } from './useErrorHandler';
