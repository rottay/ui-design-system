/** The command-palette channels a local density scope re-derives, measured in Chromium.
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
import { commandPaletteChromeDeriver } from "..";

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
  resolve(process.cwd(), "src/components/patterns/navigation/command-palette/engines/modern/index.tsx"),
  "utf8"
);

const PRODUCES = new Set<string>(commandPaletteChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the part, the declaration its oracle paints, the computed properties read at both.
 *  A group label also matches the section-label rule, so the section-label channels read at the section label. */
const SITES = {
  "--ds-command-palette-search-gap": { part: "search", declaration: "gap", properties: ["column-gap"] },
  "--ds-command-palette-search-padding": { part: "search", declaration: "padding", properties: ["padding-top", "padding-left"] },
  "--ds-command-palette-list-padding-block": { part: "list", declaration: "padding-block", properties: ["padding-top", "padding-bottom"] },
  "--ds-command-palette-recent-padding-inline": { part: "recent", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-command-palette-recent-padding-block-end": { part: "recent", declaration: "padding-block-end", properties: ["padding-bottom"] },
  "--ds-command-palette-section-label-padding-inline": { part: "section-label", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-command-palette-section-label-margin-block-end": { part: "section-label", declaration: "margin-block-end", properties: ["margin-bottom"] },
  "--ds-command-palette-group-label-padding-block": { part: "group-label", declaration: "padding-block", properties: ["padding-top", "padding-bottom"] },
  "--ds-command-palette-group-label-padding-inline": { part: "group-label", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-command-palette-item-gap": { part: "item", declaration: "gap", properties: ["column-gap"] },
  "--ds-command-palette-item-margin-inline": { part: "item", declaration: "margin-inline", properties: ["margin-left"] },
  "--ds-command-palette-item-padding-block": { part: "item", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-command-palette-item-padding-inline": { part: "item", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-command-palette-item-main-gap": { part: "item-main", declaration: "gap", properties: ["column-gap"] },
  "--ds-command-palette-shortcut-margin-inline-start": { part: "shortcut", declaration: "margin-inline-start", properties: ["margin-left"] },
  "--ds-command-palette-empty-padding-block": { part: "empty", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-command-palette-error-padding-block": { part: "error", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-command-palette-error-padding-inline": { part: "error", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-command-palette-argument-panel-padding-block": { part: "argument-panel", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-command-palette-argument-panel-padding-inline": { part: "argument-panel", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-command-palette-argument-error-margin-block-start": { part: "argument-error", declaration: "margin-block-start", properties: ["margin-top"] },
  "--ds-command-palette-footer-padding-block": { part: "footer", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-command-palette-footer-padding-inline": { part: "footer", declaration: "padding-inline", properties: ["padding-left"] },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** The lineage `usePortalScope` re-stamps onto the portaled dialog, which sits outside every ancestor boundary. */
const portalRoot = (tenant: string, density?: string) => (inner: string) =>
  `<div data-portal-scope="true" data-ds-root="" data-vertical="bithire" data-tenant="${tenant}"${
    density ? ` data-density="${density}"` : ""
  }>${inner}</div>`;

/** None, each posture, both nesting orders, an Arabic subtree, and the boundary copied onto the portal root. */
const scopesFor = (tenant: string) =>
  ({
    rest: (inner: string) => inner,
    compact: (inner: string) => `<div data-density="compact">${inner}</div>`,
    comfortable: (inner: string) => `<div data-density="comfortable">${inner}</div>`,
    spacious: (inner: string) => `<div data-density="spacious">${inner}</div>`,
    nested: (inner: string) =>
      `<div data-density="spacious"><div data-density="compact">${inner}</div></div>`,
    reverseNested: (inner: string) =>
      `<div data-density="compact"><div data-density="spacious">${inner}</div></div>`,
    arabic: (inner: string) => `<div lang="ar">${inner}</div>`,
    portal: portalRoot(tenant),
    portalCompact: portalRoot(tenant, "compact"),
    portalSpacious: portalRoot(tenant, "spacious"),
  }) as const;

const SCOPES = scopesFor("bithire");
type Scope = keyof typeof SCOPES;
const SCOPE_NAMES = Object.keys(SCOPES) as Scope[];
const ANCESTOR_BOUNDED: readonly Scope[] = ["compact", "comfortable", "spacious", "nested", "reverseNested"];
const PORTAL_BOUNDED: readonly Scope[] = ["portalCompact", "portalSpacious"];
const BOUNDED: readonly Scope[] = [...ANCESTOR_BOUNDED, ...PORTAL_BOUNDED];
const UNBOUNDED: readonly Scope[] = ["rest", "arabic", "portal"];

const oracleOf = (channel: Channel) =>
  `<div data-oracle="${channel}" style="${SITES[channel].declaration}: ${PRODUCED[channel]}"></div>`;

/** The palette anatomy the Modern skin selects on Modal's surface -- every mode's parts at once --
 *  plus one oracle per channel painting its expression in place. */
function palette(rootStyle = ""): string {
  const item = [
    `<div data-part="item"><div data-part="item-main"><div data-part="item-text">`,
    `<div data-part="label">Open</div><div data-part="description">Open a record</div></div></div>`,
    `<span data-part="shortcut">K</span></div>`,
  ].join("");
  return [
    `<div class="ds-pattern-command-palette ds-engine-modern" data-part="surface" style="${rootStyle}">`,
    `<div data-part="content">`,
    `<div data-part="search"><span data-part="argument-chip">Go</span><span>Query</span></div>`,
    `<div data-part="argument-panel"><div data-part="argument-prompt">Name</div>`,
    `<div data-part="argument-error">Required</div></div>`,
    `<div data-part="list">`,
    `<div data-part="recent"><div data-part="section-label">Recent</div>${item}</div>`,
    `<div data-part="group-label">Actions</div>${item}`,
    `<div data-part="error">Provider failed</div>`,
    `<div data-part="empty">Nothing found</div>`,
    `</div>`,
    `<div data-part="footer">Enter to run</div>`,
    `</div>`,
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = "", tenant = "bithire"): string {
  const scopes = scopesFor(tenant);
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${scopes[scope](palette(rootStyle))}</div>`).join("");
}

/** The first item outside the recent block, so the recent block's own inline-padding rule is not the read. */
const partSelector = (part: string) =>
  part === "item" || part === "item-main" || part === "shortcut"
    ? `[data-part='list'] > [data-part='item'] ${part === "item" ? "" : `[data-part='${part}']`}`.trim()
    : `[data-part='${part}']`;

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) =>
      SITES[channel].properties.flatMap((property) => [
        { id: `site|${scope}|${channel}|${property}`, selector: `#${hostId(scope)} ${partSelector(SITES[channel].part)}`, property },
        { id: `oracle|${scope}|${channel}|${property}`, selector: `#${hostId(scope)} [data-oracle='${channel}']`, property },
      ])
    )
  );
}

const SEARCH_GAP: readonly Channel[] = ["--ds-command-palette-search-gap"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-command-palette-search-gap: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the palette), one ON the boundary (inline), and one on the
 *  portal root, where `usePortalScope` copies the lineage's inline overrides beside its density. */
const PALETTE_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-command-palette-search-gap: ${BOUNDARY_STATED}">`,
  palette(),
  `</div></div>`,
  `<div id="on-portal"><div data-portal-scope="true" data-ds-root="" data-vertical="bithire" data-tenant="bithire"`,
  ` data-density="compact" style="--ds-command-palette-search-gap: ${BOUNDARY_STATED}">`,
  palette(),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-command-palette-search-gap: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-command-palette-search-gap: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-command-palette-search-gap: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-command-palette-search-gap"],
  derive: () => ({ "--ds-command-palette-search-gap": CARRIED }),
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
  `<style>${css}</style><div data-ds-root data-vertical="bithire" data-tenant="acme">${markup("", "", "acme")}</div>`;

let readings: ProbeReadings;
let rootStated: ProbeReadings;
let paletteStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const searchGap = (from: ProbeReadings, scope: Scope) => site(from, scope, "--ds-command-palette-search-gap", "column-gap");

describe("chrome/command-palette channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      { id: "onBoundary", selector: "#on-boundary [data-part='search']", property: "column-gap" },
      { id: "onPortal", selector: "#on-portal [data-part='search']", property: "column-gap" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(SEARCH_GAP));
    paletteStated = await probe(markup("", `--ds-command-palette-search-gap: ${PALETTE_STATED}`), targets(SEARCH_GAP));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(SEARCH_GAP));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(SEARCH_GAP));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(SEARCH_GAP));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(SEARCH_GAP));
    }
  }, 180_000);

  it("probes the parts the engine stamps, on the certified Modal it composes", () => {
    for (const part of CHANNELS.map((channel) => SITES[channel].part).filter((part) => part !== "item")) {
      expect(ENGINE).toContain(`data-part="${part}"`);
    }
    expect(ENGINE).toContain("partAttributes('item'");
    expect(ENGINE).toContain("'ds-pattern-command-palette', 'ds-engine-modern'");
  });

  it("measures a real read site and a real oracle for every channel in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries, on an ancestor or on the portal root, really move the oracle away from rest", () => {
    for (const channel of CHANNELS) {
      const property = SITES[channel].properties[0];
      const rest = oracle(readings, "rest", channel, property);
      for (const scope of ["compact", "spacious", "portalCompact", "portalSpacious"] as const) {
        expect({ channel, scope, value: oracle(readings, scope, channel, property) }).not.toEqual({ channel, scope, value: rest });
      }
      expect({ channel, portal: oracle(readings, "portal", channel, property) }).toEqual({ channel, portal: rest });
    }
  });

  it("(a) every channel paints the local scope's answer, not the root's, including on the portal root", () => {
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

  it("(b1) a statement at or below the boundary wins in every scope, and on the portal root", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: searchGap(paletteStated, scope) }).toEqual({ scope, painted: PALETTE_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
    expect(readings.base.onPortal).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: searchGap(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: searchGap(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-command-palette-search-gap", "column-gap"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-command-palette-search-gap"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-command-palette-search-gap"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: searchGap(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-command-palette-search-gap": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: searchGap(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of ANCESTOR_BOUNDED) {
      expect({ scope, painted: searchGap(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-command-palette-search-gap", "column-gap"),
      });
    }
  });

  it("pin: a portal root copying the DB lineage re-matches the tenant root block itself, which outweighs the first-party boundary", () => {
    for (const scope of PORTAL_BOUNDED) {
      expect({ scope, painted: searchGap(dbUncarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-command-palette-search-gap", "column-gap");
    expect(searchGap(drills.layeredHeavy, "compact")).toBe(local);
    expect(searchGap(drills.unlayeredLighter, "compact")).toBe(local);
    expect(searchGap(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the command-palette channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-2")).toBe(true);
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
