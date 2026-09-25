/** The mobile-header channels a local density scope re-derives, measured in Chromium.
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
import { mobileHeaderChromeDeriver } from "..";

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

const RENDERING = readFileSync(
  resolve(process.cwd(), "src/components/structures/headers/mobile-header/runtime/rendering/index.tsx"),
  "utf8"
);

const PRODUCES = new Set<string>(mobileHeaderChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the part, the declaration its oracle paints, the computed properties read at both. */
const SITES = {
  "--ds-mobile-header-bar-padding-inline": {
    part: "bar",
    declaration: "padding-inline",
    properties: ["padding-left", "padding-right"],
  },
  "--ds-mobile-header-center-padding-inline": {
    part: "center",
    declaration: "padding-inline",
    properties: ["padding-left", "padding-right"],
  },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** Named pin, never an (a) cell: the title is an h1, so rottay-personality's heading tracking outranks the
 *  channel at its only read site, and `:lang(ar) { letter-spacing: normal }` in the last layer masks both. */
const MASKED = "--ds-mobile-header-title-tracking";
const MASKED_INPUT = "--ds-letter-spacing-subtle";
const HEADING_TRACKING = "--ds-typography-heading-letter-spacing";
const MASK_STATED = "3px";
const MASK_STATED_HOST = [
  `<div id="mask-stated"><header class="rottay-mobile-header" data-testid="mobile-header" data-part="root" data-sticky="false">`,
  `<div class="rottay-mobile-header__bar" data-part="bar" style="display: flex">`,
  `<div class="rottay-mobile-header__center" data-part="center">`,
  `<h1 class="rottay-mobile-header__title" data-part="label" style="${MASKED}: ${MASK_STATED}">Records</h1>`,
  `</div></div></header></div>`,
].join("");

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

/** The anatomy the runtime renders and the skin selects, plus one oracle per channel painting its expression in place. */
function mobileHeader(rootStyle = ""): string {
  return [
    `<header class="rottay-mobile-header" data-testid="mobile-header" data-part="root" data-sticky="false" style="${rootStyle}">`,
    `<div class="rottay-mobile-header__bar" data-part="bar" style="display: flex">`,
    `<div class="rottay-mobile-header__left" data-part="left"></div>`,
    `<div class="rottay-mobile-header__center" data-part="center">`,
    `<h1 class="rottay-mobile-header__title" data-part="label">Records</h1></div>`,
    `<div class="rottay-mobile-header__right" data-part="right"></div></div>`,
    CHANNELS.map(oracleOf).join(""),
    `</header>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](mobileHeader(rootStyle))}</div>`).join("");
}

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) =>
      SITES[channel].properties.flatMap((property) => [
        { id: `site|${scope}|${channel}|${property}`, selector: `#${hostId(scope)} [data-part='${SITES[channel].part}']`, property },
        { id: `oracle|${scope}|${channel}|${property}`, selector: `#${hostId(scope)} [data-oracle='${channel}']`, property },
      ])
    )
  );
}

/** The masked pin reads the channel, its input and the painted tracking where the title sits. */
const MASK_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) => {
  const title = `#${hostId(scope)} [data-part='label']`;
  return [
    { id: `mask-channel|${scope}`, selector: title, property: MASKED },
    { id: `mask-input|${scope}`, selector: title, property: MASKED_INPUT },
    { id: `mask-site|${scope}`, selector: title, property: "letter-spacing" },
    { id: `mask-heading|${scope}`, selector: title, property: HEADING_TRACKING },
  ];
});

const BAR_PADDING: readonly Channel[] = ["--ds-mobile-header-bar-padding-inline"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-mobile-header-bar-padding-inline: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the header) and one ON the boundary (inline). */
const HEADER_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-mobile-header-bar-padding-inline: ${BOUNDARY_STATED}">`,
  mobileHeader(),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-mobile-header-bar-padding-inline: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-mobile-header-bar-padding-inline: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-mobile-header-bar-padding-inline: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-mobile-header-bar-padding-inline"],
  derive: () => ({ "--ds-mobile-header-bar-padding-inline": CARRIED }),
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

const barPadding = (from: ProbeReadings, scope: Scope) =>
  site(from, scope, "--ds-mobile-header-bar-padding-inline", "padding-left");

describe("chrome/mobile-header channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY + MASK_STATED_HOST, [
      ...targets(),
      ...MASK_TARGETS,
      { id: "mask-stated-channel", selector: "#mask-stated [data-part='label']", property: MASKED },
      { id: "mask-stated-site", selector: "#mask-stated [data-part='label']", property: "letter-spacing" },
      { id: "onBoundary", selector: "#on-boundary [data-part='bar']", property: "padding-left" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(BAR_PADDING));
    headerStated = await probe(markup("", `--ds-mobile-header-bar-padding-inline: ${HEADER_STATED}`), targets(BAR_PADDING));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(BAR_PADDING));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(BAR_PADDING));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(BAR_PADDING));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(BAR_PADDING));
    }
  }, 180_000);

  it("probes the parts and classes the runtime stamps", () => {
    for (const part of ["root", "bar", "left", "center", "label", "right"]) {
      expect(RENDERING).toContain(`data-part="${part}"`);
    }
    for (const suffix of ["", "__bar", "__left", "__center", "__title", "__right"]) {
      expect(RENDERING).toContain(`className="rottay-mobile-header${suffix}"`);
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

  it("pin: the title's tracking channel never paints, the heading tracking outranks it at rest", () => {
    expect(readings.base["mask-stated-channel"].trim()).toBe(MASK_STATED);
    expect(readings.base["mask-stated-site"]).not.toBe(MASK_STATED);
    expect(readings.base["mask-stated-site"]).toBe(readings.base["mask-site|rest"]);
    expect(readings.base["mask-heading|rest"].trim()).not.toBe(readings.base["mask-channel|rest"].trim());
  });

  it("pin: the title's tracking is masked, its channel frozen at the root while :lang(ar) paints normal", () => {
    const rootValue = readings.base["mask-channel|rest"];
    expect(readings.base["mask-channel|arabic"]).toBe(rootValue);
    expect(readings.base["mask-input|arabic"].trim()).toBe("0");
    expect(readings.base["mask-input|arabic"].trim()).not.toBe(rootValue.trim());
    expect(readings.base["mask-site|rest"]).not.toBe("normal");
    expect(readings.base["mask-site|arabic"]).toBe("normal");
    for (const scope of BOUNDED) {
      expect({ scope, painted: readings.base[`mask-site|${scope}`] }).toEqual({
        scope,
        painted: readings.base["mask-site|rest"],
      });
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: barPadding(headerStated, scope) }).toEqual({ scope, painted: HEADER_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: barPadding(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: barPadding(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-mobile-header-bar-padding-inline", "padding-left"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-mobile-header-bar-padding-inline"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-mobile-header-bar-padding-inline"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: barPadding(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-mobile-header-bar-padding-inline": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: barPadding(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: barPadding(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-mobile-header-bar-padding-inline", "padding-left"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-mobile-header-bar-padding-inline", "padding-left");
    expect(barPadding(drills.layeredHeavy, "compact")).toBe(local);
    expect(barPadding(drills.unlayeredLighter, "compact")).toBe(local);
    expect(barPadding(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the mobile-header channels whose value reads a density-scope name", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-2")).toBe(true);
    const densityExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, DENSITY_AXIS))
      .map(([channel]) => channel)
      .sort();
    expect(densityExposed).toEqual([...CHANNELS].sort());
    const arabicExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, ARABIC_AXIS))
      .map(([channel]) => channel);
    expect(arabicExposed).toEqual([MASKED]);

    const projected = Object.keys(COMPILED.densityScopeBlock?.cssVariables ?? {}).filter((channel) =>
      PRODUCES.has(channel)
    );
    expect(projected.sort()).toEqual(densityExposed);
    for (const channel of projected) {
      expect(COMPILED.densityScopeBlock?.cssVariables[channel]).toBe(COMPILED.cssVariables[channel]);
    }
  });
});
