"use client";

/**
 * @fileoverview Container Component - Rottay Design System
 * @description A centered, max-width constrained layout container with configurable
 * padding and responsive breakpoints. Essential for creating consistent page layouts.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Container component provides a centered content wrapper with a maximum width,
 * commonly used as the main page layout wrapper. It ensures content doesn't stretch
 * too wide on large screens while remaining responsive on smaller devices.
 *
 * Key features:
 * - **Max-width presets**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
 * - **Custom max-width**: Support for numeric pixel values
 * - **Auto-centering**: Horizontally centers content with margin-auto
 * - **Padding presets**: Consistent internal spacing options
 * - **Fluid mode**: Full-width container without max-width constraint
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Classic**: Inline CSS styles for maximum compatibility
 * - **Modern**: Tailwind CSS classes (max-w-screen-*, mx-auto, p-*)
 * - **Rustic**: Pure inline CSS for dependency-free usage
 *
 * @example Basic Container
 * ```tsx
 * import { Container } from '@rottay/design-system';
 *
 * <Container>
 *   <h1>Page Title</h1>
 *   <p>Content is centered and constrained to 1024px (lg default)</p>
 * </Container>
 * ```
 *
 * @example Max-width Variants
 * ```tsx
 * import { Container } from '@rottay/design-system';
 *
 * // Narrow container for reading content
 * <Container maxWidth="sm">
 *   <article>Long-form content...</article>
 * </Container>
 *
 * // Wide container for dashboards
 * <Container maxWidth="xl">
 *   <Dashboard />
 * </Container>
 *
 * // Custom pixel width
 * <Container maxWidth={900}>
 *   <Form />
 * </Container>
 * ```
 *
 * @example Padding Options
 * ```tsx
 * import { Container } from '@rottay/design-system';
 *
 * // No padding (content extends to edges)
 * <Container padding="none">
 *   <FullWidthImage />
 * </Container>
 *
 * // Large padding for comfortable reading
 * <Container padding="lg">
 *   <TextContent />
 * </Container>
 *
 * // Custom pixel padding
 * <Container padding={32}>
 *   <Content />
 * </Container>
 * ```
 *
 * @example Fluid Container
 * ```tsx
 * import { Container } from '@rottay/design-system';
 *
 * // Full-width container (ignores maxWidth)
 * <Container fluid>
 *   <FullWidthBanner />
 * </Container>
 * ```
 *
 * @example Non-centered Container
 * ```tsx
 * import { Container } from '@rottay/design-system';
 *
 * // Left-aligned container (no auto margins)
 * <Container center={false} maxWidth="md">
 *   <Sidebar />
 * </Container>
 * ```
 *
 * @example Using with Engine Override
 * ```tsx
 * import { Container } from '@rottay/design-system';
 *
 * // Force Modern engine for Tailwind classes
 * <Container engine="modern" maxWidth="lg" padding="md">
 *   Outputs: class="max-w-screen-lg mx-auto p-4 w-full box-border"
 * </Container>
 * ```
 *
 * @see {@link Box} - For basic styled containers
 * @see {@link Grid} - For grid-based layouts
 * @see {@link Stack} - For stacking content vertically
 *
 * @module Container
 * @category Layout
 * @package @rottay/design-system
 */

import { createEngineComponent } from "../../../../infrastructure/runtime/engines/presentation/component-factory";
import type { ContainerProps } from "./contracts";

// ============================================================================
// TYPE AND CONSTANT EXPORTS
// ============================================================================

/**
 * Re-export all Container-related types and constants for external consumption.
 */
export {
  type ContainerProps,
  type ContainerMaxWidth,
  type ContainerPadding,
  CONTAINER_DEFAULTS,
  CONTAINER_MAX_WIDTHS,
  CONTAINER_PADDINGS,
} from "./contracts";

// ============================================================================
// ENGINE-AWARE COMPONENT
// ============================================================================

/**
 * The main Container component with automatic engine resolution.
 *
 * The engine is determined in this order:
 * 1. `engine` prop passed directly to the component
 * 2. Nearest `EngineProvider` in the component tree
 * 3. Default engine (Classic)
 *
 * @example
 * ```tsx
 * // Basic centered container
 * <Container maxWidth="lg" padding="md">
 *   Page content here
 * </Container>
 *
 * // Fluid full-width container
 * <Container fluid padding="lg">
 *   Full-width content
 * </Container>
 * ```
 */
export const Container = createEngineComponent<ContainerProps>("Container", {
  classic: () => import("./engines/classic"),
  modern: () => import("./engines/modern"),
  rustic: () => import("./engines/rustic"),
});

export default Container;
