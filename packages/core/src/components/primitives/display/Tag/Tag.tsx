'use client';

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
 * - **Classic**: Ant Design Tag with preset colors
 * - **Modern**: DaisyUI badge classes with Tailwind utilities
 * - **Rustic**: Pure CSS implementation with zero dependencies
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
 * - `--ds-tag-{size}-height` - Tag height per size
 * - `--ds-tag-{size}-padding` - Tag padding per size
 * - `--ds-tag-{size}-font-size` - Font size per size
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

import { createElement, forwardRef } from 'react';

import { createEngineComponent } from '../../../../engines/factory';
import { useOptionalTokens } from '../../../../hooks';
import { resolveBadgePersonalityDefaults } from '../../../../personality/primitives';
import type { TagProps } from './Tag.types';
import { TagGroup } from './compound';

// Export types
export type { TagProps, TagSize, TagVariant, TagRadius } from './Tag.types';
export { TAG_DEFAULTS, SIZE_MAP, RADIUS_MAP, VARIANT_COLORS } from './Tag.types';

// Export compound components
export { TagGroup };
export type { TagGroupProps } from './compound';

// Export base component

/**
 * Tag component with engine-aware rendering.
 *
 * Automatically selects the appropriate engine implementation based on the
 * engine prop or EngineProvider context. Supports all three engines:
 * - classic: Ant Design implementation
 * - modern: DaisyUI/Tailwind implementation
 * - rustic: Pure HTML/CSS implementation
 *
 * @example
 * ```tsx
 * // Default engine (from context or classic)
 * <Tag variant="primary">Primary Tag</Tag>
 *
 * // Override engine per component
 * <Tag engine="modern" variant="success">Modern Tag</Tag>
 * ```
 */
const TagBase = createEngineComponent<TagProps>('Tag', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  });

const TagComponent = forwardRef<any, TagProps>((props, ref) => {
  const tokens = useOptionalTokens();
  const defaults = tokens ? resolveBadgePersonalityDefaults(tokens) : null;

  return createElement(TagBase, {
    ref,
    ...props,
    radius: props.radius ?? defaults?.radius,
  });
});

TagComponent.displayName = 'Tag';

export const Tag = Object.assign(
  TagComponent,
  {
    /**
     * Tag.Group - Compound component for grouping tags with consistent spacing.
     */
    Group: TagGroup,
  }
);
