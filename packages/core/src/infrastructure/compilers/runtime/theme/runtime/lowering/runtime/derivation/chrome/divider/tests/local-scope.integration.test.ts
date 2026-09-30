/** The divider channels a local density scope re-derives, measured in Chromium.
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
import { dividerChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/primitives/layout/divider/engines/modern/index.tsx"), "utf8");
const SKIN = stripComments(
  readFileSync(resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css"), "utf8")
);

const PRODUCES = new Set<string>(dividerChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the divider that selects it, the declaration its oracle paints, the property read at both. */
const SITES = {
  "--ds-divider-inset-none": { site: "none", declaration: "margin-top", property: "margin-top" },
  "--ds-divider-inset-xs": { site: "xs", declaration: "margin-top", property: "margin-top" },
  "--ds-divider-inset-sm": { site: "sm", declaration: "margin-top", property: "margin-top" },
  "--ds-divider-inset-md": { site: "md", declaration: "margin-top", property: "margin-top" },
  "--ds-divider-inset-lg": { site: "lg", declaration: "margin-top", property: "margin-top" },
  "--ds-divider-inset-xl": { site: "xl", declaration: "margin-top", property: "margin-top" },
  "--ds-divider-gap": { site: "text", declaration: "column-gap", property: "column-gap" },
  "--ds-divider-content-gap": { site: "text", declaration: "column-gap", property: "column-gap" },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];
const RUNGS = CHANNELS.filter((channel) => SITES[channel].site !== "text");

/** `--ds-spacing-0` holds zero in every posture: a member that never moves. */
const INVARIANT = "--ds-divider-inset-none" as const;
const MOVING = CHANNELS.filter((channel) => channel !== INVARIANT);
const DRILLED = "--ds-divider-inset-md" as const;

/** The overline tracking: the label's one read site, reached by the channel and, through it at the root, its input. */
const TRACK = "--ds-divider-label-track" as const;
const TRACKING = "--ds-divider-label-tracking" as const;
const TRACK_INPUT = "--ds-type-label-letter-spacing" as const;
const TRACKING_STATED = "3px";

/** None, each posture, both nesting orders, an Arabic subtree, and the divider as its own boundary. */
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

type Scope = keyof typeof SCOPES | "ownCompact" | "ownSpacious" | "ownOverAncestor";
const SCOPE_NAMES: readonly Scope[] = [...(Object.keys(SCOPES) as Scope[]), "ownCompact", "ownSpacious", "ownOverAncestor"];
const BOUNDED: readonly Scope[] = ["compact", "comfortable", "spacious", "nested", "reverseNested"];
const UNBOUNDED: readonly Scope[] = ["rest", "arabic"];

const oracleOf = (channel: Channel) =>
  `<div data-oracle="${channel}" style="${SITES[channel].declaration}: ${PRODUCED[channel]}"></div>`;

/** The divider anatomy the Modern skin selects, its own density attribute when it is the boundary. */
function divider(spacing: string, own: string, options: { orientation?: string; text?: string; rootStyle?: string; inner?: string }): string {
  const density = own ? ` data-density="${own}"` : "";
  const withText = options.text !== undefined;
  const label = withText
    ? `<span data-part="line-before"></span><span data-part="text">${options.text}</span><span data-part="line-after"></span>`
    : "";
  return [
    `<div class="ds-divider ds-divider--modern" data-part="root" data-component="divider" data-orientation="${options.orientation ?? "horizontal"}" data-spacing="${spacing}"`,
    ` data-with-text="${withText}" data-plain="false" data-text-position="center"${density} style="${options.rootStyle ?? ""}">`,
    label,
    options.inner ?? "",
    `</div>`,
  ].join("");
}

const TRACK_ORACLE = `<div data-oracle="${TRACK}" style="letter-spacing: ${PRODUCED[TRACK]}; font-size: ${PRODUCED["--ds-divider-label-size"]}"></div>`;

function scene(scope: Scope, rootStyle = ""): string {
  const own = scope === "ownCompact" || scope === "ownOverAncestor" ? "compact" : scope === "ownSpacious" ? "spacious" : "";
  const rungs = RUNGS.map((channel) =>
    `<div data-site="${SITES[channel].site}">${divider(SITES[channel].site, own, { rootStyle, inner: oracleOf(channel) })}</div>`
  ).join("");
  const text = `<div data-site="text">${divider("md", own, {
    text: "Section",
    rootStyle,
    inner: oracleOf("--ds-divider-gap") + oracleOf("--ds-divider-content-gap") + TRACK_ORACLE,
  })}</div>`;
  const vertical = `<div data-site="vertical" style="display: flex; block-size: 40px">${divider("md", own, { orientation: "vertical", rootStyle })}</div>`;
  const body = rungs + text + vertical;
  if (scope === "ownOverAncestor") return `<div data-density="spacious">${body}</div>`;
  return scope in SCOPES ? SCOPES[scope as keyof typeof SCOPES](body) : body;
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${scene(scope, rootStyle)}</div>`).join("");
}

const rootOf = (scope: Scope, kind: string) => `#${hostId(scope)} [data-site='${kind}'] > [data-part='root']`;

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) => [
      { id: `site|${scope}|${channel}`, selector: rootOf(scope, SITES[channel].site), property: SITES[channel].property },
      { id: `oracle|${scope}|${channel}`, selector: `#${hostId(scope)} [data-oracle='${channel}']`, property: SITES[channel].property },
    ])
  );
}

const EXTRA_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) => [
  { id: `vertical|${scope}`, selector: rootOf(scope, "vertical"), property: "margin-left" },
  { id: `track-site|${scope}`, selector: `${rootOf(scope, "text")} [data-part='text']`, property: "letter-spacing" },
  { id: `track-oracle|${scope}`, selector: `#${hostId(scope)} [data-oracle='${TRACK}']`, property: "letter-spacing" },
  { id: `track-channel|${scope}`, selector: `${rootOf(scope, "text")} [data-part='text']`, property: TRACK },
  { id: `tracking-channel|${scope}`, selector: `${rootOf(scope, "text")} [data-part='text']`, property: TRACKING },
  { id: `track-input|${scope}`, selector: `${rootOf(scope, "text")} [data-part='text']`, property: TRACK_INPUT },
]);

const TRACK_TARGETS: ProbeTarget[] = (["rest", "arabic"] as const).map((scope) => ({
  id: `track-site|${scope}`,
  selector: `${rootOf(scope, "text")} [data-part='text']`,
  property: "letter-spacing",
}));

const DRILL: readonly Channel[] = [DRILLED];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { ${DRILLED}: ${ROOT_STATED}; }</style>`;
/** The retired alias stated the same way: no read site names it any more. */
const ROOT_ALIAS_STYLE = `<style>html[data-tenant][data-tenant] { --ds-divider-inset: ${ROOT_STATED}; }</style>`;

/** The tracking drills: the channel inline on the label, and its input stated at the root the channel resolves at. */
const TRACK_INLINE_STYLE = `<style>.ds-divider [data-part='text'] { ${TRACK}: ${TRACKING_STATED} !important; }</style>`;
const TRACKING_LABEL_STYLE = `<style>.ds-divider [data-part='text'] { ${TRACKING}: ${TRACKING_STATED} !important; }</style>`;
const TRACKING_ROOT_STYLE = `<style>html[data-tenant][data-tenant] { ${TRACKING}: ${TRACKING_STATED}; }</style>`;

/** b1: a statement below the boundary (on the divider) and one ON the boundary (inline). */
const DIVIDER_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="${DRILLED}: ${BOUNDARY_STATED}">`,
  divider("md", "", {}),
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
let rootAliasStated: ProbeReadings;
let dividerStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const trackDrills: Record<string, ProbeReadings> = {};
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel) => from.base[`site|${scope}|${channel}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel) => from.base[`oracle|${scope}|${channel}`];

const inset = (from: ProbeReadings, scope: Scope) => site(from, scope, DRILLED);

describe("chrome/divider channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      ...EXTRA_TARGETS,
      { id: "onBoundary", selector: "#on-boundary [data-part='root']", property: "margin-top" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(DRILL));
    rootAliasStated = await probe(markup(ROOT_ALIAS_STYLE), targets(RUNGS));
    dividerStated = await probe(markup("", `${DRILLED}: ${DIVIDER_STATED}`), targets(DRILL));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(DRILL));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(DRILL));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(DRILL));
    for (const [name, css] of Object.entries({
      trackInline: TRACK_INLINE_STYLE,
      trackingLabel: TRACKING_LABEL_STYLE,
      trackingRoot: TRACKING_ROOT_STYLE,
    })) {
      trackDrills[name] = await probe(markup(css), TRACK_TARGETS);
    }
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(DRILL));
    }
  }, 180_000);

  it("probes the anatomy the engine stamps, and that the root takes a consumer's density attribute", () => {
    expect(ENGINE).toContain('data-part="root"');
    expect(ENGINE).toContain("data-spacing={spacing}");
    expect(ENGINE).toContain("data-orientation={orientation}");
    for (const part of ["line-before", "text", "line-after"]) expect(ENGINE).toContain(`data-part="${part}"`);
    expect(ENGINE.match(/\{\.\.\.rest\}\s*className=\{classNames\}/g)).toHaveLength(2);
  });

  it("measures a real read site and a real oracle for every channel in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries, ancestor or own, really move the oracle away from rest", () => {
    for (const channel of MOVING) {
      const rest = oracle(readings, "rest", channel);
      for (const scope of ["compact", "spacious", "ownCompact", "ownSpacious"] as const) {
        expect({ channel, scope, moved: oracle(readings, scope, channel) }).not.toEqual({ channel, scope, moved: rest });
      }
    }
  });

  it("(a) every channel paints the local scope's answer, not the root's, with the divider as its own boundary too", () => {
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const channel of CHANNELS) {
        const painted = site(readings, scope, channel);
        const expected = oracle(readings, scope, channel);
        if (painted !== expected) drift.push(`${scope} ${channel}: painted ${painted}, local answer ${expected}`);
      }
      const vertical = readings.base[`vertical|${scope}`];
      const expected = oracle(readings, scope, DRILLED);
      if (vertical !== expected) drift.push(`${scope} vertical margin-left: painted ${vertical}, local answer ${expected}`);
    }
    expect(drift).toEqual([]);
  });

  it("the divider's own attribute is the boundary: its prop keeps its rung, and it outranks an ancestor", () => {
    for (const channel of MOVING) {
      expect(site(readings, "ownCompact", channel)).toBe(oracle(readings, "compact", channel));
      expect(site(readings, "ownSpacious", channel)).toBe(oracle(readings, "spacious", channel));
      expect(site(readings, "ownOverAncestor", channel)).toBe(site(readings, "ownCompact", channel));
    }
    expect(site(readings, "ownCompact", "--ds-divider-inset-lg")).not.toBe(site(readings, "ownCompact", DRILLED));
  });

  it("pin: the none rung reads the zero rung and paints zero in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: site(readings, scope, INVARIANT) }).toEqual({ scope, painted: "0px" });
    }
  });

  it("pin: the inset in force is the skin's private selector, and the retired public name is neither compiled nor read", () => {
    expect(COMPILED.cssVariables["--ds-divider-inset"]).toBeUndefined();
    expect(COMPILED.densityScopeBlock?.cssVariables["--ds-divider-inset"]).toBeUndefined();
    expect(SKIN).not.toMatch(/--ds-divider-inset(?![-\w])/);
    expect(SKIN.match(/--_ds-divider-inset\s*:/g)).toHaveLength(6);
    for (const scope of SCOPE_NAMES) {
      for (const channel of RUNGS) {
        expect({ scope, channel, painted: site(rootAliasStated, scope, channel) }).toEqual({
          scope,
          channel,
          painted: oracle(rootAliasStated, scope, channel),
        });
      }
    }
  });

  it("pin: the overline tracking paints its channel at rest and is masked under :lang(ar), stated or not", () => {
    expect(readings.base["track-site|rest"]).not.toBe("normal");
    expect(readings.base["track-site|rest"]).toBe(readings.base["track-oracle|rest"]);
    expect(readings.base["track-channel|arabic"]).toBe(readings.base["track-channel|rest"]);
    expect(readings.base["tracking-channel|arabic"]).toBe(readings.base["tracking-channel|rest"]);
    expect(readings.base["track-input|arabic"].trim()).toBe("0");
    expect(readings.base["track-input|arabic"].trim()).not.toBe(readings.base["track-input|rest"].trim());
    expect(trackDrills.trackInline.base["track-site|rest"]).toBe(TRACKING_STATED);
    expect(trackDrills.trackInline.base["track-site|arabic"]).toBe("normal");
    for (const scope of SCOPE_NAMES.filter((scope) => scope !== "arabic")) {
      expect({ scope, painted: readings.base[`track-site|${scope}`] }).toEqual({
        scope,
        painted: readings.base["track-site|rest"],
      });
    }
    expect(readings.base["track-site|arabic"]).toBe("normal");
  });

  it("pin: the tracking input reaches the label only through the channel, resolved where the root states it", () => {
    expect(trackDrills.trackingLabel.base["track-site|rest"]).toBe(readings.base["track-site|rest"]);
    expect(trackDrills.trackingRoot.base["track-site|rest"]).toBe(TRACKING_STATED);
    expect(trackDrills.trackingRoot.base["track-site|arabic"]).toBe("normal");
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: inset(dividerStated, scope) }).toEqual({ scope, painted: DIVIDER_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: inset(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of [...BOUNDED, "ownCompact", "ownSpacious", "ownOverAncestor"] as const) {
      expect({ scope, painted: inset(rootStated, scope) }).toEqual({ scope, painted: oracle(rootStated, scope, DRILLED) });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot[DRILLED]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables[DRILLED]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: inset(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ [DRILLED]: CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: inset(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: inset(dbUncarried, scope) }).toEqual({ scope, painted: oracle(dbUncarried, scope, DRILLED) });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", DRILLED);
    expect(inset(drills.layeredHeavy, "compact")).toBe(local);
    expect(inset(drills.unlayeredLighter, "compact")).toBe(local);
    expect(inset(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the divider channels whose value reads a density-scope name; the tracking pair is the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-0")).toBe(true);
    expect(DENSITY_AXIS.has("--ds-spacing-4")).toBe(true);
    const densityExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, DENSITY_AXIS))
      .map(([channel]) => channel)
      .sort();
    expect(densityExposed).toEqual([...CHANNELS].sort());
    const arabicExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, ARABIC_AXIS))
      .map(([channel]) => channel)
      .sort();
    expect(arabicExposed).toEqual([TRACK, TRACKING].sort());

    const projected = Object.keys(COMPILED.densityScopeBlock?.cssVariables ?? {}).filter((channel) =>
      PRODUCES.has(channel)
    );
    expect(projected.sort()).toEqual(densityExposed);
    for (const channel of projected) {
      expect(COMPILED.densityScopeBlock?.cssVariables[channel]).toBe(COMPILED.cssVariables[channel]);
    }
  });
});
