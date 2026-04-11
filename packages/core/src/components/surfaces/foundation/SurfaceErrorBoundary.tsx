'use client';

/**
 * @fileoverview SurfaceErrorBoundary - Rottay Design System
 * @description Error boundary scoped to individual surface components. Catches
 * runtime crashes inside a surface (list, dashboard, detail, etc.) and renders
 * a user-friendly fallback with a retry button while keeping the surrounding
 * page chrome (header, sidebar, navigation) intact.
 *
 * @remarks
 * Design goals:
 * - **Isolation**: A single crashing surface does not take down the whole page.
 * - **Retry**: The fallback includes a retry button that resets the boundary.
 * - **Reporting**: Errors are forwarded to the centralized ErrorHandler and an
 *   optional `onError` callback so monitoring tools (Sentry, etc.) can track them.
 * - **Minimal footprint**: The fallback uses inline styles so it renders even
 *   when the theming provider itself is the crash source.
 *
 * @example Wrapping a single surface
 * ```tsx
 * <SurfaceErrorBoundary surfaceName="billing" onError={captureException}>
 *   <BillingSurface config={billingConfig} />
 * </SurfaceErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <SurfaceErrorBoundary
 *   surfaceName="dashboard"
 *   fallbackRender={(error, reset) => (
 *     <Card>
 *       <Text>Dashboard failed to load</Text>
 *       <Button onClick={reset}>Try Again</Button>
 *     </Card>
 *   )}
 * >
 *   <DashboardSurface config={dashboardConfig} />
 * </SurfaceErrorBoundary>
 * ```
 *
 * @see {@link EngineErrorBoundary} - Lower-level boundary for engine component loading
 * @see {@link DSErrorBoundary} - Top-level boundary that wraps the entire DS provider
 * @module System/Surfaces/SurfaceErrorBoundary
 * @category System
 * @package @rottay/design-system
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorHandler } from '../../../_internal/errors/ErrorHandler';
import { ErrorCategory, ErrorSeverity } from '../../../_internal/errors/types';
import { errorInDev } from '../../../_internal/utils/runtime-logger';

export interface SurfaceErrorBoundaryProps {
  /** Child components (the surface being wrapped) */
  children: ReactNode;
  /**
   * Name of the surface being protected. Used in error reports to identify
   * which part of the page failed. E.g. 'billing', 'dashboard', 'list'.
   */
  surfaceName?: string;
  /** Custom fallback UI render function */
  fallbackRender?: (error: Error, reset: () => void) => ReactNode;
  /** Error callback for external logging/monitoring */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary that wraps individual surface components to prevent a crash
 * in one surface from cascading to the rest of the page.
 *
 * The default fallback renders a contained error card with:
 * - A clear error message identifying the surface
 * - The underlying error description
 * - A retry button that resets the boundary state
 */
export class SurfaceErrorBoundary extends Component<SurfaceErrorBoundaryProps, State> {
  constructor(props: SurfaceErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const surfaceLabel = this.props.surfaceName ?? 'unknown';

    errorInDev(
      `[SurfaceErrorBoundary] Surface "${surfaceLabel}" crashed:`,
      error
    );

    // Forward to the external callback so apps can pipe to Sentry, etc.
    this.props.onError?.(error, errorInfo);

    // Report to the centralized ErrorHandler for in-memory tracking and
    // subscriber notification.
    ErrorHandler.getInstance().reportError({
      code: 'SURFACE_RUNTIME_ERROR',
      message: `Surface "${surfaceLabel}" crashed: ${error.message}`,
      technicalMessage: errorInfo.componentStack ?? undefined,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      component: `SurfaceErrorBoundary(${surfaceLabel})`,
      originalError: error,
      metadata: {
        surfaceName: surfaceLabel,
      },
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback takes priority when provided
      if (this.props.fallbackRender) {
        return this.props.fallbackRender(this.state.error, this.reset);
      }

      const surfaceLabel = this.props.surfaceName ?? 'This section';

      // Default fallback uses inline styles so it renders correctly even when
      // the theming provider or CSS variables are unavailable.
      return (
        <div
          style={{
            padding: '24px',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            {surfaceLabel} encountered an error
          </div>
          <div
            style={{
              fontSize: '14px',
              opacity: 0.8,
              marginBottom: '16px',
              lineHeight: 1.5,
            }}
          >
            {this.state.error.message}
          </div>
          <button
            type="button"
            onClick={this.reset}
            style={{
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#991b1b',
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
