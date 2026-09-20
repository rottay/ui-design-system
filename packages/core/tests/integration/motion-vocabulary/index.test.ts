/**
 * The motion vocabulary the skins bind to, measured in real Chromium.
 *
 * A skin reaches the `motion.dial` decision only through the INTENT durations
 * (`feedback`, `reveal`, `disclosure`, `resize`, `rearrange`, `attention`),
 * which the foundation and every vertical artifact declare as
 * `calc(<rung> * var(--ds-motion-duration-scale))`. The primitive rungs
 * (`fast`, `normal`, `slow`, and their `instant`/`calm`/`deliberate` aliases)
 * carry the same resting value but no dial factor, so a skin that binds one
 * paints a duration the tenant can never move.
 *
 * The milestone-B motion lot rewired every in-skin primitive read onto the
 * intent name of its own rung. That substitution is safe exactly when the two
 * names resolve to the same computed duration at `durationScale: 1`, which is
 * what the first suite measures; the second measures that the intent names --
 * and only the intent names -- answer the dial.
 */
import { describe, expect, it } from 'vitest';

import { FIRST_PARTY_VERTICALS, measureArms } from '@tests/support/family-causality';
import type { ProbeVertical } from '@tests/support/family-causality';

/** Each intent name beside the primitive rung it must equal at rest. */
const RUNGS = {
  feedback: ['fast', 'instant'],
  reveal: ['normal', 'calm'],
  disclosure: ['normal', 'calm'],
  resize: ['normal', 'calm'],
  rearrange: ['slow', 'deliberate'],
  attention: ['slow', 'deliberate'],
} as const;

const INTENTS = Object.keys(RUNGS) as ReadonlyArray<keyof typeof RUNGS>;
const PRIMITIVES = ['fast', 'instant', 'normal', 'calm', 'slow', 'deliberate'] as const;
const NAMES = [...INTENTS, ...PRIMITIVES];

/**
 * One bare probe per vocabulary name. A custom property reads back as its own
 * token stream, so the only way to resolve `calc(200ms * 1)` to a duration is
 * to let a real longhand consume it.
 */
const markup = NAMES.map(
  (name) => `<div id="probe-${name}" style="transition: opacity var(--ds-motion-${name})"></div>`,
).join('');

const targets = NAMES.map((name) => ({
  id: name,
  selector: `#probe-${name}`,
  property: 'transition-duration',
}));

/** The verticals whose artifact declares `durationScale: 1`, where the rewire must be byte-equal. */
const AT_REST: readonly ProbeVertical[] = ['rottay', 'evnto'];

describe('motion vocabulary', () => {
  const readings: Partial<Record<ProbeVertical, Record<string, Record<string, string>>>> = {};

  it('resolves every intent name to its own rung at durationScale 1', async () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      readings[vertical] = await measureArms({
        vertical,
        markup,
        arms: { base: {}, slower: { 'motion.dial': { durationScale: 1.35 } } },
        targets,
      });
    }
    for (const vertical of AT_REST) {
      const base = readings[vertical]!.base!;
      for (const [intent, rungs] of Object.entries(RUNGS)) {
        expect(base[intent], `${vertical}: ${intent} has a reading`).toMatch(/^[0-9.]+s$/);
        for (const rung of rungs) {
          expect(base[intent], `${vertical}: --ds-motion-${intent} vs --ds-motion-${rung}`).toBe(base[rung]);
        }
      }
    }
  }, 240_000);

  it('moves every intent name on the dial and holds every primitive rung', () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const base = readings[vertical]!.base!;
      const slower = readings[vertical]!.slower!;
      for (const intent of INTENTS) {
        expect(slower[intent], `${vertical}: ${intent} answers the dial`).not.toBe(base[intent]);
      }
      // The negative control the axis instrument relies on: the rungs are the
      // dial's INPUT, so a dial arm must leave them exactly where they were.
      for (const rung of PRIMITIVES) {
        expect(slower[rung], `${vertical}: ${rung} is dial-independent`).toBe(base[rung]);
      }
    }
  });

  it('applies the vertical dial the rewire exposed: bithire paints its 0.8 cadence', () => {
    const base = readings.bithire!.base!;
    // bithire declares `durationScale: 0.8`; before the rewire its skins read
    // the rungs and painted the unscaled cadence. 0.8 x 120ms and 0.8 x 200ms.
    expect(base.feedback).toBe('0.096s');
    expect(base.fast).toBe('0.12s');
    expect(base.reveal).toBe('0.16s');
    expect(base.normal).toBe('0.2s');
  });
});
