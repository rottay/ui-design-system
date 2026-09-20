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
import { FIRST_PARTY_BASELINES } from "@tests/support/theme-lowering";

const FIXTURE_DIR = resolve(
  process.cwd(),
  "src/infrastructure/compilers/composition/tenant-theme/tests/fixtures"
);

const readFixture = (name: string): TenantThemeArtifact =>
  JSON.parse(readFileSync(resolve(FIXTURE_DIR, name), "utf8"));

const CHART_SERIES_TOKEN = /^--ds-chart-series-(?:[1-9]|1[0-2])$/;
const DENSITY_MODE_FACTOR_TOKEN = "--ds-density-mode-factor";
const ON_PRIMARY_INK_TOKEN = "--ds-color-text-on-primary";
const BEHAVIOR_ONLY_AMBIENT_TOKEN = "--ds-motion-ambient";
/**
 * The two corners the toggle deriver emits since 04e835647: a pill unless the
 * theme states a `surfaces.buttonStyle`, in which case the button silhouette.
 * A document that states one therefore carries them as a delta member.
 */
const TOGGLE_CORNERS = [
  "--ds-toggle-dot-border-radius",
  "--ds-toggle-track-border-radius",
] as const;
const TOGGLE_SILHOUETTE_ALIAS = "var(--ds-radius-button, var(--ds-radius-full))";

/** The ground the retired appearance compiler assumed for an unstated canvas. */
const PRE_ISO_ASSUMED_CANVAS = "#FFFFFF";
/**
 * The ground the single lowering reads off the merged Theme instead.
 *
 * WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15), pending DT
 * registration: #F4F8FB -> #FFFFFF. bithire is now the neutral foundation plus
 * its preset document, and the preset states no canvas of its own, so the
 * ground falls back to the foundation's white -- the same pixel the retired
 * appearance compiler assumed. The regrounding this constant exists to measure
 * therefore collapses to a no-op, which is asserted rather than left to be
 * inferred from a zero.
 */
const BITHIRE_AUTHORED_CANVAS = "#FFFFFF";
/**
 * The seeds `POPULATED_SIMPLE_DOCUMENT` authors AND the compiler still ramps.
 * It authors a third, `accent: "#E2725B"`; its ten steps are pinned retired in
 * `POPULATED_ACCENT_RAMP_RETIRED` instead, so the two lists together still
 * account for every step the frozen fixture carries.
 */
const REGROUNDED_RAMP_SEEDS = {
  primary: "#0F766E",
  secondary: "#8C6D46",
} as const;

/**
 * The accent ramp, retired for want of a reader (WO-DER-03 palette half). No
 * `var(--ds-color-accent-<step>)` exists anywhere in the package, so a tenant
 * that re-seeded its accent moved ten channels nothing painted. The seed
 * channel `--ds-color-accent` itself is unaffected.
 */
const POPULATED_ACCENT_RAMP_RETIRED: readonly RetiredChannel[] = RAMP_STEPS.map(
  (step) => ({
    token: `--ds-color-accent-${step}`,
    because: "retired: the accent ramp has no var() reader in the package",
  })
);

/**
 * The compiled bithire baseline's own radius dial.
 *
 * WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): bithire radius
 * base, 1.25 -> 0.8. bithire is now the neutral foundation plus its preset
 * document, and the preset's `shape.radius-scale` is 0.8 where the retired
 * authored theme carried 1.25. The preset deciding is the correct semantics; it
 * is registered for DER-07 to confirm, not reverted. Every folded literal below
 * moves with this divisor and no resting pixel law changes: the fold still
 * divides by the baseline's own scale before multiplying by it.
 */
const BITHIRE_RADIUS_DIAL = "0.8";

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
    token: "--ds-input-border-focus",
    because:
      "D6-2c-ii: the preset bakes no input focus leaf, so the tenant's derivation equals the baseline",
  },
  {
    token: "--ds-input-shadow-focus",
    because:
      "D6-2c-ii: the preset bakes no input focus leaf, so the tenant's derivation equals the baseline",
  },
  {
    token: ON_PRIMARY_INK_TOKEN,
    because: "benign: #ffffff under both the tenant seed and the baseline",
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
  // WO-DER-04. `--ds-density-mode-factor` used to sit in POPULATED_WITHDRAWN
  // as "benign: a `normal` mode rests at the baseline's own factor of 1" --
  // but the rest WAS the defect: the posture table withheld the identity
  // factor, so a vertical whose baseline is not normal could not be asked for
  // normal by any decision. An AUTHORED posture is a statement even at the
  // identity, so this document's `normal` now reaches the delta.
  [DENSITY_MODE_FACTOR_TOKEN]: "1",
  "--ds-button-primary-bg-hover": "#00635C",
  "--ds-color-border-focus": "#0F766E",
  "--ds-color-link": "#0F766E",
  "--ds-color-link-hover": "#00635C",
  // D6-2c-ii (2026-09-15): `--ds-input-border-focus` and
  // `--ds-input-shadow-focus` left this list for `POPULATED_WITHDRAWN`. They
  // were seed-derived because the retired bithire theme BAKED an input focus
  // leaf for the tenant's derivation to displace; the preset bakes none, so the
  // derivation now equals the baseline and the delta inherits it. The same
  // re-partition is recorded in `provenance-acceptance.test.ts`, which owns the
  // family's closure proof.
  // The FAM-10 wave (181817599, WO-DER-06 D6-FAM-01): `--ds-focus-ring-color`.
  // The focus ring now derives a safe color from the seed against the
  // effective mode ground, so this document's primary reaches it: the tenant's
  // `#0F766E` displaces the baseline's preset-seed `#2F5BE8` and the channel
  // joins the delta. It is not a member of the seed-shadowing family above --
  // that table's closure is untouched -- but it is seed-derived in exactly the
  // same sense, so it is pinned here, by value, rather than in the plain
  // additions list. `canonical-digest-identity.test.ts` pins the same channel
  // from the digest side.
  "--ds-focus-ring-color": "#0F766E",
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
  // D6-2c-ii (2026-09-15): `--ds-density-scale` left this list. It was retired
  // as baseline-identical because the retired bithire theme also rested at 0.9;
  // the preset does not, so the tenant's authored 0.9 reaches the delta again
  // and equals the frozen fixture's own value -- which is why it needs no
  // declaration at all now, and is asserted by the plain equality loop.
  // D6-2c-ii: `--ds-elevation-1`, `-2` and `-3` left this list for the same
  // reason as `--ds-density-scale` above -- the preset states no elevation
  // ladder where the retired theme was already flat, so this document's `flat`
  // posture reaches the delta and lands on the frozen fixture's own values.
  // D6-2c-ii: `--ds-layout-header-height` and `--ds-shell-header-block-size`
  // left this list on the same ground -- the preset authors no header height,
  // so the tenant's 56px reaches the delta and lands on the frozen fixture's
  // own value. Every removal above collapses the same way: what the retired
  // theme baked and the delta therefore inherited, the preset leaves to the
  // tenant, and the frozen capture is what the tenant produces.
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
/**
 * The channels the `inverse` tone used to produce for the W4 pin document.
 *
 * WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15), pending DT
 * registration: `navigation.sidebarTone: "inverse"` is INERT on bithire over
 * neutral + preset. Its fan-out equals the baseline, so every channel it used
 * to produce leaves the delta. The two the tenant authors EXPLICITLY are
 * unaffected and stay in `W4_RESTORED`, which is what keeps this a statement
 * about the tone and not about the sidebar.
 * `canonical-digest-identity.test.ts` pins the same four.
 */
const W4_INERT_TONE_RETIRED: readonly RetiredChannel[] = [
  "--ds-sidebar-item-bg-active",
  "--ds-sidebar-item-bg-hover",
  "--ds-sidebar-item-color-active",
  "--ds-sidebar-text-muted",
].map((token) => ({
  token,
  because: "D6-2c-ii: the `inverse` tone is inert over neutral + preset",
}));

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
 * bithire baseline authors `0.8` — so it is declared per call site alongside
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
  /**
   * Leaves of the frozen `normalizedAppearance` the compiling document had to
   * move to stay ADMISSIBLE, keyed by dotted path to the new value.
   *
   * The byte-identity law is a claim about the compiler, not about the fixture
   * files: it says the same authored decisions still normalize and emit the
   * same way. A decision the admission floor no longer accepts cannot be
   * carried unchanged, so it is declared here -- named, one leaf at a time, and
   * applied to the FIXTURE side before the comparison -- rather than dropping
   * the fixture or loosening the comparison. Everything else stays byte-exact.
   */
  readonly appearanceMoved?: Readonly<Record<string, string>>;
}

/** Apply a dotted-path leaf override onto a copy of a frozen value. */
const withAppearanceMoved = (
  appearance: unknown,
  moved: Readonly<Record<string, string>>
): unknown => {
  const next = structuredClone(appearance) as Record<string, unknown>;
  for (const [path, value] of Object.entries(moved)) {
    const segments = path.split(".");
    const leaf = segments.pop()!;
    let node = next;
    for (const segment of segments) node = node[segment] as Record<string, unknown>;
    expect(node[leaf], `${path} must exist in the frozen fixture`).toBeDefined();
    node[leaf] = value;
  }
  return next;
};

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
    JSON.stringify(
      declared.appearanceMoved
        ? withAppearanceMoved(
            fixture.normalizedAppearance,
            declared.appearanceMoved
          )
        : fixture.normalizedAppearance
    )
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
    // D6-2c-ii (2026-09-15): "subtle" -> "strong", the same move as the copy of
    // this document in `provenance-acceptance.test.ts`. `subtle` is no longer
    // admissible on bithire: its derived `--ds-sidebar-text` / `--ds-sidebar-bg`
    // pair is two references the APCA checker cannot read, so admission fails
    // closed. Pinned in `tenant-theme-compiler.test.ts` under "refusals the
    // neutral baseline introduces" and registered pending DT adjudication.
    navigation: { sidebarTone: "strong" },
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
      FIRST_PARTY_BASELINES.bithire.palette.backgroundColor,
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
    // 26 -> 18 (accent steps retired) -> 0. D6-2c-ii: the two grounds are now
    // the SAME pixel, so the regrounding is a no-op by construction and the map
    // is empty. This is the one case where an empty map is not a silent
    // collapse, so it is stated twice -- the count below, and the identity of
    // the two grounds above it, which is what makes the emptiness derivable
    // rather than merely observed. Every ramp step therefore still equals the
    // frozen fixture, which the loop above asserts step for step.
    expect(PRE_ISO_ASSUMED_CANVAS).toBe(BITHIRE_AUTHORED_CANVAS);
    expect(Object.keys(regrounded)).toHaveLength(0);

    const additions = expectStableEmission(artifact, fixture, {
      // D6-2c-ii (2026-09-15): the one decision this document had to move to
      // stay admissible; see the fixture's own note above.
      appearanceMoved: { "general.navigation.sidebarTone": "strong" },
      retired: [
        ...POPULATED_ACCENT_RAMP_RETIRED,
        {
          token: "--ds-sidebar-item-color-active",
          because:
            "D6-2c-ii: under the declared `strong` tone the active row's ink equals the baseline, so the delta stops restating it",
        },
      ],
      withdrawn: POPULATED_WITHDRAWN,
      seedDerived: POPULATED_SEED_DERIVED,
      moved: {
        ...regrounded,
        // D6-2c-ii (2026-09-15): the five the declared `appearanceMoved` above
        // carries with it. `strong` plates the rail on the primary ramp where
        // `subtle` sat on the neutral surface roles, so every channel the tone
        // owns moves once, together, and for that one declared reason. The
        // sixth, `--ds-sidebar-item-color-active`, is withdrawn rather than
        // moved and is declared as such below.
        "--ds-sidebar-bg": "var(--ds-color-primary-900)",
        "--ds-sidebar-text": "var(--ds-color-white)",
        "--ds-sidebar-text-muted": "var(--ds-color-neutral-400)",
        "--ds-sidebar-item-bg-active": "var(--ds-color-primary-700)",
        "--ds-sidebar-item-bg-hover": "var(--ds-color-primary-800)",
      },
    });
    expect(additions.filter((token) => CHART_SERIES_TOKEN.test(token))).toHaveLength(12);
    expect([...additions].sort()).toEqual([
      // The five per-size button radii the CHOSEN silhouette now reaches.
      // `shape.button-style` used to expand into a `chrome.controls`
      // geometry leaf inside the DB ingress, at the vertical's own rank, where
      // bithire's authored per-size radii outranked it and the tenant's word
      // painted nothing. The `shape` family derives it at the tenant rank for
      // both transports, so the tenant's silhouette wins and appears here.
      "--ds-button-lg-radius",
      "--ds-button-md-radius",
      // The seed-derived six. Their VALUES are pinned by
      // `POPULATED_SEED_DERIVED`; what this list adds is exactness — no seventh
      // channel may join the family without being declared there first.
      "--ds-button-primary-bg-hover",
      "--ds-button-sm-radius",
      "--ds-button-xl-radius",
      "--ds-button-xs-radius",
      "--ds-chart-series-1",
      "--ds-chart-series-10",
      "--ds-chart-series-11",
      "--ds-chart-series-12",
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
      // WO-DER-04. The density posture this document AUTHORS (`normal`) now
      // reaches the delta at its identity factor, and its `flat` elevation
      // states the whole 0..6 ladder instead of levels 1..3 -- so roles 4..6
      // join `--ds-elevation-1..3`, which the baseline already matched and
      // `W4_RETIRED` already records.
      "--ds-density-mode-factor",
      // D6-2c-ii (2026-09-15): role 0 joined the ladder's delta. The preset
      // states no elevation ladder of its own, where the retired theme stated
      // `none` for role 0, so this document's `flat` posture now moves it like
      // the other six. `provenance-acceptance.test.ts` pins the same move from
      // the posture-floor side.
      "--ds-elevation-0",
      "--ds-elevation-4",
      "--ds-elevation-5",
      "--ds-elevation-6",
      // The FAM-10 wave's one new member (181817599, WO-DER-06 D6-FAM-01):
      // the focus ring derives a safe color from the seed against the
      // effective mode ground, so the channel this document's seed produces
      // displaces the baseline's preset-seed value. Its value is pinned in
      // `POPULATED_SEED_DERIVED` above; this entry names it as an addition.
      "--ds-focus-ring-color",
      // D6-2c-ii: `--ds-input-border-focus` and `--ds-input-shadow-focus` left
      // this list with `POPULATED_SEED_DERIVED`, and the two toggle corners
      // left it because the preset now STATES a silhouette -- so the tenant's
      // `soft` matches the baseline and the alias stops being a delta member.
      // Both are asserted two-sided below.
    ]);
    expect(artifact.variables["--ds-color-primary-rgb"]).toBe("15, 118, 110");
    expect(artifact.variables["--ds-color-secondary-rgb"]).toBe("140, 109, 70");
    // D6-2c-ii, two-sided. The corner is the silhouette ALIAS, not a resolved
    // radius: a theme that states any `surfaces.buttonStyle` gets the same
    // string. The preset states one (`sharp`) where the retired theme stated
    // none, so baseline and tenant now emit byte-identical corners and the
    // delta withdraws them -- while the silhouettes themselves still differ,
    // through `--ds-radius-button`, which is where that difference belongs.
    expect(
      FIRST_PARTY_BASELINES.bithire.surfaces?.buttonStyle,
      "the baseline states a silhouette, which is why the tenant's alias is no longer a delta member"
    ).toBe("sharp");
    for (const corner of TOGGLE_CORNERS) {
      expect(artifact.variables[corner], corner).toBeUndefined();
    }
    expect(TOGGLE_SILHOUETTE_ALIAS).toContain("--ds-radius-button");
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
      retired: [...W4_RETIRED, ...W4_INERT_TONE_RETIRED],
      restored: W4_RESTORED,
    });
    expect(additions).toEqual([
      // The chosen silhouette's five per-size radii; see the populated-simple
      // block above for why they moved from the vertical rank to the tenant's.
      "--ds-button-lg-radius",
      "--ds-button-md-radius",
      "--ds-button-sm-radius",
      "--ds-button-xl-radius",
      "--ds-button-xs-radius",
      // D6-2c-ii (2026-09-15): five channels joined this list and one left it,
      // all for the one reason -- what the retired theme BAKED and the delta
      // therefore inherited, the preset leaves unstated, so the tenant's own
      // decision reaches the delta instead. The whole `flat` ladder now moves
      // (role 0 and roles 4..6; 1..3 land on the frozen fixture's values and
      // need no declaration), the `--ds-radius-md` operand no longer matches
      // the baseline's, and the authored header height reaches the shell
      // channel. `--ds-density-mode-factor` went the other way: the preset
      // rests at this document's own `compact`, so the factor equals the
      // baseline and the delta withdraws it, which the two-sided assertion
      // below states.
      "--ds-elevation-0",
      "--ds-elevation-4",
      "--ds-elevation-5",
      "--ds-elevation-6",
      "--ds-radius-md-base",
      "--ds-shell-topbar-height",
    ]);
    expect(artifact.variables[DENSITY_MODE_FACTOR_TOKEN]).toBeUndefined();
    expect(
      FIRST_PARTY_BASELINES.bithire.surfaces?.density,
      "the factor is withdrawn because the baseline already rests at this document's density"
    ).toBe("compact");
    // D6-2c-ii: the silhouette alias is no longer a delta member here either.
    // The preset states a silhouette, so baseline and tenant emit the same
    // alias string and the corners resolve identically; see the
    // populated-simple block for the two-sided form of this proof.
    for (const corner of TOGGLE_CORNERS) {
      expect(artifact.variables[corner], corner).toBeUndefined();
    }
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
    // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15), pending DT
    // registration: this block's subject is gone on BOTH sides, and both are
    // pinned so the absence is a measured statement and not a vacuous pass.
    // The preset leaves `modes.dark.chrome.sidebar` unauthored where the
    // retired theme authored bg #0a0f18 and ink var(--ds-color-text-secondary),
    // so there is nothing left for the tenant's base leaf to outrank; and the
    // `inverse` tone is inert over neutral + preset, so its dark ink leaves the
    // delta with it. The dark halves of the authored card, header and table
    // chrome went the same way -- they were the BASELINE's `modes.dark` values
    // re-stated over the tenant's base leaves, and the preset authors no dark
    // chrome either -- so this document now produces NO mode delta at all.
    // Every input to that conclusion is pinned, so a preset that starts
    // authoring a dark block reds here rather than silently repainting.
    const bithireDark = FIRST_PARTY_BASELINES.bithire.modes?.dark?.chrome;
    expect(bithireDark?.sidebar?.bg, "the preset leaves the dark sidebar bg unauthored").toBeUndefined();
    expect(bithireDark?.sidebar?.text, "the preset leaves the dark sidebar ink unauthored").toBeUndefined();
    expect(bithireDark?.cardComponent?.bg, "and the dark card bg with it").toBeUndefined();
    expect(bithireDark?.table?.headerBg, "and the dark table header bg with it").toBeUndefined();
    expect(artifact.modeDeltas ?? []).toHaveLength(0);
    // With the sidebar pair restored, the css body needs no value rewrite at
    // all: retirements and the radius dial are the only two things still
    // standing between this document and the frozen fixture, byte for byte.
    expect(
      withoutTokens(
        withoutModeDeltaBlocks(withoutDensityModeFactor(cssBody(artifact))),
        // The chosen silhouette's five per-size radii, trimmed on the ARTIFACT
        // side because the frozen fixture predates them: `shape.button-style`
        // now derives at the tenant rank instead of expanding into a vertical
        // chrome leaf that bithire's own per-size radii outranked. Their values
        // are pinned by the `additions` list above, so trimming them here hides
        // nothing.
        [
          "--ds-button-xs-radius",
          "--ds-button-sm-radius",
          "--ds-button-md-radius",
          "--ds-button-lg-radius",
          "--ds-button-xl-radius",
          // D6-2c-ii: the six the preset stopped baking, trimmed on the
          // artifact side for the same reason -- the frozen fixture predates
          // them and the `additions` list above pins every one by name.
          "--ds-elevation-0",
          "--ds-elevation-4",
          "--ds-elevation-5",
          "--ds-elevation-6",
          "--ds-radius-md-base",
          "--ds-shell-topbar-height",
        ]
      )
    ).toBe(
      withoutTokens(
        withDialedRadius(
          withoutBehaviorOnlyAmbient(cssBody(fixture)),
          dialFolded,
          BITHIRE_RADIUS_DIAL
        ),
        [...W4_RETIRED, ...W4_INERT_TONE_RETIRED].map((entry) => entry.token)
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
