/** The surface-lifecycle channels a local density scope re-derives, measured in Chromium.
 *  Each oracle paints the channel's own expression at the element: the answer the scope owes. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import ts from "typescript";
import { beforeAll, describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import { measureArms, type ProbeReadings, type ProbeTarget } from "@tests/support/family-causality";
import { compileThemeIntent, emitThemeCss, firstPartyScope, staticThemeIntent } from "@/entrypoints/server";
import { themeChannelDelta } from "@/infrastructure/compilers/runtime/theme/facade/foundation/admission/runtime/limits";
import { emitTenantArtifactCss } from "@/infrastructure/compilers/runtime/theme/runtime/emission";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { FAMILY_DERIVERS } from "../../..";
import { lowerBlock } from "../../../../pipeline";
import { densityScopeMembers, projectDensityScopeBlock } from "../../../../density-scope";
import { surfaceLifecycleChromeDeriver } from "..";

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css/foundation");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Every name a non-root scope of one axis re-declares for its own subtree. */
function scopeVaryingNames(file: string, scoped: RegExp): Set<string> {
  const names = new Set<string>();
  const css = stripComments(readFileSync(resolve(CSS_ROOT, file), "utf8"));
  for (const block of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!scoped.test(block[1])) continue;
    for (const declared of block[2].matchAll(/(--ds-[a-z0-9-]+)\s*:/g)) names.add(declared[1]);
  }
  return names;
}

const DENSITY_AXIS = scopeVaryingNames("base/density/index.css", /:not\(:root\)/);
const ARABIC_AXIS = scopeVaryingNames("responsive/language-arabic/index.css", /:lang\(ar\)/);

const ENGINE = readFileSync(
  resolve(process.cwd(), "src/components/structures/feedback/surface-lifecycle/states/index.tsx"),
  "utf8"
);

/** The legacy classes retained on the one banner read site. */
const LEGACY_BANNER_CLASSES = "ds-surface ds-stale-banner";
/** The only appended class door admitted by the LC1 ruling; no suffix wildcard. */
const BANNER_CLASS_HOOK = "ds-stale-banner__banner";

/**
 * Check the direct Flex root of the exported SurfaceStaleBanner, not text on another element.
 * @param source The owning TSX source, inspected without executing the component.
 * @returns Whether the root keeps its banner part and legacy classes, with only the authorised hook optional.
 */
function hasStaleBannerStamp(source: string): boolean {
  const file = ts.createSourceFile(
    "surface-states.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const owners: ts.FunctionDeclaration[] = [];
  for (const statement of file.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === "SurfaceStaleBanner"
    )
      owners.push(statement);
  }
  if (owners.length !== 1) return false;
  const owner = owners[0];
  const modifiers = owner?.modifiers;
  if (
    !owner ||
    owner.asteriskToken ||
    modifiers?.length !== 1 ||
    modifiers[0]?.kind !== ts.SyntaxKind.ExportKeyword
  ) {
    return false;
  }

  // The fixture paints this direct return; unrelated or nested JSX cannot supply its stamp.
  const returns: ts.ReturnStatement[] = [];
  for (const statement of owner.body?.statements ?? []) {
    if (ts.isReturnStatement(statement)) returns.push(statement);
  }
  if (returns.length !== 1) return false;
  let root = returns[0]?.expression;
  while (root && ts.isParenthesizedExpression(root)) root = root.expression;
  if (
    !root ||
    !ts.isJsxElement(root) ||
    root.openingElement.tagName.getText(file) !== "Flex"
  )
    return false;

  let classes: ts.StringLiteral | undefined;
  let part: ts.StringLiteral | undefined;
  let classCount = 0;
  let partCount = 0;
  for (const attribute of root.openingElement.attributes.properties) {
    // A spread could replace either binding; a duplicate or expression is not the admitted literal form.
    if (ts.isJsxSpreadAttribute(attribute)) return false;
    const name = attribute.name.getText(file);
    if (name === "className") {
      classCount += 1;
      if (attribute.initializer && ts.isStringLiteral(attribute.initializer))
        classes = attribute.initializer;
    }
    if (name === "data-part") {
      partCount += 1;
      if (attribute.initializer && ts.isStringLiteral(attribute.initializer))
        part = attribute.initializer;
    }
  }
  return (
    classCount === 1 &&
    partCount === 1 &&
    part?.text === "banner" &&
    (classes?.text === LEGACY_BANNER_CLASSES ||
      classes?.text === `${LEGACY_BANNER_CLASSES} ${BANNER_CLASS_HOOK}`)
  );
}

/** Small source fixtures keep the reader controls valid before and after the real class door lands. */
const BANNER_SOURCE_FIXTURE = [
  "export function SurfaceStaleBanner() {",
  `  return (<Flex className="${LEGACY_BANNER_CLASSES}" data-part="banner">`,
  `    <span data-part="description">Cached data</span>`,
  "  </Flex>);",
  "}",
].join("\n");

const PRODUCES = new Set<string>(surfaceLifecycleChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the part, the declarations its oracle paints, and the computed
 *  properties read at both. */
const SITES = {
  "--ds-surface-lifecycle-stale-banner-padding-block": {
    site: "[data-part='banner']",
    declarations: ["padding-block"],
    properties: ["padding-top", "padding-bottom"],
  },
  "--ds-surface-lifecycle-stale-banner-padding-inline": {
    site: "[data-part='banner']",
    declarations: ["padding-inline"],
    properties: ["padding-left", "padding-right"],
  },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** None, each posture, both nesting orders, and an Arabic subtree. */
const SCOPES = {
  rest: (inner: string) => inner,
  compact: (inner: string) => `<div data-density="compact">${inner}</div>`,
  comfortable: (inner: string) => `<div data-density="comfortable">${inner}</div>`,
  spacious: (inner: string) => `<div data-density="spacious">${inner}</div>`,
  nested: (inner: string) =>
    `<div data-density="spacious"><div data-density="compact">${inner}</div></div>`,
  reverseNested: (inner: string) =>
    `<div data-density="compact"><div data-density="spacious">${inner}</div></div>`,
  arabic: (inner: string) => `<div lang="ar">${inner}</div>`,
} as const;

type Scope = keyof typeof SCOPES;
const SCOPE_NAMES = Object.keys(SCOPES) as Scope[];
const BOUNDED: readonly Scope[] = ["compact", "comfortable", "spacious", "nested", "reverseNested"];
const UNBOUNDED: readonly Scope[] = ["rest", "arabic"];

const oracleOf = (channel: Channel) =>
  `<div data-oracle="${channel}" style="${SITES[channel].declarations
    .map((declaration) => `${declaration}: ${PRODUCED[channel]}`)
    .join("; ")}"></div>`;

/** The stale banner the skin selects, as the engine stamps it, plus one oracle per channel. */
function banner(rootStyle = ""): string {
  return [
    `<div>`,
    `<div class="ds-surface ds-stale-banner" data-part="banner" data-refreshing="false" style="${rootStyle}">`,
    `<span data-part="description">Showing cached data</span>`,
    `</div>`,
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](banner(rootStyle))}</div>`).join("");
}

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) =>
      SITES[channel].properties.flatMap((property) => [
        { id: `site|${scope}|${channel}|${property}`, selector: `#${hostId(scope)} ${SITES[channel].site}`, property },
        { id: `oracle|${scope}|${channel}|${property}`, selector: `#${hostId(scope)} [data-oracle='${channel}']`, property },
      ])
    )
  );
}

const DRILL: readonly Channel[] = ["--ds-surface-lifecycle-stale-banner-padding-inline"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-surface-lifecycle-stale-banner-padding-inline: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the banner) and one ON the boundary (inline). */
const BANNER_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-surface-lifecycle-stale-banner-padding-inline: ${BOUNDARY_STATED}">`,
  banner(),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-surface-lifecycle-stale-banner-padding-inline: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-surface-lifecycle-stale-banner-padding-inline: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-surface-lifecycle-stale-banner-padding-inline: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-surface-lifecycle-stale-banner-padding-inline"],
  derive: () => ({ "--ds-surface-lifecycle-stale-banner-padding-inline": CARRIED }),
};
const carriedTheme = firstPartyFixture("bithire");
const carriedDerivers = [...FAMILY_DERIVERS, statedAtTenant];
const carriedRoot = lowerBlock({ theme: carriedTheme }, carriedDerivers);
const carriedBlock = projectDensityScopeBlock(
  carriedRoot,
  densityScopeMembers(carriedDerivers, (derivers) => lowerBlock({ theme: carriedTheme }, derivers)),
  []
);
const carriedCompile = {
  cssVariables: carriedRoot,
  modeBlocks: [],
  ...(carriedBlock ? { densityScopeBlock: carriedBlock } : {}),
  runtime: { personality: {}, tokenOverrides: {} },
};
const CARRIED_CSS = emitThemeCss(carriedCompile, firstPartyScope("bithire"));

/** b3 at the DB door: the tenant delta over the vertical's own compile, under a DB root. */
const carriedDelta = themeChannelDelta(carriedCompile, COMPILED);
const dbCss = (withBoundary: boolean) =>
  emitTenantArtifactCss({
    verticalKey: "bithire",
    slug: "acme",
    compilerVersion: "probe",
    digest: "probe",
    variables: carriedDelta.variables,
    ...(withBoundary ? { densityScopeVariables: carriedDelta.densityScopeVariables } : {}),
  });
const dbRoot = (css: string) =>
  `<style>${css}</style><div data-ds-root data-vertical="bithire" data-tenant="acme">${markup()}</div>`;

let readings: ProbeReadings;
let rootStated: ProbeReadings;
let bannerStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const drilled = (from: ProbeReadings, scope: Scope) => site(from, scope, "--ds-surface-lifecycle-stale-banner-padding-inline", "padding-left");

describe("chrome/surface-lifecycle channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      { id: "onBoundary", selector: "#on-boundary [data-part='banner']", property: "padding-left" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(DRILL));
    bannerStated = await probe(markup("", `--ds-surface-lifecycle-stale-banner-padding-inline: ${BANNER_STATED}`), targets(DRILL));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(DRILL));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(DRILL));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(DRILL));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(DRILL));
    }
  }, 180_000);

  it("probes the parts the engine stamps", () => {
    // Bind the source pin to the banner root that the lifecycle fixture actually paints.
    expect(hasStaleBannerStamp(ENGINE)).toBe(true);
  });

  it("accepts the banner's legacy classes and its one appended class door", () => {
    // Keep both supported forms observable even after the real owner acquires its class door.
    const armed = BANNER_SOURCE_FIXTURE.replace(
      LEGACY_BANNER_CLASSES,
      `${LEGACY_BANNER_CLASSES} ${BANNER_CLASS_HOOK}`
    );
    expect(armed).not.toBe(BANNER_SOURCE_FIXTURE);
    expect(hasStaleBannerStamp(BANNER_SOURCE_FIXTURE)).toBe(true);
    expect(hasStaleBannerStamp(armed)).toBe(true);
  });

  it("refuses a foreign, split or overriding banner stamp", () => {
    const armedClasses = `${LEGACY_BANNER_CLASSES} ${BANNER_CLASS_HOOK}`;
    const armed = BANNER_SOURCE_FIXTURE.replace(
      LEGACY_BANNER_CLASSES,
      armedClasses
    );
    const mutants = [
      {
        cause: "wrong class door",
        source: armed.replace(BANNER_CLASS_HOOK, "ds-stale-banner__foreign"),
      },
      { cause: "missing base class", source: armed.replace("ds-surface ", "") },
      {
        cause: "part moved to a child",
        source: armed
          .replace('data-part="banner"', 'data-part="description"')
          .replace(
            '<span data-part="description">',
            '<span data-part="banner">'
          ),
      },
      {
        cause: "duplicate class binding",
        source: armed.replace(
          'data-part="banner"',
          `className="${LEGACY_BANNER_CLASSES}" data-part="banner"`
        ),
      },
      {
        cause: "later spread can replace the class",
        source: armed.replace(
          'data-part="banner"',
          'data-part="banner" {...{ className: "foreign" }}'
        ),
      },
      {
        cause: "matching text only in a comment",
        source:
          armed.replace(`className="${armedClasses}" `, "") +
          `\n// <Flex className="${LEGACY_BANNER_CLASSES}" data-part="banner" />`,
      },
      {
        cause: "different owner",
        source: armed.replace(
          "function SurfaceStaleBanner",
          "function ForeignStaleBanner"
        ),
      },
    ];
    for (const { cause, source } of mutants) {
      // Each refusal has the same intact positive immediately before its single causal mutation is checked.
      expect(hasStaleBannerStamp(armed), cause).toBe(true);
      expect(source, cause).not.toBe(armed);
      expect(hasStaleBannerStamp(source), cause).toBe(false);
    }
  });

  it("measures a real read site and a real oracle for every channel in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries really move the oracle away from rest", () => {
    for (const channel of CHANNELS) {
      const property = SITES[channel].properties[0];
      const rest = oracle(readings, "rest", channel, property);
      expect({ channel, compact: oracle(readings, "compact", channel, property) }).not.toEqual({ channel, compact: rest });
      expect({ channel, spacious: oracle(readings, "spacious", channel, property) }).not.toEqual({ channel, spacious: rest });
    }
  });

  it("(a) every channel paints the local scope's answer, not the root's", () => {
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const channel of CHANNELS) {
        for (const property of SITES[channel].properties) {
          const painted = site(readings, scope, channel, property);
          const expected = oracle(readings, scope, channel, property);
          if (painted !== expected) drift.push(`${scope} ${channel} ${property}: painted ${painted}, local answer ${expected}`);
        }
      }
    }
    expect(drift).toEqual([]);
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: drilled(bannerStated, scope) }).toEqual({ scope, painted: BANNER_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: drilled(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: drilled(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-surface-lifecycle-stale-banner-padding-inline", "padding-left"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-surface-lifecycle-stale-banner-padding-inline"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-surface-lifecycle-stale-banner-padding-inline"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: drilled(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-surface-lifecycle-stale-banner-padding-inline": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: drilled(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: drilled(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-surface-lifecycle-stale-banner-padding-inline", "padding-left"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-surface-lifecycle-stale-banner-padding-inline", "padding-left");
    expect(drilled(drills.layeredHeavy, "compact")).toBe(local);
    expect(drilled(drills.unlayeredLighter, "compact")).toBe(local);
    expect(drilled(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the surface-lifecycle channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-3")).toBe(true);
    const densityExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, DENSITY_AXIS))
      .map(([channel]) => channel)
      .sort();
    expect(densityExposed).toEqual([...CHANNELS].sort());
    expect(Object.entries(PRODUCED).filter(([, value]) => readsAny(value, ARABIC_AXIS))).toEqual([]);

    const projected = Object.keys(COMPILED.densityScopeBlock?.cssVariables ?? {}).filter((channel) =>
      PRODUCES.has(channel)
    );
    expect(projected.sort()).toEqual(densityExposed);
    for (const channel of projected) {
      expect(COMPILED.densityScopeBlock?.cssVariables[channel]).toBe(COMPILED.cssVariables[channel]);
    }
  });
});
