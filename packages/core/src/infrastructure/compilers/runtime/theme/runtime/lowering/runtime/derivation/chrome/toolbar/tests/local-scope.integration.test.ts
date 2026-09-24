/** The toolbar channels a local density scope re-derives, measured in Chromium.
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
import { deriveToolbarChannels, toolbarChromeDeriver } from "..";

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

const PRODUCED = deriveToolbarChannels();

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the part, the container width that activates it, the properties it paints. */
const SITES = {
  "--ds-toolbar-min-height": { part: "main-row", width: "wide", properties: ["min-height"] },
  "--ds-toolbar-title-gap": { part: "title-section", width: "wide", properties: ["column-gap"] },
  "--ds-toolbar-title-letter-spacing": { part: "title", width: "wide", properties: ["letter-spacing"] },
  "--ds-toolbar-controls-gap": { part: "controls", width: "wide", properties: ["column-gap"] },
  "--ds-toolbar-control-gap": { part: "filter-rail", width: "wide", properties: ["column-gap"] },
  "--ds-toolbar-filter-strip-padding": { part: "filter-chips-strip", width: "wide", properties: ["padding-top", "padding-left"] },
  "--ds-toolbar-compact-padding": { part: "mobile-layout", width: "medium", properties: ["padding-top", "padding-left"] },
  "--ds-toolbar-phone-padding": { part: "mobile-layout", width: "phone", properties: ["padding-top", "padding-left"] },
  "--ds-toolbar-phone-filter-strip-padding": { part: "filter-chips-strip", width: "phone", properties: ["padding-top", "padding-left"] },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** Named pins, never (a) cells: the base strip rule's doubled attribute outranks the phone strip rule,
 *  and `:lang(ar) { letter-spacing: normal }` in the last layer masks the frozen tracking channel. */
const SHADOWED: Partial<Record<Channel, Channel>> = {
  "--ds-toolbar-phone-filter-strip-padding": "--ds-toolbar-filter-strip-padding",
};
const MASKED = "--ds-toolbar-title-letter-spacing" as const;
const LIVE = CHANNELS.filter((channel) => !(channel in SHADOWED) && channel !== MASKED);

const WIDTHS = { wide: "1200px", medium: "800px", phone: "400px" } as const;

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

const CSS_PROPERTY: Record<string, string> = {
  "min-height": "min-height",
  "column-gap": "column-gap",
  "letter-spacing": "letter-spacing",
  "padding-top": "padding",
  "padding-left": "padding",
};

/** Tracking resolves against the title's own font size, so its oracle carries it too. */
const ORACLE_EXTRA: Partial<Record<Channel, string>> = {
  [MASKED]: `font-size: ${PRODUCED["--ds-toolbar-title-font-size"]}`,
};

function oracleOf(channel: Channel): string {
  const property = CSS_PROPERTY[SITES[channel].properties[0]];
  const extra = ORACLE_EXTRA[channel] ? `; ${ORACLE_EXTRA[channel]}` : "";
  return `<div data-oracle="${channel}" style="${property}: ${PRODUCED[channel]}${extra}"></div>`;
}

/** The toolbar anatomy the Modern skin selects, plus one oracle per channel painting its expression in place. */
function toolbar(width: keyof typeof WIDTHS, rootStyle = ""): string {
  const oracles = CHANNELS.filter((channel) => SITES[channel].width === width).map(oracleOf).join("");
  return [
    `<div class="ds-pattern-list-toolbar ds-engine-modern" data-part="root" style="width: ${WIDTHS[width]};${rootStyle}">`,
    `<div class="ds-list-toolbar__main-row" data-part="main-row">`,
    `<div class="ds-list-toolbar__title-section" data-part="title-section">`,
    `<span class="ds-list-toolbar__title" data-part="title">Records</span></div>`,
    `<div class="ds-list-toolbar__filter-rail" data-part="filter-rail"></div>`,
    `<div class="ds-list-toolbar__controls" data-part="controls"></div></div>`,
    `<div class="ds-list-toolbar__mobile-layout" data-part="mobile-layout"></div>`,
    `<div class="ds-list-toolbar__filter-chips-strip" data-part="filter-chips-strip"></div>`,
    oracles,
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope, width: string) => `${scope}-${width}`;

function markup(extra = "", rootStyle = "", widths: ReadonlyArray<keyof typeof WIDTHS> = ["wide", "medium", "phone"]): string {
  const hosts = SCOPE_NAMES.flatMap((scope) =>
    widths.map((width) => `<div id="${hostId(scope, width)}">${SCOPES[scope](toolbar(width, rootStyle))}</div>`)
  );
  return extra + hosts.join("");
}

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) => {
      const { part, width, properties } = SITES[channel];
      const host = `#${hostId(scope, width)}`;
      return properties.flatMap((property) => [
        { id: `site|${scope}|${channel}|${property}`, selector: `${host} [data-part='${part}']`, property },
        { id: `oracle|${scope}|${channel}|${property}`, selector: `${host} [data-oracle='${channel}']`, property },
      ]);
    })
  );
}

/** The masked pin reads the channel and its input where the title sits. */
const MASK_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) => [
  { id: `mask-channel|${scope}`, selector: `#${hostId(scope, "wide")} [data-part='title']`, property: MASKED },
  {
    id: `mask-input|${scope}`,
    selector: `#${hostId(scope, "wide")} [data-part='title']`,
    property: "--ds-type-section-title-letter-spacing",
  },
]);

const MIN_HEIGHT: readonly Channel[] = ["--ds-toolbar-min-height"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-toolbar-min-height: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the toolbar) and one ON the boundary (inline). */
const TOOLBAR_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-toolbar-min-height: ${BOUNDARY_STATED}">`,
  toolbar("wide"),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-toolbar-min-height: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-toolbar-min-height: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-toolbar-min-height: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-toolbar-min-height"],
  derive: () => ({ "--ds-toolbar-min-height": CARRIED }),
};
const carriedTheme = firstPartyFixture("bithire");
const carriedDerivers = [...FAMILY_DERIVERS, statedAtTenant];
const carriedRoot = lowerBlock({ theme: carriedTheme }, carriedDerivers);
const carriedBlock = projectDensityScopeBlock(
  carriedRoot,
  densityScopeMembers(carriedDerivers, (derivers) => lowerBlock({ theme: carriedTheme }, derivers)),
  []
);
const CARRIED_CSS = emitThemeCss(
  {
    cssVariables: carriedRoot,
    modeBlocks: [],
    ...(carriedBlock ? { densityScopeBlock: carriedBlock } : {}),
    runtime: { personality: {}, tokenOverrides: {} },
  },
  firstPartyScope("bithire")
);

/** b3 at the DB door: the tenant delta over the vertical's own compile, under a DB root. */
const carriedDelta = themeChannelDelta(
  {
    cssVariables: carriedRoot,
    modeBlocks: [],
    ...(carriedBlock ? { densityScopeBlock: carriedBlock } : {}),
    runtime: { personality: {}, tokenOverrides: {} },
  },
  compileThemeIntent(staticThemeIntent("bithire")).compiled
);
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
  `<style>${css}</style><div data-ds-root data-vertical="bithire" data-tenant="acme">${markup("", "", ["wide"])}</div>`;

let readings: ProbeReadings;
let rootStated: ProbeReadings;
let toolbarStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const minHeight = (from: ProbeReadings, scope: Scope) => site(from, scope, "--ds-toolbar-min-height", "min-height");

describe("chrome/toolbar channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      ...MASK_TARGETS,
      { id: "onBoundary", selector: "#on-boundary [data-part='main-row']", property: "min-height" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE, "", ["wide"]), targets(MIN_HEIGHT));
    toolbarStated = await probe(
      markup("", ` --ds-toolbar-min-height: ${TOOLBAR_STATED}`, ["wide"]),
      targets(MIN_HEIGHT)
    );
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`, "", ["wide"]), targets(MIN_HEIGHT));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(MIN_HEIGHT));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(MIN_HEIGHT));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`, "", ["wide"]), targets(MIN_HEIGHT));
    }
  }, 180_000);

  it("measures a real read site and a real oracle for every channel in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries really move the oracle away from rest", () => {
    for (const channel of LIVE) {
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

  it("pin: the phone strip channel never reaches its site, the wide strip channel paints there in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      for (const [channel, shadow] of Object.entries(SHADOWED) as Array<[Channel, Channel]>) {
        for (const property of SITES[channel].properties) {
          const painted = site(readings, scope, channel, property);
          expect({ scope, channel, painted }).toEqual({ scope, channel, painted: site(readings, scope, shadow, property) });
          expect({ scope, channel, painted }).not.toEqual({ scope, channel, painted: oracle(readings, scope, channel, property) });
        }
      }
    }
  });

  it("pin: the title's tracking is masked, its channel frozen at the root while :lang(ar) paints normal", () => {
    const rootValue = readings.base["mask-channel|rest"];
    expect(readings.base["mask-channel|arabic"]).toBe(rootValue);
    expect(readings.base["mask-input|arabic"].trim()).toBe("0");
    expect(readings.base["mask-input|arabic"].trim()).not.toBe(rootValue.trim());
    expect(site(readings, "arabic", MASKED, "letter-spacing")).toBe("normal");
    for (const scope of BOUNDED) {
      expect({ scope, painted: site(readings, scope, MASKED, "letter-spacing") }).toEqual({
        scope,
        painted: site(readings, "rest", MASKED, "letter-spacing"),
      });
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: minHeight(toolbarStated, scope) }).toEqual({ scope, painted: TOOLBAR_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: minHeight(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: minHeight(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-toolbar-min-height", "min-height"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-toolbar-min-height"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-toolbar-min-height"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: minHeight(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-toolbar-min-height": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: minHeight(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: minHeight(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-toolbar-min-height", "min-height"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-toolbar-min-height", "min-height");
    expect(minHeight(drills.layeredHeavy, "compact")).toBe(local);
    expect(minHeight(drills.unlayeredLighter, "compact")).toBe(local);
    expect(minHeight(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the toolbar channels whose value reads a density-scope name", () => {
    expect(DENSITY_AXIS.has("--ds-density-effective-scale")).toBe(true);
    expect(DENSITY_AXIS.has("--ds-spacing-2")).toBe(true);
    const densityExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, DENSITY_AXIS))
      .map(([channel]) => channel)
      .sort();
    const arabicExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, ARABIC_AXIS))
      .map(([channel]) => channel);
    expect([...densityExposed, ...arabicExposed].sort()).toEqual([...CHANNELS].sort());
    expect(arabicExposed).toEqual([MASKED]);

    const { compiled } = compileThemeIntent(staticThemeIntent("bithire"));
    const projected = Object.keys(compiled.densityScopeBlock?.cssVariables ?? {}).filter((channel) =>
      toolbarChromeDeriver.produces.includes(channel)
    );
    expect(projected.sort()).toEqual(densityExposed);
    for (const channel of projected) {
      expect(compiled.densityScopeBlock?.cssVariables[channel]).toBe(compiled.cssVariables[channel]);
    }
  });
});
