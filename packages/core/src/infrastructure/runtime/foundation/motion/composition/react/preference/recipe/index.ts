'use client';

import { useMemo } from 'react';

import type {
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
