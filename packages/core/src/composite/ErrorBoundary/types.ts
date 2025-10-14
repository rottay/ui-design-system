import type { ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}
