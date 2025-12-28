/**
 * @fileoverview Spinner Component - Rottay Design System
 * @description A loading indicator component that provides visual feedback during async operations.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Spinner component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Titan (Ant Design), Hermes (DaisyUI), and Apollo
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - spinner styling automatically adapts
 * to your tenant's brand colors, sizing, and animation tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { Spinner } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   return (
 *     <div>
 *       <Spinner />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Label
 * ```tsx
 * import { Spinner } from '@rottay/design-system';
 *
 * function LoadingState() {
 *   return (
 *     <Spinner size="lg" label="Loading data..." />
 *   );
 * }
 * ```
 *
 * @example Different Sizes
 * ```tsx
 * // Small spinner for inline loading
 * <Spinner size="sm" />
 *
 * // Medium spinner (default)
 * <Spinner size="md" />
 *
 * // Large spinner for page loading
 * <Spinner size="lg" />
 *
 * // Extra large spinner for full-page overlays
 * <Spinner size="xl" />
 * ```
 *
 * @example Custom Color
 * ```tsx
 * // Using brand color
 * <Spinner color="#8b5cf6" size="lg" />
 *
 * // Using CSS variable
 * <Spinner color="var(--color-primary)" />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Spinner automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Spinner size="lg" label="Processing..." />
 *   {/* Uses ACME Corp's brand colors and styling *\/}
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Spinner engine="hermes" size="lg" />
 * // Renders with DaisyUI/Tailwind styling
 *
 * <Spinner engine="apollo" size="lg" color="#1890ff" />
 * // Renders with pure CSS animation
 * ```
 *
 * @example Loading Button Pattern
 * ```tsx
 * import { Button, Spinner } from '@rottay/design-system';
 *
 * function SubmitButton({ isLoading }) {
 *   return (
 *     <Button disabled={isLoading}>
 *       {isLoading ? <Spinner size="sm" /> : 'Submit'}
 *     </Button>
 *   );
 * }
 * ```
 *
 * @see {@link SpinnerProps} for complete prop documentation
 * @see {@link SpinnerSize} for available size options
 * @see {@link Progress} for determinate loading indicators
 * @see {@link Skeleton} for content placeholder loading
 *
 * @module Spinner
 * @category Feedback
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { SpinnerProps } from './types';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type SpinnerProps,
  type SpinnerSize,
  SPINNER_DEFAULTS,
  SIZE_MAP,
} from './types';

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Main Component
// ============================================================================

/**
 * Spinner component with multi-engine support.
 *
 * @description
 * A loading indicator that provides visual feedback during async operations. Ideal for:
 * - Page and content loading states
 * - Button loading indicators
 * - Form submission feedback
 * - Data fetching indicators
 * - Async action feedback
 *
 * @remarks
 * - Supports four size variants (sm, md, lg, xl)
 * - Customizable color for brand consistency
 * - Optional label for accessibility and context
 * - Smooth CSS animations for performance
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link SpinnerProps}
 * @returns React component with animated loading indicator
 *
 * @example
 * ```tsx
 * <Spinner size="lg" label="Loading..." />
 * ```
 */
export const Spinner = createEngineComponent<SpinnerProps>('Spinner', {
  /** Ant Design implementation - uses Spin component with native animations */
  titan: () => import('./engines/titan'),
  /** DaisyUI/Tailwind implementation - utility-first with loading classes */
  hermes: () => import('./engines/hermes'),
  /** Vanilla HTML/CSS implementation - pure CSS keyframe animations */
  apollo: () => import('./engines/apollo'),
});
