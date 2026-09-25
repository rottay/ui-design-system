/** The splitter channels a local density scope re-derives, measured in Chromium.
 *  Each oracle paints the channel's own expression at the element: the answer the scope owes. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
import { splitterChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/primitives/layout/splitter/engines/modern/index.tsx"), "utf8");

const PRODUCES = new Set<string>(splitterChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

const GUTTER_SIZE = "--ds-splitter-gutter-size" as const;
const CHANNELS = [GUTTER_SIZE] as const;

/** The gutter reads its one channel twice: as its width across a row, as its height down a column. */
const READS = {
  horizontal: { declaration: "inline-size", property: "width" },
  vertical: { declaration: "block-size", property: "height" },
} as const;

type Orientation = keyof typeof READS;
const ORIENTATIONS = Object.keys(READS) as Orientation[];

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

const oracleOf = (orientation: Orientation) =>
  `<div data-oracle="${orientation}" style="${READS[orientation].declaration}: ${PRODUCED[GUTTER_SIZE]}"></div>`;

/** The splitter anatomy the Modern skin selects, one per orientation, plus the oracles painting the expression in place. */
function splitter(rootStyle = ""): string {
  const root = (orientation: Orientation) =>
    [
      `<div class="ds-splitter ds-splitter--modern" data-part="root" data-orientation="${orientation}" style="${rootStyle}">`,
      `<div data-part="panel">A</div>`,
      `<div data-part="gutter" data-orientation="${orientation}"></div>`,
      `<div data-part="panel">B</div>`,
      `</div>`,
    ].join("");
  return [`<div data-probe="splitters">`, ...ORIENTATIONS.map(root), ...ORIENTATIONS.map(oracleOf), `</div>`].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](splitter(rootStyle))}</div>`).join("");
}

const gutterSelector = (orientation: Orientation) =>
  `[data-part='root'] > [data-part='gutter'][data-orientation='${orientation}']`;

function targets(orientations: readonly Orientation[] = ORIENTATIONS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    orientations.flatMap((orientation) => [
      {
        id: `site|${scope}|${orientation}`,
        selector: `#${hostId(scope)} ${gutterSelector(orientation)}`,
        property: READS[orientation].property,
      },
      {
        id: `oracle|${scope}|${orientation}`,
        selector: `#${hostId(scope)} [data-oracle='${orientation}']`,
        property: READS[orientation].property,
      },
    ])
  );
}

const HORIZONTAL: readonly Orientation[] = ["horizontal"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { ${GUTTER_SIZE}: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the splitter) and one ON the boundary (inline). */
const SPLITTER_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="${GUTTER_SIZE}: ${BOUNDARY_STATED}">`,
  splitter(),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { ${GUTTER_SIZE}: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { ${GUTTER_SIZE}: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { ${GUTTER_SIZE}: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: [GUTTER_SIZE],
  derive: () => ({ [GUTTER_SIZE]: CARRIED }),
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
let splitterStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, orientation: Orientation) => from.base[`site|${scope}|${orientation}`];
const oracle = (from: ProbeReadings, scope: Scope, orientation: Orientation) =>
  from.base[`oracle|${scope}|${orientation}`];

const width = (from: ProbeReadings, scope: Scope) => site(from, scope, "horizontal");

describe("chrome/splitter channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      { id: "onBoundary", selector: `#on-boundary ${gutterSelector("horizontal")}`, property: "width" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(HORIZONTAL));
    splitterStated = await probe(markup("", `${GUTTER_SIZE}: ${SPLITTER_STATED}`), targets(HORIZONTAL));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(HORIZONTAL));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(HORIZONTAL));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(HORIZONTAL));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(HORIZONTAL));
    }
  }, 180_000);

  it("probes the parts the engine stamps", () => {
    expect(ENGINE).toContain("ds-splitter ds-splitter--modern");
    expect(ENGINE).toContain('data-part="root"');
    expect(ENGINE).toContain("'data-part': 'gutter'");
    expect(ENGINE).toContain("'data-orientation': isVertical ? 'vertical' : 'horizontal'");
  });

  it("measures a real read site and a real oracle for every orientation in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries really move the oracle away from rest", () => {
    for (const orientation of ORIENTATIONS) {
      const rest = oracle(readings, "rest", orientation);
      expect({ orientation, compact: oracle(readings, "compact", orientation) }).not.toEqual({ orientation, compact: rest });
      expect({ orientation, spacious: oracle(readings, "spacious", orientation) }).not.toEqual({ orientation, spacious: rest });
    }
  });

  it("(a) the gutter paints the local scope's answer, not the root's, in both orientations", () => {
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const orientation of ORIENTATIONS) {
        const painted = site(readings, scope, orientation);
        const expected = oracle(readings, scope, orientation);
        if (painted !== expected) drift.push(`${scope} ${orientation}: painted ${painted}, local answer ${expected}`);
      }
    }
    expect(drift).toEqual([]);
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: width(splitterStated, scope) }).toEqual({ scope, painted: SPLITTER_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: width(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: width(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "horizontal"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot[GUTTER_SIZE]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables[GUTTER_SIZE]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: width(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ [GUTTER_SIZE]: CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: width(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: width(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "horizontal"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "horizontal");
    expect(width(drills.layeredHeavy, "compact")).toBe(local);
    expect(width(drills.unlayeredLighter, "compact")).toBe(local);
    expect(width(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the splitter channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-density-effective-scale")).toBe(true);
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
