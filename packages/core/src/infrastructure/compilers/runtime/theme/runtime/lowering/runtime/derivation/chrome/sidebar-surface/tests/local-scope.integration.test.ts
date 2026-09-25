/** The sidebar-surface channels a local density scope re-derives, measured in Chromium.
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
import { sidebarSurfaceChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/structures/shell/navigation/sidebar-surface/index.tsx"), "utf8");

const PRODUCES = new Set<string>(sidebarSurfaceChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** The aside track in force: the skin declares it on the root, the engine writes it inline from a config width. */
const ASIDE = "--ds-sidebar-surface-aside-inline-size" as const;

/** One read site per channel: the posture that activates it, the element, the declaration its oracle paints and the property read. */
const SITES = {
  "--ds-sidebar-surface-gap": { posture: "side", site: "", declaration: "column-gap", property: "column-gap" },
  "--ds-sidebar-surface-stacked-gap": { posture: "stacked", site: "", declaration: "row-gap", property: "row-gap" },
  "--ds-sidebar-surface-panel-gap": { posture: "side", site: " [data-part='panel-body']", declaration: "row-gap", property: "row-gap" },
  "--ds-sidebar-surface-main-gap": { posture: "side", site: " [data-part='main']", declaration: "row-gap", property: "row-gap" },
  "--ds-sidebar-surface-aside-width": { posture: "side", site: " > .ds-sidebar-surface-aside", declaration: "width", property: "width" },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];
const DRILLED = "--ds-sidebar-surface-main-gap" as const;
const GAP = "--ds-sidebar-surface-gap" as const;

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

/** The structure anatomy the skin selects: a side-by-side root with its aside, or the stacked column. */
function sidebar(posture: "side" | "stacked" | "inline", rootStyle = ""): string {
  const stacked = posture === "stacked";
  const style = posture === "inline" ? `${ASIDE}: 250px;${rootStyle}` : rootStyle;
  const oracles = CHANNELS.filter((channel) => SITES[channel].posture === (stacked ? "stacked" : "side")).map(oracleOf);
  return [
    `<div class="ds-structure ds-sidebar-surface" data-part="root" data-collapsed="false" data-stacked="${stacked}" data-aside="true" data-bordered="true" style="width: 1200px;${style}">`,
    `<div class="ds-sidebar-surface-panel"><div data-part="panel-body"><span>a</span><span>b</span></div></div>`,
    `<div data-part="main"><span>a</span><span>b</span>${posture === "inline" ? "" : oracles.join("")}</div>`,
    `<div class="ds-sidebar-surface-aside">aside</div>`,
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return (
    extra +
    SCOPE_NAMES.map(
      (scope) =>
        `<div id="${hostId(scope)}">${SCOPES[scope](
          (["side", "stacked", "inline"] as const)
            .map((posture) => `<div data-posture-host="${posture}">${sidebar(posture, rootStyle)}</div>`)
            .join("")
        )}</div>`
    ).join("")
  );
}

const rootOf = (scope: Scope, posture: string) => `#${hostId(scope)} [data-posture-host='${posture}'] > [data-part='root']`;

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) => {
      const { posture, site, property } = SITES[channel];
      return [
        { id: `site|${scope}|${channel}`, selector: `${rootOf(scope, posture)}${site}`, property },
        { id: `oracle|${scope}|${channel}`, selector: `${rootOf(scope, posture)} [data-oracle='${channel}']`, property },
      ];
    })
  );
}

const EXTRA_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) => [
  { id: `separator|${scope}`, selector: `${rootOf(scope, "side")} [data-part='main']`, property: "padding-left" },
  { id: `inline|${scope}`, selector: `${rootOf(scope, "inline")} > .ds-sidebar-surface-aside`, property: "width" },
]);

const DRILL: readonly Channel[] = [DRILLED];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { ${DRILLED}: ${ROOT_STATED}; }</style>`;
/** The retired alias stated the same way: the skin's root declaration shadows it. */
const ROOT_ASIDE_STYLE = `<style>html[data-tenant][data-tenant] { ${ASIDE}: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the structure) and one ON the boundary (inline). */
const SIDEBAR_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="${DRILLED}: ${BOUNDARY_STATED}">`,
  sidebar("side"),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { ${DRILLED}: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { ${DRILLED}: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { ${DRILLED}: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: [DRILLED],
  derive: () => ({ [DRILLED]: CARRIED }),
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
let rootAsideStated: ProbeReadings;
let sidebarStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel) => from.base[`site|${scope}|${channel}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel) => from.base[`oracle|${scope}|${channel}`];

const mainGap = (from: ProbeReadings, scope: Scope) => site(from, scope, DRILLED);

describe("chrome/sidebar-surface channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      ...EXTRA_TARGETS,
      { id: "onBoundary", selector: "#on-boundary [data-part='root'] [data-part='main']", property: "row-gap" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(DRILL));
    rootAsideStated = await probe(markup(ROOT_ASIDE_STYLE), targets(["--ds-sidebar-surface-aside-width"]));
    sidebarStated = await probe(markup("", `${DRILLED}: ${SIDEBAR_STATED}`), targets(DRILL));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(DRILL));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(DRILL));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(DRILL));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(DRILL));
    }
  }, 180_000);

  it("probes the anatomy the engine stamps, and its inline aside track", () => {
    expect(ENGINE).toContain('className="ds-structure ds-sidebar-surface"');
    for (const attribute of ["data-stacked", "data-aside", "data-bordered"]) expect(ENGINE).toContain(`${attribute}={`);
    for (const part of ["panel-body", "main"]) expect(ENGINE).toContain(`data-part="${part}"`);
    expect(ENGINE).toContain(`{ '${ASIDE}': toCssLength(config.visual.asideWidth) }`);
  });

  it("measures a real read site and a real oracle for every channel in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries really move the oracle away from rest", () => {
    for (const channel of CHANNELS) {
      const rest = oracle(readings, "rest", channel);
      expect({ channel, compact: oracle(readings, "compact", channel) }).not.toEqual({ channel, compact: rest });
      expect({ channel, spacious: oracle(readings, "spacious", channel) }).not.toEqual({ channel, spacious: rest });
    }
  });

  it("(a) every channel paints the local scope's answer, not the root's, the separator inset included", () => {
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const channel of CHANNELS) {
        const painted = site(readings, scope, channel);
        const expected = oracle(readings, scope, channel);
        if (painted !== expected) drift.push(`${scope} ${channel}: painted ${painted}, local answer ${expected}`);
      }
      const separator = readings.base[`separator|${scope}`];
      if (separator !== oracle(readings, scope, GAP)) drift.push(`${scope} separator inset: painted ${separator}, local answer ${oracle(readings, scope, GAP)}`);
    }
    expect(drift).toEqual([]);
  });

  it("pin: a config aside width travels inline on the aside track and paints exactly in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: readings.base[`inline|${scope}`] }).toEqual({ scope, painted: "250px" });
    }
  });

  it("pin: the aside track in force is not a theme channel: never compiled, and a root statement of it paints nowhere", () => {
    expect(COMPILED.cssVariables[ASIDE]).toBeUndefined();
    expect(COMPILED.densityScopeBlock?.cssVariables[ASIDE]).toBeUndefined();
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: site(rootAsideStated, scope, "--ds-sidebar-surface-aside-width") }).toEqual({
        scope,
        painted: oracle(rootAsideStated, scope, "--ds-sidebar-surface-aside-width"),
      });
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: mainGap(sidebarStated, scope) }).toEqual({ scope, painted: SIDEBAR_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: mainGap(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: mainGap(rootStated, scope) }).toEqual({ scope, painted: oracle(rootStated, scope, DRILLED) });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot[DRILLED]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables[DRILLED]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: mainGap(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ [DRILLED]: CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: mainGap(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: mainGap(dbUncarried, scope) }).toEqual({ scope, painted: oracle(dbUncarried, scope, DRILLED) });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", DRILLED);
    expect(mainGap(drills.layeredHeavy, "compact")).toBe(local);
    expect(mainGap(drills.unlayeredLighter, "compact")).toBe(local);
    expect(mainGap(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the sidebar-surface channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-80")).toBe(true);
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
