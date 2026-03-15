'use client';

/**
 * @fileoverview EngineErrorBoundary Component - Rottay Design System
 * @description React error boundary that catches and handles errors during
 * engine component loading, providing graceful degradation and fallback support.
 *
 * @remarks
 * The EngineErrorBoundary provides:
 *
 * - **Error catching**: Catches errors from lazy-loaded engine components
 * - **Fallback UI**: Displays error message with optional custom render
 * - **Reset capability**: Allows retry after error recovery
 * - **Error reporting**: Callback for logging/monitoring integration
 * - **Fallback engine**: Option to try a different engine on failure
 *
 * This boundary is used internally by `createEngineComponent` but can also
 * be used directly for custom error handling scenarios.
 *
 * @example Basic usage
 * ```tsx
 * <EngineErrorBoundary
 *   onError={(error) => logToSentry(error)}
 * >
 *   <LazyLoadedComponent />
 * </EngineErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <EngineErrorBoundary
 *   fallbackRender={(error, reset) => (
 *     <div>
 *       <p>Failed to load: {error.message}</p>
 *       <button onClick={reset}>Retry</button>
 *     </div>
 *   )}
 * >
 *   <Component />
 * </EngineErrorBoundary>
 * ```
 *
 * @see {@link createEngineComponent} - Uses this boundary internally
 * @module System/Engines/Boundary/EngineErrorBoundary
 * @category System
 * @package @rottay/design-system
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import type { EngineName } from '../../types';
import { errorInDev } from '../../utils/runtime-logger';

export interface EngineErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Fallback engine to try if primary fails */
  fallbackEngine?: EngineName;
  /** Custom fallback UI render function */
  fallbackRender?: (error: Error, reset: () => void) => ReactNode;
  /** Error callback for logging/monitoring */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component for engine loading failures
 * Catches errors during component lazy loading and provides fallback UI
 *
 * @example
 * ```tsx
 * <EngineErrorBoundary
 *   fallbackEngine="rustic"
 *   onError={(error) => console.error('Engine failed:', error)}
 * >
 *   <Button>Click me</Button>
 * </EngineErrorBoundary>
 * ```
 */
export class EngineErrorBoundary extends Component<EngineErrorBoundaryProps, State> {
  constructor(props: EngineErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorInDev('[EngineErrorBoundary] Engine loading failed:', error);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallbackRender && this.state.error) {
        return this.props.fallbackRender(this.state.error, this.reset);
      }

      // Default error UI
      return (
        <div
          style={{
            padding: '16px',
            color: 'var(--ds-color-error-700)',
            background: 'var(--ds-color-error-bg)',
            border: '1px solid var(--ds-color-error-border)',
            borderRadius: 'var(--ds-radius-sm)',
          }}
        >
          <strong>Engine Error:</strong> Failed to load component.
          {this.props.fallbackEngine && (
            <span> Attempting fallback to {this.props.fallbackEngine}...</span>
          )}
          {this.state.error && (
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
              {this.state.error.message}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
