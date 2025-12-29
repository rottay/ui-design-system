/**
 * Error Handling Module
 *
 * Provides centralized error handling for the design system
 * with categorization, severity levels, and subscription support.
 *
 * @example
 * ```tsx
 * import { useErrorHandler, ErrorCategory, ErrorSeverity } from '@rottay/design-system';
 *
 * const MyComponent = () => {
 *   const { reportError } = useErrorHandler({
 *     onError: (error) => console.log('Error:', error)
 *   });
 *
 *   const handleImageError = () => {
 *     reportError({
 *       code: 'IMAGE_LOAD_FAILED',
 *       message: 'Failed to load image',
 *       category: ErrorCategory.ASSET_LOAD,
 *       severity: ErrorSeverity.WARNING,
 *     });
 *   };
 *
 *   return <img onError={handleImageError} />;
 * };
 * ```
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
