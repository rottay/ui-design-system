/**
 * @fileoverview Anchor Compound Components - Rottay Design System
 * @description Re-exports all compound components for the Anchor primitive.
 *
 * @remarks
 * This barrel file provides convenient access to the Anchor compound
 * component. The AnchorLink component is designed to work within an
 * Anchor container to create navigation structures.
 *
 * **Component Hierarchy:**
 * ```
 * <Anchor>
 *   <Anchor.Link />  ← Navigation link to a page section
 *   <Anchor.Link>    ← Parent link with nested children
 *     <Anchor.Link />  ← Nested child link
 *     <Anchor.Link />  ← Nested child link
 *   </Anchor.Link>
 * </Anchor>
 * ```
 *
 * **Multi-Engine Support:**
 * The AnchorLink component uses the engine factory to automatically
 * render with the appropriate styling based on the configured engine
 * (Titan, Hermes, or Apollo).
 *
 * @example Basic Usage
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * <Anchor>
 *   <Anchor.Link href="#section1" title="Section 1" />
 *   <Anchor.Link href="#section2" title="Section 2" />
 *   <Anchor.Link href="#section3" title="Section 3" />
 * </Anchor>
 * ```
 *
 * @example Nested Navigation
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * <Anchor direction="vertical">
 *   <Anchor.Link href="#getting-started" title="Getting Started">
 *     <Anchor.Link href="#installation" title="Installation" />
 *     <Anchor.Link href="#configuration" title="Configuration" />
 *   </Anchor.Link>
 *   <Anchor.Link href="#api" title="API Reference">
 *     <Anchor.Link href="#components" title="Components" />
 *     <Anchor.Link href="#hooks" title="Hooks" />
 *   </Anchor.Link>
 * </Anchor>
 * ```
 *
 * @example Direct Import (Alternative)
 * ```tsx
 * import { AnchorLink } from '@rottay/design-system/components/primitives/navigation/Anchor/compound';
 *
 * // Can be used directly, though Anchor.Link is preferred
 * <AnchorLink href="#section" title="Section" />
 * ```
 *
 * @see {@link AnchorLinkProps} - Link component props
 * @see {@link Anchor} - Parent container component
 * @module Anchor/Compound
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import { createEngineComponent } from '../../../../../system/engines/factory';
import type { AnchorLinkProps } from '../types';

// ============================================================================
// Component Exports
// ============================================================================

/**
 * AnchorLink - Compound component for creating navigation links within an Anchor.
 *
 * @description
 * Creates a clickable navigation link that scrolls to a target section.
 * Supports nesting for hierarchical navigation structures.
 *
 * @remarks
 * - Automatically highlights when the corresponding section is in view
 * - Smooth scrolls to target on click
 * - Supports nested children for sub-navigation
 * - Inherits engine context from parent Anchor
 *
 * @param props - {@link AnchorLinkProps}
 * @returns Navigation link element
 *
 * @example Basic Link
 * ```tsx
 * <Anchor>
 *   <AnchorLink href="#section1" title="Section 1" />
 *   <AnchorLink href="#section2" title="Section 2">
 *     <AnchorLink href="#section2-1" title="Subsection 2.1" />
 *   </AnchorLink>
 * </Anchor>
 * ```
 */
export const AnchorLink = createEngineComponent<AnchorLinkProps>('Anchor.Link', {
  /** Ant Design link implementation */
  titan: () => import('../engines/titan').then(m => ({ default: m.Link })),
  /** DaisyUI/Tailwind link implementation */
  hermes: () => import('../engines/hermes').then(m => ({ default: m.Link })),
  /** Vanilla HTML/CSS link implementation */
  apollo: () => import('../engines/apollo').then(m => ({ default: m.Link })),
});

// ============================================================================
// Type Exports
// ============================================================================

export type { AnchorLinkProps };
