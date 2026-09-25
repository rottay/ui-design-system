/** The table channels a local density scope re-derives, measured in Chromium.
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
import { tableChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/primitives/display/table/engines/modern/index.tsx"), "utf8");
const SKIN = stripComments(
  readFileSync(resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css"), "utf8")
);

const PRODUCES = new Set<string>(tableChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

const ROOT = ".ds-table.ds-table--modern";

/** One read site per channel: the element, the declaration its oracle paints, and the computed properties read at both. */
const SITES = {
  "--ds-table-title-margin-block-end": { site: `${ROOT} > [data-part='title']`, declaration: "margin-block-end", properties: ["margin-bottom"] },
  "--ds-table-footer-margin-block-start": {
    site: `${ROOT} > [data-part='footer']`,
    declaration: "margin-block-start",
    properties: ["margin-top"],
  },
  "--ds-table-pagination-margin-block-start": {
    site: `${ROOT} > [data-part='pagination']`,
    declaration: "margin-block-start",
    properties: ["margin-top"],
  },
  "--ds-table-selection-control-coarse-size": {
    site: `${ROOT} [data-part='selection-control']`,
    declaration: "width",
    properties: ["width"],
  },
  "--ds-table-cell-ellipsis-max-width": {
    site: `${ROOT} [data-part='cell'][data-ellipsis='true']`,
    declaration: "max-width",
    properties: ["max-width"],
  },
  "--ds-table-col-min-width": { site: `${ROOT} [data-part='cell'][data-ellipsis='true']`, declaration: "min-width", properties: ["min-width"] },
  "--ds-table-sticky-top": { site: `${ROOT} [data-part='header-cell'][data-sticky='true']`, declaration: "top", properties: ["top"] },
  "--ds-table-virtual-spacer": { site: `${ROOT} [data-part='virtual-spacer']`, declaration: "height", properties: ["height"] },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** Named pins, never (a) cells: the skin re-declares four runtime geometry channels on the table root,
 *  so no root or boundary statement of those names reaches a read site. Three rest at literal zero and
 *  are re-stamped inline per prop; the ellipsis cap restates the local ramp in its own words. */
const SHADOWED: readonly Channel[] = [
  "--ds-table-cell-ellipsis-max-width",
  "--ds-table-col-min-width",
  "--ds-table-sticky-top",
  "--ds-table-virtual-spacer",
];
const ZERO: readonly Channel[] = ["--ds-table-col-min-width", "--ds-table-sticky-top", "--ds-table-virtual-spacer"];
/** Read only under a coarse pointer, where the entrypoint's touch floor outranks it. Its expression
 *  multiplies a spacing rung, already density-scaled, by the density scale again. */
const DOUBLED = "--ds-table-selection-control-coarse-size" as const;
const LIVE = CHANNELS.filter((channel) => !SHADOWED.includes(channel) && channel !== DOUBLED);
const DRILLED = "--ds-table-pagination-margin-block-start" as const;

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

/** A titled, selectable, sticky, virtualized table with a truncating column, a footer and pagination,
 *  plus one oracle per channel painting its expression in place. */
function table(rootStyle = ""): string {
  return [
    `<div class="ds-table ds-table--modern" style="width: 720px;${rootStyle}">`,
    `<div data-part="title">Records</div>`,
    `<div data-part="scroll-container"><table data-part="table"><thead><tr>`,
    `<th data-part="header-cell" data-sticky="true"><input type="checkbox" data-part="selection-control" aria-label="Select all"></th>`,
    `<th data-part="header-cell" data-sticky="true">Name</th></tr></thead><tbody>`,
    `<tr aria-hidden="true"><td colspan="2" data-part="virtual-spacer"></td></tr>`,
    `<tr><td data-part="cell"><input type="checkbox" data-part="selection-control" aria-label="Select row"></td>`,
    `<td data-part="cell" data-ellipsis="true">A long value that truncates</td></tr>`,
    `</tbody></table></div>`,
    `<div data-part="footer">Footer</div>`,
    `<div data-part="pagination"><span data-part="pagination-range">1-1 of 1</span></div>`,
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](table(rootStyle))}</div>`).join("");
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

/** b1: a statement below the boundary (on the table) and one ON the boundary (inline). */
const TABLE_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="${DRILLED}: ${BOUNDARY_STATED}">`,
  table(),
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
let coarse: ProbeReadings;
let rootStated: ProbeReadings;
let tableStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];
const px = (value: string) => Number.parseFloat(value);

const paginationGap = (from: ProbeReadings, scope: Scope) => site(from, scope, DRILLED, "margin-top");

describe("chrome/table channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(CHANNELS.filter((channel) => channel !== DOUBLED)),
      { id: "onBoundary", selector: "#on-boundary [data-part='pagination']", property: "margin-top" },
    ]);
    coarse = await measureArms({
      vertical: "bithire",
      markup: markup(),
      arms: { base: {} },
      targets: [
        ...targets([DOUBLED]),
        ...SCOPE_NAMES.map((scope) => ({
          id: `floor|${scope}`,
          selector: `#${hostId(scope)} ${SITES[DOUBLED].site}`,
          property: "--ds-touch-target-min",
        })),
      ],
      environment: { touch: true },
    });
    rootStated = await probe(markup(ROOT_STYLE), targets(DRILL));
    tableStated = await probe(markup("", ` ${DRILLED}: ${TABLE_STATED}`), targets(DRILL));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets([DRILLED, ...SHADOWED]));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(DRILL));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(DRILL));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(DRILL));
    }
  }, 180_000);

  it("probes the parts and the runtime stamps the engine writes", () => {
    expect(ENGINE).toContain("['ds-table', 'ds-table--modern', className]");
    for (const part of ["title", "footer", "pagination", "header-cell", "virtual-spacer"]) {
      expect(ENGINE).toContain(`data-part="${part}"`);
    }
    for (const stamped of ["'--ds-table-col-min-width'", "'--ds-table-sticky-top'", "'--ds-table-virtual-spacer'"]) {
      expect(ENGINE).toContain(stamped);
    }
  });

  it("measures a real read site and a real oracle for every channel in every scope", () => {
    for (const [id, value] of Object.entries({ ...readings.base, ...coarse.base })) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries really move the oracle away from rest", () => {
    for (const channel of [...LIVE, "--ds-table-cell-ellipsis-max-width" as const]) {
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

  it("pin: under a coarse pointer the touch floor paints the selection control in every scope, above the channel's own answer", () => {
    for (const scope of SCOPE_NAMES) {
      const painted = site(coarse, scope, DOUBLED, "width");
      expect({ scope, painted }).toEqual({ scope, painted: coarse.base[`floor|${scope}`].trim() });
      expect({ scope, below: px(oracle(coarse, scope, DOUBLED, "width")) < px(painted) }).toEqual({ scope, below: true });
    }
  });

  it("pin: the channel's own answer takes a boundary's posture twice", () => {
    const ratio = px(oracle(coarse, "compact", DOUBLED, "width")) / px(oracle(coarse, "rest", DOUBLED, "width"));
    expect(ratio).toBeCloseTo(0.85 * 0.85, 2);
  });

  it("pin: the table root re-declares the four runtime geometry channels", () => {
    const rootRule = SKIN.match(/\.ds-table\.ds-table--modern\s*\{([^{}]*--ds-table-col-min-width[^{}]*)\}/)?.[1] ?? "";
    for (const channel of SHADOWED) {
      expect({ channel, declared: new RegExp(`${channel}\\s*:`).test(rootRule) }).toEqual({ channel, declared: true });
    }
  });

  it("pin: the shadowed channels paint the skin's own root statement in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      for (const channel of SHADOWED) {
        const property = SITES[channel].properties[0];
        const painted = site(readings, scope, channel, property);
        const expected = ZERO.includes(channel) ? "0px" : oracle(readings, scope, channel, property);
        expect({ scope, channel, painted }).toEqual({ scope, channel, painted: expected });
      }
    }
  });

  it("pin: a compiler-rank statement of a shadowed channel is carried into both blocks and reaches no read site", () => {
    for (const channel of SHADOWED) {
      expect(carriedRoot[channel]).toBe(SHADOW_CARRIED);
      expect(carriedBlock?.cssVariables[channel]).toBe(SHADOW_CARRIED);
    }
    for (const scope of SCOPE_NAMES) {
      for (const channel of SHADOWED) {
        const property = SITES[channel].properties[0];
        expect({ scope, channel, painted: site(carried, scope, channel, property) }).not.toEqual({
          scope,
          channel,
          painted: SHADOW_CARRIED,
        });
      }
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: paginationGap(tableStated, scope) }).toEqual({ scope, painted: TABLE_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: paginationGap(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: paginationGap(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, DRILLED, "margin-top"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot[DRILLED]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables[DRILLED]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: paginationGap(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual(STATED);
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: paginationGap(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: paginationGap(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, DRILLED, "margin-top"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", DRILLED, "margin-top");
    expect(paginationGap(drills.layeredHeavy, "compact")).toBe(local);
    expect(paginationGap(drills.unlayeredLighter, "compact")).toBe(local);
    expect(paginationGap(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the table channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-0")).toBe(true);
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
