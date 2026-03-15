'use client';

/**
 * @fileoverview Anchor Component - Rottay Design System
 * @description A navigation component that creates links to sections within a page.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The Anchor component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - anchor styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * function TableOfContents() {
 *   return (
 *     <Anchor>
 *       <Anchor.Link href="#introduction" title="Introduction" />
 *       <Anchor.Link href="#features" title="Features" />
 *       <Anchor.Link href="#getting-started" title="Getting Started" />
 *       <Anchor.Link href="#api" title="API Reference" />
 *     </Anchor>
 *   );
 * }
 * ```
 *
 * @example Nested Links
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * <Anchor>
 *   <Anchor.Link href="#components" title="Components">
 *     <Anchor.Link href="#button" title="Button" />
 *     <Anchor.Link href="#input" title="Input" />
 *     <Anchor.Link href="#select" title="Select" />
 *   </Anchor.Link>
 *   <Anchor.Link href="#hooks" title="Hooks">
 *     <Anchor.Link href="#use-theme" title="useTheme" />
 *     <Anchor.Link href="#use-engine" title="useEngine" />
 *   </Anchor.Link>
 * </Anchor>
 * ```
 *
 * @example Different Directions
 * ```tsx
 * // Vertical navigation (default) - sidebar style
 * <Anchor direction="vertical">
 *   <Anchor.Link href="#section1" title="Section 1" />
 *   <Anchor.Link href="#section2" title="Section 2" />
 * </Anchor>
 *
 * // Horizontal navigation - tab style
 * <Anchor direction="horizontal">
 *   <Anchor.Link href="#overview" title="Overview" />
 *   <Anchor.Link href="#details" title="Details" />
 * </Anchor>
 * ```
 *
 * @example With Scroll Container
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * function ScrollableContent() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *
 *   return (
 *     <div style={{ display: 'flex' }}>
 *       <Anchor
 *         getContainer={() => containerRef.current!}
 *         offsetTop={20}
 *         onChange={(key) => console.log('Active:', key)}
 *       >
 *         <Anchor.Link href="#part-1" title="Part 1" />
 *         <Anchor.Link href="#part-2" title="Part 2" />
 *       </Anchor>
 *       <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
 *         {/* Scrollable content *\/}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Anchor automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Anchor>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *     <Anchor.Link href="#about" title="About Us" />
 *   </Anchor>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Anchor engine="modern">
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 *   <Anchor.Link href="#section" title="Section" />
 * </Anchor>
 * ```
 *
 * @see {@link AnchorProps} for complete prop documentation
 * @see {@link AnchorLinkProps} for link prop documentation
 * @see {@link AnchorLink} for the link compound component
 *
 * @module Anchor
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { AnchorProps, AnchorLinkProps } from './Anchor.types';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type AnchorProps,
  type AnchorLinkProps,
  ANCHOR_DEFAULTS,
} from './Anchor.types';

// ============================================================================
// Engine Component Factory
// ============================================================================

/**
 * Base Anchor component created via engine factory.
 * Automatically selects the appropriate engine implementation based on context.
 *
 * @internal
 */
const AnchorBase = createEngineComponent<AnchorProps>('Anchor', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic').then(m => ({ default: m.Anchor })),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern').then(m => ({ default: m.Anchor })),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Anchor })),
});

/**
 * Anchor.Link component for navigation items.
 * Created via engine factory for multi-engine support.
 *
 * @internal
 */
const Link = createEngineComponent<AnchorLinkProps>('Anchor.Link', {
  /** Ant Design link implementation */
  classic: () => import('./engines/classic').then(m => ({ default: m.Link })),
  /** DaisyUI/Tailwind link implementation */
  modern: () => import('./engines/modern').then(m => ({ default: m.Link })),
  /** Vanilla HTML/CSS link implementation */
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Link })),
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * Anchor component with multi-engine support and compound components.
 *
 * @description
 * A navigation component that creates links to page sections. Ideal for:
 * - Table of contents
 * - Sidebar navigation
 * - Documentation pages
 * - Long-form content navigation
 * - Single-page applications
 *
 * @remarks
 * - Automatically tracks scroll position and highlights active link
 * - Supports nested link hierarchies
 * - Can be affixed to viewport for sticky navigation
 * - Smooth scroll to target sections on click
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link AnchorProps}
 * @returns React component with Link compound component
 *
 * @example
 * ```tsx
 * <Anchor offsetTop={80} onChange={(key) => console.log(key)}>
 *   <Anchor.Link href="#intro" title="Introduction" />
 *   <Anchor.Link href="#features" title="Features">
 *     <Anchor.Link href="#feature-1" title="Feature 1" />
 *     <Anchor.Link href="#feature-2" title="Feature 2" />
 *   </Anchor.Link>
 * </Anchor>
 * ```
 */
export const Anchor = Object.assign(AnchorBase, {
  /**
   * Link component for anchor navigation items.
   * Creates clickable links that scroll to target sections.
   * @see {@link AnchorLinkProps}
   */
  Link,
});

export default Anchor;
