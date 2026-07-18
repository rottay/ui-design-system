'use client';

/**
 * @fileoverview useCollectionStagger - Rottay Design System
 * @description Resolves the `collection.insert` stagger for a freshly mounted
 * batch of rows/cards through the active motion policy, and returns the primitive
 * values a collection surface stamps to drive the `.ds-collection-stagger` CSS
 * preset (foundation/tokens/css/foundation/animations/collection-stagger.css).
 *
 * The recipe (staggerStepMs 30, staggerMaxMs 240, capped by
 * MAX_TOTAL_STAGGER_MS 320) is the single source of truth for the timing, so a
 * surface never hardcodes stagger numbers. A reduced / calm / hidden / power-
 * constrained policy returns the final state, so every item renders in place
 * with no delay -- matching the CSS preset's own reduced-motion guard.
 *
 * The result is deliberately primitive-only (booleans and strings, no style
 * objects): a caller composes its own spread-free `style` literal
 * (`{ '--ds-stagger-index': index }`, `{ '--ds-stagger-step': stepCss }`), which
 * keeps the inline-paint audit honest -- an opaque `...spread` of a returned
 * style object reads as unclassifiable paint.
 *
 * @module Patterns/Foundation/Motion/CollectionStagger
 * @category Patterns
 * @package @rottay/design-system
 */

import { useMemo } from 'react';

import { useMotionRecipe } from '@/infrastructure/runtime/motion';

export interface CollectionStaggerResult {
  /** True when the entrance choreography is active; false = render final-state. */
  animated: boolean;
  /**
   * Class to append to the freshly mounted batch container. Empty string when
   * final-state, so a caller can compose it unconditionally.
   */
  containerClassName: string;
  /**
   * `--ds-stagger-step` value (e.g. `"30ms"`), resolved from the active motion
   * policy. Empty string when final-state.
   */
  stepCss: string;
  /**
   * `--ds-stagger-max` value (e.g. `"240ms"`) -- the total window for this batch,
   * capped by item count and the recipe ceiling. Empty string when final-state.
   */
  maxCss: string;
}

const FINAL_STATE: CollectionStaggerResult = Object.freeze({
  animated: false,
  containerClassName: '',
  stepCss: '',
  maxCss: '',
});

/**
 * Resolve the `collection.insert` stagger for a batch of `itemCount` rows/cards.
 *
 * @param itemCount - Number of items in the freshly mounted batch. Caps the
 *   total stagger window: `maxCss` resolves to `min((itemCount - 1) * step,
 *   recipe cap)`, and the CSS preset clamps every item's delay to that window.
 * @returns Primitive container + timing values for the `.ds-collection-stagger`
 *   preset. Compose spread-free `style` literals from these at the call site.
 *
 * @example
 * ```tsx
 * const stagger = useCollectionStagger(items.length);
 * return (
 *   <div
 *     className={['grid', stagger.containerClassName].filter(Boolean).join(' ')}
 *     style={stagger.animated ? { '--ds-stagger-step': stagger.stepCss, '--ds-stagger-max': stagger.maxCss } : undefined}
 *   >
 *     {items.map((item, index) => (
 *       <Card
 *         key={item.id}
 *         data-ds-stagger-item={stagger.animated ? '' : undefined}
 *         style={stagger.animated ? { '--ds-stagger-index': index } : undefined}
 *       >
 *         {item.title}
 *       </Card>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useCollectionStagger(itemCount: number): CollectionStaggerResult {
  const recipe = useMotionRecipe('collection.insert', { itemCount });
  const { state, stagger } = recipe;

  return useMemo(() => {
    if (state !== 'animated' || stagger.stepMs <= 0) {
      return FINAL_STATE;
    }

    return {
      animated: true,
      containerClassName: 'ds-collection-stagger',
      stepCss: `${stagger.stepMs}ms`,
      maxCss: `${stagger.totalMs}ms`,
    };
  }, [state, stagger.stepMs, stagger.totalMs]);
}
