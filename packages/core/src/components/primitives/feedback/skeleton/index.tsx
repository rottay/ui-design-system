'use client';

/**
 * @fileoverview Skeleton - placeholder loading indicators that mimic content shape.
 * `AnatomySkeleton` builds a component's loading state from its `data-part` anatomy.
 * Animation defaults resolve from the tenant personality tokens when available.
 * Multi-engine: Classic (Ant Design), Modern (token skin), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <Skeleton active avatar paragraph={{ rows: 3 }} title />
 * <AnatomySkeleton loading={isLoading}><Card title={title} /></AnatomySkeleton>
 * ```
 *
 * @module Skeleton
 * @category Feedback
 */

import { createElement, forwardRef } from 'react';

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import { useOptionalTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import {
  mergePersonalityStyle,
  resolveSkeletonPersonalityDefaults,
} from '@/foundation/tokens/ts/runtime/personality';
import type { SkeletonProps } from './contracts';

export {
  type SkeletonProps,
  type SkeletonVariant,
  type SkeletonAnimation,
  SKELETON_DEFAULTS,
} from './contracts';

export {
  AnatomySkeleton,
  type AnatomySkeletonProps,
  type SkeletonPartRole,
} from './runtime/anatomy-renderer';

// Engine-switchable base -- not exported directly because SkeletonComponent
// wraps it to inject personality-aware animation defaults.
const SkeletonBase = createEngineComponent<SkeletonProps>('Skeleton', {
    classic: () => import('./engines/classic'),  // Ant Design
    modern: () => import('./engines/modern'),     // Token skin (no DaisyUI)
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
 * Skeleton component with personality-aware defaults.
 * Variants: text, circular, rectangular, rounded. Animations: pulse, wave.
 */
export const Skeleton = SkeletonComponent;
