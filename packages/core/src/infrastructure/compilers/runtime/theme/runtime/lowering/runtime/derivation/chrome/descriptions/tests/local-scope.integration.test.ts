/** The descriptions channels a local density scope re-derives, measured in Chromium.
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
import { descriptionsChromeDeriver } from "..";

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
  resolve(process.cwd(), "src/components/primitives/display/descriptions/engines/modern/index.tsx"),
  "utf8"
);

const PRODUCES = new Set<string>(descriptionsChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

const HORIZONTAL = "[data-layout='horizontal']";
const VERTICAL = "[data-layout='vertical']";

/** One read site per channel: the part (and its layout), the declaration its oracle paints,
 *  and the computed properties read at both. */
const SITES = {
  "--ds-descriptions-header-min-height": {
    site: `${HORIZONTAL} > [data-part='header']`,
    declaration: "min-height",
    properties: ["min-height"],
  },
  "--ds-descriptions-section-gap": {
    site: `${HORIZONTAL} > [data-part='header']`,
    declaration: "margin-bottom",
    properties: ["margin-bottom"],
  },
  "--ds-descriptions-grid-gap": {
    site: `${HORIZONTAL} > [data-part='body'] > [data-part='rows']`,
    declaration: "gap",
    properties: ["row-gap", "column-gap"],
  },
  "--ds-descriptions-grid-padding": {
    site: `${HORIZONTAL} > [data-part='body'] > [data-part='rows']`,
    declaration: "padding",
    properties: ["padding-top", "padding-left"],
  },
  "--ds-descriptions-column-gap": {
    site: `${VERTICAL} > [data-part='body'] > [data-part='rows']`,
    declaration: "column-gap",
    properties: ["column-gap"],
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
  `<div data-oracle="${channel}" style="${SITES[channel].declaration}: ${PRODUCED[channel]}"></div>`;

const rows = [1, 2, 3, 4]
  .map(
    (index) =>
      `<div class="rottay-descriptions-row" data-part="row" data-index="${index}" data-span="1">` +
      `<dt class="rottay-descriptions-label" data-part="label">Field ${index}</dt>` +
      `<dd class="rottay-descriptions-content" data-part="content" data-empty="false">Value</dd></div>`
  )
  .join("");

const descriptions = (layout: "horizontal" | "vertical", rootStyle: string) =>
  [
    `<div class="rottay-descriptions rottay-descriptions--modern" data-part="root" data-engine="modern"`,
    ` data-layout="${layout}" data-bordered="false" data-size="default" data-columns="fixed" data-column-count="3"`,
    ` data-has-header="${layout === "horizontal"}" data-has-extra="false" style="${rootStyle}">`,
    layout === "horizontal"
      ? `<div class="rottay-descriptions-title" data-part="header"><h3 data-part="title">Details</h3></div>`
      : "",
    `<div data-part="body"><dl data-part="rows">${rows}</dl></div>`,
    `</div>`,
  ].join("");

/** Both layouts the Modern skin selects, wide enough to clear every narrow-container rule,
 *  plus one oracle per channel painting its expression in place. */
function sheet(rootStyle = ""): string {
  return [
    `<div style="inline-size: 1000px">`,
    descriptions("horizontal", rootStyle),
    descriptions("vertical", rootStyle),
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return (
    extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](sheet(rootStyle))}</div>`).join("")
  );
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

const GRID_PADDING: readonly Channel[] = ["--ds-descriptions-grid-padding"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-descriptions-grid-padding: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the root) and one ON the boundary (inline). */
const ROOT_ELEMENT_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-descriptions-grid-padding: ${BOUNDARY_STATED}">`,
  sheet(),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-descriptions-grid-padding: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-descriptions-grid-padding: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-descriptions-grid-padding: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-descriptions-grid-padding"],
  derive: () => ({ "--ds-descriptions-grid-padding": CARRIED }),
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
let rootElementStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const gridPadding = (from: ProbeReadings, scope: Scope) => site(from, scope, "--ds-descriptions-grid-padding", "padding-top");

describe("chrome/descriptions channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      { id: "onBoundary", selector: `#on-boundary ${SITES["--ds-descriptions-grid-padding"].site}`, property: "padding-top" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(GRID_PADDING));
    rootElementStated = await probe(markup("", `--ds-descriptions-grid-padding: ${ROOT_ELEMENT_STATED}`), targets(GRID_PADDING));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(GRID_PADDING));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(GRID_PADDING));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(GRID_PADDING));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(GRID_PADDING));
    }
  }, 180_000);

  it("probes the parts the engine stamps", () => {
    for (const part of ["header", "title", "body", "rows", "row", "label", "content"]) {
      expect(ENGINE).toContain(`data-part="${part}"`);
    }
    expect(ENGINE).toContain("rottay-descriptions rottay-descriptions--modern");
    expect(ENGINE).toContain("data-layout={layout}");
    expect(ENGINE).toContain("data-has-header={hasHeader}");
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
      expect({ scope, painted: gridPadding(rootElementStated, scope) }).toEqual({ scope, painted: ROOT_ELEMENT_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: gridPadding(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: gridPadding(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-descriptions-grid-padding", "padding-top"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-descriptions-grid-padding"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-descriptions-grid-padding"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: gridPadding(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-descriptions-grid-padding": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: gridPadding(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: gridPadding(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-descriptions-grid-padding", "padding-top"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-descriptions-grid-padding", "padding-top");
    expect(gridPadding(drills.layeredHeavy, "compact")).toBe(local);
    expect(gridPadding(drills.unlayeredLighter, "compact")).toBe(local);
    expect(gridPadding(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the descriptions channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-2")).toBe(true);
    expect(DENSITY_AXIS.has("--ds-spacing-14")).toBe(true);
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
