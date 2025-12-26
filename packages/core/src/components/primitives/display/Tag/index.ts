/**
 * Tag - Engine Router
 *
 * @module Tag
 * @description Main entry point for the Tag component. Creates an engine-aware
 * Tag component that dynamically loads the appropriate engine implementation
 * based on context or explicit prop.
 *
 * @example
 * ```tsx
 * import { Tag } from '@rottay/design-system';
 *
 * // Basic usage
 * <Tag>Label</Tag>
 *
 * // With variants and closable
 * <Tag variant="primary" closable onClose={handleClose}>
 *   Premium
 * </Tag>
 *
 * // With icon
 * <Tag icon={<StarIcon />} variant="success">
 *   Featured
 * </Tag>
 *
 * // Explicit engine selection
 * <Tag engine="hermes" variant="warning">
 *   Hermes Tag
 * </Tag>
 *
 * // Tag group
 * <Tag.Group gap="md">
 *   <Tag>React</Tag>
 *   <Tag>TypeScript</Tag>
 * </Tag.Group>
 * ```
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
export { BaseTag } from './base';

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
