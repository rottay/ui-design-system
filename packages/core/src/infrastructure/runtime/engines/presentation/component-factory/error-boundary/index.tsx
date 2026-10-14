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
 * The default fallback renders after an engine failed to load, so it resolves
 * nothing through the engine loader: it is plain elements styled only by
 * `--ds-*` custom properties, with catalog copy when an i18n provider is
 * mounted and English literals otherwise. Raw structural elements here are a
 * documented exception to the no-raw-HTML rule: a primitive resolved through an
 * engine could fail again inside the fallback.
 *
 * @see {@link createEngineComponent} - Uses this boundary internally
 * @module System/Engines/Boundary/EngineErrorBoundary
 * @category System
 * @package @rottay/design-system
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import type { CSSProperties } from 'react';
import { errorInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n/composition/translation';
import { ErrorHandler } from '../../../../error-handling/bus/handler';
import { ErrorCategory, ErrorSeverity } from '@/foundation/contracts/runtime/errors';

const FALLBACK_TITLE_KEY = 'errors.generic';
const FALLBACK_TITLE = 'An unexpected error occurred';
const FALLBACK_RETRY_KEY = 'components.surfaces.states.retry';
const FALLBACK_RETRY = 'Try again';

const FALLBACK_ROOT_STYLE: CSSProperties = {
  padding: 'var(--ds-spacing-4)',
  color: 'var(--ds-color-error-700, var(--ds-color-error))',
  background: 'var(--ds-color-error-bg)',
  borderWidth: 'var(--ds-border-width-thin, var(--ds-border-width-1))',
  borderStyle: 'solid',
  borderColor: 'var(--ds-color-error-border, var(--ds-color-error))',
  borderRadius: 'var(--ds-radius-sm)',
};

const FALLBACK_DETAIL_STYLE: CSSProperties = {
  marginTop: 'var(--ds-spacing-2)',
  fontSize: 'var(--ds-font-size-xs)',
};

const FALLBACK_ACTIONS_STYLE: CSSProperties = {
  marginTop: 'var(--ds-spacing-3)',
};

const FALLBACK_RETRY_STYLE: CSSProperties = {
  padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
  font: 'inherit',
  fontSize: 'var(--ds-font-size-sm)',
  cursor: 'pointer',
  borderWidth: 'var(--ds-border-width-thin, var(--ds-border-width-1))',
  borderStyle: 'solid',
  borderColor: 'var(--ds-color-error-border, var(--ds-color-error))',
  borderRadius: 'var(--ds-radius-sm)',
  background: 'none',
  color: 'inherit',
};

function EngineErrorFallback({ error, onRetry }: { error?: Error; onRetry: () => void }) {
  const i18n = useOptionalTranslation();
  const copy = (key: string, literal: string): string => {
    try {
      return i18n?.tOr(key, literal) ?? literal;
    } catch {
      return literal;
    }
  };

  return (
    <div role="alert" style={FALLBACK_ROOT_STYLE}>
      <strong>{copy(FALLBACK_TITLE_KEY, FALLBACK_TITLE)}</strong>
      {error?.message ? <div style={FALLBACK_DETAIL_STYLE}>{error.message}</div> : null}
      <div style={FALLBACK_ACTIONS_STYLE}>
        <button type="button" onClick={onRetry} style={FALLBACK_RETRY_STYLE}>
          {copy(FALLBACK_RETRY_KEY, FALLBACK_RETRY)}
        </button>
      </div>
    </div>
  );
}

export interface EngineErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
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

    // Report to the centralized error handler so subscribers (Sentry, etc.)
    // receive structured engine-level errors automatically.
    ErrorHandler.getInstance().reportError({
      code: 'ENGINE_COMPONENT_LOAD_FAILED',
      message: error.message,
      technicalMessage: errorInfo.componentStack ?? undefined,
      category: ErrorCategory.ENGINE,
      severity: ErrorSeverity.ERROR,
      component: 'EngineErrorBoundary',
      originalError: error,
    });
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

      return <EngineErrorFallback error={this.state.error} onRetry={this.reset} />;
    }

    return this.props.children;
  }
}
