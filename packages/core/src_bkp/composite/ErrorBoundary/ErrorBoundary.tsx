import { Component, ErrorInfo } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './types';
import { DefaultErrorFallback } from './DefaultErrorFallback';

/**
 * ErrorBoundary Component
 *
 * React Error Boundary that catches JavaScript errors anywhere in the component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error, errorInfo) => console.error(error, errorInfo)}
 *   fallback={<div>Custom error UI</div>}
 * >
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary';
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
    });

    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, className, style } = this.props;

    if (hasError && error) {
      // Render custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError);
        }
        return fallback;
      }

      // Render default fallback
      return (
        <div className={className} style={style}>
          <DefaultErrorFallback error={error} resetError={this.resetError} />
        </div>
      );
    }

    // No error, render children normally
    return children;
  }
}
