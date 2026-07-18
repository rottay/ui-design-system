import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { resolveMotionPolicy } from '@/infrastructure/runtime/foundation/motion/policy';
import { resolveMotionRecipe } from '@/infrastructure/runtime/foundation/motion/policy/recipes';
import { MotionProvider } from '@/infrastructure/runtime/motion';
import {
  motionRecipeCssVariables,
  useMotionRecipePresentation,
} from '..';

function animatedPolicy() {
  return resolveMotionPolicy({
    profile: 'precise',
    tenantDial: { intensity: 1, durationScale: 1, ambient: 'subtle' },
    reduce: false,
    pointer: 'fine',
    power: 'normal',
    visible: true,
  });
}

function reducedPolicy() {
  return resolveMotionPolicy({
    profile: 'precise',
    reduce: true,
    pointer: 'fine',
    power: 'normal',
    visible: true,
  });
}

describe('motionRecipeCssVariables', () => {
  it('serializes an animated recipe to the --ds-recipe-* contract', () => {
    const recipe = resolveMotionRecipe('feedback.press', animatedPolicy());
    const variables = motionRecipeCssVariables(recipe);

    expect(variables['--ds-recipe-enter']).toBe(`${recipe.durations.enterMs}ms`);
    expect(variables['--ds-recipe-exit']).toBe(`${recipe.durations.exitMs}ms`);
    expect(variables['--ds-recipe-settle']).toBe(`${recipe.durations.settleMs}ms`);
    expect(variables['--ds-recipe-cycle']).toBe('0ms');
    expect(variables['--ds-recipe-x']).toBe(`${recipe.distances.xPx}px`);
    expect(variables['--ds-recipe-y']).toBe(`${recipe.distances.yPx}px`);
    expect(Number(variables['--ds-recipe-scale-from'])).toBeLessThan(1);
    expect(variables['--ds-recipe-enter']).not.toBe('0ms');
    // precise profile resolves spring-gentle; the mapping targets a canon token
    expect(variables['--ds-recipe-curve']).toBe('var(--ds-motion-spring-gentle)');
  });

  it('serializes a reduced (final) recipe to the settled state', () => {
    const recipe = resolveMotionRecipe('overlay.modal', reducedPolicy());
    expect(recipe.state).toBe('final');

    const variables = motionRecipeCssVariables(recipe);
    expect(variables['--ds-recipe-enter']).toBe('0ms');
    expect(variables['--ds-recipe-exit']).toBe('0ms');
    expect(variables['--ds-recipe-settle']).toBe('0ms');
    expect(variables['--ds-recipe-cycle']).toBe('0ms');
    expect(variables['--ds-recipe-x']).toBe('0px');
    expect(variables['--ds-recipe-y']).toBe('0px');
    expect(variables['--ds-recipe-scale-from']).toBe('1');
  });
});

describe('useMotionRecipePresentation', () => {
  it('returns animated attributes and variables under a motion-permitting policy', () => {
    // The shared test setup's matchMedia stub reports no OS reduce preference,
    // so the default policy outside an explicit override permits motion.
    const { result } = renderHook(() => useMotionRecipePresentation('feedback.press'));

    expect(result.current.attributes['data-recipe']).toBe('feedback.press');
    expect(result.current.attributes['data-recipe-state']).toBe('animated');
    expect(result.current.variables['--ds-recipe-enter']).not.toBe('0ms');
  });

  it('returns the final settled contract when the provider forces reduced motion', () => {
    const { result } = renderHook(() => useMotionRecipePresentation('feedback.press'), {
      wrapper: ({ children }) => (
        <MotionProvider reducedMotion>{children}</MotionProvider>
      ),
    });

    expect(result.current.attributes['data-recipe']).toBe('feedback.press');
    expect(result.current.attributes['data-recipe-state']).toBe('final');
    expect(result.current.recipe.state).toBe('final');
    expect(result.current.variables['--ds-recipe-enter']).toBe('0ms');
    expect(result.current.variables['--ds-recipe-scale-from']).toBe('1');
  });
});
