/** The card channels a local density scope re-derives, measured in Chromium.
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
import { cardChromeDeriver } from "..";

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

const CARD = resolve(process.cwd(), "src/components/primitives/display/card");
const ENGINE = readFileSync(resolve(CARD, "engines/modern/index.tsx"), "utf8");
const HEADER = readFileSync(resolve(CARD, "compound/header/index.tsx"), "utf8");
const FOOTER = readFileSync(resolve(CARD, "compound/footer/index.tsx"), "utf8");
const RECIPE = readFileSync(
  resolve(process.cwd(), "src/infrastructure/runtime/foundation/recipes/contracts/families/card/index.ts"),
  "utf8"
);

const PRODUCES = new Set<string>(cardChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the part the skin selects, the declaration its oracle paints,
 *  and the computed properties read at both. */
const SITES = {
  "--ds-card-loading-min-height": {
    site: ".ds-card[data-loading='true'] > [data-part='loading-content']",
    declaration: "min-block-size",
    properties: ["min-height"],
  },
  "--ds-card-header-extra-min-height": {
    site: ".ds-card-header > [data-part='extra']",
    declaration: "min-block-size",
    properties: ["min-height"],
  },
  "--ds-card-footer-actions-inset": {
    site: ".ds-card-footer > [data-part='actions']",
    declaration: "padding",
    properties: ["padding-top", "padding-left"],
  },
  // Read by the Grid skin's auto-fit recipe: the resolved track list of eight
  // cells in a fixed 66rem box moves with the footprint the scope answers.
  "--ds-card-min-inline-size": {
    site: "[data-probe='auto-fit'] > [data-component='grid']",
    declaration: "grid-template-columns",
    properties: ["grid-template-columns"],
  },
} as const;

const EIGHT_CELLS = "<div></div>".repeat(8);
const AUTO_FIT_SITE = [
  `<div data-probe="auto-fit" style="inline-size: 66rem">`,
  `<div class="rottay-grid rottay-grid--modern" data-part="root" data-component="grid" data-auto-fit="true">${EIGHT_CELLS}</div>`,
  `</div>`,
].join("");

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
  channel === "--ds-card-min-inline-size"
    ? `<div style="inline-size: 66rem"><div data-oracle="${channel}" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, calc(${PRODUCED[channel]} * var(--ds-card-scale, 1))), 1fr))">${EIGHT_CELLS}</div></div>`
    : `<div data-oracle="${channel}" style="${SITES[channel].declaration}: ${PRODUCED[channel]}"></div>`;

/** The card anatomy the skin selects -- a loading card, and a resting card composing the header
 *  and footer compounds -- plus one oracle per channel painting its expression in place. */
function card(rootStyle = ""): string {
  return [
    `<div>`,
    `<div class="ds-card ds-card--modern ds-card--elevated" data-part="root" data-variant="elevated" data-loading="true" style="${rootStyle}">`,
    `<div data-part="loading-content"><div data-part="loading-overlay"><span data-part="spinner"></span></div></div>`,
    `</div>`,
    `<div class="ds-card ds-card--modern ds-card--elevated" data-part="root" data-variant="elevated" style="${rootStyle}">`,
    `<div data-part="body">`,
    `<div class="ds-card-header" data-part="header" data-padding="md" data-has-extra="true">`,
    `<div data-part="content"><div data-part="header-main"><h3 data-part="title">Title</h3></div></div>`,
    `<div data-part="extra">Extra</div></div>`,
    `<div class="ds-card-footer" data-part="footer" data-padding="md" data-align="end">`,
    `<div data-part="actions"><button type="button">Go</button></div></div>`,
    `</div></div>`,
    AUTO_FIT_SITE,
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](card(rootStyle))}</div>`).join("");
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

const INSET: readonly Channel[] = ["--ds-card-footer-actions-inset"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-card-footer-actions-inset: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the card) and one ON the boundary (inline). */
const CARD_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-card-footer-actions-inset: ${BOUNDARY_STATED}">`,
  card(),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-card-footer-actions-inset: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-card-footer-actions-inset: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-card-footer-actions-inset: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-card-footer-actions-inset"],
  derive: () => ({ "--ds-card-footer-actions-inset": CARRIED }),
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
let cardStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const inset = (from: ProbeReadings, scope: Scope) => site(from, scope, "--ds-card-footer-actions-inset", "padding-top");

describe("chrome/card channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      { id: "onBoundary", selector: "#on-boundary .ds-card-footer > [data-part='actions']", property: "padding-top" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(INSET));
    cardStated = await probe(markup("", `--ds-card-footer-actions-inset: ${CARD_STATED}`), targets(INSET));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(INSET));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(INSET));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(INSET));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(INSET));
    }
  }, 180_000);

  it("probes the parts the engine stamps", () => {
    expect(RECIPE).toContain("root: 'ds-card'");
    expect(RECIPE).toContain("root: 'ds-card--modern'");
    expect(ENGINE).toContain(`data-part="loading-content"`);
    expect(ENGINE).toContain("'data-loading'");
    expect(HEADER).toContain("'ds-card-header'");
    expect(HEADER).toContain(`data-part="extra"`);
    expect(FOOTER).toContain("'ds-card-footer'");
    expect(FOOTER).toContain(`data-part="actions"`);
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
      expect({ scope, painted: inset(cardStated, scope) }).toEqual({ scope, painted: CARD_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: inset(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: inset(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-card-footer-actions-inset", "padding-top"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-card-footer-actions-inset"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-card-footer-actions-inset"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: inset(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-card-footer-actions-inset": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: inset(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: inset(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-card-footer-actions-inset", "padding-top"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-card-footer-actions-inset", "padding-top");
    expect(inset(drills.layeredHeavy, "compact")).toBe(local);
    expect(inset(drills.unlayeredLighter, "compact")).toBe(local);
    expect(inset(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the card channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-1")).toBe(true);
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
