/** The stepper channels a local density scope re-derives, measured in Chromium.
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
import { stepperChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/primitives/navigation/stepper/engines/modern/index.tsx"), "utf8");

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const STEP = readSource("src/components/primitives/navigation/stepper/compound/step/index.tsx");
const PANEL = readSource("src/components/primitives/navigation/stepper/compound/content/index.tsx");
const SKINS = [
  "src/foundation/tokens/css/runtime/engines/modern/skin/stepper/index.css",
  "src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css",
].map(readSource);

const PRODUCES = new Set<string>(stepperChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

interface Site {
  readonly site: string;
  readonly declaration: string;
  readonly properties: readonly string[];
  /** The expression the site wraps the channel in, when it is not the bare channel. */
  readonly paints?: (value: string) => string;
}

const HORIZONTAL = "[data-part='root'][data-direction='horizontal']";
const VERTICAL = "[data-part='root'][data-direction='vertical']";
const step = (size: "sm" | "md" | "lg") => `.ds-stepper-step[data-size='${size}']`;
const CONNECTOR = (direction: "horizontal" | "vertical") => `.ds-stepper-connector[data-direction='${direction}']`;
const reader = (channel: string) => `[data-reader='${channel}']`;

/** One read site per channel. The engine's circle and connector are pseudo-elements the probe cannot
 *  read, so those two sites are reader twins in the item painting the INHERITED channel the pseudo reads. */
const SITES = {
  "--ds-stepper-dot-size": { site: `${HORIZONTAL} [data-part='dot']`, declaration: "width", properties: ["width"] },
  "--ds-stepper-text-gap": { site: `${HORIZONTAL} [data-part='content']`, declaration: "gap", properties: ["row-gap"] },
  "--ds-stepper-text-margin-block-start": {
    site: `${HORIZONTAL} [data-part='content']`,
    declaration: "margin-block-start",
    properties: ["margin-top"],
  },
  "--ds-stepper-vertical-gap": {
    site: `${VERTICAL} [data-part='item']:first-child`,
    declaration: "column-gap",
    properties: ["column-gap"],
  },
  "--ds-stepper-vertical-item-gap": {
    site: `${VERTICAL} [data-part='item']:first-child`,
    declaration: "padding-block-end",
    properties: ["padding-bottom"],
  },
  "--ds-stepper-circles-ring": {
    site: `${HORIZONTAL} ${reader("--ds-stepper-circles-ring")}`,
    declaration: "box-shadow",
    properties: ["box-shadow"],
  },
  "--ds-stepper-connector-clearance": {
    site: `${HORIZONTAL} ${reader("--ds-stepper-connector-clearance")}`,
    declaration: "margin-top",
    properties: ["margin-top"],
  },
  "--ds-stepper-item-gap": { site: step("md"), declaration: "gap", properties: ["column-gap"] },
  "--ds-stepper-item-size-sm": { site: `${step("sm")} > [data-part='icon']`, declaration: "width", properties: ["width", "height"] },
  "--ds-stepper-item-size-md": { site: `${step("md")} > [data-part='icon']`, declaration: "width", properties: ["width", "height"] },
  "--ds-stepper-item-size-lg": { site: `${step("lg")} > [data-part='icon']`, declaration: "width", properties: ["width", "height"] },
  "--ds-stepper-process-ring": {
    site: ".ds-stepper-step[data-status='process'] > [data-part='icon']",
    declaration: "box-shadow",
    properties: ["box-shadow"],
  },
  "--ds-stepper-connector-inset": { site: CONNECTOR("horizontal"), declaration: "margin-inline", properties: ["margin-left", "margin-right"] },
  "--ds-stepper-connector-min-length": { site: CONNECTOR("horizontal"), declaration: "min-width", properties: ["min-width"] },
  "--ds-stepper-connector-block-gap": { site: CONNECTOR("vertical"), declaration: "margin-block", properties: ["margin-top", "margin-bottom"] },
  "--ds-stepper-panel-slide-distance": {
    site: ".ds-stepper-content[data-part='panel']",
    declaration: "transform",
    properties: ["transform"],
    paints: (value: string) => `translateX(${value})`,
  },
} as const satisfies Record<string, Site>;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];
const siteOf = (channel: Channel): Site => SITES[channel];
const TWINNED = ["--ds-stepper-circles-ring", "--ds-stepper-connector-clearance"] as const;

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

function oracleOf(channel: Channel): string {
  const { declaration, paints } = siteOf(channel);
  const value = paints ? paints(PRODUCED[channel]) : PRODUCED[channel];
  return `<div data-oracle="${channel}" style="${declaration}: ${value}"></div>`;
}

const twins = TWINNED.map(
  (channel) => `<div data-reader="${channel}" style="${SITES[channel].declaration}: var(${channel})"></div>`
).join("");

/** The engine track in both directions: a render-function dot, the text column, the reader twins. */
const engine = (direction: "horizontal" | "vertical", rootStyle: string) =>
  [
    `<ol class="ds-stepper ds-stepper--modern" data-part="root" data-direction="${direction}" data-size="md"`,
    ` data-variant="circles" style="${rootStyle}">`,
    `<li data-part="item" data-status="process"><span data-part="dot-slot"><span data-part="dot"></span></span>`,
    `<span data-part="content"><span data-part="label">One</span><span data-part="description">First</span></span>`,
    direction === "horizontal" ? twins : "",
    `</li>`,
    `<li data-part="item" data-status="wait"><span data-part="content"><span data-part="label">Two</span></span></li>`,
    `</ol>`,
  ].join("");

const compoundStep = (size: "sm" | "md" | "lg", status: string, direction: "horizontal" | "vertical", rootStyle: string) =>
  [
    `<div class="ds-stepper-step" data-part="item" data-status="${status}" data-size="${size}" data-direction="${direction}"`,
    ` data-label-placement="horizontal" style="${rootStyle}">`,
    `<div data-part="icon" data-variant="default">1</div>`,
    `<div data-part="content"><div data-part="label">Step<span data-part="subtitle">Sub</span></div></div></div>`,
    `<div class="ds-stepper-connector" data-part="connector" data-status="${status}" data-direction="${direction}" data-size="${size}"></div>`,
  ].join("");

/** The compound composition: steps of each size, both connector orientations, a sliding panel. */
const compound = (rootStyle: string) =>
  [
    `<div>`,
    compoundStep("md", "process", "horizontal", rootStyle),
    compoundStep("sm", "wait", "vertical", rootStyle),
    compoundStep("lg", "wait", "vertical", rootStyle),
    `<div class="ds-stepper-content" data-part="panel" role="tabpanel" data-presence="entering" data-direction="forward"`,
    ` data-animation="slide">Panel</div>`,
    `</div>`,
  ].join("");

/** Both render trees the skins select, wide enough to clear the narrow collapse,
 *  plus one oracle per channel painting its expression in place. */
function steppers(rootStyle = ""): string {
  return [
    `<div style="inline-size: 800px">`,
    engine("horizontal", rootStyle),
    engine("vertical", rootStyle),
    compound(rootStyle),
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](steppers(rootStyle))}</div>`).join("");
}

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) =>
      SITES[channel].properties.flatMap((property) => [
        { id: `site|${scope}|${channel}|${property}`, selector: `#${hostId(scope)} ${SITES[channel].site}`, property },
        {
          id: `oracle|${scope}|${channel}|${property}`,
          selector: `#${hostId(scope)} [data-oracle='${channel}']`,
          property: property === "height" ? "width" : property,
        },
      ])
    )
  );
}

const ITEM_GAP: readonly Channel[] = ["--ds-stepper-item-gap"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-stepper-item-gap: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on every step) and one ON the boundary (inline). */
const STEP_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-stepper-item-gap: ${BOUNDARY_STATED}">`,
  steppers(),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-stepper-item-gap: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-stepper-item-gap: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-stepper-item-gap: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-stepper-item-gap"],
  derive: () => ({ "--ds-stepper-item-gap": CARRIED }),
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
let stepStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const itemGap = (from: ProbeReadings, scope: Scope) => site(from, scope, "--ds-stepper-item-gap", "column-gap");

describe("chrome/stepper channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      { id: "onBoundary", selector: `#on-boundary ${step("md")}`, property: "column-gap" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(ITEM_GAP));
    stepStated = await probe(markup("", `--ds-stepper-item-gap: ${STEP_STATED}`), targets(ITEM_GAP));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(ITEM_GAP));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(ITEM_GAP));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(ITEM_GAP));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(ITEM_GAP));
    }
  }, 180_000);

  it("probes the parts the engine and the compound stamp", () => {
    for (const part of ["item", "dot-slot", "dot", "content", "label"]) {
      expect(ENGINE).toContain(`data-part="${part}"`);
    }
    expect(ENGINE).toContain(`className="ds-stepper ds-stepper--modern"`);
    expect(STEP).toContain(`data-part="icon"`);
    expect(STEP).toContain(`className="ds-stepper-connector"`);
    expect(PANEL).toContain(`data-part="panel"`);
  });

  it("pin: nothing in the skins re-declares a twinned channel, so the pseudo reads what its twin reads", () => {
    for (const channel of TWINNED) {
      for (const skin of SKINS) expect({ channel, declared: skin.includes(`${channel}:`) }).toEqual({ channel, declared: false });
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

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: itemGap(stepStated, scope) }).toEqual({ scope, painted: STEP_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: itemGap(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: itemGap(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-stepper-item-gap", "column-gap"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-stepper-item-gap"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-stepper-item-gap"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: itemGap(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-stepper-item-gap": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: itemGap(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: itemGap(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-stepper-item-gap", "column-gap"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-stepper-item-gap", "column-gap");
    expect(itemGap(drills.layeredHeavy, "compact")).toBe(local);
    expect(itemGap(drills.unlayeredLighter, "compact")).toBe(local);
    expect(itemGap(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the stepper channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-2")).toBe(true);
    expect(DENSITY_AXIS.has("--ds-spacing-10")).toBe(true);
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
