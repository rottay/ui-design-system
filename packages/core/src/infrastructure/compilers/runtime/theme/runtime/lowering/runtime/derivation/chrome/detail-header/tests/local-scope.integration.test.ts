/** The detail-header channels a local density scope re-derives, measured in Chromium.
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
import { detailHeaderChromeDeriver } from "..";

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
  resolve(process.cwd(), "src/components/structures/headers/detail/runtime/rendering/index.tsx"),
  "utf8"
);

const PRODUCES = new Set<string>(detailHeaderChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the container width that activates it, the part, the declarations its oracle paints, the computed properties. */
const SITES = {
  "--ds-detail-header-root-margin-block-end": {
    width: "wide",
    part: "root",
    declarations: ["margin-block-end"],
    properties: ["margin-bottom"],
  },
  "--ds-detail-header-hero-panel-padding": {
    width: "wide",
    part: "hero-panel",
    declarations: ["padding"],
    properties: ["padding-top"],
  },
  "--ds-detail-header-hero-panel-padding-compact": {
    width: "narrow",
    part: "hero-panel",
    declarations: ["padding"],
    properties: ["padding-top"],
  },
  "--ds-detail-header-metadata-card-margin-block-start": {
    width: "wide",
    part: "metadata-card",
    declarations: ["margin-block-start"],
    properties: ["margin-top"],
  },
  "--ds-detail-header-back-button-padding": {
    width: "wide",
    part: "back-button",
    declarations: ["padding"],
    properties: ["padding-left", "padding-top"],
  },
  "--ds-detail-header-tab-padding": {
    width: "wide",
    part: "tab",
    declarations: ["padding"],
    properties: ["padding-left", "padding-top", "padding-bottom"],
  },
  "--ds-detail-header-avatar-size-compact": {
    width: "narrow",
    part: "avatar",
    declarations: ["inline-size", "block-size"],
    properties: ["width", "height"],
  },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** Named pin, never an (a) cell: the compact gutter is stated by a `@container ds-detail-header` rule on the
 *  root itself, and a container query never matches its own container, so the full gutter paints there. */
const UNREACHABLE: Partial<Record<Channel, Channel>> = {
  "--ds-detail-header-hero-panel-padding-compact": "--ds-detail-header-hero-panel-padding",
};
const LIVE = CHANNELS.filter((channel) => !(channel in UNREACHABLE));

/** Named pins, never (a) cells: the title is an h1, so rottay-personality's heading tracking outranks both
 *  channels at their read sites, and `:lang(ar) { letter-spacing: normal }` in the last layer masks them all. */
const MASKED = {
  "--ds-detail-header-title-tracking": "wide",
  "--ds-detail-header-title-tracking-compact": "narrow",
} as const;
type Masked = keyof typeof MASKED;
const MASKED_CHANNELS = Object.keys(MASKED) as Masked[];
const MASKED_INPUT = "--ds-type-page-title-letter-spacing";
const HEADING_INPUT = "--ds-typography-heading-letter-spacing";
const STATED_TRACKING = "3px";

const WIDTHS = { wide: "1000px", narrow: "560px" } as const;
type Width = keyof typeof WIDTHS;

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
  `<div data-oracle="${channel}" style="${SITES[channel].declarations.map((declaration) => `${declaration}: ${PRODUCED[channel]}`).join("; ")}"></div>`;

/** The anatomy the runtime renders and the skin selects, plus one oracle per channel painting its expression in place. */
function detailHeader(width: Width, rootStyle = "", titleStyle = ""): string {
  return [
    `<div class="ds-structure ds-detail-header" data-part="root" data-archetype="control" style="width: ${WIDTHS[width]};${rootStyle}">`,
    `<div data-part="top-bar"><div style="display: flex"><a href="#">`,
    `<div data-part="back-button" style="display: flex"><span data-part="back-label">Back</span></div></a></div></div>`,
    `<div data-part="hero-panel" data-archetype="control"><div data-part="hero-spine" aria-hidden="true"></div>`,
    `<div style="display: flex"><div data-part="hero-cluster" style="display: flex">`,
    `<div data-part="avatar" data-variant="initials"><span data-part="avatar-initials">AB</span></div>`,
    `<div data-part="hero-copy"><h1 data-part="title" data-archetype="control" style="${titleStyle}">Record`,
    `<span data-oracle="heading" style="letter-spacing: var(${HEADING_INPUT})"></span></h1></div></div></div>`,
    `<div data-part="metadata-card" role="group"></div></div>`,
    `<div data-part="tab-strip" role="tablist"><div data-part="tab-list" style="display: flex">`,
    `<div data-part="tab" data-active="true" role="tab">Overview</div></div></div>`,
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope, width: Width) => `${scope}-${width}`;

function markup(extra = "", rootStyle = "", widths: readonly Width[] = ["wide", "narrow"]): string {
  const hosts = SCOPE_NAMES.flatMap((scope) =>
    widths.map((width) => `<div id="${hostId(scope, width)}">${SCOPES[scope](detailHeader(width, rootStyle))}</div>`)
  );
  return extra + hosts.join("");
}

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) => {
      const { part, width, properties } = SITES[channel];
      const host = `#${hostId(scope, width)}`;
      const selector = part === "root" ? `${host} [data-part='root']` : `${host} [data-part='${part}']`;
      return properties.flatMap((property) => [
        { id: `site|${scope}|${channel}|${property}`, selector, property },
        { id: `oracle|${scope}|${channel}|${property}`, selector: `${host} [data-oracle='${channel}']`, property },
      ]);
    })
  );
}

/** The unreachable pin reads the shadowing channel's oracle at the same host. */
const UNREACHABLE_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) =>
  (Object.entries(UNREACHABLE) as Array<[Channel, Channel]>).flatMap(([channel, shadow]) =>
    SITES[channel].properties.map((property) => ({
      id: `shadow-oracle|${scope}|${channel}|${property}`,
      selector: `#${hostId(scope, SITES[channel].width)} [data-oracle='${shadow}']`,
      property,
    }))
  )
);

/** The masked pins read each channel, its input and the painted tracking where the title sits at its width. */
const MASK_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) =>
  MASKED_CHANNELS.flatMap((channel) => {
    const title = `#${hostId(scope, MASKED[channel])} [data-part='title']`;
    return [
      { id: `mask-channel|${scope}|${channel}`, selector: title, property: channel },
      { id: `mask-input|${scope}|${channel}`, selector: title, property: MASKED_INPUT },
      { id: `mask-site|${scope}|${channel}`, selector: title, property: "letter-spacing" },
      {
        id: `mask-heading|${scope}|${channel}`,
        selector: `#${hostId(scope, MASKED[channel])} [data-oracle='heading']`,
        property: "letter-spacing",
      },
    ];
  })
);

/** The shadow drills: each channel stated on the title itself, and the heading input stated there instead. */
const STATED = MASKED_CHANNELS.map(
  (channel) =>
    `<div id="stated-${channel}">${detailHeader(MASKED[channel], "", `${channel}: ${STATED_TRACKING}`)}</div>` +
    `<div id="heading-stated-${channel}">${detailHeader(MASKED[channel], "", `${HEADING_INPUT}: ${STATED_TRACKING}`)}</div>`
).join("");
const SHADOW_TARGETS: ProbeTarget[] = MASKED_CHANNELS.flatMap((channel) => [
  { id: `stated-site|${channel}`, selector: `#stated-${channel} [data-part='title']`, property: "letter-spacing" },
  { id: `heading-stated-site|${channel}`, selector: `#heading-stated-${channel} [data-part='title']`, property: "letter-spacing" },
]);

const MARGIN: readonly Channel[] = ["--ds-detail-header-root-margin-block-end"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-detail-header-root-margin-block-end: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the header) and one ON the boundary (inline). */
const HEADER_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-detail-header-root-margin-block-end: ${BOUNDARY_STATED}">`,
  detailHeader("wide"),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-detail-header-root-margin-block-end: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-detail-header-root-margin-block-end: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-detail-header-root-margin-block-end: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-detail-header-root-margin-block-end"],
  derive: () => ({ "--ds-detail-header-root-margin-block-end": CARRIED }),
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
  `<style>${css}</style><div data-ds-root data-vertical="bithire" data-tenant="acme">${markup("", "", ["wide"])}</div>`;

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

const margin = (from: ProbeReadings, scope: Scope) =>
  site(from, scope, "--ds-detail-header-root-margin-block-end", "margin-bottom");

describe("chrome/detail-header channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY + STATED, [
      ...targets(),
      ...UNREACHABLE_TARGETS,
      ...MASK_TARGETS,
      ...SHADOW_TARGETS,
      { id: "onBoundary", selector: "#on-boundary [data-part='root']", property: "margin-bottom" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE, "", ["wide"]), targets(MARGIN));
    headerStated = await probe(
      markup("", ` --ds-detail-header-root-margin-block-end: ${HEADER_STATED}`, ["wide"]),
      targets(MARGIN)
    );
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`, "", ["wide"]), targets(MARGIN));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(MARGIN));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(MARGIN));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`, "", ["wide"]), targets(MARGIN));
    }
  }, 180_000);

  it("probes the parts, state stamps and scope classes the runtime stamps", () => {
    for (const part of [
      "root",
      "top-bar",
      "hero-panel",
      "hero-spine",
      "hero-cluster",
      "hero-copy",
      "avatar",
      "title",
      "metadata-card",
      "tab-strip",
      "tab-list",
    ]) {
      expect(RENDERING).toContain(`data-part="${part}"`);
    }
    for (const part of ["back-button", "tab"]) {
      expect(RENDERING).toContain(`partAttributes('${part}'`);
    }
    expect(RENDERING).toContain(`['ds-structure', 'ds-detail-header', className]`);
    expect(RENDERING).toContain(`<Box data-part="title" data-archetype={archetype} as="h1">`);
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

  it("pin: the compact gutter never reaches the hero panel, the full gutter's local answer paints there in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      for (const channel of Object.keys(UNREACHABLE) as Channel[]) {
        for (const property of SITES[channel].properties) {
          const painted = site(readings, scope, channel, property);
          expect({ scope, channel, painted }).toEqual({
            scope,
            channel,
            painted: readings.base[`shadow-oracle|${scope}|${channel}|${property}`],
          });
          expect({ scope, channel, painted }).not.toEqual({ scope, channel, painted: oracle(readings, scope, channel, property) });
        }
      }
    }
  });

  it("pin: both title tracking channels are shadowed at rest by the personality heading rule", () => {
    for (const channel of MASKED_CHANNELS) {
      const rest = readings.base[`mask-site|rest|${channel}`];
      expect({ channel, rest }).toEqual({ channel, rest: readings.base[`mask-heading|rest|${channel}`] });
      expect({ channel, stated: readings.base[`stated-site|${channel}`] }).toEqual({ channel, stated: rest });
      expect({ channel, stated: readings.base[`stated-site|${channel}`] }).not.toEqual({ channel, stated: STATED_TRACKING });
      expect({ channel, heading: readings.base[`heading-stated-site|${channel}`] }).toEqual({
        channel,
        heading: STATED_TRACKING,
      });
    }
  });

  it("pin: both title tracking channels are masked, frozen at the root while :lang(ar) paints normal", () => {
    for (const channel of MASKED_CHANNELS) {
      const rootValue = readings.base[`mask-channel|rest|${channel}`];
      expect({ channel, frozen: readings.base[`mask-channel|arabic|${channel}`] }).toEqual({ channel, frozen: rootValue });
      expect({ channel, input: readings.base[`mask-input|arabic|${channel}`].trim() }).toEqual({ channel, input: "0" });
      expect(readings.base[`mask-input|arabic|${channel}`].trim()).not.toBe(rootValue.trim());
      expect({ channel, rest: readings.base[`mask-site|rest|${channel}`] }).not.toEqual({ channel, rest: "normal" });
      expect({ channel, arabic: readings.base[`mask-site|arabic|${channel}`] }).toEqual({ channel, arabic: "normal" });
      for (const scope of BOUNDED) {
        expect({ channel, scope, painted: readings.base[`mask-site|${scope}|${channel}`] }).toEqual({
          channel,
          scope,
          painted: readings.base[`mask-site|rest|${channel}`],
        });
      }
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: margin(headerStated, scope) }).toEqual({ scope, painted: HEADER_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: margin(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: margin(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-detail-header-root-margin-block-end", "margin-bottom"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-detail-header-root-margin-block-end"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-detail-header-root-margin-block-end"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: margin(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-detail-header-root-margin-block-end": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: margin(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: margin(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-detail-header-root-margin-block-end", "margin-bottom"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-detail-header-root-margin-block-end", "margin-bottom");
    expect(margin(drills.layeredHeavy, "compact")).toBe(local);
    expect(margin(drills.unlayeredLighter, "compact")).toBe(local);
    expect(margin(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the detail-header channels whose value reads a density-scope name", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-14")).toBe(true);
    const densityExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, DENSITY_AXIS))
      .map(([channel]) => channel)
      .sort();
    expect(densityExposed).toEqual([...CHANNELS].sort());
    const arabicExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, ARABIC_AXIS))
      .map(([channel]) => channel)
      .sort();
    expect(arabicExposed).toEqual([...MASKED_CHANNELS].sort());

    const projected = Object.keys(COMPILED.densityScopeBlock?.cssVariables ?? {}).filter((channel) =>
      PRODUCES.has(channel)
    );
    expect(projected.sort()).toEqual(densityExposed);
    for (const channel of projected) {
      expect(COMPILED.densityScopeBlock?.cssVariables[channel]).toBe(COMPILED.cssVariables[channel]);
    }
  });
});
