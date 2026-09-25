/** The badge channel a local density scope re-derives, measured in Chromium.
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
import { badgeChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/primitives/display/badge/engines/modern/index.tsx"), "utf8");

const PRODUCES = new Set<string>(badgeChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

const CHANNEL = "--ds-badge-container-padding-inline" as const;
const PROPERTIES = ["padding-left", "padding-right"] as const;

/** The site wraps the inset in the local density factor once more, so every oracle carries it too. */
const paints = (value: string) => `padding-inline: calc(${value} * var(--ds-density-effective-scale))`;

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

/** A chip in a container at most 12rem wide -- the only place the skin reads the channel --
 *  plus the oracle of the channel and, for a drill, the oracle of the stated value. */
function badge(rootStyle = "", stated?: string): string {
  return [
    `<div style="container-type: inline-size; inline-size: 10rem">`,
    `<span class="rottay-badge rottay-badge--modern" data-part="root" data-kind="chip" style="${rootStyle}">`,
    `<span data-part="label">Chip</span></span>`,
    `<div data-oracle="${CHANNEL}" style="${paints(PRODUCED[CHANNEL])}"></div>`,
    stated ? `<div data-stated style="${paints(stated)}"></div>` : "",
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = "", stated?: string): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](badge(rootStyle, stated))}</div>`).join("");
}

function targets(stated = false): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    PROPERTIES.flatMap((property) => [
      { id: `site|${scope}|${property}`, selector: `#${hostId(scope)} [data-part='root']`, property },
      { id: `oracle|${scope}|${property}`, selector: `#${hostId(scope)} [data-oracle='${CHANNEL}']`, property },
      ...(stated ? [{ id: `stated|${scope}|${property}`, selector: `#${hostId(scope)} [data-stated]`, property }] : []),
    ])
  );
}

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { ${CHANNEL}: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the badge) and one ON the boundary (inline). */
const BADGE_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="${CHANNEL}: ${BOUNDARY_STATED}">`,
  badge("", BOUNDARY_STATED),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { ${CHANNEL}: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { ${CHANNEL}: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { ${CHANNEL}: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: [CHANNEL],
  derive: () => ({ [CHANNEL]: CARRIED }),
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
  `<style>${css}</style><div data-ds-root data-vertical="bithire" data-tenant="acme">${markup("", "", CARRIED)}</div>`;

let readings: ProbeReadings;
let rootStated: ProbeReadings;
let badgeStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, property = "padding-left") => from.base[`site|${scope}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, property = "padding-left") => from.base[`oracle|${scope}|${property}`];
const stated = (from: ProbeReadings, scope: Scope) => from.base[`stated|${scope}|padding-left`];

describe("chrome/badge channel under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      { id: "onBoundary", selector: "#on-boundary [data-part='root']", property: "padding-left" },
      { id: "onBoundaryStated", selector: "#on-boundary [data-stated]", property: "padding-left" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE, "", ROOT_STATED), targets(true));
    badgeStated = await probe(markup("", `${CHANNEL}: ${BADGE_STATED}`, BADGE_STATED), targets(true));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`, "", CARRIED), targets(true));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(true));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(true));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`, "", OVERRIDE), targets(true));
    }
  }, 180_000);

  it("probes the parts the engine stamps", () => {
    expect(ENGINE).toContain("rottay-badge rottay-badge--modern");
    expect(ENGINE).toContain("data-kind={kind}");
    expect(ENGINE).toContain(`data-part="label"`);
  });

  it("measures a real read site and a real oracle in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries really move the oracle away from rest", () => {
    const rest = oracle(readings, "rest");
    expect(oracle(readings, "compact")).not.toBe(rest);
    expect(oracle(readings, "spacious")).not.toBe(rest);
  });

  it("(a) the channel paints the local scope's answer, not the root's", () => {
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const property of PROPERTIES) {
        const painted = site(readings, scope, property);
        const expected = oracle(readings, scope, property);
        if (painted !== expected) drift.push(`${scope} ${CHANNEL} ${property}: painted ${painted}, local answer ${expected}`);
      }
    }
    expect(drift).toEqual([]);
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: site(badgeStated, scope) }).toEqual({ scope, painted: stated(badgeStated, scope) });
      expect({ scope, painted: site(badgeStated, scope) }).not.toEqual({ scope, painted: oracle(badgeStated, scope) });
    }
    expect(readings.base.onBoundary).toBe(readings.base.onBoundaryStated);
    expect(readings.base.onBoundary).not.toBe(oracle(readings, "compact"));
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: site(rootStated, scope) }).toEqual({ scope, painted: stated(rootStated, scope) });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: site(rootStated, scope) }).toEqual({ scope, painted: oracle(rootStated, scope) });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot[CHANNEL]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables[CHANNEL]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: site(carried, scope) }).toEqual({ scope, painted: stated(carried, scope) });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ [CHANNEL]: CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: site(dbCarried, scope) }).toEqual({ scope, painted: stated(dbCarried, scope) });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: site(dbUncarried, scope) }).toEqual({ scope, painted: oracle(dbUncarried, scope) });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact");
    expect(site(drills.layeredHeavy, "compact")).toBe(local);
    expect(site(drills.unlayeredLighter, "compact")).toBe(local);
    expect(site(drills.unlayeredHeavier, "compact")).toBe(stated(drills.unlayeredHeavier, "compact"));
    expect(site(drills.unlayeredHeavier, "compact")).not.toBe(local);
  });

  it("(c) the compiler projects exactly the badge channel whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-2")).toBe(true);
    const densityExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, DENSITY_AXIS))
      .map(([channel]) => channel);
    expect(densityExposed).toEqual([CHANNEL]);
    expect(Object.entries(PRODUCED).filter(([, value]) => readsAny(value, ARABIC_AXIS))).toEqual([]);

    const projected = Object.keys(COMPILED.densityScopeBlock?.cssVariables ?? {}).filter((channel) =>
      PRODUCES.has(channel)
    );
    expect(projected).toEqual(densityExposed);
    expect(COMPILED.densityScopeBlock?.cssVariables[CHANNEL]).toBe(COMPILED.cssVariables[CHANNEL]);
  });
});
