/** The workbench-header channels a local density scope re-derives, measured in Chromium.
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
import { workbenchHeaderChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/patterns/shell/workbench-header/engines/modern/index.tsx"), "utf8");
const SKIN = stripComments(
  readFileSync(resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/workbench-header/index.css"), "utf8")
);

const PRODUCES = new Set<string>(workbenchHeaderChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

const ROOT = ".ds-pattern-workbench-header.ds-engine-modern[data-part='root']";

/** One read site per channel: the element, the declaration its oracle paints, and the computed properties read at both. */
const SITES = {
  "--ds-workbench-header-icon-size": { site: `${ROOT} [data-part='header-icon']`, declaration: "width", properties: ["width"] },
  "--ds-workbench-header-padding": { site: ROOT, declaration: "padding", properties: ["padding-top", "padding-left"] },
  "--ds-workbench-header-section-gap": { site: `${ROOT} [data-part='header-row']`, declaration: "column-gap", properties: ["column-gap"] },
  "--ds-workbench-header-item-gap": { site: `${ROOT} [data-part='lead']`, declaration: "column-gap", properties: ["column-gap"] },
  "--ds-workbench-header-action-gap": { site: `${ROOT} [data-part='actions']`, declaration: "column-gap", properties: ["column-gap"] },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** Named pins, never (a) cells: the skin re-declares the four room tiers on the root itself, so no
 *  root or boundary statement of these names reaches a read site; the skin's own spacing ramp does. */
const SHADOWED: readonly Channel[] = [
  "--ds-workbench-header-padding",
  "--ds-workbench-header-section-gap",
  "--ds-workbench-header-item-gap",
  "--ds-workbench-header-action-gap",
];
const LIVE = CHANNELS.filter((channel) => !SHADOWED.includes(channel));
const DRILLED = "--ds-workbench-header-icon-size" as const;

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

/** The header anatomy the Modern skin selects, plus one oracle per channel painting its expression in place. */
function header(rootStyle = ""): string {
  return [
    `<div class="ds-pattern-workbench-header ds-engine-modern" data-part="root" data-loading="false" style="width: 1000px;${rootStyle}">`,
    `<div data-part="header-row"><div data-part="lead"><span data-part="header-icon" aria-hidden="true"></span>`,
    `<div data-part="titles"><div data-part="title-row"><h2 data-part="title">Workbench</h2></div></div></div>`,
    `<div data-part="actions"><button data-part="action">Run</button><button data-part="action">Stop</button></div></div>`,
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](header(rootStyle))}</div>`).join("");
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

const DRILL: readonly Channel[] = [DRILLED];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { ${DRILLED}: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the header) and one ON the boundary (inline). */
const HEADER_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="${DRILLED}: ${BOUNDARY_STATED}">`,
  header(),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { ${DRILLED}: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { ${DRILLED}: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { ${DRILLED}: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement of the live channel and of every shadowed one, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const SHADOW_CARRIED = "77px";
const STATED: Readonly<Record<string, string>> = {
  [DRILLED]: CARRIED,
  ...Object.fromEntries(SHADOWED.map((channel) => [channel, SHADOW_CARRIED])),
};
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: [DRILLED, ...SHADOWED],
  derive: () => ({ ...STATED }),
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
let headerStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const iconSize = (from: ProbeReadings, scope: Scope) => site(from, scope, DRILLED, "width");

describe("chrome/workbench-header channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      { id: "onBoundary", selector: "#on-boundary [data-part='header-icon']", property: "width" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(DRILL));
    headerStated = await probe(markup("", ` ${DRILLED}: ${HEADER_STATED}`), targets(DRILL));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets([DRILLED, ...SHADOWED]));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(DRILL));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(DRILL));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(DRILL));
    }
  }, 180_000);

  it("probes the parts the engine stamps", () => {
    expect(ENGINE).toContain("ds-pattern-workbench-header ds-engine-modern");
    for (const part of ["header-row", "lead", "header-icon", "titles", "title-row", "actions"]) {
      expect(ENGINE).toContain(`data-part="${part}"`);
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

  it("(a) every live channel paints the local scope's answer, not the root's", () => {
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const channel of LIVE) {
        for (const property of SITES[channel].properties) {
          const painted = site(readings, scope, channel, property);
          const expected = oracle(readings, scope, channel, property);
          if (painted !== expected) drift.push(`${scope} ${channel} ${property}: painted ${painted}, local answer ${expected}`);
        }
      }
    }
    expect(drift).toEqual([]);
  });

  it("pin: the root rule itself re-declares the four room tiers", () => {
    const rootRule = SKIN.match(/\.ds-pattern-workbench-header\.ds-engine-modern\[data-part='root'\]\s*\{([^{}]*)\}/)?.[1] ?? "";
    for (const channel of SHADOWED) {
      expect({ channel, declared: new RegExp(`${channel}\\s*:`).test(rootRule) }).toEqual({ channel, declared: true });
    }
  });

  it("pin: the shadowed tiers paint the skin's own statement, which already rides the local ramp, in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      for (const channel of SHADOWED) {
        for (const property of SITES[channel].properties) {
          expect({ scope, channel, property, painted: site(readings, scope, channel, property) }).toEqual({
            scope,
            channel,
            property,
            painted: oracle(readings, scope, channel, property),
          });
        }
      }
    }
  });

  it("pin: a compiler-rank statement of a shadowed tier is carried into both blocks and reaches no read site", () => {
    for (const channel of SHADOWED) {
      expect(carriedRoot[channel]).toBe(SHADOW_CARRIED);
      expect(carriedBlock?.cssVariables[channel]).toBe(SHADOW_CARRIED);
    }
    for (const scope of SCOPE_NAMES) {
      for (const channel of SHADOWED) {
        for (const property of SITES[channel].properties) {
          const painted = site(carried, scope, channel, property);
          expect({ scope, channel, painted }).not.toEqual({ scope, channel, painted: SHADOW_CARRIED });
          expect({ scope, channel, painted }).toEqual({ scope, channel, painted: oracle(carried, scope, channel, property) });
        }
      }
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: iconSize(headerStated, scope) }).toEqual({ scope, painted: HEADER_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: iconSize(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: iconSize(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, DRILLED, "width"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot[DRILLED]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables[DRILLED]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: iconSize(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual(STATED);
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: iconSize(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: iconSize(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, DRILLED, "width"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", DRILLED, "width");
    expect(iconSize(drills.layeredHeavy, "compact")).toBe(local);
    expect(iconSize(drills.unlayeredLighter, "compact")).toBe(local);
    expect(iconSize(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the workbench-header channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-10")).toBe(true);
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
