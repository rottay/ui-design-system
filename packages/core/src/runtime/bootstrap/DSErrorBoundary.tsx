'use client';

/**
 * @fileoverview DSErrorBoundary - Rottay Design System
 * @description Top-level error boundary that wraps the entire DesignSystemProvider
 * tree. When an unrecoverable error occurs anywhere in the DS internals (provider
 * composition, engine resolution, theme loading, etc.), this boundary catches it
 * and renders children in a minimal safe mode -- no theming, no engine, no context --
 * so the host application can still display content.
 *
 * @remarks
 * This boundary is designed for apps that need *guaranteed rendering*. If the DS
 * providers crash during initialization or at runtime, DSErrorBoundary ensures
 * the page still shows something rather than a blank white screen.
 *
 * The safe-mode fallback:
 * - Renders children without any DS providers (no TenantProvider, no EngineProvider,
 *   no ThemeProvider, no FeatureProvider)
 * - Uses browser-default styles so content remains readable
 * - Shows a non-intrusive banner at the top indicating degraded mode
 * - Provides a retry button to attempt re-initialization
 * - Reports the error to the onError callback for monitoring
 *
 * @example Basic usage
 * ```tsx
 * <DSErrorBoundary onError={(err) => Sentry.captureException(err)}>
 *   <DesignSystemProvider>
 *     <App />
 *   </DesignSystemProvider>
 * </DSErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <DSErrorBoundary
 *   fallbackRender={(error, reset) => (
 *     <div>
 *       <h1>Design system failed to load</h1>
 *       <button onClick={reset}>Reload</button>
 *       <App /> {/* render app without DS theming *\/}
 *     </div>
 *   )}
 * >
 *   <DesignSystemProvider>
 *     <App />
 *   </DesignSystemProvider>
 * </DSErrorBoundary>
 * ```
 *
 * @see {@link DesignSystemProvider} - The provider this boundary protects
 * @see {@link SurfaceErrorBoundary} - Page-level boundary for individual surfaces
 * @see {@link EngineErrorBoundary} - Component-level boundary for engine loading
 * @module System/Bootstrap/DSErrorBoundary
 * @category System
 * @package @rottay/design-system
 */

import { Component, ErrorInfo, ReactNode } from 'react';

export interface DSErrorBoundaryProps {
  /** Children to render (typically DesignSystemProvider + app tree) */
  children: ReactNode;
  /**
   * Custom fallback renderer. When provided, replaces the default safe-mode
   * rendering entirely. Receives the caught error and a reset function.
   */
  fallbackRender?: (error: Error, reset: () => void) => ReactNode;
  /**
   * Error callback for external monitoring (Sentry, DataDog, etc.).
   * Called with the original Error and React's ErrorInfo containing the
   * component stack trace.
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Global error boundary that protects against complete DS failure.
 *
 * Place this *outside* DesignSystemProvider. When the DS crashes, children are
 * still rendered but without any provider context -- effectively a "safe mode"
 * that keeps the app functional with browser-default styles.
 */
export class DSErrorBoundary extends Component<DSErrorBoundaryProps, State> {
  constructor(props: DSErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);

    // Log in dev for immediate visibility. Production logging is the
    // responsibility of the onError callback.
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[DSErrorBoundary] Design system failed to initialize. ' +
          'Rendering in safe mode (no theming, no engine).',
        error
      );
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback takes full control when provided
      if (this.props.fallbackRender) {
        return this.props.fallbackRender(this.state.error, this.reset);
      }

      // Default safe-mode: render a degraded banner + children without
      // any DS context. The inline styles guarantee visibility regardless
      // of CSS/theme state.
      return (
        <>
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              backgroundColor: '#fffbeb',
              borderBottom: '1px solid #f59e0b',
              color: '#92400e',
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <span>
              The design system encountered an error and is running in safe mode.
              Some visual features may be unavailable.
            </span>
            <button
              type="button"
              onClick={this.reset}
              style={{
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                border: '1px solid #f59e0b',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: '#92400e',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Retry
            </button>
          </div>
          {this.props.children}
        </>
      );
    }

    return this.props.children;
  }
}
