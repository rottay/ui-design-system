'use client';

import { useMemo } from 'react';

import type {
  MotionCurve,
  MotionRecipeName,
  MotionRecipeResolveOptions,
  ResolvedMotionRecipe,
} from '@/foundation/contracts/runtime/motion';
import { useMotionPolicy } from '..';
import { resolveMotionRecipe } from '@/infrastructure/runtime/foundation/motion/policy/recipes';

/** Resolve a semantic recipe through the nearest vertical/tenant/device policy. */
export function useMotionRecipe(
  name: MotionRecipeName,
  options: MotionRecipeResolveOptions = {},
): ResolvedMotionRecipe {
  const policy = useMotionPolicy();
  const { active, itemCount } = options;

  return useMemo(
    () => resolveMotionRecipe(name, policy, { active, itemCount }),
    [active, itemCount, name, policy],
  );
}

/**
 * Supplier-neutral curve identities mapped onto the motion canon's CSS easing
 * tokens (foundation/animations/transitions.css). `settled` still receives a
 * valid easing because a settled recipe carries 0ms durations — the timing
 * function can never observably run; skins additionally disable interpolation
 * on `[data-recipe-state='final']`.
 */
const RECIPE_CURVE_CSS: Readonly<Record<MotionCurve, string>> = Object.freeze({
  settled: 'var(--ds-motion-ease-out)',
  'ease-out': 'var(--ds-motion-ease-out)',
  'spring-gentle': 'var(--ds-motion-spring-gentle)',
  'spring-tactile': 'var(--ds-motion-spring)',
});

/** CSS custom properties a recipe consumer stamps on its root element. */
export interface MotionRecipeCssVariables {
  '--ds-recipe-enter': string;
  '--ds-recipe-exit': string;
  '--ds-recipe-settle': string;
  '--ds-recipe-cycle': string;
  '--ds-recipe-x': string;
  '--ds-recipe-y': string;
  '--ds-recipe-scale-from': string;
  '--ds-recipe-curve': string;
}

/** DOM vocabulary a recipe consumer stamps on its root element. */
export interface MotionRecipeDataAttributes {
  'data-recipe': MotionRecipeName;
  /** `final` means the element must render settled, with no interpolation. */
  'data-recipe-state': ResolvedMotionRecipe['state'];
}

export interface MotionRecipePresentation {
  recipe: ResolvedMotionRecipe;
  attributes: MotionRecipeDataAttributes;
  variables: MotionRecipeCssVariables;
}

/**
 * Serialize a resolved recipe to the `--ds-recipe-*` variable contract engine
 * skins consume. Pure and total: a `final` recipe serializes to 0ms durations,
 * zero distances and scale 1, so a skin that consumes only these variables
 * renders the settled state even before it honors `data-recipe-state`.
 */
export function motionRecipeCssVariables(
  recipe: ResolvedMotionRecipe,
): MotionRecipeCssVariables {
  return {
    '--ds-recipe-enter': `${recipe.durations.enterMs}ms`,
    '--ds-recipe-exit': `${recipe.durations.exitMs}ms`,
    '--ds-recipe-settle': `${recipe.durations.settleMs}ms`,
    '--ds-recipe-cycle': `${recipe.durations.cycleMs}ms`,
    '--ds-recipe-x': `${recipe.distances.xPx}px`,
    '--ds-recipe-y': `${recipe.distances.yPx}px`,
    '--ds-recipe-scale-from': `${recipe.distances.scaleFrom}`,
    '--ds-recipe-curve': RECIPE_CURVE_CSS[recipe.curve],
  };
}

/**
 * Component-facing consumption seam for the recipe canon. Resolves the named
 * recipe through the nearest motion policy and returns the root-element
 * contract: `data-recipe` / `data-recipe-state` attributes plus the
 * `--ds-recipe-*` variables. Consumers spread `attributes` onto their root and
 * merge `variables` into the root style BEFORE any caller-supplied `style`, so
 * caller inline declarations keep their precedence.
 */
export function useMotionRecipePresentation(
  name: MotionRecipeName,
  options: MotionRecipeResolveOptions = {},
): MotionRecipePresentation {
  const recipe = useMotionRecipe(name, options);

  return useMemo(
    () => ({
      recipe,
      attributes: {
        'data-recipe': recipe.name,
        'data-recipe-state': recipe.state,
      },
      variables: motionRecipeCssVariables(recipe),
    }),
    [recipe],
  );
}
