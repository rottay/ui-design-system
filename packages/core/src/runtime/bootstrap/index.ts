/**
 * @fileoverview Bootstrap barrel - Rottay Design System
 * @description Canonical entry point for wiring the full design system runtime
 * into a React application. Exports the root provider and CSS variable bridge.
 *
 * @module System/Bootstrap
 * @category System
 * @package @rottay/design-system
 */
export { DesignSystemProvider } from './DesignSystemProvider';
export type { DesignSystemProviderProps } from './DesignSystemProvider';
export { SystemCssVariablesBridge } from './SystemCssVariablesBridge';
export { DSErrorBoundary } from './DSErrorBoundary';
export type { DSErrorBoundaryProps } from './DSErrorBoundary';
