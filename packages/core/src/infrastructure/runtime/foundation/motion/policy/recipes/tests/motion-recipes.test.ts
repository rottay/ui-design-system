import { describe, expect, it } from 'vitest';

import {
  MOTION_RECIPE_NAMES,
  type MotionPolicy,
  type MotionRecipeName,
} from '@/foundation/contracts/runtime/motion';
import { resolveMotionPolicy } from '../..';
import { resolveMotionRecipe } from '..';

function buildPolicy(overrides: Partial<MotionPolicy> = {}): MotionPolicy {
  return {
    ...resolveMotionPolicy({
      profile: 'precise',
      tenantDial: { intensity: 1, durationScale: 1, ambient: 'subtle' },
      reduce: false,
      pointer: 'fine',
      power: 'normal',
      visible: true,
    }),
    ...overrides,
  };
}

describe('resolveMotionRecipe', () => {
  it('publishes exactly the sanctioned semantic recipe vocabulary', () => {
    expect(MOTION_RECIPE_NAMES).toEqual([
      'feedback.press',
      'feedback.confirm',
      'feedback.hover',
      'feedback.focus',
      'feedback.error',
      'disclosure.reveal',
      'state.change',
      'overlay.modal',
      'overlay.sheet',
      'navigation.route',
      'navigation.shared-record',
      'collection.insert',
      'collection.reorder',
      'ai.thinking',
      'ai.tool-running',
      'ai.artifact-ready',
    ] satisfies MotionRecipeName[]);
  });

  it.each(MOTION_RECIPE_NAMES)('%s is deterministic, finite and compositor-only', (name) => {
    const first = resolveMotionRecipe(name, buildPolicy(), {
      active: true,
      itemCount: 40,
    });
    const second = resolveMotionRecipe(name, buildPolicy(), {
      active: true,
      itemCount: 40,
    });

    expect(first).toEqual(second);
    expect(first.properties).toEqual(['opacity', 'transform']);
    expect(first.state).toBe('animated');
    expect(first.curve).toBe('spring-gentle');
    expect(first.stagger.totalMs).toBeLessThanOrEqual(320);

    const numbers = [
      ...Object.values(first.durations),
      ...Object.values(first.distances),
      ...Object.values(first.stagger),
      first.continuous.maxContinuousLoops,
    ];
    expect(numbers.every(Number.isFinite)).toBe(true);

    const publicKeys = JSON.stringify(first);
    for (const layoutProperty of [
      'width', 'height', 'top', 'right', 'bottom', 'left', 'margin', 'padding',
    ]) {
      expect(publicKeys).not.toContain(`\"${layoutProperty}\"`);
    }
  });

  it.each([
    'feedback.hover',
    'feedback.focus',
    'feedback.error',
    'disclosure.reveal',
  ] as const)('%s (DS-A008) is bounded, never live, and collapses under reduced motion', (name) => {
    const animated = resolveMotionRecipe(name, buildPolicy(), { active: true });
    expect(animated.state).toBe('animated');
    expect(animated.continuous.maxContinuousLoops).toBe(0);
    expect(animated.durations.enterMs).toBeLessThanOrEqual(200);

    const reduced = resolveMotionRecipe(
      name,
      buildPolicy({ reduce: true }),
      { active: true }
    );
    expect(reduced.state).toBe('final');
    expect(Object.values(reduced.durations).every((value) => value === 0)).toBe(
      true
    );
  });

  it('resolves canonical cadence, distance and phone caps', () => {
    // C2 re-pin: the precise profile's distance cap now DERIVES from its own
    // envelope (maxOffsetPx 2) — the historic hand-typed 16px let "precise"
    // travel farthest, the exact inversion C2 removes.
    expect(resolveMotionRecipe('overlay.sheet', buildPolicy())).toMatchObject({
      state: 'animated',
      durations: { enterMs: 320, exitMs: 250, settleMs: 320, cycleMs: 0 },
      distances: { xPx: 0, yPx: 2, scaleFrom: 1 },
    });
    // The profile cap binds before the coarse-pointer 12px cap now.
    expect(
      resolveMotionRecipe(
        'navigation.shared-record',
        buildPolicy({ pointer: 'coarse', allowHoverEffects: false, allowContinuousMotion: false, maxContinuousLoops: 0 }),
      ).distances.xPx,
    ).toBe(2);
  });

  it('applies bounded tenant intensity and duration scaling deterministically', () => {
    const recipe = resolveMotionRecipe(
      'overlay.modal',
      buildPolicy({ intensity: 0.5, durationScale: 1.5 }),
    );

    expect(recipe.durations).toEqual({
      enterMs: 420,
      exitMs: 330,
      settleMs: 480,
      cycleMs: 0,
    });
    // C2 re-pin: precise's envelope-derived 2px cap binds (was 4 under the
    // inverted 16px table).
    expect(recipe.distances).toEqual({ xPx: 0, yPx: 2, scaleFrom: 0.99 });
  });

  it.each([
    ['reduced', { reduce: true }],
    ['power constrained', { power: 'constrained' as const }],
    ['hidden', { visible: false }],
    ['zero intensity', { intensity: 0 }],
  ])('returns the settled state for a %s policy', (_label, override) => {
    for (const name of MOTION_RECIPE_NAMES) {
      expect(
        resolveMotionRecipe(name, buildPolicy(override), { active: true, itemCount: 20 }),
      ).toEqual({
        name,
        state: 'final',
        curve: 'settled',
        properties: ['opacity', 'transform'],
        durations: { enterMs: 0, exitMs: 0, settleMs: 0, cycleMs: 0 },
        distances: { xPx: 0, yPx: 0, scaleFrom: 1 },
        stagger: { stepMs: 0, totalMs: 0 },
        continuous: { enabled: false, maxContinuousLoops: 0 },
      });
    }
  });

  it('reserves continuous motion for active live recipes with an available slot', () => {
    for (const name of ['ai.thinking', 'ai.tool-running'] as const) {
      expect(resolveMotionRecipe(name, buildPolicy(), { active: true }).continuous).toEqual({
        enabled: true,
        maxContinuousLoops: 1,
      });
      expect(resolveMotionRecipe(name, buildPolicy(), { active: false }).continuous).toEqual({
        enabled: false,
        maxContinuousLoops: 0,
      });
    }

    expect(
      resolveMotionRecipe('ai.artifact-ready', buildPolicy(), { active: true }).continuous,
    ).toEqual({ enabled: false, maxContinuousLoops: 0 });
  });

  it.each([
    ['reduced', { reduce: true }],
    ['coarse pointer', { pointer: 'coarse' as const, allowHoverEffects: false }],
    ['constrained power', { power: 'constrained' as const }],
    ['hidden document', { visible: false }],
  ])('never loops under %s', (_label, override) => {
    const policy = buildPolicy({
      ...override,
      allowContinuousMotion: false,
      maxContinuousLoops: 0,
    });
    expect(
      resolveMotionRecipe('ai.thinking', policy, { active: true }).continuous,
    ).toEqual({ enabled: false, maxContinuousLoops: 0 });
  });

  it('separates active product state from tenant-owned ambient decoration', () => {
    const policy = resolveMotionPolicy({
      profile: 'calm',
      tenantDial: { ambient: 'off' },
      reduce: false,
      pointer: 'fine',
      power: 'normal',
      visible: true,
    });

    expect(policy.allowContinuousMotion).toBe(true);
    expect(policy.allowAmbientMotion).toBe(false);
    expect(
      resolveMotionRecipe('ai.thinking', policy, { active: true }).continuous,
    ).toEqual({ enabled: true, maxContinuousLoops: 1 });
  });

  it('makes vertical identities distinguishable and bounds their displacement', () => {
    const input = {
      tenantDial: { intensity: 1, durationScale: 1, ambient: 'subtle' as const },
      reduce: false,
      pointer: 'fine' as const,
      power: 'normal' as const,
      visible: true,
    };
    const precise = resolveMotionRecipe(
      'navigation.shared-record',
      resolveMotionPolicy({ ...input, profile: 'precise' }),
    );
    const calm = resolveMotionRecipe(
      'navigation.shared-record',
      resolveMotionPolicy({ ...input, profile: 'calm' }),
    );
    const expressive = resolveMotionRecipe(
      'navigation.shared-record',
      resolveMotionPolicy({ ...input, profile: 'expressive' }),
    );

    expect(precise).toMatchObject({ curve: 'spring-gentle', distances: { xPx: 2 } });
    expect(calm).toMatchObject({ curve: 'ease-out', distances: { xPx: 2 } });
    expect(expressive).toMatchObject({ curve: 'spring-tactile', distances: { xPx: 6 } });
    // Anti-inversion LAW (C2): the expressive posture must always be allowed
    // to travel at least as far as precise — a regression of the historic
    // precise=16 table turns this red.
    expect(precise.distances.xPx).toBeLessThanOrEqual(expressive.distances.xPx);
  });

  it('never exceeds the finite 500ms emphasis budget', () => {
    expect(
      resolveMotionRecipe(
        'ai.artifact-ready',
        buildPolicy({ durationScale: 1.5 }),
      ).durations,
    ).toMatchObject({ enterMs: 500, settleMs: 500 });
  });

  it('bounds total stagger independently of collection size and hostile counts', () => {
    expect(
      resolveMotionRecipe('collection.insert', buildPolicy(), { itemCount: 1 }).stagger,
    ).toEqual({ stepMs: 30, totalMs: 0 });
    expect(
      resolveMotionRecipe('collection.insert', buildPolicy(), { itemCount: 10_000 }).stagger,
    ).toEqual({ stepMs: 30, totalMs: 240 });
    expect(
      resolveMotionRecipe('ai.artifact-ready', buildPolicy({ durationScale: 1.5 }), { itemCount: 10_000 }).stagger,
    ).toEqual({ stepMs: 60, totalMs: 320 });

    for (const itemCount of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      expect(
        resolveMotionRecipe('collection.reorder', buildPolicy(), { itemCount }).stagger.totalMs,
      ).toBe(0);
    }
  });
});
