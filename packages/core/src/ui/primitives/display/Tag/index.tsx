'use client';

/**
 * @fileoverview Tag - Label for categorization and status indication.
 * Supports closable, icon, and clickable variants. `Tag.Group` provides
 * consistent spacing when rendering multiple tags together.
 *
 * @example
 * ```tsx
 * import { Tag } from '@rottay/design-system';
 *
 * <Tag.Group gap="md">
 *   <Tag variant="primary">React</Tag>
 *   <Tag variant="success" closable onClose={handleClose}>Active</Tag>
 * </Tag.Group>
 * ```
 *
 * @module Tag
 * @category Display
 */

import { createElement, forwardRef } from 'react';

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import { useOptionalTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { resolveBadgePersonalityDefaults } from '@/foundation/tokens/ts/runtime/personality';
import type { TagProps } from './contracts';
import { TagGroup } from './compound';

export type { TagProps, TagSize, TagVariant, TagTone, TagRadius } from './contracts';
export { TAG_DEFAULTS, SIZE_MAP, RADIUS_MAP, VARIANT_COLORS, TONE_TO_TAG_VARIANT } from './contracts';

export { TagGroup };
export type { TagGroupProps } from './compound';

/** Engine-routed base -- consumers use the public `Tag` export below. */
const TagBase = createEngineComponent<TagProps>('Tag', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  });

/**
 * Personality wrapper for Tag.
 *
 * Reuses `resolveBadgePersonalityDefaults` because Tag and Badge share the
 * same border-radius personality token -- they are visually related primitives.
 */
const TagComponent = forwardRef<any, TagProps>((props, ref) => {
  const tokens = useOptionalTokens();
  // Tag intentionally shares badge personality: both are small label-like elements.
  const defaults = tokens ? resolveBadgePersonalityDefaults(tokens) : null;

  return createElement(TagBase, {
    ref,
    ...props,
    radius: props.radius ?? defaults?.radius,
  });
});

TagComponent.displayName = 'Tag';

/** Compound assembly: attaches Group for `Tag.Group` usage. */
export const Tag = Object.assign(
  TagComponent,
  {
    /** Flex container that spaces multiple Tags with a configurable gap. */
    Group: TagGroup,
  }
);
