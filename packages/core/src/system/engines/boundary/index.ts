/**
 * @fileoverview Engine Error Boundary - Rottay Design System
 * @description React error boundary for graceful handling of engine loading
 * failures, with optional fallback to alternative engines.
 *
 * @remarks
 * The error boundary provides:
 * - **Graceful degradation**: Catches rendering errors in engine components
 * - **Fallback engine**: Optionally switch to a different engine on failure
 * - **Error reporting**: Callback for error tracking and logging
 * - **Recovery**: Allows app to continue functioning despite failures
 *
 * @example Basic usage (internal)
 * ```tsx
 * <EngineErrorBoundary
 *   fallbackEngine="apollo"
 *   onError={(error, info) => logToSentry(error, info)}
 * >
 *   <EngineComponent />
 * </EngineErrorBoundary>
 * ```
 *
 * @see {@link createEngineComponent} - Uses this internally
 * @module System/Engines/Boundary
 * @category System
 * @package @rottay/design-system
 */

export { EngineErrorBoundary } from './EngineErrorBoundary';
export type { EngineErrorBoundaryProps } from './EngineErrorBoundary';
