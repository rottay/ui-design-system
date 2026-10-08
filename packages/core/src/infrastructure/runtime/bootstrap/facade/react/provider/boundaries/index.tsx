import React, { ReactNode, memo } from 'react';

/**
 * Simple loading component - minimal to avoid SSR issues
 */
export const LoadingScreen: React.FC = () => null;

/**
 * Memoized children boundary.
 *
 * Prevents the entire children subtree from re-rendering when a provider
 * higher in the composition chain re-renders due to its own state changes
 * (e.g., ThemeProvider loading state). Children will only re-render when
 * they consume a context whose value actually changed.
 */
export const MemoizedChildren = memo(function MemoizedChildren({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
});
