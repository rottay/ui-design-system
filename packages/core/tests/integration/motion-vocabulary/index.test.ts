/**
 * The motion vocabulary the skins bind to, measured in real Chromium.
 *
 * The vocabulary has two tiers, and the difference between them is the whole
 * contract. The CADENCE (`instant`, `calm`, `deliberate`) is the product-law
 * closed set and the INPUT `motion.dial` multiplies. Every public duration name
 * a skin may bind is an OUTPUT of it: the INTENT names (`feedback`, `reveal`,
 * `disclosure`, `resize`, `rearrange`, `attention`) and the RAMP names (`fast`,
 * `normal`, `slow`) alike, all declared as `calc(<rung> * var(--ds-motion-
 * duration-scale))` by the foundation sheet, the modern engine's at-rest block
 * and every vertical artifact.
 *
 * The ramp names used to be bare `var()` aliases of the cadence, which made the
 * CHOICE OF SPELLING decide whether a tenant could move the duration at all:
 * `--ds-motion-feedback` answered the dial while `--ds-motion-fast` -- its own
 * rung under the other name -- painted a duration no tenant could reach. The
 * base-ramp derivation lot made them products. This suite is what keeps the two
 * tiers apart: the cadence holds under a dial arm, everything else moves, and
 * at `durationScale: 1` every name resolves to exactly the duration it always
 * did.
 *
 * `glacial` stays a rung deliberately. It is the ambient-loop step, and the
 * loops that ride it already carry `var(--ds-motion-duration-scale)` at the
 * call site (the empty-state precedent); a product here would apply the dial
 * twice, so it is asserted dial-independent beside the cadence.
 */
import { describe, expect, it } from 'vitest';

import { FIRST_PARTY_VERTICALS, measureArms } from '@tests/support/family-causality';
import type { ProbeVertical } from '@tests/support/family-causality';

/** Each intent name beside the ramp name and the cadence rung it must equal at rest. */
const RUNGS = {
  feedback: ['fast', 'instant'],
  reveal: ['normal', 'calm'],
  disclosure: ['normal', 'calm'],
  resize: ['normal', 'calm'],
  rearrange: ['slow', 'deliberate'],
  attention: ['slow', 'deliberate'],
} as const;

/** The ramp name each cadence rung answers to, and which the dial now reaches. */
const RAMP_OF_CADENCE = {
  fast: 'instant',
  normal: 'calm',
  slow: 'deliberate',
} as const;

const INTENTS = Object.keys(RUNGS) as ReadonlyArray<keyof typeof RUNGS>;
const RAMP = Object.keys(RAMP_OF_CADENCE) as ReadonlyArray<keyof typeof RAMP_OF_CADENCE>;
/** The dial's INPUT: the closed cadence, plus the ambient rung scaled at its call sites. */
const CADENCE = ['instant', 'calm', 'deliberate', 'glacial'] as const;
const NAMES = [...INTENTS, ...RAMP, ...CADENCE];

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

/**
 * The resting duration of every name, per vertical, BEFORE the base-ramp lot.
 *
 * Read from the same probe at the lot's parent commit (12894ff11). It is the
 * byte-equality claim stated as data rather than as prose: at `durationScale: 1`
 * nothing may move, and where the dial is not 1 the ramp names -- and ONLY the
 * ramp names -- are allowed to differ from this table.
 */
const RESTING_BEFORE: Readonly<Record<ProbeVertical, Readonly<Record<string, string>>>> = {
  rottay: {
    feedback: '0.12s', reveal: '0.2s', disclosure: '0.2s', resize: '0.2s',
    rearrange: '0.32s', attention: '0.32s',
    fast: '0.12s', normal: '0.2s', slow: '0.32s',
    instant: '0.12s', calm: '0.2s', deliberate: '0.32s', glacial: '0.5s',
  },
  evnto: {
    feedback: '0.12s', reveal: '0.2s', disclosure: '0.2s', resize: '0.2s',
    rearrange: '0.32s', attention: '0.32s',
    fast: '0.12s', normal: '0.2s', slow: '0.32s',
    instant: '0.12s', calm: '0.2s', deliberate: '0.32s', glacial: '0.5s',
  },
  bithire: {
    feedback: '0.096s', reveal: '0.16s', disclosure: '0.16s', resize: '0.16s',
    rearrange: '0.256s', attention: '0.256s',
    fast: '0.12s', normal: '0.2s', slow: '0.32s',
    instant: '0.12s', calm: '0.2s', deliberate: '0.32s', glacial: '0.5s',
  },
};

describe('motion vocabulary', () => {
  const readings: Partial<Record<ProbeVertical, Record<string, Record<string, string>>>> = {};

  it('resolves every intent and ramp name to its own rung at durationScale 1', async () => {
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

  it('moves every intent AND ramp name on the dial, and holds the cadence', () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const base = readings[vertical]!.base!;
      const slower = readings[vertical]!.slower!;
      for (const name of [...INTENTS, ...RAMP]) {
        expect(slower[name], `${vertical}: ${name} answers the dial`).not.toBe(base[name]);
      }
      // The negative control the axis instrument relies on: the cadence is the
      // dial's INPUT, so a dial arm must leave it exactly where it was. `glacial`
      // sits here because its loops multiply it themselves.
      for (const rung of CADENCE) {
        expect(slower[rung], `${vertical}: ${rung} is dial-independent`).toBe(base[rung]);
      }
    }
  });

  it('keeps each ramp name and its intent twin one duration, at rest and under the dial', () => {
    // `fast` IS `feedback`: two spellings of the instant rung. Before the lot
    // they diverged the moment a tenant turned the dial, which is precisely the
    // failure the axis probe measured as fifteen non-moving families.
    const TWIN = { fast: 'feedback', normal: 'reveal', slow: 'rearrange' } as const;
    for (const vertical of FIRST_PARTY_VERTICALS) {
      for (const arm of ['base', 'slower'] as const) {
        const reading = readings[vertical]![arm]!;
        for (const [ramp, intent] of Object.entries(TWIN)) {
          expect(reading[ramp], `${vertical}/${arm}: ${ramp} vs ${intent}`).toBe(reading[intent]);
        }
      }
    }
  });

  it('is byte-equal at rest where the dial is 1, and moves ONLY the ramp where it is not', () => {
    for (const vertical of FIRST_PARTY_VERTICALS) {
      const base = readings[vertical]!.base!;
      const before = RESTING_BEFORE[vertical];
      const moved = NAMES.filter((name) => base[name] !== before[name]);
      // rottay and evnto compile `durationScale: 1`, so the whole table holds.
      // bithire compiles 0.8, so exactly the three ramp names move -- the
      // DECLARED reach of this lot, and nothing else.
      expect(moved.sort(), vertical).toEqual(vertical === 'bithire' ? [...RAMP].sort() : []);
    }
  });

  it('applies the vertical dial the rewire exposed: bithire paints its 0.8 cadence', () => {
    const base = readings.bithire!.base!;
    // bithire declares `durationScale: 0.8`. 0.8 x 120ms, 0.8 x 200ms, and the
    // ramp names now paint the same thing their intent twins do.
    expect(base.feedback).toBe('0.096s');
    expect(base.fast).toBe('0.096s');
    expect(base.reveal).toBe('0.16s');
    expect(base.normal).toBe('0.16s');
    expect(base.rearrange).toBe('0.256s');
    expect(base.slow).toBe('0.256s');
    // The cadence it multiplies is untouched, which is why the product is one
    // multiplication and not two.
    expect(base.instant).toBe('0.12s');
    expect(base.calm).toBe('0.2s');
    expect(base.deliberate).toBe('0.32s');
  });
});
