'use client';

/**
 * @fileoverview Divider Component - Rottay Design System
 * @description A visual separator that creates horizontal or vertical lines to divide
 * content sections. Supports optional text labels, various line styles (solid, dashed,
 * dotted), and configurable thickness and spacing.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Divider component provides visual separation between content areas, improving
 * readability and creating clear content boundaries. It supports:
 * - Horizontal and vertical orientations
 * - Optional text content with configurable positioning
 * - Multiple line styles (solid, dashed, dotted)
 * - Customizable thickness and spacing
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Titan**: Ant Design-compatible styling with `ant-divider` class structure
 * - **Hermes**: DaisyUI-compatible styling with `divider` classes
 * - **Apollo**: Pure HTML/CSS with ARIA `separator` role for accessibility
 *
 * @example Basic Horizontal Divider
 * ```tsx
 * import { Divider } from '@rottay/design-system';
 *
 * <article>
 *   <h2>Section 1</h2>
 *   <p>Content for section 1...</p>
 *   <Divider />
 *   <h2>Section 2</h2>
 *   <p>Content for section 2...</p>
 * </article>
 * ```
 *
 * @example Divider with Text
 * ```tsx
 * import { Divider } from '@rottay/design-system';
 *
 * // Centered text (default)
 * <Divider>OR</Divider>
 *
 * // Left-aligned text
 * <Divider textPosition="left">Chapter 1</Divider>
 *
 * // Right-aligned text
 * <Divider textPosition="right">See more</Divider>
 * ```
 *
 * @example Line Styles
 * ```tsx
 * import { Divider } from '@rottay/design-system';
 *
 * // Solid line (default)
 * <Divider variant="solid" />
 *
 * // Dashed line
 * <Divider variant="dashed" />
 * <Divider dashed />  // Shorthand for variant="dashed"
 *
 * // Dotted line
 * <Divider variant="dotted" />
 * ```
 *
 * @example Vertical Divider
 * ```tsx
 * import { Divider, Flex } from '@rottay/design-system';
 *
 * // Vertical separator in a flex container
 * <Flex align="center" gap={16} style={{ height: '100px' }}>
 *   <span>Left content</span>
 *   <Divider orientation="vertical" />
 *   <span>Right content</span>
 * </Flex>
 * ```
 *
 * @example Custom Thickness and Color
 * ```tsx
 * import { Divider } from '@rottay/design-system';
 *
 * // Thick colored divider
 * <Divider
 *   thickness="thick"
 *   color="#3b82f6"
 *   spacing="lg"
 * />
 *
 * // Custom pixel thickness
 * <Divider thickness={4} color="red" />
 * ```
 *
 * @example Using with Engine Override
 * ```tsx
 * import { Divider } from '@rottay/design-system';
 *
 * // Force Hermes engine for DaisyUI classes
 * <Divider engine="hermes">Section</Divider>
 * ```
 *
 * @see {@link Stack} - For stacking with automatic dividers
 * @see {@link Box} - For container layouts
 *
 * @module Divider
 * @category Layout
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { DividerProps } from './types';

// ============================================================================
// TYPE AND CONSTANT EXPORTS
// ============================================================================

/**
 * Re-export all Divider-related types and constants for external consumption.
 */
export {
  type DividerProps,
  type DividerOrientation,
  type DividerVariant,
  type DividerTextPosition,
  type DividerThickness,
  type DividerThicknessPreset,
  type DividerSpacing,
  DIVIDER_DEFAULTS,
  SPACING_MAP,
  THICKNESS_MAP,
  DEFAULT_COLORS,
  getThicknessValue,
} from './types';

// ============================================================================
// BASE COMPONENT EXPORTS
// ============================================================================

/**
 * Re-export base component for custom extensions.
 */

// ============================================================================
// ENGINE-AWARE COMPONENT
// ============================================================================

/**
 * The main Divider component with automatic engine resolution.
 *
 * The engine is determined in this order:
 * 1. `engine` prop passed directly to the component
 * 2. Nearest `EngineProvider` in the component tree
 * 3. Default engine (Titan)
 *
 * @example
 * ```tsx
 * // Basic horizontal divider
 * <Divider />
 *
 * // With text content
 * <Divider>Section Title</Divider>
 *
 * // Vertical with engine override
 * <Divider engine="hermes" orientation="vertical" />
 * ```
 */
export const Divider = createEngineComponent<DividerProps>('Divider', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
