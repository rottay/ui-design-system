/** The tabs channels a local density scope re-derives, measured in Chromium.
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
import { tabsChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/primitives/navigation/tabs/engines/modern/index.tsx"), "utf8");
const SKIN = stripComments(
  readFileSync(resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css"), "utf8")
);

const PRODUCES = new Set<string>(tabsChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

const HOSTS = {
  md: `data-variant="line" data-size="md"`,
  sm: `data-variant="line" data-size="sm"`,
  lg: `data-variant="line" data-size="lg"`,
  contained: `data-variant="contained" data-size="md"`,
  narrow: `data-variant="line" data-size="md"`,
  step: `data-variant="line" data-size="responsive" data-ds-responsive="ds-tabs-responsive-height@xs ds-tabs-responsive-padding@xs"`,
  large: `data-variant="line" data-size="responsive" data-ds-responsive="ds-tabs-responsive-height@xs ds-tabs-responsive-padding@xs"`,
} as const;
type Host = keyof typeof HOSTS;
const HOST_STYLE: Record<Host, string> = {
  md: "width: 900px;",
  sm: "width: 900px;",
  lg: "width: 900px;",
  contained: "width: 900px;",
  narrow: "width: 400px;",
  step: "width: 900px; --_ds-rsp-ds-tabs-responsive-height-xs: 30px; --_ds-rsp-ds-tabs-responsive-padding-xs: 0 20px;",
  large:
    "width: 900px; --_ds-rsp-ds-tabs-responsive-height-xs: var(--ds-tabs-lg-height); --_ds-rsp-ds-tabs-responsive-padding-xs: var(--ds-tabs-lg-padding);",
};

/** One read site per channel: the tabs that activate it, the part, the declaration its oracle paints and the property read. */
const SITES = {
  "--ds-tabs-gap": { host: "md", part: "[data-part='tab-list']", declaration: "column-gap", property: "column-gap" },
  "--ds-tabs-sm-height": { host: "sm", part: "[data-part='tab-button']", declaration: "block-size", property: "height" },
  "--ds-tabs-sm-padding": { host: "sm", part: "[data-part='tab-button']", declaration: "padding", property: "padding-left" },
  "--ds-tabs-md-height": { host: "md", part: "[data-part='tab-button']", declaration: "block-size", property: "height" },
  "--ds-tabs-md-padding": { host: "md", part: "[data-part='tab-button']", declaration: "padding", property: "padding-left" },
  "--ds-tabs-lg-height": { host: "lg", part: "[data-part='tab-button']", declaration: "block-size", property: "height" },
  "--ds-tabs-lg-padding": { host: "lg", part: "[data-part='tab-button']", declaration: "padding", property: "padding-left" },
  "--ds-tabs-mobile-gap": { host: "narrow", part: "[data-part='tab-list']", declaration: "column-gap", property: "column-gap" },
  "--ds-tabs-mobile-padding": { host: "narrow", part: "[data-part='tab-button']", declaration: "padding", property: "padding-left" },
  "--ds-tabs-list-padding": { host: "contained", part: "[data-part='tab-list']", declaration: "padding", property: "padding-left" },
  "--ds-tabs-overflow-fade-width": { host: "md", part: "[data-twin='fade']", declaration: "width", property: "width" },
  "--ds-tabs-item-gap": { host: "md", part: "[data-part='tab-button']", declaration: "column-gap", property: "column-gap" },
  "--ds-tabs-icon-padding": { host: "md", part: "[data-part='icon']", declaration: "padding", property: "padding-left" },
  "--ds-tabs-badge-min-width": { host: "md", part: "[data-part='tab-badge']", declaration: "min-width", property: "min-width" },
  "--ds-tabs-badge-height": { host: "md", part: "[data-part='tab-badge']", declaration: "block-size", property: "height" },
  "--ds-tabs-badge-padding": { host: "md", part: "[data-part='tab-badge']", declaration: "padding", property: "padding-left" },
  "--ds-tabs-indicator-offset": { host: "md", part: "[data-part='indicator']", declaration: "transform", property: "transform" },
  "--ds-tabs-overflow-control-size": { host: "md", part: "[data-part='overflow-previous']", declaration: "width", property: "width" },
  "--ds-tabs-panel-padding": { host: "md", part: "[data-part='tab-panel']", declaration: "padding", property: "padding-top" },
  "--ds-tabs-panel-gap": { host: "contained", part: "[data-part='tab-panel']", declaration: "margin-top", property: "margin-top" },
  "--ds-tabs-panel-motion-distance": { host: "md", part: "[data-twin='motion']", declaration: "width", property: "width" },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** `--ds-spacing-0` holds zero in every posture: members that never move. */
const INVARIANT: readonly Channel[] = ["--ds-tabs-mobile-gap", "--ds-tabs-indicator-offset"];
/** Named pin, never an (a) cell: the root rule re-declares the resting offset and the engine writes the measured one inline. */
const OFFSET = "--ds-tabs-indicator-offset" as const;
const LIVE = CHANNELS.filter((channel) => channel !== OFFSET);
const MOVING = LIVE.filter((channel) => !INVARIANT.includes(channel));
const DRILLED = "--ds-tabs-md-height" as const;

/** The tab label tracking: the button is its one read site, masked under Arabic. */
const MASKED = "--ds-tabs-item-letter-spacing" as const;
const MASKED_INPUT = "--ds-type-label-letter-spacing" as const;
const TRACKING_STATED = "3px";

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
const MASK_ORACLE = `<div data-oracle="${MASKED}" style="letter-spacing: ${PRODUCED[MASKED]}; font-size: ${PRODUCED["--ds-tabs-md-font-size"]}"></div>`;

/** The tabs anatomy the Modern skin selects, plus the oracles of the channels this host activates, painted in place.
 *  The fade is an ::after and the panel travel a keyframe, which the probe cannot read: each gets a twin that reads
 *  the channel where the pseudo-element and the panel inherit it (nothing between them and the root re-declares it). */
function tabs(host: Host, rootStyle = ""): string {
  const oracles = CHANNELS.filter((channel) => SITES[channel].host === host).map(oracleOf).join("");
  return [
    `<div class="ds-tabs ds-tabs--modern" data-part="root" ${HOSTS[host]} data-panel-variant="${host === "contained" ? "contained" : "plain"}" style="${HOST_STYLE[host]}${rootStyle}">`,
    `<div data-part="tab-rail">`,
    `<button data-part="overflow-previous" type="button">p</button>`,
    `<div role="tablist" data-part="tab-list">`,
    `<button data-part="tab-button" data-selected="true" type="button"><span data-part="icon" aria-hidden="true">i</span><span data-part="tab-label">One</span><span data-part="tab-badge">3</span></button>`,
    `<button data-part="tab-button" data-selected="false" type="button"><span data-part="tab-label">Two</span></button>`,
    `<span data-part="indicator" data-visible="true"></span>`,
    `</div>`,
    `<span data-twin="fade" style="display: block; flex: none; inline-size: var(--ds-tabs-overflow-fade-width)"></span>`,
    `</div>`,
    `<div data-part="tab-panel">Panel<span data-twin="motion" style="display: block; inline-size: var(--ds-tabs-panel-motion-distance)"></span></div>`,
    oracles,
    host === "md" ? MASK_ORACLE : "",
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
          (Object.keys(HOSTS) as Host[]).map((host) => `<div data-host="${host}">${tabs(host, rootStyle)}</div>`).join("")
        )}</div>`
    ).join("")
  );
}

const rootOf = (scope: Scope, host: Host) => `#${hostId(scope)} [data-host='${host}'] > [data-part='root']`;

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) => {
      const { host, part, property } = SITES[channel];
      return [
        { id: `site|${scope}|${channel}`, selector: `${rootOf(scope, host)} ${part}`, property },
        { id: `oracle|${scope}|${channel}`, selector: `${rootOf(scope, host)} [data-oracle='${channel}']`, property },
      ];
    })
  );
}

const button = (scope: Scope, host: Host) => `${rootOf(scope, host)} [data-part='tab-button']`;
const EXTRA_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) => [
  { id: `step-height|${scope}`, selector: button(scope, "step"), property: "height" },
  { id: `step-padding|${scope}`, selector: button(scope, "step"), property: "padding-left" },
  { id: `large-height|${scope}`, selector: button(scope, "large"), property: "height" },
  { id: `large-padding|${scope}`, selector: button(scope, "large"), property: "padding-left" },
  { id: `mask-site|${scope}`, selector: button(scope, "md"), property: "letter-spacing" },
  { id: `mask-oracle|${scope}`, selector: `${rootOf(scope, "md")} [data-oracle='${MASKED}']`, property: "letter-spacing" },
  { id: `mask-channel|${scope}`, selector: button(scope, "md"), property: MASKED },
  { id: `mask-input|${scope}`, selector: button(scope, "md"), property: MASKED_INPUT },
]);

const MASK_TARGETS: ProbeTarget[] = (["rest", "arabic"] as const).map((scope) => ({
  id: `mask-site|${scope}`,
  selector: button(scope, "md"),
  property: "letter-spacing",
}));

const DRILL: readonly Channel[] = [DRILLED];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { ${DRILLED}: ${ROOT_STATED}; }</style>`;
/** The retired alias stated the same way: a runtime channel the root reads first, never projected. */
const RESPONSIVE = "--ds-tabs-responsive-height" as const;
const ROOT_RESPONSIVE_STYLE = `<style>html[data-tenant][data-tenant] { ${RESPONSIVE}: ${ROOT_STATED}; }</style>`;

/** The tracking drill: the channel stated on its read site, at rest and under Arabic. */
const MASK_STYLE = `<style>.ds-tabs [data-part='tab-button'] { ${MASKED}: ${TRACKING_STATED} !important; }</style>`;

/** b1: a statement below the boundary (on the tabs root) and one ON the boundary (inline). */
const TABS_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="${DRILLED}: ${BOUNDARY_STATED}">`,
  `<div data-host="md">${tabs("md")}</div>`,
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { ${DRILLED}: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { ${DRILLED}: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { ${DRILLED}: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement of the live channel and of the shadowed offset, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const SHADOW_CARRIED = "77px";
const STATED: Readonly<Record<string, string>> = { [DRILLED]: CARRIED, [OFFSET]: SHADOW_CARRIED };
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: [DRILLED, OFFSET],
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
let rootResponsiveStated: ProbeReadings;
let maskStated: ProbeReadings;
let tabsStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel) => from.base[`site|${scope}|${channel}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel) => from.base[`oracle|${scope}|${channel}`];

const height = (from: ProbeReadings, scope: Scope) => site(from, scope, DRILLED);

describe("chrome/tabs channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      ...EXTRA_TARGETS,
      { id: "onBoundary", selector: "#on-boundary [data-part='tab-button']", property: "height" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(DRILL));
    rootResponsiveStated = await probe(markup(ROOT_RESPONSIVE_STYLE), targets(DRILL));
    maskStated = await probe(markup(MASK_STYLE), MASK_TARGETS);
    tabsStated = await probe(markup("", ` ${DRILLED}: ${TABS_STATED};`), targets(DRILL));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets([DRILLED, OFFSET]));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(DRILL));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(DRILL));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(DRILL));
    }
  }, 240_000);

  it("probes the anatomy the engine stamps", () => {
    expect(ENGINE).toContain('data-part="root"');
    expect(ENGINE).toContain("data-size={sizeIsResponsive ? 'responsive' : scalarSize}");
    for (const part of ["tab-rail", "tab-list", "indicator", "icon", "tab-badge"]) expect(ENGINE).toContain(`data-part="${part}"`);
    for (const part of ["tab-button", "tab-panel"]) expect(ENGINE).toContain(`partAttributes('${part}'`);
    expect(ENGINE).toContain(`addResponsiveSizeChannel('${RESPONSIVE}', 'height');`);
  });

  it("the twins read what the fade and the panel travel read: the skin paints each there and no rule re-declares either", () => {
    expect(SKIN).toMatch(/\[data-part='tab-rail'\]::after\s*\{[^}]*inline-size:\s*var\(--ds-tabs-overflow-fade-width\)/);
    expect(SKIN).toMatch(/transform:\s*translateY\(var\(--ds-tabs-panel-motion-distance\)\)/);
    expect(SKIN).not.toMatch(/--ds-tabs-overflow-fade-width\s*:/);
    expect(SKIN).not.toMatch(/--ds-tabs-panel-motion-distance\s*:/);
  });

  it("measures a real read site and a real oracle for every channel in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries really move the oracle away from rest", () => {
    for (const channel of MOVING) {
      const rest = oracle(readings, "rest", channel);
      expect({ channel, compact: oracle(readings, "compact", channel) }).not.toEqual({ channel, compact: rest });
      expect({ channel, spacious: oracle(readings, "spacious", channel) }).not.toEqual({ channel, spacious: rest });
    }
  });

  it("(a) every live channel paints the local scope's answer, not the root's", () => {
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const channel of LIVE) {
        const painted = site(readings, scope, channel);
        const expected = oracle(readings, scope, channel);
        if (painted !== expected) drift.push(`${scope} ${channel}: painted ${painted}, local answer ${expected}`);
      }
    }
    expect(drift).toEqual([]);
  });

  it("pin: the zero-rung members paint zero in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: site(readings, scope, "--ds-tabs-mobile-gap") }).toEqual({ scope, painted: "0px" });
      expect({ scope, painted: site(readings, scope, OFFSET) }).toEqual({ scope, painted: "matrix(1, 0, 0, 1, 0, 0)" });
    }
  });

  it("pin: the root rule re-declares the resting offset, so a compiler-rank statement of it is carried into both blocks and reaches no read site", () => {
    const rootRule = SKIN.match(/\.ds-tabs\.ds-tabs--modern\[data-part='root'\]\s*\{([^{}]*)\}/)?.[1] ?? "";
    expect(rootRule).toMatch(new RegExp(`${OFFSET}\\s*:\\s*0px`));
    expect(ENGINE).toContain(`'${OFFSET}': \`\${indicatorPosition.left}px\``);
    expect(carriedRoot[OFFSET]).toBe(SHADOW_CARRIED);
    expect(carriedBlock?.cssVariables[OFFSET]).toBe(SHADOW_CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: site(carried, scope, OFFSET) }).toEqual({ scope, painted: "matrix(1, 0, 0, 1, 0, 0)" });
    }
  });

  it("pin: a responsive step keeps its own rung in every scope, and a step onto a named rung re-derives locally", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: readings.base[`step-height|${scope}`] }).toEqual({ scope, painted: "30px" });
      expect({ scope, painted: readings.base[`step-padding|${scope}`] }).toEqual({ scope, painted: "20px" });
      expect({ scope, painted: readings.base[`large-height|${scope}`] }).toEqual({
        scope,
        painted: site(readings, scope, "--ds-tabs-lg-height"),
      });
      expect({ scope, painted: readings.base[`large-padding|${scope}`] }).toEqual({
        scope,
        painted: site(readings, scope, "--ds-tabs-lg-padding"),
      });
    }
  });

  it("pin: the responsive size channels are runtime, not theme: never compiled, and a raw root statement is read first in every scope", () => {
    for (const channel of ["--ds-tabs-responsive-height", "--ds-tabs-responsive-padding"]) {
      expect(COMPILED.cssVariables[channel]).toBeUndefined();
      expect(COMPILED.densityScopeBlock?.cssVariables[channel]).toBeUndefined();
    }
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: height(rootResponsiveStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
  });

  it("pin: the tab tracking paints its channel at rest and is masked under :lang(ar), stated or not", () => {
    expect(readings.base["mask-site|rest"]).not.toBe("normal");
    expect(readings.base["mask-site|rest"]).toBe(readings.base["mask-oracle|rest"]);
    expect(readings.base["mask-channel|arabic"]).toBe(readings.base["mask-channel|rest"]);
    expect(readings.base["mask-input|arabic"].trim()).toBe("0");
    expect(readings.base["mask-input|arabic"].trim()).not.toBe(readings.base["mask-input|rest"].trim());
    expect(maskStated.base["mask-site|rest"]).toBe(TRACKING_STATED);
    expect(maskStated.base["mask-site|arabic"]).toBe("normal");
    expect(readings.base["mask-site|arabic"]).toBe("normal");
    for (const scope of BOUNDED) {
      expect({ scope, painted: readings.base[`mask-site|${scope}`] }).toEqual({ scope, painted: readings.base["mask-site|rest"] });
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: height(tabsStated, scope) }).toEqual({ scope, painted: TABS_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: height(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: height(rootStated, scope) }).toEqual({ scope, painted: oracle(rootStated, scope, DRILLED) });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot[DRILLED]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables[DRILLED]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: height(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual(STATED);
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: height(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: height(dbUncarried, scope) }).toEqual({ scope, painted: oracle(dbUncarried, scope, DRILLED) });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", DRILLED);
    expect(height(drills.layeredHeavy, "compact")).toBe(local);
    expect(height(drills.unlayeredLighter, "compact")).toBe(local);
    expect(height(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the tabs channels whose value reads a density-scope name; the tab tracking is the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-0")).toBe(true);
    expect(DENSITY_AXIS.has("--ds-density-effective-scale")).toBe(true);
    const densityExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, DENSITY_AXIS))
      .map(([channel]) => channel)
      .sort();
    expect(densityExposed).toEqual([...CHANNELS].sort());
    expect(Object.entries(PRODUCED).filter(([, value]) => readsAny(value, ARABIC_AXIS)).map(([channel]) => channel)).toEqual([MASKED]);

    const projected = Object.keys(COMPILED.densityScopeBlock?.cssVariables ?? {}).filter((channel) =>
      PRODUCES.has(channel)
    );
    expect(projected.sort()).toEqual(densityExposed);
    for (const channel of projected) {
      expect(COMPILED.densityScopeBlock?.cssVariables[channel]).toBe(COMPILED.cssVariables[channel]);
    }
  });
});
