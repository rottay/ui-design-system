'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface SpatialErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError(error: unknown): void;
  resetKey: number;
}

interface SpatialErrorBoundaryState {
  failed: boolean;
  resetKey: number;
}

export class SpatialErrorBoundary extends Component<
  SpatialErrorBoundaryProps,
  SpatialErrorBoundaryState
> {
  state: SpatialErrorBoundaryState = {
    failed: false,
    resetKey: this.props.resetKey,
  };

  static getDerivedStateFromError(): Partial<SpatialErrorBoundaryState> {
    return { failed: true };
  }

  static getDerivedStateFromProps(
    props: SpatialErrorBoundaryProps,
    state: SpatialErrorBoundaryState,
  ): Partial<SpatialErrorBoundaryState> | null {
    if (props.resetKey === state.resetKey) return null;
    return { failed: false, resetKey: props.resetKey };
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onError(error);
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
