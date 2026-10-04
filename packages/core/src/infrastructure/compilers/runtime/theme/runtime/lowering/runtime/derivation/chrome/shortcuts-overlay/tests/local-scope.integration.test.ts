/** The shortcuts-overlay channels a local density scope re-derives, measured in Chromium.
 *  Each oracle paints the channel's own expression at the element: the answer the scope owes. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import { measureArms, type ProbeReadings, type ProbeTarget } from "@tests/support/family-causality";
import { bundleRealMount, measureRealMount, type RealMountScene } from "@tests/support/family-causality/real-mount";
import { compileThemeIntent, emitThemeCss, firstPartyScope, staticThemeIntent } from "@/entrypoints/server";
import { themeChannelDelta } from "@/infrastructure/compilers/runtime/theme/facade/foundation/admission/runtime/limits";
import { emitTenantArtifactCss } from "@/infrastructure/compilers/runtime/theme/runtime/emission";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { FAMILY_DERIVERS } from "../../..";
import { lowerBlock } from "../../../../pipeline";
import { densityScopeMembers, projectDensityScopeBlock } from "../../../../density-scope";
import { shortcutsOverlayChromeDeriver } from "..";

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
  resolve(process.cwd(), "src/components/patterns/navigation/shortcuts-overlay/engines/modern/index.tsx"),
  "utf8"
);

const PRODUCES = new Set<string>(shortcutsOverlayChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the part, the declaration its oracle paints, the computed properties read at both. */
const SITES = {
  "--ds-shortcuts-overlay-header-gap": { part: "header", declaration: "gap", properties: ["column-gap"] },
  "--ds-shortcuts-overlay-header-padding-block": { part: "header", declaration: "padding-block", properties: ["padding-top", "padding-bottom"] },
  "--ds-shortcuts-overlay-header-padding-inline": { part: "header", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-shortcuts-overlay-search-padding-block": { part: "search", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-shortcuts-overlay-search-padding-inline": { part: "search", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-shortcuts-overlay-list-padding-block": { part: "list", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-shortcuts-overlay-list-column-gap": { part: "list", declaration: "column-gap", properties: ["column-gap"] },
  "--ds-shortcuts-overlay-group-padding-block": { part: "group", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-shortcuts-overlay-category-padding-block": { part: "category-row", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-shortcuts-overlay-category-padding-inline": { part: "category-row", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-shortcuts-overlay-item-gap": { part: "item", declaration: "gap", properties: ["column-gap"] },
  "--ds-shortcuts-overlay-item-padding-inline": { part: "item", declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-shortcuts-overlay-chord-gap": { part: "chord", declaration: "gap", properties: ["column-gap"] },
  "--ds-shortcuts-overlay-empty-padding-block": { part: "empty", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-shortcuts-overlay-footer-padding-block": { part: "footer", declaration: "padding-block", properties: ["padding-top"] },
  "--ds-shortcuts-overlay-footer-padding-inline": { part: "footer", declaration: "padding-inline", properties: ["padding-left"] },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** The inline gutter has no box of its own: the skin folds it into the measure it hands Modal's surface,
 *  so its read site is that Modal channel and its oracle states the same expression in place. */
const GUTTER = "--ds-shortcuts-overlay-padding-inline";
const MEASURE = "--ds-modal-max-inline-size";
const tokens = (value: string) => value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

/** Named pin, never an (a) cell: `:lang(ar) { letter-spacing: normal }` in the last layer masks the
 *  frozen tracking channel at the category label, its only read site. */
const MASKED = "--ds-shortcuts-overlay-category-letter-spacing";
const MASKED_INPUT = "--ds-letter-spacing-wide";

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
/** The nearest density stamp `usePortalScope` re-stamps on the portaled dialog. */
const NEAREST_DENSITY: Readonly<Record<Scope, string>> = {
  rest: "<absent>",
  compact: "compact",
  comfortable: "comfortable",
  spacious: "spacious",
  nested: "compact",
  reverseNested: "spacious",
  arabic: "<absent>",
};

const oracleOf = (channel: Channel) =>
  `<div data-oracle="${channel}" style="${SITES[channel].declaration}: ${PRODUCED[channel]}"></div>`;

const gutterOracle = () =>
  `<div data-oracle="${GUTTER}" style="${MEASURE}: min(var(--ds-shortcuts-overlay-dialog-max-inline-size, 40rem), calc(100dvw - 2 * ${PRODUCED[GUTTER]}))"></div>`;

const pinOracles = () =>
  [
    gutterOracle(),
    `<div data-oracle="${MASKED}" style="letter-spacing: ${PRODUCED[MASKED]}; font-size: ${PRODUCED["--ds-shortcuts-overlay-category-font-size"]}"></div>`,
  ].join("");

/** The anatomy the Modern skin selects on Modal's surface -- a populated group, the empty state and
 *  the footer at once -- plus one oracle per channel painting its expression in place. */
function overlay(rootStyle = ""): string {
  return [
    `<div class="ds-pattern-shortcuts-overlay ds-engine-modern" data-part="surface" style="${rootStyle}">`,
    `<div data-part="content">`,
    `<div data-part="header"><h2 data-part="title">Keyboard Shortcuts</h2><button data-part="close">x</button></div>`,
    `<div data-part="search"><input aria-label="Search shortcuts" /></div>`,
    `<div data-part="list">`,
    `<div data-part="group"><div data-part="category-row"><span data-part="category-label">File</span></div>`,
    `<div data-part="item"><span data-part="description">Save</span>`,
    `<div data-part="chord" dir="ltr"><span data-part="kbd">Ctrl</span><span data-part="kbd">S</span></div></div></div>`,
    `<div data-part="empty">No matching shortcuts.</div>`,
    `</div>`,
    `<div data-part="footer">Press ? to toggle</div>`,
    `</div>`,
    CHANNELS.map(oracleOf).join(""),
    pinOracles(),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

/** The tracking channel stated on the overlay surface, at rest and under an Arabic subtree. */
const TRACKING_STATED = "3px";
const TRACKING_HOSTS = [
  `<div id="tracking-stated">${overlay(`${MASKED}: ${TRACKING_STATED}`)}</div>`,
  `<div id="tracking-stated-arabic"><div lang="ar">${overlay(`${MASKED}: ${TRACKING_STATED}`)}</div></div>`,
].join("");

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](overlay(rootStyle))}</div>`).join("");
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

/** The masked pin reads the channel, its input and the painted tracking where the category label sits. */
const MASK_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) => {
  const label = `#${hostId(scope)} [data-part='category-label']`;
  return [
    { id: `mask-channel|${scope}`, selector: label, property: MASKED },
    { id: `mask-input|${scope}`, selector: label, property: MASKED_INPUT },
    { id: `mask-site|${scope}`, selector: label, property: "letter-spacing" },
    { id: `mask-oracle|${scope}`, selector: `#${hostId(scope)} [data-oracle='${MASKED}']`, property: "letter-spacing" },
  ];
}).concat([
  { id: "mask-stated", selector: "#tracking-stated [data-part='category-label']", property: "letter-spacing" },
  { id: "mask-stated-arabic", selector: "#tracking-stated-arabic [data-part='category-label']", property: "letter-spacing" },
]);

/** The gutter pin reads the measure the surface declares and the oracle's statement of it. */
const GUTTER_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) => [
  { id: `gutter-site|${scope}`, selector: `#${hostId(scope)} [data-part='surface']`, property: MEASURE },
  { id: `gutter-oracle|${scope}`, selector: `#${hostId(scope)} [data-oracle='${GUTTER}']`, property: MEASURE },
]);

const HEADER_GAP: readonly Channel[] = ["--ds-shortcuts-overlay-header-gap"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_CSS = `html[data-tenant][data-tenant] { --ds-shortcuts-overlay-header-gap: ${ROOT_STATED}; }`;
const ROOT_STYLE = `<style>${ROOT_CSS}</style>`;

/** b1: a statement below the boundary (on the overlay surface) and one ON the boundary (inline). */
const OVERLAY_STATED = "52px";
const BOUNDARY_STATED = "53px";
const onBoundary = (inner: string) =>
  `<div data-density="compact" style="--ds-shortcuts-overlay-header-gap: ${BOUNDARY_STATED}">${inner}</div>`;
const ON_BOUNDARY = `<div id="on-boundary">${onBoundary(overlay())}</div>`;

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-shortcuts-overlay-header-gap: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-shortcuts-overlay-header-gap: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-shortcuts-overlay-header-gap: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-shortcuts-overlay-header-gap"],
  derive: () => ({ "--ds-shortcuts-overlay-header-gap": CARRIED }),
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
const dbLineage = (inner: string) => `<div data-ds-root data-vertical="bithire" data-tenant="acme">${inner}</div>`;
const dbRoot = (css: string) => `<style>${css}</style>${dbLineage(markup())}`;

/** The real overlay: Modal portals its dialog out of the anchor's lineage and `usePortalScope` carries
 *  that lineage across -- the nearest scope stamps plus the anchor's computed `--ds-*` values, inline. */
const REAL_PROPS = `({ open: true, onOpenChange() {}, footer: "Press ? to toggle",
  shortcuts: [{ key: "ctrl+s", description: "Save", category: "File" }] })`;
const READY = "dialog [data-part='search']";

/** The empty state renders only without shortcuts, in its own scene; the populated list renders the rest. */
const EMPTY_CHANNELS = CHANNELS.filter((channel) => SITES[channel].part === "empty");
const LIST_CHANNELS = CHANNELS.filter((channel) => SITES[channel].part !== "empty");
const EMPTY_PROPS = { shortcuts: [] };
const emptyScene = (scope: Scope) => `${scope}|empty`;
const sceneOf = (scope: Scope, channel: Channel) => (SITES[channel].part === "empty" ? emptyScene(scope) : scope);

const STAMPS = [
  { id: "density", selector: "dialog", property: "@attr.data-density" },
  { id: "tenant", selector: "dialog", property: "@attr.data-tenant" },
  { id: "copied", selector: "dialog", property: "@inline.--ds-shortcuts-overlay-header-gap" },
  { id: "inAnchorLineage", selector: "[data-real-mount-host] dialog", property: "display" },
  { id: "scoped", selector: "dialog .ds-pattern-shortcuts-overlay.ds-engine-modern", property: "@attr.data-part" },
];

/** One scene per scope: the mount point and one oracle per channel sit in the anchor's lineage. */
function realScenes(
  lineage = (inner: string) => inner,
  channels: readonly Channel[] = LIST_CHANNELS,
  variant?: { id: (scope: Scope) => string; props: Readonly<Record<string, unknown>> }
): RealMountScene[] {
  return SCOPE_NAMES.map((scope) => ({
    id: variant ? variant.id(scope) : scope,
    ...(variant ? { props: variant.props } : {}),
    markup: lineage(SCOPES[scope](`<div data-real-mount></div>${channels.map(oracleOf).join("")}${gutterOracle()}`)),
    ready: READY,
    targets: [
      ...STAMPS,
      { id: "gutter-site", selector: "dialog .ds-pattern-shortcuts-overlay", property: MEASURE },
      { id: "gutter-oracle", selector: `[data-oracle='${GUTTER}']`, property: MEASURE },
      ...channels.flatMap((channel) =>
        SITES[channel].properties.flatMap((property) => [
          { id: `site|${channel}|${property}`, selector: `dialog [data-part='${SITES[channel].part}']`, property },
          { id: `oracle|${channel}|${property}`, selector: `[data-oracle='${channel}']`, property },
        ])
      ),
    ],
  }));
}

const GAP_SITE = "site|--ds-shortcuts-overlay-header-gap|column-gap";
const GAP_ORACLE = "oracle|--ds-shortcuts-overlay-header-gap|column-gap";

/** b1 on the real mount: the inline statement on the boundary is part of the lineage the portal copies. */
const REAL_ON_BOUNDARY: RealMountScene = {
  id: "onBoundary",
  markup: onBoundary(`<div data-real-mount></div>`),
  ready: READY,
  targets: [{ id: GAP_SITE, selector: "dialog [data-part='header']", property: "column-gap" }],
};

let readings: ProbeReadings;
let rootStated: ProbeReadings;
let overlayStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};
let real: ProbeReadings;
let realRootStated: ProbeReadings;
let realCarried: ProbeReadings;
let realDbCarried: ProbeReadings;

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const headerGap = (from: ProbeReadings, scope: Scope) =>
  site(from, scope, "--ds-shortcuts-overlay-header-gap", "column-gap");

describe("chrome/shortcuts-overlay channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY + TRACKING_HOSTS, [
      ...targets(),
      ...MASK_TARGETS,
      ...GUTTER_TARGETS,
      { id: "onBoundary", selector: "#on-boundary [data-part='header']", property: "column-gap" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(HEADER_GAP));
    overlayStated = await probe(markup("", `--ds-shortcuts-overlay-header-gap: ${OVERLAY_STATED}`), targets(HEADER_GAP));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(HEADER_GAP));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(HEADER_GAP));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(HEADER_GAP));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(HEADER_GAP));
    }

    const bundle = await bundleRealMount({
      module: "src/components/patterns/navigation/shortcuts-overlay/engines/modern",
      props: REAL_PROPS,
    });
    const mountReal = (scenes: RealMountScene[], css: string[] = []) =>
      measureRealMount({ vertical: "bithire", bundle, css, scenes });
    real = await mountReal([
      ...realScenes(),
      ...realScenes(undefined, EMPTY_CHANNELS, { id: emptyScene, props: EMPTY_PROPS }),
      REAL_ON_BOUNDARY,
    ]);
    realRootStated = await mountReal(realScenes(undefined, HEADER_GAP), [ROOT_CSS]);
    realCarried = await mountReal(realScenes(undefined, HEADER_GAP), [CARRIED_CSS]);
    realDbCarried = await mountReal(realScenes(dbLineage, HEADER_GAP), [dbCss(true)]);
  }, 180_000);

  it("probes the parts the engine stamps, on the certified Modal it composes", () => {
    const parts = [
      "content", "header", "title", "close", "search", "list", "group",
      "category-row", "category-label", "item", "description", "chord", "kbd", "empty", "footer",
    ];
    for (const part of parts) {
      expect(ENGINE).toContain(`data-part="${part}"`);
    }
    expect(ENGINE).toContain("'ds-pattern-shortcuts-overlay', 'ds-engine-modern'");
    expect(ENGINE).toMatch(/<Modal\b/);
    expect(ENGINE).not.toMatch(/data-part="(root|backdrop|dialog)"/);
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

  it("pin: the gutter reaches the surface through Modal's measure, at the local scope's answer", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, measure: tokens(readings.base[`gutter-site|${scope}`]) }).toEqual({
        scope,
        measure: tokens(readings.base[`gutter-oracle|${scope}`]),
      });
    }
    const rest = tokens(readings.base["gutter-oracle|rest"]);
    expect(rest).toContain("100dvw");
    for (const scope of ["compact", "spacious"] as const) {
      expect({ scope, measure: tokens(readings.base[`gutter-oracle|${scope}`]) }).not.toEqual({ scope, measure: rest });
    }
  });

  it("pin: the category label's tracking paints its channel at rest and is masked under :lang(ar), stated or not", () => {
    const rootValue = readings.base["mask-channel|rest"];
    expect(readings.base["mask-channel|arabic"]).toBe(rootValue);
    expect(readings.base["mask-input|arabic"].trim()).toBe("0");
    expect(readings.base["mask-input|arabic"].trim()).not.toBe(rootValue.trim());
    expect(readings.base["mask-site|rest"]).not.toBe("normal");
    expect(readings.base["mask-site|rest"]).toBe(readings.base["mask-oracle|rest"]);
    expect(readings.base["mask-stated"]).toBe(TRACKING_STATED);
    expect(readings.base["mask-site|arabic"]).toBe("normal");
    expect(readings.base["mask-stated-arabic"]).toBe("normal");
    for (const scope of BOUNDED) {
      expect({ scope, painted: readings.base[`mask-site|${scope}`] }).toEqual({
        scope,
        painted: readings.base["mask-site|rest"],
      });
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: headerGap(overlayStated, scope) }).toEqual({ scope, painted: OVERLAY_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: headerGap(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: headerGap(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-shortcuts-overlay-header-gap", "column-gap"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-shortcuts-overlay-header-gap"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-shortcuts-overlay-header-gap"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: headerGap(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-shortcuts-overlay-header-gap": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: headerGap(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: headerGap(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-shortcuts-overlay-header-gap", "column-gap"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-shortcuts-overlay-header-gap", "column-gap");
    expect(headerGap(drills.layeredHeavy, "compact")).toBe(local);
    expect(headerGap(drills.unlayeredLighter, "compact")).toBe(local);
    expect(headerGap(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("real mount: the dialog leaves the anchor's lineage, re-stamps its nearest scope and carries its values inline", () => {
    for (const scope of SCOPE_NAMES) {
      const at = real[scope];
      expect({ scope, inAnchorLineage: at.inAnchorLineage }).toEqual({ scope, inAnchorLineage: expect.stringMatching(/^<no match/) });
      expect({ scope, density: at.density, tenant: at.tenant }).toEqual({ scope, density: NEAREST_DENSITY[scope], tenant: "bithire" });
      expect({ scope, copied: at.copied }).not.toEqual({ scope, copied: "" });
      expect({ scope, scoped: at.scoped }).toEqual({ scope, scoped: "surface" });
    }
  });

  it("(a) real mount: every channel on the portaled dialog paints the anchor's local answer", () => {
    expect(EMPTY_CHANNELS).toEqual(["--ds-shortcuts-overlay-empty-padding-block"]);
    expect(LIST_CHANNELS.length).toBe(CHANNELS.length - 1);
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const channel of CHANNELS) {
        for (const property of SITES[channel].properties) {
          const painted = real[sceneOf(scope, channel)][`site|${channel}|${property}`];
          const expected = real[sceneOf(scope, channel)][`oracle|${channel}|${property}`];
          expect({ scope, channel, painted }).not.toEqual({ scope, channel, painted: expect.stringMatching(/^<no match|^$/) });
          if (painted !== expected) drift.push(`${scope} ${channel} ${property}: painted ${painted}, local answer ${expected}`);
        }
      }
      const measure = tokens(real[scope]["gutter-site"]);
      if (measure !== tokens(real[scope]["gutter-oracle"])) {
        drift.push(`${scope} ${GUTTER}: measure ${measure}, local answer ${tokens(real[scope]["gutter-oracle"])}`);
      }
    }
    expect(drift).toEqual([]);
    for (const scope of ["compact", "spacious"] as const) {
      expect({ scope, gap: real[scope][GAP_ORACLE] }).not.toEqual({ scope, gap: real.rest[GAP_ORACLE] });
      expect({ scope, measure: tokens(real[scope]["gutter-oracle"]) }).not.toEqual({
        scope,
        measure: tokens(real.rest["gutter-oracle"]),
      });
    }
  });

  it("(b1) real mount: an inline statement on the boundary travels with the lineage onto the dialog", () => {
    expect(real.onBoundary[GAP_SITE]).toBe(BOUNDARY_STATED);
  });

  it("(b2) real mount: the dialog paints the raw root statement where no boundary intervenes, the local answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: realRootStated[scope][GAP_SITE] }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: realRootStated[scope][GAP_SITE] }).toEqual({ scope, painted: realRootStated[scope][GAP_ORACLE] });
    }
  });

  it("(b3) real mount: a compiler-rank statement paints on the dialog in every scope, first-party and at the DB door", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: realCarried[scope][GAP_SITE] }).toEqual({ scope, painted: CARRIED });
      expect({ scope, painted: realDbCarried[scope][GAP_SITE] }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(c) the compiler projects exactly the shortcuts-overlay channels whose value reads a density-scope name", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-2")).toBe(true);
    const densityExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, DENSITY_AXIS))
      .map(([channel]) => channel)
      .sort();
    expect(densityExposed).toEqual([...CHANNELS, GUTTER].sort());
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
