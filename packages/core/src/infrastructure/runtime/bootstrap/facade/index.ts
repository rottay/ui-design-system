/**
 * @fileoverview Bootstrap barrel - Rottay Design System
 * @description Canonical entry point for wiring the full design system runtime
 * into a React application. Exports the root provider and CSS variable bridge.
 *
 * @module System/Bootstrap
 * @category System
 * @package @rottay/design-system
 */
export { DesignSystemProvider } from './react/provider';
export type { DesignSystemProviderProps } from './react/provider';
export { SystemCssVariablesBridge } from '@/infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge';
export { DSErrorBoundary } from '../presentation/boundaries/system-error';
export type { DSErrorBoundaryProps } from '../presentation/boundaries/system-error';
