/**
 * Engine Error Boundary
 * Handles errors during engine component loading with fallback support
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import type { EngineName } from '../../../types';

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
 *   fallbackEngine="apollo"
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
    console.error('[EngineErrorBoundary] Engine loading failed:', error);
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
            color: '#dc2626',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
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
