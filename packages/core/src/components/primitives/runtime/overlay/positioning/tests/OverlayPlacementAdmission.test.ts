/**
 * WO-INV-01 -- placement admission: which requests a frozen engine is refused,
 * which it is granted, and what the refusal has to say.
 *
 * The disposition itself, without React. Where it is ENFORCED -- the shared
 * engine router, in development only -- is pinned by
 * `display/tooltip/tests/Tooltip.frozen-placement-refusal.integration.test.tsx`
 * and `infrastructure/runtime/engines/.../tests/props-admission.integration.test.tsx`.
 */
import { describe, expect, it } from 'vitest';

import { ENGINE_NAMES } from '@/foundation/contracts/kernel/engine-identity';

import { OVERLAY_PLACEMENT_ALIASES, refuseFrozenPlacement } from '..';

const LOGICAL_PLACEMENTS = Object.values(OVERLAY_PLACEMENT_ALIASES);
const PHYSICAL_PLACEMENTS = Object.keys(OVERLAY_PLACEMENT_ALIASES);
const BLOCK_PLACEMENTS = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'];

describe('a frozen engine is refused the logical inline vocabulary', () => {
  it.each(['classic', 'rustic'] as const)('%s refuses all six spellings', (engine) => {
    for (const placement of LOGICAL_PLACEMENTS) {
      expect(refuseFrozenPlacement(engine, placement)).toContain(`"${placement}"`);
    }
  });

  it('names the engine, the fallback it would take, and the engine that implements it', () => {
    const refusal = refuseFrozenPlacement('rustic', 'inline-end');

    expect(refusal).toContain('"rustic"');
    expect(refusal).toContain('"inline-end"');
    expect(refusal).toContain('"top"');
    expect(refusal).toContain('modern');
  });

  it('offers the physical spelling the published migration table pairs it with', () => {
    for (const [physical, logical] of Object.entries(OVERLAY_PLACEMENT_ALIASES)) {
      expect(refuseFrozenPlacement('rustic', logical)).toContain(`"${physical}"`);
    }
  });
});

describe('what is admitted', () => {
  it.each(['classic', 'rustic'] as const)('%s admits every physical spelling', (engine) => {
    for (const placement of PHYSICAL_PLACEMENTS) {
      expect(refuseFrozenPlacement(engine, placement)).toBeUndefined();
    }
  });

  it.each(ENGINE_NAMES)('%s admits the block axis, which no engine mirrors', (engine) => {
    for (const placement of BLOCK_PLACEMENTS) {
      expect(refuseFrozenPlacement(engine, placement)).toBeUndefined();
    }
  });

  it('modern implements the logical vocabulary and is never refused', () => {
    for (const placement of LOGICAL_PLACEMENTS) {
      expect(refuseFrozenPlacement('modern', placement)).toBeUndefined();
    }
  });

  it('custom declares its own vocabulary through its pack', () => {
    for (const placement of LOGICAL_PLACEMENTS) {
      expect(refuseFrozenPlacement('custom', placement)).toBeUndefined();
    }
  });

  it('an undeclared engine or an omitted placement is not a placement refusal', () => {
    expect(refuseFrozenPlacement(undefined, 'inline-start')).toBeUndefined();
    expect(refuseFrozenPlacement('rustic', undefined)).toBeUndefined();
  });
});
