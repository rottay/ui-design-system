/**
 * `spacing.rhythm` — STATIC ⇄ DB PARITY, measured rather than assumed.
 *
 * The modern-rescue product promise says one semantic input must be accepted
 * by BOTH the static `BrandTheme` path and the DB `TenantTheme` path, be
 * normalized by ONE authority into governed semantic channels, and restore the
 * exact baseline when removed (README, product promise points 1, 2 and 5).
 * `governance/manifest/controls/spacing/rhythm/index.json` records the three stops
 * (tight=0.85, normal=1, airy=1.2), the 0.8-1.25 envelope, and the two ingress
 * paths (`surfaces.rhythm` / `appearance.general.rhythm`) — and its
 * `calibration.openContractQuestions` says explicitly that invalid-input
 * behavior and exact static/DB parity are CLAIMS TO PROVE, not inherited
 * acceptance.
 *
 * WHAT WAS ALREADY PROVEN ELSEWHERE, and is deliberately not repeated here:
 *
 * - `capability-reachability.test.ts` proves the DB path reaches the channel
 *   for `airy`, that a hostile posture and a raw number are rejected by the
 *   document schema, and that rhythm does not touch a density channel.
 * - `static-db-channel-vocabulary.test.ts` proves the two paths share ONE
 *   channel vocabulary over the shared core families.
 *
 * WHAT THIS FILE ADDS. Those two grade one path each. Nothing yet compared the
 * paths against each other on this control, which is where the four open
 * claims live:
 *
 * 1. EQUAL NORMALIZED OUTPUT — the same word produces the same bytes on the
 *    same channel from both paths, for all three stops. "Both non-empty" is
 *    not the claim and would pass on two different numbers.
 * 2. ABSENT IS THE BASELINE — omitting the input emits NOTHING on either path,
 *    and the whole-artifact delta between absent and `normal` is exactly the
 *    one rhythm key. That is what makes "byte-identical to the pre-rhythm
 *    cascade" a measurement instead of a sentence.
 * 3. INVALID FAILS CLOSED THE SAME WAY on both paths. This is measured across
 *    a hostile matrix and the result is asserted as found.
 * 4. ONE SPELLING — neither path invents a second channel name for the concept.
 *
 * Plus the false-claim check the control file's compat text implies: the
 * expert `token-overrides` path must not be able to acquire
 * `--ds-rhythm-scale`.
 */
import { describe, expect, it } from 'vitest';

import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import {
  appearanceGeneralToVariables,
  compileAppearanceVariables,
} from '@/infrastructure/compilers/kernel/runtime/appearance';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import type { TenantThemeDocument } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  TENANT_THEME_OVERRIDE_TOKENS,
  TENANT_THEME_RHYTHM_FACTORS,
  TENANT_THEME_RHYTHM_SCALE_BOUNDS,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  validateTenantThemeDocument,
} from '../index';

/** The one channel both paths must land on. */
const CHANNEL = '--ds-rhythm-scale';

const ENVELOPE = getTenantThemeVerticalEnvelope('bithire')!;

const IDENTITY = {
  tenantId: 'tenant_rhythm_parity',
  slug: 'rhythm-parity',
  verticalKey: 'bithire',
  rowVersion: 1,
} as const;

/**
 * The static ingress. `surfaces.rhythm` is typed, so every hostile case below
 * has to be cast in — which is exactly the shape this compiler receives in
 * production: a `BrandTheme` arriving as plain JSON through the RSC boundary
 * or the compatibility `TenantConfig.brandTheme` field carries no type at all.
 */
const staticVariables = (rhythm?: unknown): Record<string, string> =>
  lowerBrandThemeFixture({
    brandTheme: {
      id: 'rhythm-parity',
      name: 'Rhythm Parity',
      palette: { primaryColor: '#0F766E' },
      surfaces: rhythm === undefined ? {} : { rhythm },
    } as unknown as BrandTheme,
    tenantSlug: 'rhythm-parity',
  }).cssVariables;

/** The DB ingress, at `appearance.general.rhythm`. */
const dbDocument = (rhythm?: unknown): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: 'simple',
    appearance: {
      palette: { primary: '#0F766E' },
      ...(rhythm === undefined ? {} : { rhythm }),
    },
  }) as unknown as TenantThemeDocument;

const dbVariables = (rhythm?: unknown): Record<string, string> =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(dbDocument(rhythm), IDENTITY),
    { verticalEnvelope: ENVELOPE }
  ).variables;

/** Whatever the DB path does with an input: accepted, or refused and how. */
const dbOutcome = (
  rhythm: unknown
): { accepted: true; value: string | undefined } | { accepted: false } => {
  if (!validateTenantThemeDocument(dbDocument(rhythm)).success) {
    return { accepted: false };
  }
  return { accepted: true, value: dbVariables(rhythm)[CHANNEL] };
};

/** The same question of the static path, which has no validation stage. */
const staticOutcome = (
  rhythm: unknown
): { accepted: true; value: string | undefined } | { accepted: false } => {
  const emitted = staticVariables(rhythm)[CHANNEL];
  return emitted === undefined ? { accepted: false } : { accepted: true, value: emitted };
};

const rhythmChannelsIn = (variables: Record<string, string>): string[] =>
  Object.keys(variables)
    .filter((name) => name.includes('rhythm'))
    .sort();

describe('spacing.rhythm · both ingress paths normalize to the same channel and value', () => {
  it('lowers the three stops identically, from the one shared factor table', () => {
    // Built from the table rather than restating 0.85/1/1.2, so a change to
    // the canon moves this test with it instead of silently disagreeing.
    for (const [posture, factor] of Object.entries(TENANT_THEME_RHYTHM_FACTORS)) {
      const fromStatic = staticVariables(posture)[CHANNEL];
      const fromDb = dbVariables(posture)[CHANNEL];

      // Equal to each other, not merely both present: two different numbers
      // would satisfy "both non-empty" and be the exact drift this measures.
      expect({ posture, fromStatic, fromDb }).toEqual({
        posture,
        fromStatic: String(factor),
        fromDb: String(factor),
      });
      // Inside the declared envelope on both sides.
      expect(Number(fromStatic)).toBeGreaterThanOrEqual(
        TENANT_THEME_RHYTHM_SCALE_BOUNDS.min
      );
      expect(Number(fromStatic)).toBeLessThanOrEqual(
        TENANT_THEME_RHYTHM_SCALE_BOUNDS.max
      );
    }
  });

  it('spells the concept ONE way on both paths', () => {
    // A second name for the same concept is a finding, not a convenience: the
    // consumers read channel names and nothing else. Scanning for `rhythm`
    // rather than asserting the known name is what makes an invented alias
    // fail here instead of passing unnoticed.
    for (const posture of Object.keys(TENANT_THEME_RHYTHM_FACTORS)) {
      expect(rhythmChannelsIn(staticVariables(posture))).toEqual([CHANNEL]);
      expect(rhythmChannelsIn(dbVariables(posture))).toEqual([CHANNEL]);
    }
  });
});

describe('spacing.rhythm · absent input is the untouched baseline', () => {
  it('emits nothing at all on either path', () => {
    expect(staticVariables()[CHANNEL]).toBeUndefined();
    expect(dbVariables()[CHANNEL]).toBeUndefined();
    expect(rhythmChannelsIn(staticVariables())).toEqual([]);
    expect(rhythmChannelsIn(dbVariables())).toEqual([]);
  });

  it('differs from an authored `normal` by EXACTLY the one rhythm key', () => {
    // The documented default is "normal (factor 1), byte-identical to the
    // pre-rhythm cascade". Proven as a whole-artifact delta rather than by
    // reading the one key: if authoring the posture moved anything else — a
    // spacing rung, a density factor, a digest-visible field — it would show
    // up here, and the "byte-identical" claim would be false.
    const deltaKeys = (
      absent: Record<string, string>,
      normal: Record<string, string>
    ) =>
      [...new Set([...Object.keys(absent), ...Object.keys(normal)])]
        .filter((key) => absent[key] !== normal[key])
        .sort();

    expect(deltaKeys(staticVariables(), staticVariables('normal'))).toEqual([
      CHANNEL,
    ]);
    expect(deltaKeys(dbVariables(), dbVariables('normal'))).toEqual([CHANNEL]);
    // And the one moving key moves to the identity factor, which is what the
    // `:root` seed already resolves to.
    expect(staticVariables('normal')[CHANNEL]).toBe('1');
    expect(dbVariables('normal')[CHANNEL]).toBe('1');
  });
});

/**
 * Module scope on purpose: the same hostile matrix is consumed twice — once
 * against the DB DOCUMENT pipeline (schema-gated) and once against the DB
 * LOWERING itself (ungated). Two copies could drift, and the second block
 * exists precisely because the first one cannot see the lowering.
 */
const HOSTILE: readonly { label: string; value: unknown }[] = [
  { label: 'unknown posture', value: 'cavernous' },
  { label: 'wrong case', value: 'Tight' },
  { label: 'upper case', value: 'TIGHT' },
  { label: 'empty string', value: '' },
  { label: 'null', value: null },
  { label: 'in-envelope raw number', value: 1.2 },
  { label: 'out-of-envelope number', value: 1.9 },
  { label: 'zero', value: 0 },
  { label: 'boolean', value: true },
  { label: 'inherited: constructor', value: 'constructor' },
  { label: 'inherited: toString', value: 'toString' },
  { label: 'inherited: valueOf', value: 'valueOf' },
  { label: 'inherited: hasOwnProperty', value: 'hasOwnProperty' },
  { label: 'inherited: __proto__', value: '__proto__' },
  { label: 'object coercing to a real posture', value: { toString: () => 'tight' } },
];

describe('spacing.rhythm · invalid input fails closed identically on both paths', () => {
  /**
   * The hostile matrix, MEASURED. The control file lists invalid-input
   * behavior as an open claim, so this table is the measurement result and not
   * a restatement of an expectation: every row was observed on both compilers.
   *
   * Three families are represented deliberately, because they fail for
   * different reasons and an implementation can get one right and the others
   * wrong:
   *
   *   - out-of-vocabulary strings, including case variants of real postures;
   *   - wrong types (a raw number inside the envelope, a boolean, null, '');
   *   - INHERITED member names. `constructor`, `toString`, `valueOf`,
   *     `hasOwnProperty` and `__proto__` are not keys of the factor table, but
   *     a bare `TABLE[key]` read resolves them from `Object.prototype`. That
   *     is how the static path emitted `function toString() { [native code] }`
   *     into a numeric channel before the own-property guard landed; the DB
   *     path always rejected them at the enum.
   *
   * SCOPE LIMIT, stated rather than implied: `dbOutcome` consults
   * `validateTenantThemeDocument` first, so this block compares a compiler
   * against a validator. The compiler-to-compiler block below closes that.
   */

  it('refuses every hostile input on BOTH paths, with no path-specific escape', () => {
    const measured = HOSTILE.map(({ label, value }) => ({
      label,
      static: staticOutcome(value),
      db: dbOutcome(value),
    }));

    // Reported as one object so a single failure prints the whole matrix and
    // names which row and which path leaked.
    expect(
      measured.map(({ label, static: fromStatic, db }) => ({
        label,
        staticAccepted: fromStatic.accepted,
        dbAccepted: db.accepted,
      }))
    ).toEqual(
      HOSTILE.map(({ label }) => ({
        label,
        staticAccepted: false,
        dbAccepted: false,
      }))
    );
  });

  it('leaves the artifact byte-identical to the absent case when input is hostile', () => {
    // Failing closed means more than "no rhythm key": the rest of the artifact
    // must be untouched too, or a rejected posture would still have moved the
    // theme. The out-of-envelope number is the sharpest case — the CSS clamp
    // would have bounded it, which is precisely why the compiler must not have
    // emitted it in the first place.
    const baseline = staticVariables();
    for (const { label, value } of HOSTILE) {
      expect({ label, variables: staticVariables(value) }).toEqual({
        label,
        variables: baseline,
      });
    }
  });

  it('DRILL: the inherited-member read is caught, not tolerated', () => {
    // The counterfactual for the own-property guard, written as the value the
    // unguarded lowering produced. If the guard is removed, the channel comes
    // back carrying a function body and this fails on the FIRST assertion —
    // which is the difference between a closed vocabulary and a lookup.
    const emitted = staticVariables('toString')[CHANNEL];
    expect(emitted).toBeUndefined();
    expect(String(emitted)).not.toContain('native code');
  });
});

describe('spacing.rhythm · COMPILER versus COMPILER, with no validator in between', () => {
  /**
   * WHY THIS BLOCK EXISTS, AND WHY THE BLOCK ABOVE WAS NOT ENOUGH.
   *
   * `dbOutcome` asks `validateTenantThemeDocument` first and returns
   * `{accepted:false}` the moment the schema refuses. That makes the hostile
   * matrix above a comparison between a COMPILER (static) and a VALIDATOR
   * (DB) — so it proves the DB *document pipeline* fails closed, and says
   * nothing about the DB *lowering* itself.
   *
   * That gap was not hypothetical. `appearanceGeneralToVariables` is exported
   * and reachable without the schema through the legacy `TenantConfig.
   * appearance` compat path, and at the time this block was written it read
   * the factor table with a bare `TABLE[key]`. An inherited member name
   * resolved to a FUNCTION, `factor != null` passed, `clampValue` coerced it
   * to `NaN`, and the literal text `NaN` was written into the channel — the
   * exact defect the static path had already been hardened against in the same
   * working tree. A validator-gated comparison could never see it.
   *
   * So this block drives BOTH REAL LOWERERS on the same inputs, with no schema
   * on either side, and demands identical valid / absent / hostile behaviour.
   */
  const staticLowering = (rhythm?: unknown): string | undefined =>
    staticVariables(rhythm)[CHANNEL];

  /** The DB lowering itself — the function `compileTenantThemeConfig` calls. */
  const dbLowering = (rhythm?: unknown): string | undefined =>
    appearanceGeneralToVariables(
      (rhythm === undefined ? {} : { rhythm }) as never
    )[CHANNEL];

  it('agrees on every VALID posture', () => {
    const measured = Object.entries(TENANT_THEME_RHYTHM_FACTORS).map(
      ([posture, factor]) => ({
        posture,
        fromStatic: staticLowering(posture),
        fromDb: dbLowering(posture),
        expected: String(factor),
      })
    );
    expect(measured).toEqual(
      measured.map(({ posture, expected }) => ({
        posture,
        fromStatic: expected,
        fromDb: expected,
        expected,
      }))
    );
  });

  it('agrees that ABSENT emits nothing', () => {
    expect({ fromStatic: staticLowering(), fromDb: dbLowering() }).toEqual({
      fromStatic: undefined,
      fromDb: undefined,
    });
  });

  it('agrees on every HOSTILE input, compiler to compiler', () => {
    const measured = HOSTILE.map(({ label, value }) => ({
      label,
      fromStatic: staticLowering(value),
      fromDb: dbLowering(value),
    }));

    // One object so a failure prints the whole matrix and names the leaking
    // path. `undefined` on both sides is the only acceptable row: a hostile
    // posture must leave the channel unwritten, not written-and-clamped.
    expect(measured).toEqual(
      HOSTILE.map(({ label }) => ({
        label,
        fromStatic: undefined,
        fromDb: undefined,
      }))
    );
  });

  it('DRILL: never emits the string NaN, on either path', () => {
    // The specific corruption. `NaN` in the channel makes
    // `clamp(0.8, var(--ds-rhythm-scale, 1), 1.25)` invalid at computed-value
    // time for every consumer, which is strictly worse than an ignored input.
    for (const { label, value } of HOSTILE) {
      expect({ label, fromStatic: staticLowering(value) }).toEqual({
        label,
        fromStatic: undefined,
      });
      expect({ label, fromDb: dbLowering(value) }).toEqual({
        label,
        fromDb: undefined,
      });
    }
  });

  it('COUNTERFACTUAL: the unguarded lowering really did produce NaN', () => {
    // Proof that the drills above are load-bearing rather than vacuously
    // green. This reproduces the exact arithmetic both lowerings used before
    // the own-property guard: a bare bracket read, a `!= null` check that a
    // function satisfies, and a clamp that coerces through ToNumber.
    const unguarded = (rhythm: unknown): string | undefined => {
      const factor = (TENANT_THEME_RHYTHM_FACTORS as Record<string, unknown>)[
        rhythm as string
      ];
      if (factor == null) return undefined;
      return String(
        Math.max(
          TENANT_THEME_RHYTHM_SCALE_BOUNDS.min,
          Math.min(TENANT_THEME_RHYTHM_SCALE_BOUNDS.max, factor as number)
        )
      );
    };

    // The inherited-member family is what escaped, and it escaped as NaN.
    for (const name of ['toString', 'constructor', 'valueOf', '__proto__']) {
      expect({ name, emitted: unguarded(name) }).toEqual({ name, emitted: 'NaN' });
      // ...and the guarded lowerings refuse the very same input.
      expect({ name, emitted: staticLowering(name) }).toEqual({
        name,
        emitted: undefined,
      });
      expect({ name, emitted: dbLowering(name) }).toEqual({
        name,
        emitted: undefined,
      });
    }

    // The counterfactual must still agree with the real lowerings on the
    // VALID stops, or it would be a strawman rather than the prior behaviour.
    for (const posture of Object.keys(TENANT_THEME_RHYTHM_FACTORS)) {
      expect({ posture, emitted: unguarded(posture) }).toEqual({
        posture,
        emitted: staticLowering(posture),
      });
    }
  });
});

describe('spacing.rhythm · the expert token-overrides path cannot acquire the channel', () => {
  it('is absent from the exact override allowlist', () => {
    expect(TENANT_THEME_OVERRIDE_TOKENS as readonly string[]).not.toContain(
      CHANNEL
    );
  });

  it('is rejected by the document schema as an unknown key, not silently ignored', () => {
    // The difference between a real allowlist and a decorative one. The schema
    // builds `tokenOverrides` from `TENANT_THEME_OVERRIDE_TOKENS`, and an
    // unlisted key must produce an issue rather than being dropped on the
    // floor — a drop would read as "accepted" to the caller.
    const hostile = {
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        general: { palette: { primary: '#0F766E' } },
        advanced: { tokenOverrides: { [CHANNEL]: 1.9 } },
      },
    };

    const result = validateTenantThemeDocument(hostile);
    expect(result.success).toBe(false);
    // The assertion above states the claim; this guard is what makes it
    // load-bearing for the reads that follow. A Vitest expectation cannot
    // narrow the result union, and silently reading `issues` off an accepted
    // result would report a vacuous pass instead of the rejection this drill
    // exists to measure.
    if (result.success) {
      throw new Error(
        `Expected the hostile spacing-rhythm override \`${CHANNEL}\` to be REJECTED by the document schema as an unknown \`tokenOverrides\` key, but validation accepted the document.`
      );
    }
    expect(
      result.issues.map(({ code, path }) => ({ code, path }))
    ).toContainEqual({
      code: 'unknown_key',
      path: `$.visualFoundation.advanced.tokenOverrides["${CHANNEL}"]`,
    });

    // Positive control for the drill: a LISTED token in the same position
    // validates, so the rejection above is about the name and not about the
    // shape of the fixture.
    const listed = {
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        general: { palette: { primary: '#0F766E' } },
        advanced: { tokenOverrides: { '--ds-effect-intensity': 0.45 } },
      },
    };
    expect(validateTenantThemeDocument(listed).success).toBe(true);
  });

  it('FINDING: the unvalidated compat seam still lowers it, and is bounded only by the CSS envelope', () => {
    // Measured, and recorded as the open gap it is rather than asserted away.
    // `compileAppearanceVariables` is the normalized compiler/compat entry —
    // reachable from the legacy `TenantConfig.appearance` path — and it
    // filters raw overrides by the `--ds-` PREFIX alone. No published DB
    // document can arrive here with this name (the test above is the gate),
    // but a hand-built compat payload can.
    const seam = compileAppearanceVariables({
      advanced: { tokenOverrides: { [CHANNEL]: 1.9 } },
    } as never).variables;

    expect(seam[CHANNEL]).toBe('1.9');

    // The envelope claim survives that gap, and the distinction matters: the
    // raw value escapes the tight/normal/airy VOCABULARY but not the 0.8-1.25
    // ENVELOPE, because the clamp lives in the derived channel
    // (`--ds-rhythm-effective-scale`) in the DS floor rather than in the
    // compiler. So the reachable damage is an arbitrary in-envelope factor,
    // never an out-of-envelope one.
    expect(1.9).toBeGreaterThan(TENANT_THEME_RHYTHM_SCALE_BOUNDS.max);
  });
});
