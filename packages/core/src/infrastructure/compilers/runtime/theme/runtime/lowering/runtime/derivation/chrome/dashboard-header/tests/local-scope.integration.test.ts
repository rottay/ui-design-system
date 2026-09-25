/** The dashboard-header channels a local density scope re-derives, measured in Chromium.
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
import { dashboardHeaderChromeDeriver } from "..";

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
  resolve(process.cwd(), "src/components/structures/headers/dashboard/runtime/rendering/index.tsx"),
  "utf8"
);

const PRODUCES = new Set<string>(dashboardHeaderChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the posture it needs, the part, the declaration its oracle paints, the computed properties. */
const SITES = {
  "--ds-dashboard-header-room": {
    compact: "false",
    part: "root",
    declaration: "padding",
    properties: ["padding-top", "padding-left"],
  },
  "--ds-dashboard-header-room-tight": {
    compact: "true",
    part: "root",
    declaration: "padding",
    properties: ["padding-top"],
  },
  "--ds-dashboard-header-gap": {
    compact: "false",
    part: "header-row",
    declaration: "column-gap",
    properties: ["column-gap"],
  },
  "--ds-dashboard-header-gap-tight": {
    compact: "false",
    part: "identity",
    declaration: "column-gap",
    properties: ["column-gap"],
  },
  "--ds-dashboard-header-gap-hair": {
    compact: "false",
    part: "copy",
    declaration: "row-gap",
    properties: ["row-gap"],
  },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** Named pin, never an (a) cell: the title is an h1, so rottay-personality's heading tracking outranks the
 *  channel at its only read site, and `:lang(ar) { letter-spacing: normal }` in the last layer masks both. */
const MASKED = "--ds-dashboard-header-title-tracking";
const MASKED_INPUT = "--ds-type-page-title-letter-spacing";
const HEADING_INPUT = "--ds-typography-heading-letter-spacing";
const STATED_TRACKING = "3px";

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

/** The anatomy the runtime renders and the skin selects; the resting posture carries one oracle per channel. */
function dashboardHeader(compact: "false" | "true", rootStyle = "", titleStyle = ""): string {
  return [
    `<header class="ds-structure ds-dashboard-header" data-part="root" data-compact="${compact}" data-has-icon="true"`,
    ` data-has-metrics="false" data-has-actions="true" data-status="none" style="${rootStyle}">`,
    `<div data-part="header-row"><div data-part="identity">`,
    `<span data-part="icon" aria-hidden="true"></span>`,
    `<div data-part="copy"><div data-part="title-row">`,
    `<h1 data-part="title" style="${titleStyle}"><bdi>Operations</bdi>`,
    `<span data-oracle="heading" style="letter-spacing: var(${HEADING_INPUT})"></span></h1></div>`,
    `<p data-part="subtitle"><bdi>Live</bdi></p></div></div>`,
    `<div data-part="actions"></div></div>`,
    compact === "false" ? CHANNELS.map(oracleOf).join("") : "",
    `</header>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return (
    extra +
    SCOPE_NAMES.map(
      (scope) =>
        `<div id="${hostId(scope)}">${SCOPES[scope](dashboardHeader("false", rootStyle) + dashboardHeader("true", rootStyle))}</div>`
    ).join("")
  );
}

const siteSelector = (scope: Scope, channel: Channel) => {
  const { compact, part } = SITES[channel];
  const root = `#${hostId(scope)} [data-part='root'][data-compact='${compact}']`;
  return part === "root" ? root : `${root} [data-part='${part}']`;
};

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) =>
      SITES[channel].properties.flatMap((property) => [
        { id: `site|${scope}|${channel}|${property}`, selector: siteSelector(scope, channel), property },
        { id: `oracle|${scope}|${channel}|${property}`, selector: `#${hostId(scope)} [data-oracle='${channel}']`, property },
      ])
    )
  );
}

/** The masked pin reads the channel, its input and the painted tracking where the title sits. */
const MASK_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) => {
  const title = `#${hostId(scope)} [data-compact='false'] [data-part='title']`;
  return [
    { id: `mask-channel|${scope}`, selector: title, property: MASKED },
    { id: `mask-input|${scope}`, selector: title, property: MASKED_INPUT },
    { id: `mask-site|${scope}`, selector: title, property: "letter-spacing" },
  ];
});

/** The shadow drill: the channel stated on the title itself, beside what the heading and channel expressions paint. */
const SHADOW_TARGETS: ProbeTarget[] = [
  { id: "stated-site", selector: "#stated [data-part='title']", property: "letter-spacing" },
  { id: "heading-stated-site", selector: "#heading-stated [data-part='title']", property: "letter-spacing" },
  { id: "rest-heading", selector: `#${hostId("rest")} [data-compact='false'] [data-oracle='heading']`, property: "letter-spacing" },
];
const STATED = [
  `<div id="stated">${dashboardHeader("false", "", `${MASKED}: ${STATED_TRACKING}`)}</div>`,
  `<div id="heading-stated">${dashboardHeader("false", "", `${HEADING_INPUT}: ${STATED_TRACKING}`)}</div>`,
].join("");

const GAP: readonly Channel[] = ["--ds-dashboard-header-gap"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-dashboard-header-gap: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the header) and one ON the boundary (inline). */
const HEADER_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-dashboard-header-gap: ${BOUNDARY_STATED}">`,
  dashboardHeader("false"),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-dashboard-header-gap: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-dashboard-header-gap: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-dashboard-header-gap: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-dashboard-header-gap"],
  derive: () => ({ "--ds-dashboard-header-gap": CARRIED }),
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

const gap = (from: ProbeReadings, scope: Scope) => site(from, scope, "--ds-dashboard-header-gap", "column-gap");

describe("chrome/dashboard-header channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY + STATED, [
      ...targets(),
      ...MASK_TARGETS,
      ...SHADOW_TARGETS,
      { id: "onBoundary", selector: "#on-boundary [data-part='header-row']", property: "column-gap" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(GAP));
    headerStated = await probe(markup("", `--ds-dashboard-header-gap: ${HEADER_STATED}`), targets(GAP));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(GAP));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(GAP));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(GAP));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(GAP));
    }
  }, 180_000);

  it("probes the parts, state stamps and scope classes the runtime stamps", () => {
    for (const part of ["root", "header-row", "identity", "icon", "copy", "title-row", "title", "subtitle", "actions"]) {
      expect(RENDERING).toContain(`data-part="${part}"`);
    }
    expect(RENDERING).toContain(`className="ds-structure ds-dashboard-header"`);
    expect(RENDERING).toContain(`data-compact={compact ? 'true' : 'false'}`);
    expect(RENDERING).toContain(`<h1 data-part="title"`);
    expect(RENDERING).not.toMatch(/\sstyle=\{/);
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

  it("pin: the title's tracking channel is shadowed at rest by the personality heading rule", () => {
    expect(readings.base["mask-site|rest"]).toBe(readings.base["rest-heading"]);
    expect(readings.base["stated-site"]).not.toBe(STATED_TRACKING);
    expect(readings.base["stated-site"]).toBe(readings.base["mask-site|rest"]);
    expect(readings.base["heading-stated-site"]).toBe(STATED_TRACKING);
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
      expect({ scope, painted: gap(headerStated, scope) }).toEqual({ scope, painted: HEADER_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: gap(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: gap(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-dashboard-header-gap", "column-gap"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-dashboard-header-gap"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-dashboard-header-gap"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: gap(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-dashboard-header-gap": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: gap(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: gap(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-dashboard-header-gap", "column-gap"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-dashboard-header-gap", "column-gap");
    expect(gap(drills.layeredHeavy, "compact")).toBe(local);
    expect(gap(drills.unlayeredLighter, "compact")).toBe(local);
    expect(gap(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the dashboard-header channels whose value reads a density-scope name", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-4")).toBe(true);
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
