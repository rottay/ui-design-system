/**
 * @fileoverview BackTop Component - Rottay Design System
 * @description A floating button that scrolls the page back to the top when clicked.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The BackTop component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Titan (Ant Design), Hermes (DaisyUI), and Apollo
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - BackTop styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   return (
 *     <div>
 *       <LongContent />
 *       <BackTop />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Custom Visibility Height
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 *
 * // Show button after scrolling 200px
 * <BackTop visibilityHeight={200} />
 * ```
 *
 * @example Custom Target Container
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 *
 * function ScrollableContainer() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *
 *   return (
 *     <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
 *       <LongContent />
 *       <BackTop target={() => containerRef.current!} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Custom Icon
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 * import { ArrowUpIcon } from '@rottay/icons';
 *
 * <BackTop>
 *   <ArrowUpIcon size={24} />
 * </BackTop>
 * ```
 *
 * @example With Click Handler
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 *
 * <BackTop
 *   onClick={(e) => {
 *     console.log('Scrolled to top!');
 *     // Analytics tracking, etc.
 *   }}
 * />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // BackTop automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <BackTop />
 *   {/* Uses ACME Corp's brand colors and styling *\/}
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <BackTop engine="hermes" />
 * {/* Renders with DaisyUI/Tailwind styling *\/}
 * ```
 *
 * @see {@link BackTopProps} for complete prop documentation
 * @see {@link FloatButton} for related floating button component
 * @see {@link Anchor} for anchor navigation component
 *
 * @module BackTop
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { BackTopProps } from './types';

// ============================================================================
// Type Exports
// ============================================================================

export { type BackTopProps, BACKTOP_DEFAULTS } from './types';

// ============================================================================
// Main Component
// ============================================================================

/**
 * BackTop component with multi-engine support.
 *
 * @description
 * A floating button that appears after scrolling past a certain point and
 * smoothly scrolls the page back to the top when clicked. Ideal for:
 * - Long content pages
 * - Blog posts and articles
 * - Product listings
 * - Documentation pages
 * - Any scrollable content
 *
 * @remarks
 * - Automatically shows/hides based on scroll position
 * - Supports custom scroll containers via target prop
 * - Smooth scroll animation included
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link BackTopProps}
 * @returns React component
 *
 * @example
 * ```tsx
 * <BackTop visibilityHeight={300} duration={500} />
 * ```
 */
export const BackTop = createEngineComponent<BackTopProps>('BackTop', {
  /** Ant Design implementation - uses FloatButton.BackTop with full animations */
  titan: () => import('./engines/titan'),
  /** DaisyUI/Tailwind implementation - utility-first styling with btn classes */
  hermes: () => import('./engines/hermes'),
  /** Vanilla HTML/CSS implementation - zero dependencies, maximum control */
  apollo: () => import('./engines/apollo'),
});

export default BackTop;
