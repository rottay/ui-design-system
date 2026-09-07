/**
 * Byte-identity contract for compiled artifacts. The fixtures were compiled
 * before the W4 white-label surface (anatomy variants, typePairing, type/radius
 * scale dials, dark seeds, generated chart series, contrast autocorrect).
 *
 * Documents that use none of the new surface must keep their EMISSION stable:
 * normalizedAppearance, scopes and every pre-W4 variable stay byte-identical.
 * Three divergences are sanctioned and pinned exactly:
 * - digest/verticalEnvelopeDigest move once because both registered envelopes
 *   deliberately gained `allowAnatomyVariants` + typeScale/radiusScale ranges;
 * - a document with a concrete primary seed additionally emits the ten
 *   compiler-owned `--ds-chart-series-*` variables and the readable
 *   `--ds-color-text-on-primary` ink, both pure derivations of that seed;
 * - an explicit density mode emits `--ds-density-mode-factor`, keeping the
 *   semantic mode separate from the existing structural density scale.
 *
 * The font-family baselines additionally carry the DS-A007 Arabic-safe tail:
 * emission — not the stored document — appends `"Noto Sans Arabic"` ahead of
 * the trailing generic, so AR/RTL copy renders under every tenant stack.
 * `normalizedAppearance` still records the authored families verbatim.
 *
 * ISO wave: the DB transport no longer runs its own appearance compiler. It
 * migrates to a ThemeLayerPatch, resolves that patch onto the code-owned vertical
 * Theme, and lowers the result through the single `compileTheme`. `variables`
 * is therefore a DELTA against the compiled vertical baseline: a channel the
 * tenant does not move is inherited, not restated. That changes which channels
 * appear at all, so every fixture divergence below is declared per call site
 * with its cause attached to the assertion message — the fixtures themselves
 * stay frozen pre-change snapshots and are never refreshed.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { TenantThemeArtifact } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_COMPILER_VERSION,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "..";
import { TENANT_THEME_V1_COVERAGE } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { RAMP_STEPS, deriveOklchRamp } from "@/foundation/kernel/color/oklch/ramp";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

const FIXTURE_DIR = resolve(
  process.cwd(),
  "src/infrastructure/compilers/composition/tenant-theme/tests/fixtures"
);

const readFixture = (name: string): TenantThemeArtifact =>
  JSON.parse(readFileSync(resolve(FIXTURE_DIR, name), "utf8"));

const CHART_SERIES_TOKEN = /^--ds-chart-series-(?:[1-9]|10)$/;
const DENSITY_MODE_FACTOR_TOKEN = "--ds-density-mode-factor";
const ON_PRIMARY_INK_TOKEN = "--ds-color-text-on-primary";
const BEHAVIOR_ONLY_AMBIENT_TOKEN = "--ds-motion-ambient";

/** The ground the retired appearance compiler assumed for an unstated canvas. */
const PRE_ISO_ASSUMED_CANVAS = "#FFFFFF";
/** The ground the single lowering reads off the merged Theme instead. */
const BITHIRE_AUTHORED_CANVAS = "#F4F8FB";
/** Exactly the three seeds `POPULATED_SIMPLE_DOCUMENT` authors. */
const REGROUNDED_RAMP_SEEDS = {
  primary: "#0F766E",
  secondary: "#8C6D46",
  accent: "#E2725B",
} as const;

/** The compiled bithire baseline's own radius dial. */
const BITHIRE_RADIUS_DIAL = "1.25";

/**
 * Channels the populated document no longer restates, and the reason each one
 * is healthy. Every member here is BENIGN: the value is genuinely identical
 * under the tenant's seed and under the baseline, so tenant and baseline agree
 * and the delta inherits rather than repeats it.
 *
 * This list used to carry a second, unhealthy group of seven, marked DEFERRED:
 * the bithire baseline authors button, link and focus chrome as concrete
 * leaves, and a resolved Theme carries no record of which layer authored a
 * field, so the tenant's own primary seed could not displace them. T2A closed
 * that. `applyTenantSeedDerivations` re-derives the family a tenant-authored
 * `palette.primary` owns, so those seven now reach the delta with the TENANT's
 * colour — they moved from this list into `POPULATED_SEED_DERIVED`, where they
 * are pinned by value rather than by absence.
 */
const POPULATED_WITHDRAWN: readonly RetiredChannel[] = [
  {
    token: "--ds-color-primary-foreground",
    because: "benign: #ffffff under both the tenant seed and the baseline",
  },
  {
    token: ON_PRIMARY_INK_TOKEN,
    because: "benign: #ffffff under both the tenant seed and the baseline",
  },
  {
    token: DENSITY_MODE_FACTOR_TOKEN,
    because: "benign: a `normal` mode rests at the baseline's own factor of 1",
  },
  {
    token: "--ds-button-primary-bg",
    because: "benign: a `var(--ds-color-primary)` indirection, not a color",
  },
  {
    token: "--ds-button-primary-border",
    because: "benign: a `var(--ds-button-primary-bg)` indirection, not a color",
  },
  {
    token: "--ds-button-primary-color",
    because: "benign: a `var(--ds-control-on-brand)` indirection, not a color",
  },
];

/**
 * The other side of that closure: the six channels the tenant's own
 * `palette.primary` (`#0F766E`) now re-derives, pinned at the exact value each
 * one carries. They are ADDITIONS — absent from the frozen pre-change fixture,
 * because before T2A the baseline's blue displaced every one of them — so the
 * declaration is two-sided by construction: absent from the fixture, present in
 * the artifact at these values.
 *
 * Four of the ten channels the seed owns stay in `POPULATED_WITHDRAWN` above,
 * and correctly so. Re-derivation only produces a delta member when the derived
 * value BAKES A COLOUR OF ITS OWN; `--ds-button-primary-border`,
 * `--ds-button-primary-bg`, `--ds-button-primary-color` and
 * `--ds-color-primary-foreground` resolve
 * through an indirection that already points at a channel the seed controls, so
 * they are byte-identical to the baseline's and the subtraction removes them.
 * Splitting the family this way is what makes a future regression legible: a
 * derivation that stops firing empties this record, and one that starts baking
 * literals where an indirection belongs moves a token across the boundary.
 */
const POPULATED_SEED_DERIVED: Readonly<Record<string, string>> = {
  "--ds-button-primary-bg-hover": "#00635C",
  "--ds-color-border-focus": "#0F766E",
  "--ds-color-link": "#0F766E",
  "--ds-color-link-hover": "#00635C",
  "--ds-input-border-focus": "var(--ds-color-border-focus, var(--ds-color-primary))",
  "--ds-input-shadow-focus":
    "0 0 0 3px color-mix(in srgb, var(--ds-color-border-focus, var(--ds-color-primary)) 20%, transparent)",
};

/**
 * Channels the W4 pin document no longer restates. Every one of them is proven
 * byte-identical between `compileTheme(bithire)` and the tenant's own
 * compilation, so the delta inherits rather than repeats them — this document
 * was authored to mirror the bithire baseline, which is exactly why it is the
 * pin. `--ds-radius-md` is the one rename: the dial law emits the reachable
 * OPERAND `--ds-radius-md-base`, never a resolved radius, and that operand is
 * itself baseline-identical here.
 */
const W4_RETIRED: readonly RetiredChannel[] = [
  {
    token: "--ds-radius-md",
    because: "renamed to the dial operand `--ds-radius-md-base`",
  },
  {
    token: "--ds-density-scale",
    because: "baseline-identical: the bithire baseline also rests at 0.9",
  },
  {
    token: "--ds-elevation-1",
    because: "baseline-identical: the bithire baseline is already flat",
  },
  {
    token: "--ds-elevation-2",
    because: "baseline-identical: the bithire baseline is already flat",
  },
  {
    token: "--ds-elevation-3",
    because: "baseline-identical: the bithire baseline is already flat",
  },
  {
    token: "--ds-layout-header-height",
    because: "baseline-identical: the bithire baseline also authors 56px",
  },
  {
    token: "--ds-shell-header-block-size",
    because: "baseline-identical: the bithire baseline also authors 56px",
  },
];

/**
 * The sidebar pair this document authors EXPLICITLY, and which emission used to
 * discard. `general.navigation.sidebarTone` and `advanced.chrome.sidebar.bg`
 * come from the SAME document, but the semantic posture was lowered last into
 * the same flat chrome object, so it overwrote the concrete leaf beside it —
 * the pair left as `var(--ds-color-neutral-900)` / `var(--ds-color-neutral-100)`
 * and this list pinned that loss so the fix would red.
 *
 * T2A made that fix. `assignToneUnderTenantLeaves` ranks a tenant's explicit
 * leaf above a tone from any layer, including the tenant's own, so the pair now
 * reaches CSS as authored — which is byte-identical to what the frozen
 * pre-change fixture already recorded. The declaration therefore inverts: it no
 * longer says "these two moved away from the fixture", it says "these two are
 * back ON the fixture, and that is load-bearing". Absence would red here too,
 * so the restoration cannot be undone by dropping the channels instead.
 */
const W4_RESTORED: readonly RetiredChannel[] = [
  {
    token: "--ds-sidebar-bg",
    because: "the tenant's explicit sidebar leaf outranks its own sidebarTone",
  },
  {
    token: "--ds-sidebar-text",
    because: "the tenant's explicit sidebar leaf outranks its own sidebarTone",
  },
];

/**
 * The fourth sanctioned divergence: an authored radius LITERAL now reaches the
 * artifact as its own product with `--ds-radius-scale`, so a tenant corner
 * stays reachable by `shape.radius-scale` instead of outranking it from the
 * unlayered tenant block. Every resting pixel is unchanged — these documents
 * author no radius scale, so the dial rests at 1.
 *
 * Declared per call site, never pattern-matched, and deliberately not refreshed
 * into the fixtures: a channel that starts folding without being declared is a
 * change to review. The populated fixture's `--ds-radius-button` is
 * `var(--ds-radius-md, 8px)` and stays untouched, which proves how narrow the
 * rule is.
 *
 * The fold divides by the compiled baseline's own `--ds-radius-scale` before
 * multiplying by it, so the resting pixel reproduces the authored literal
 * exactly. That divisor is a property of the vertical, not a constant — the
 * bithire baseline authors `1.25` — so it is declared per call site alongside
 * the folded channels. A vertical resting at `1` folds to the bare literal.
 */
const dialedRadius = (authored: string, divisor: string): string =>
  divisor === "1"
    ? authored
    : `calc(${authored} / ${divisor} * var(--ds-radius-scale, 1))`;

/** Rewrite a frozen fixture's declarations of `tokens` into their dialed form. */
const withDialedRadius = (
  css: string,
  tokens: readonly string[],
  divisor: string
): string =>
  css
    .split("\n")
    .map((line) => {
      const match = /^(\s*)(--[\w-]+):\s*(.+);$/.exec(line);
      if (!match || !tokens.includes(match[2])) return line;
      return `${match[1]}${match[2]}: ${dialedRadius(match[3], divisor)};`;
    })
    .join("\n");

/** A fixture channel the delta transport no longer restates, and why. */
interface RetiredChannel {
  readonly token: string;
  /** Causal reason; doubles as the assertion message when it comes back. */
  readonly because: string;
}

/**
 * Drop the trailing mode-delta scope blocks. The frozen fixtures predate mode
 * deltas entirely: the pre-ISO transport emitted one resting block per tenant,
 * so a document whose effective dark mode diverges from the vertical's had no
 * way to say so. `projectModeDeltas` now appends that divergence as its own
 * scoped block, which is additive by construction — the resting block above it
 * is what the fixtures pin, and it is compared byte-for-byte after this trim.
 * The block's own content is asserted separately at the call site.
 */
const withoutModeDeltaBlocks = (css: string): string => {
  const index = css.indexOf("[data-theme='dark']");
  if (index === -1) return css;
  const start = css.lastIndexOf("[data-ds-root]", index);
  // Keeps the resting block's own terminator, so the trim never changes the
  // trailing whitespace the frozen fixture pins.
  return css.slice(0, start);
};

/** Drop whole declarations of `tokens` from a frozen fixture's css body. */
const withoutTokens = (css: string, tokens: readonly string[]): string =>
  css
    .split("\n")
    .filter((line) => {
      const match = /^\s*(--[\w-]+):/.exec(line);
      return !match || !tokens.includes(match[1]);
    })
    .join("\n");

/** The artifact css minus its digest banner line. */
const cssBody = (artifact: Pick<TenantThemeArtifact, "css">): string =>
  artifact.css.split("\n").slice(1).join("\n");

const withoutDensityModeFactor = (css: string): string =>
  css
    .split("\n")
    .filter((line) => !line.includes(DENSITY_MODE_FACTOR_TOKEN))
    .join("\n");

/**
 * `motion.ambient` remains part of normalized appearance and is consumed by
 * MotionProvider. It is intentionally absent from CSS because off|subtle is a
 * policy keyword, not a CSS time or scalar.
 */
const withoutBehaviorOnlyAmbient = (css: string): string =>
  css
    .split("\n")
    .filter((line) => !line.includes(BEHAVIOR_ONLY_AMBIENT_TOKEN))
    .join("\n");

interface DeclaredDivergences {
  /** Authored radius literals the dial now folds. */
  readonly dialFolded?: readonly string[];
  /** The compiled baseline's `--ds-radius-scale`, i.e. the fold's divisor. */
  readonly dialDivisor?: string;
  /** Fixture channels the delta transport inherits instead of restating. */
  readonly retired?: readonly RetiredChannel[];
  /** Former additions the delta transport inherits instead of emitting. */
  readonly withdrawn?: readonly RetiredChannel[];
  /** Channels whose value moved once, keyed to their new value. */
  readonly moved?: Readonly<Record<string, string>>;
  /** Additions a tenant seed re-derives, keyed to the exact derived value. */
  readonly seedDerived?: Readonly<Record<string, string>>;
  /** Channels a fix returned to the frozen fixture's own value. */
  readonly restored?: readonly RetiredChannel[];
}

function expectStableEmission(
  artifact: TenantThemeArtifact,
  fixture: TenantThemeArtifact,
  declared: DeclaredDivergences = {}
): string[] {
  const dialFolded = declared.dialFolded ?? [];
  const dialDivisor = declared.dialDivisor ?? "1";
  const retired = declared.retired ?? [];
  const moved = declared.moved ?? {};
  const retiredTokens = retired.map((entry) => entry.token);
  expect(JSON.stringify(artifact.normalizedAppearance)).toBe(
    JSON.stringify(fixture.normalizedAppearance)
  );
  expect(JSON.stringify(artifact.scopes)).toBe(JSON.stringify(fixture.scopes));
  expect(artifact.adjustments).toBeUndefined();
  for (const [token, value] of Object.entries(fixture.variables)) {
    if (token === BEHAVIOR_ONLY_AMBIENT_TOKEN) continue;
    if (retiredTokens.includes(token)) continue;
    const expected =
      moved[token] ??
      (dialFolded.includes(token) ? dialedRadius(value, dialDivisor) : value);
    expect(artifact.variables[token], token).toBe(expected);
  }
  // Refuses a stale declaration in both directions: a token that left the
  // fixture, and a token the compiler stopped folding. Without it the list
  // could outlive the exception and quietly stop asserting anything.
  for (const token of dialFolded) {
    expect(fixture.variables[token], `${token} absent from fixture`).toBeDefined();
    expect(fixture.variables[token]?.startsWith("calc(")).toBe(false);
  }
  // Same two-sided rule for a retired channel: it must still be IN the frozen
  // fixture, so the declaration cannot outlive the divergence it explains, and
  // OUT of the artifact, so a channel that re-enters the delta reds here with
  // its own causal reason rather than passing silently.
  for (const { token, because } of retired) {
    expect(fixture.variables[token], `${token} absent from fixture`).toBeDefined();
    expect(artifact.variables[token], because).toBeUndefined();
  }
  // A withdrawn channel never was in the frozen fixture — it used to arrive as
  // a declared ADDITION and no longer does. It must be absent from both sides;
  // the exact-equality additions assertion is what keeps the list from
  // outliving the divergence.
  for (const { token, because } of declared.withdrawn ?? []) {
    expect(fixture.variables[token], `${token} is in the fixture`).toBeUndefined();
    expect(artifact.variables[token], because).toBeUndefined();
  }
  // And a moved channel must still be in the fixture AND have actually moved.
  for (const [token, value] of Object.entries(moved)) {
    expect(fixture.variables[token], `${token} absent from fixture`).toBeDefined();
    expect(fixture.variables[token], `${token} did not move`).not.toBe(value);
  }
  // A seed-derived channel is the mirror image of a withdrawn one: absent from
  // the frozen fixture, because the baseline used to displace it, and present
  // in the artifact carrying the value the TENANT's seed derives. Pinning the
  // value rather than mere presence is what stops a derivation from drifting
  // onto some other colour and still passing.
  for (const [token, value] of Object.entries(declared.seedDerived ?? {})) {
    expect(fixture.variables[token], `${token} is in the fixture`).toBeUndefined();
    expect(artifact.variables[token], `${token} is not seed-derived`).toBe(value);
  }
  // A restored channel is one a fix returned to the fixture's own value. The
  // loop above already compares it; declaring it here states that the identity
  // is load-bearing rather than incidental, and refuses the other way out of a
  // regression — dropping the channel instead of repainting it.
  for (const { token, because } of declared.restored ?? []) {
    expect(fixture.variables[token], `${token} absent from fixture`).toBeDefined();
    expect(artifact.variables[token], because).toBe(fixture.variables[token]);
  }
  // And nothing folded behind our back.
  expect(
    Object.keys(fixture.variables)
      .filter((token) => artifact.variables[token]?.startsWith("calc("))
      .sort()
  ).toEqual([...dialFolded].sort());
  expect(artifact.variables[BEHAVIOR_ONLY_AMBIENT_TOKEN]).toBeUndefined();
  const additions = Object.keys(artifact.variables).filter(
    (token) => fixture.variables[token] === undefined
  );
  // The envelope opt-in flip is the wave's one sanctioned digest move.
  expect(artifact.verticalEnvelopeDigest).not.toBe(
    fixture.verticalEnvelopeDigest
  );
  expect(artifact.digest).not.toBe(fixture.digest);
  // Provenance wave: the artifact now declares the channels it owns, so the
  // compiler version moves exactly once alongside the digest while emission
  // stays byte-stable. The fixtures remain frozen pre-change snapshots.
  expect(artifact.compilerVersion).not.toBe(fixture.compilerVersion);
  expect(artifact.compilerVersion).toBe(TENANT_THEME_COMPILER_VERSION);
  expect(fixture.coverage).toBeUndefined();
  expect(artifact.coverage).toEqual([...TENANT_THEME_V1_COVERAGE]);
  return additions;
}

const IDENTITY = {
  tenantId: "tenant_fixture",
  slug: "fixture-tenant",
  verticalKey: "bithire",
  rowVersion: 1,
} as const;

const W4_PIN_IDENTITY = {
  tenantId: "tenant_w4_pin",
  slug: "w4-pin-tenant",
  verticalKey: "bithire",
  rowVersion: 3,
} as const;

const NULL_OVERRIDE_DOCUMENT = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {},
} as const;

const POPULATED_SIMPLE_DOCUMENT = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {
    palette: {
      primary: "#0F766E",
      secondary: "#8C6D46",
      accent: "#E2725B",
      backgroundMode: "light",
    },
    typography: {
      fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
      fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
    },
    density: "normal",
    motion: { intensity: 0.62, durationScale: 1.15, ambient: "subtle" },
    shape: { buttonStyle: "soft" },
    surfaces: { elevation: "elevated" },
    navigation: { sidebarTone: "subtle" },
  },
} as const;

const ABSENT_NEW_FIELDS_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      typography: {
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, serif",
      },
      shape: { buttonStyle: "pill" },
      density: "compact",
      motion: { intensity: 0.4, durationScale: 0.9, ambient: "off" },
      surfaces: { elevation: "flat" },
      navigation: { sidebarTone: "inverse" },
    },
    advanced: {
      chrome: {
        sidebar: { bg: "#101014", text: "#F4F4F5", width: "248px" },
        layout: { headerBg: "#FFFFFF", headerHeight: "56px" },
        table: { headerBg: "#F8F8FA", cellPadding: "10px 12px" },
        cardComponent: { bg: "#FFFFFF", radius: "10px" },
      },
      tokenOverrides: {
        "--ds-radius-md": "10px",
        "--ds-density-scale": 0.9,
      },
    },
  },
} as const;

describe("tenant theme artifact byte-identity against pre-W4 fixtures", () => {
  it("keeps the null-override document's emission byte-identical", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(NULL_OVERRIDE_DOCUMENT, { ...IDENTITY })
    );
    const fixture = readFixture("null-override-artifact.fixture.json");
    const additions = expectStableEmission(artifact, fixture);
    expect(additions).toEqual([]);
    expect(cssBody(artifact)).toBe(withoutBehaviorOnlyAmbient(cssBody(fixture)));
  });

  it("keeps the populated simple document stable modulo the generated chart series", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );
    const fixture = readFixture("populated-simple-artifact.fixture.json");

    // Regrounding, proven from both sides. The pre-ISO appearance compiler
    // resolved its ramp ground from the TENANT's own general block alone, so a
    // document that authors no background fell back to an assumed pure white.
    // The single lowering resolves it from the merged Theme, which finally
    // mixes the ramp toward the canvas the tenant actually sits on. Nothing
    // else about the derivation moved: the same seed and the same
    // `deriveOklchRamp` reproduce the FROZEN fixture from the old ground and
    // the artifact from the new one, step for step. That two-sided identity is
    // the causal reason this pin moves exactly once.
    expect(
      FIRST_PARTY_THEMES.bithire.palette.backgroundColor,
      "the new ground is the bithire baseline's authored canvas"
    ).toBe(BITHIRE_AUTHORED_CANVAS);
    const regrounded: Record<string, string> = {};
    for (const [role, seed] of Object.entries(REGROUNDED_RAMP_SEEDS)) {
      const before = deriveOklchRamp(seed, PRE_ISO_ASSUMED_CANVAS, "light");
      const after = deriveOklchRamp(seed, BITHIRE_AUTHORED_CANVAS, "light");
      for (const step of RAMP_STEPS) {
        const token = `--ds-color-${role}-${step}`;
        expect(fixture.variables[token], `${token} is the old ground`).toBe(
          before[step]
        );
        if (after[step] !== before[step]) regrounded[token] = after[step];
      }
    }
    // The darkest steps land on the same pixel under either ground, so a
    // silent collapse of the whole map into a no-op would be visible here.
    expect(Object.keys(regrounded).length).toBe(26);

    const additions = expectStableEmission(artifact, fixture, {
      withdrawn: POPULATED_WITHDRAWN,
      seedDerived: POPULATED_SEED_DERIVED,
      moved: {
        ...regrounded,
        // The canonical `sidebarToneToChrome` lowering replaced the appearance
        // path's flat recipe. `subtle` now plates the active row on
        // `--ds-color-primary-100` and inks it with `--ds-color-primary-900`;
        // the old pairing put the raw primary seed on that same tint, which is
        // the sub-floor combination the APCA text-contrast law rejects.
        "--ds-sidebar-item-color-active": "var(--ds-color-primary-900)",
      },
    });
    expect(additions.filter((token) => CHART_SERIES_TOKEN.test(token))).toHaveLength(10);
    expect([...additions].sort()).toEqual([
      // The seed-derived six. Their VALUES are pinned by
      // `POPULATED_SEED_DERIVED`; what this list adds is exactness — no seventh
      // channel may join the family without being declared there first.
      "--ds-button-primary-bg-hover",
      "--ds-chart-series-1",
      "--ds-chart-series-10",
      "--ds-chart-series-2",
      "--ds-chart-series-3",
      "--ds-chart-series-4",
      "--ds-chart-series-5",
      "--ds-chart-series-6",
      "--ds-chart-series-7",
      "--ds-chart-series-8",
      "--ds-chart-series-9",
      "--ds-color-border-focus",
      "--ds-color-link",
      "--ds-color-link-hover",
      // The rgb companions of the seeds this document DOES move. They are the
      // positive control for the retirements below: the tenant's palette seed
      // reaches the delta, so a missing derivation is never "the seed was
      // ignored".
      "--ds-color-primary-rgb",
      "--ds-color-secondary-rgb",
      "--ds-input-border-focus",
      "--ds-input-shadow-focus",
    ]);
    expect(artifact.variables["--ds-color-primary-rgb"]).toBe("15, 118, 110");
    expect(artifact.variables["--ds-color-secondary-rgb"]).toBe("140, 109, 70");
  });

  it("keeps an advanced document ABSENT of every W4 field byte-identical", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(ABSENT_NEW_FIELDS_DOCUMENT, {
        ...W4_PIN_IDENTITY,
      }),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire") }
    );
    const fixture = readFixture("w4-absent-new-fields-artifact.fixture.json");
    // The three authored radius literals in this document. `--ds-radius-md` is
    // authored too, but through `tokenOverrides`, which the migration maps to
    // `surfaces.borderRadius.md` — so it leaves as the dial OPERAND rather
    // than folding in place, and is declared in `W4_RETIRED` instead.
    const dialFolded = [
      "--ds-card-border-radius",
      "--ds-card-radius",
      "--ds-radius-button",
    ];
    const additions = expectStableEmission(artifact, fixture, {
      dialFolded,
      dialDivisor: BITHIRE_RADIUS_DIAL,
      retired: W4_RETIRED,
      restored: W4_RESTORED,
    });
    expect(additions).toEqual([DENSITY_MODE_FACTOR_TOKEN]);
    expect(artifact.variables[DENSITY_MODE_FACTOR_TOKEN]).toBe("0.85");
    // `--ds-radius-md` leaving the delta must mean "equal to the baseline",
    // never "the override stopped arriving". The same document with a radius
    // the baseline does NOT author proves the path is live: it emits the dial
    // operand, divided by that same baseline scale.
    const movedRadius = compileTenantThemeConfig(
      hydrateTenantThemeConfig(
        {
          ...ABSENT_NEW_FIELDS_DOCUMENT,
          visualFoundation: {
            ...ABSENT_NEW_FIELDS_DOCUMENT.visualFoundation,
            advanced: {
              ...ABSENT_NEW_FIELDS_DOCUMENT.visualFoundation.advanced,
              tokenOverrides: {
                ...ABSENT_NEW_FIELDS_DOCUMENT.visualFoundation.advanced
                  .tokenOverrides,
                "--ds-radius-md": "12px",
              },
            },
          },
        },
        { ...W4_PIN_IDENTITY }
      ),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire") }
    );
    expect(movedRadius.variables["--ds-radius-md-base"]).toBe(
      `calc(12px / ${BITHIRE_RADIUS_DIAL})`
    );
    expect(movedRadius.variables["--ds-radius-md"]).toBeUndefined();
    // The one mode-delta block this document produces, pinned exactly so the
    // trim above can never hide a channel. `sidebarTone: inverse` is the only
    // field here that reads the effective mode, and it inks the active row
    // with `neutral-100` in dark instead of the resting `white`; the other
    // four are the dark halves of the authored card/table/header chrome.
    //
    // This block is UNCHANGED by the sidebar restoration above, and that is
    // load-bearing rather than incidental. The tenant states
    // `chrome.sidebar.bg`/`.text` once, at the base, without qualifying a mode
    // — so it has stated them for every mode, and bithire's own
    // `modes.dark.chrome.sidebar` must not take them back. The two values that
    // would otherwise appear here are asserted to exist on the baseline, so
    // this stays a proof that they LOSE rather than a vacuous absence.
    const bithireDark = FIRST_PARTY_THEMES.bithire.modes?.dark?.chrome?.sidebar;
    expect(bithireDark?.bg, "the vertical does author a dark sidebar bg").toBe(
      "#0a0f18"
    );
    expect(bithireDark?.text, "the vertical does author a dark sidebar ink").toBe(
      "var(--ds-color-text-secondary)"
    );
    expect(artifact.modeDeltas?.length).toBe(1);
    expect(artifact.modeDeltas?.[0]?.mode).toBe("dark");
    expect(artifact.modeDeltas?.[0]?.variables).toEqual({
      "--ds-card-bg": "#151d2b",
      "--ds-layout-header-bg":
        "color-mix(in srgb, var(--ds-surface-card) 92%, transparent)",
      "--ds-sidebar-item-color-active": "var(--ds-color-neutral-100)",
      "--ds-table-cell-padding": "0.875rem 1rem",
      "--ds-table-header-bg": "#151d2b",
    });
    // With the sidebar pair restored, the css body needs no value rewrite at
    // all: retirements and the radius dial are the only two things still
    // standing between this document and the frozen fixture, byte for byte.
    expect(withoutModeDeltaBlocks(withoutDensityModeFactor(cssBody(artifact)))).toBe(
      withoutTokens(
        withDialedRadius(
          withoutBehaviorOnlyAmbient(cssBody(fixture)),
          dialFolded,
          BITHIRE_RADIUS_DIAL
        ),
        W4_RETIRED.map((entry) => entry.token)
      )
    );
  });

  it("emits variables in deterministic UTF-16 code-unit order", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );
    const keys = Object.keys(artifact.variables);
    const codeUnitSorted = [...keys].sort((left, right) =>
      left < right ? -1 : left > right ? 1 : 0
    );
    expect(keys).toEqual(codeUnitSorted);
    expect(keys.length).toBeGreaterThan(20);
  });

  it("keeps the DS-A007 Arabic-safe tail on tenant-authored stacks", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );

    expect(artifact.variables["--ds-font-family-base"]).toBe(
      'Optima, Candara, \'Noto Sans\', "Noto Sans Arabic", sans-serif'
    );
    expect(artifact.variables["--ds-font-family-heading"]).toBe(
      '\'Fraunces\', Georgia, \'Times New Roman\', "Noto Sans Arabic", serif'
    );
    expect(artifact.normalizedAppearance.general?.typography).toEqual({
      fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
      fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
    });
  });
});
