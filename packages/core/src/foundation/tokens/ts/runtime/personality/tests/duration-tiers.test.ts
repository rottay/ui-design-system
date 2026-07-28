/**
 * C6.8-4B: `--ds-duration-slow` is a governed tier, not an orphan.
 *
 * It was reported as a dead channel because the tenant-channel consumer gate
 * scans DS `src/` only. Two facts make retiring it wrong. First, the foundation
 * declares a CLOSED five-tier duration vocabulary and zeroes every tier under
 * reduced motion, so `slow` is not a stray name — and it is not even uniquely
 * DS-unread: `instant` and `gentle` have no DS reader either, so removing only
 * `slow` would leave an arbitrary three-tier contract behind. Second, the tier
 * has real consumers in the reference adoption app.
 *
 * These tests pin the vocabulary's closure so a future drain has to make a
 * deliberate decision about all five tiers instead of picking one off.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { resolvePartialPersonalityCssVariables } from '../index';

const here = dirname(fileURLToPath(import.meta.url));
const TRANSITIONS = readFileSync(
  join(here, '../../../../css/foundation/animations/transitions.css'),
  'utf-8'
);

const TIERS = ['instant', 'fast', 'normal', 'slow', 'gentle'] as const;

describe('the duration vocabulary is closed', () => {
  it('declares every tier and zeroes every tier under reduced motion', () => {
    const reducedMotion = TRANSITIONS.slice(
      TRANSITIONS.indexOf('@media (prefers-reduced-motion: reduce)')
    );
    for (const tier of TIERS) {
      expect(TRANSITIONS).toContain(`--ds-duration-${tier}:`);
      expect(reducedMotion).toContain(`--ds-duration-${tier}: 0s;`);
    }
  });

  it('lets a tenant author the slow tier through the typed transitions field', () => {
    const authored = resolvePartialPersonalityCssVariables({}, {
      fast: '11ms',
      normal: '22ms',
      slow: '33ms',
    });
    expect(authored['--ds-duration-slow']).toBe('33ms');

    // Without an authored value the emitter must defer to the foundation chain
    // rather than inlining a literal, which is what keeps transitions.css the
    // single numeric source.
    const unauthored = resolvePartialPersonalityCssVariables({}, undefined);
    expect(unauthored['--ds-duration-slow']).toBe('var(--duration-normal)');
  });
});
