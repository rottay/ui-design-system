/**
 * @fileoverview Tag - Rottay Design System
 * @description Label component for categorization and status indication.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Tag component provides labels for categorization, filtering, and
 * status indication with support for icons, closing, and clickable interactions.
 *
 * **Multi-Engine Architecture:**
 * - **Titan**: Ant Design Tag with preset colors
 * - **Hermes**: DaisyUI badge classes with Tailwind utilities
 * - **Apollo**: Pure CSS implementation with zero dependencies
 *
 * **Key Features:**
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Semantic variants (default, primary, secondary, success, warning, error)
 * - Closable with close button
 * - Icon support (left side)
 * - Outlined and bordered styles
 * - Clickable tags with hover effects
 * - Grouping with consistent spacing
 *
 * **Compound Components:**
 * - `Tag.Group` - Container for multiple tags with gap options
 *
 * **CSS Custom Properties:**
 * - `--tag-{size}-height` - Tag height per size
 * - `--tag-{size}-padding` - Tag padding per size
 * - `--tag-{size}-font-size` - Font size per size
 *
 * @example Basic Tag
 * ```tsx
 * import { Tag } from '@rottay/design-system';
 *
 * <Tag>Label</Tag>
 * <Tag variant="primary">Primary</Tag>
 * ```
 *
 * @example Closable Tag
 * ```tsx
 * <Tag variant="success" closable onClose={handleClose}>
 *   Removable
 * </Tag>
 * ```
 *
 * @example Tag with Icon
 * ```tsx
 * <Tag icon={<StarIcon />} variant="warning">
 *   Featured
 * </Tag>
 * ```
 *
 * @example Tag Group
 * ```tsx
 * <Tag.Group gap="md">
 *   <Tag>React</Tag>
 *   <Tag>TypeScript</Tag>
 *   <Tag>Vite</Tag>
 * </Tag.Group>
 * ```
 *
 * @see {@link TagProps} for available props
 * @see {@link TagGroup} for grouping configuration
 * @module Tag
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TagProps } from './types';
import { TagGroup } from './compound';

// Export types
export type { TagProps, TagSize, TagVariant, TagRadius } from './types';
export { TAG_DEFAULTS, SIZE_MAP, RADIUS_MAP, VARIANT_COLORS } from './types';

// Export compound components
export { TagGroup };
export type { TagGroupProps } from './compound';

// Export base component

/**
 * Tag component with engine-aware rendering.
 *
 * Automatically selects the appropriate engine implementation based on the
 * engine prop or EngineProvider context. Supports all three engines:
 * - titan: Ant Design implementation
 * - hermes: DaisyUI/Tailwind implementation
 * - apollo: Pure HTML/CSS implementation
 *
 * @example
 * ```tsx
 * // Default engine (from context or titan)
 * <Tag variant="primary">Primary Tag</Tag>
 *
 * // Override engine per component
 * <Tag engine="hermes" variant="success">Hermes Tag</Tag>
 * ```
 */
export const Tag = Object.assign(
  createEngineComponent<TagProps>('Tag', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    /**
     * Tag.Group - Compound component for grouping tags with consistent spacing.
     */
    Group: TagGroup,
  }
);
