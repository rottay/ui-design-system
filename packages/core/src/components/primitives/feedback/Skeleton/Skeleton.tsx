'use client';

/**
 * @fileoverview Skeleton - placeholder loading indicators that mimic content shape.
 * Compound sub-components: Avatar, Text, Button, Card, ListItem, Table, Form, Paragraph.
 * Animation defaults resolve from the tenant personality tokens when available.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <Skeleton active avatar paragraph={{ rows: 3 }} title />
 * <Skeleton.Card />
 * <Skeleton.Table rows={5} columns={4} />
 * ```
 *
 * @module Skeleton
 * @category Feedback
 */

import { createElement, forwardRef } from 'react';

import { createEngineComponent } from '../../../../engines/factory';
import { useOptionalTokens } from '../../../../hooks';
import {
  mergePersonalityStyle,
  resolveSkeletonPersonalityDefaults,
} from '../../../../personality/primitives';
import type { SkeletonProps } from './Skeleton.types';
import {
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonTable,
  SkeletonForm,
  SkeletonParagraph,
} from './compound';

export {
  type SkeletonProps,
  type SkeletonVariant,
  type SkeletonAnimation,
  SKELETON_DEFAULTS,
} from './Skeleton.types';

export { SkeletonAvatar, SkeletonText, SkeletonButton, SkeletonCard, SkeletonListItem, SkeletonTable, SkeletonForm, SkeletonParagraph };
export type { SkeletonAvatarProps, SkeletonTextProps, SkeletonButtonProps } from './compound';
export type { SkeletonCardProps, SkeletonListItemProps, SkeletonTableProps, SkeletonFormProps, SkeletonParagraphProps } from './compound';

// Engine-switchable base -- not exported directly because SkeletonComponent
// wraps it to inject personality-aware animation defaults.
const SkeletonBase = createEngineComponent<SkeletonProps>('Skeleton', {
    classic: () => import('./engines/classic'),  // Ant Design
    modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
    rustic: () => import('./engines/rustic'),      // Vanilla HTML/CSS
  });

/**
 * Personality-aware wrapper around the engine base.
 * Reads tenant tokens (if available) and merges personality defaults for
 * animation style so loading placeholders match the tenant's visual tone.
 */
const SkeletonComponent = forwardRef<any, SkeletonProps>((props, ref) => {
  const tokens = useOptionalTokens();
  const defaults = tokens ? resolveSkeletonPersonalityDefaults(tokens) : null;
  const {
    animation,
    style,
    ...rest
  } = props;

  return createElement(SkeletonBase, {
    ref,
    ...rest,
    // Animation defaults come from personality so loading states match tenant tone.
    animation: animation ?? defaults?.animation,
    style: defaults ? mergePersonalityStyle(style, defaults.style) : style,
  });
});

SkeletonComponent.displayName = 'Skeleton';

/**
 * Skeleton component with personality-aware defaults and compound sub-components.
 * Variants: text, circular, rectangular, rounded. Animations: pulse, wave.
 */
export const Skeleton = Object.assign(
  SkeletonComponent,
  // Attach compound sub-components for shape-specific placeholders
  {
    /** Circular/square placeholder for avatar images. */
    Avatar: SkeletonAvatar,
    /** Multi-line text placeholder. */
    Text: SkeletonText,
    /** Button-shaped placeholder. */
    Button: SkeletonButton,
    /** Card with optional image area and text lines. */
    Card: SkeletonCard,
    /** List row with optional avatar and text lines. */
    ListItem: SkeletonListItem,
    /** Table grid with configurable rows and columns. */
    Table: SkeletonTable,
    /** Form layout with label + input pairs. */
    Form: SkeletonForm,
    /** Dense body-copy placeholder with variable last-line width. */
    Paragraph: SkeletonParagraph,
  }
);
