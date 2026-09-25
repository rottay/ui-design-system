/** The container channels a local density scope re-derives, measured in Chromium.
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
import { containerChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/primitives/layout/container/engines/modern/index.tsx"), "utf8");

const PRODUCES = new Set<string>(containerChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** The inset in force: the skin re-points it by `data-padding` on the root, the engine writes it inline for a number. */
const PAD = "--ds-container-pad" as const;

/** One read site per rung: the container stamped with that rung, read on both edges. */
const SITES = {
  "--ds-container-padding-none": { padding: "none" },
  "--ds-container-padding-sm": { padding: "sm" },
  "--ds-container-padding-md": { padding: "md" },
  "--ds-container-padding-lg": { padding: "lg" },
} as const;
const PROPERTIES = ["padding-top", "padding-left"] as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** `--ds-spacing-0` holds zero in every posture: a member that never moves. */
const INVARIANT = "--ds-container-padding-none" as const;
const MOVING = CHANNELS.filter((channel) => channel !== INVARIANT);
const DRILLED = "--ds-container-padding-md" as const;

/** None, each posture, both nesting orders, an Arabic subtree, and the container as its own boundary. */
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
const OWN = { ownCompact: "compact", ownSpacious: "spacious" } as const;

type Scope = keyof typeof SCOPES | keyof typeof OWN | "ownOverAncestor";
const SCOPE_NAMES: readonly Scope[] = [...(Object.keys(SCOPES) as Scope[]), "ownCompact", "ownSpacious", "ownOverAncestor"];
const BOUNDED: readonly Scope[] = ["compact", "comfortable", "spacious", "nested", "reverseNested"];
const UNBOUNDED: readonly Scope[] = ["rest", "arabic"];

const oracleOf = (channel: Channel) => `<div data-oracle="${channel}" style="padding: ${PRODUCED[channel]}"></div>`;

/** The container the Modern skin selects for one rung, its own density attribute when it is the boundary. */
function container(padding: string, own = "", rootStyle = "", inner = ""): string {
  const density = own ? ` data-density="${own}"` : "";
  return [
    `<div class="ds-container ds-container--modern" data-part="root" data-max-width="lg" data-padding="${padding}" data-component="container"${density} style="${rootStyle}">`,
    inner,
    `</div>`,
  ].join("");
}

function scene(scope: Scope, rootStyle = ""): string {
  const own = scope === "ownCompact" || scope === "ownOverAncestor" ? "compact" : scope === "ownSpacious" ? "spacious" : "";
  const instances = CHANNELS.map((channel) =>
    `<div data-site="${channel}">${container(SITES[channel].padding, own, rootStyle, oracleOf(channel))}</div>`
  ).join("");
  const custom = `<div data-site="custom">${container("custom", own, `${PAD}: 20px;${rootStyle}`)}</div>`;
  const body = instances + custom;
  if (scope === "ownOverAncestor") return `<div data-density="spacious">${body}</div>`;
  return scope in SCOPES ? SCOPES[scope as keyof typeof SCOPES](body) : body;
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${scene(scope, rootStyle)}</div>`).join("");
}

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) =>
      PROPERTIES.flatMap((property) => [
        {
          id: `site|${scope}|${channel}|${property}`,
          selector: `#${hostId(scope)} [data-site='${channel}'] > [data-part='root']`,
          property,
        },
        { id: `oracle|${scope}|${channel}|${property}`, selector: `#${hostId(scope)} [data-oracle='${channel}']`, property },
      ])
    )
  );
}

const CUSTOM_TARGETS: ProbeTarget[] = SCOPE_NAMES.map((scope) => ({
  id: `custom|${scope}`,
  selector: `#${hostId(scope)} [data-site='custom'] > [data-part='root']`,
  property: "padding-left",
}));

const DRILL: readonly Channel[] = [DRILLED];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { ${DRILLED}: ${ROOT_STATED}; }</style>`;
/** The retired alias stated the same way: a data-padding re-point shadows it on every root. */
const ROOT_PAD_STYLE = `<style>html[data-tenant][data-tenant] { ${PAD}: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the container) and one ON the boundary (inline). */
const CONTAINER_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="${DRILLED}: ${BOUNDARY_STATED}">`,
  container("md"),
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
let rootPadStated: ProbeReadings;
let containerStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const inset = (from: ProbeReadings, scope: Scope) => site(from, scope, DRILLED, "padding-left");

describe("chrome/container channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      ...CUSTOM_TARGETS,
      { id: "onBoundary", selector: "#on-boundary [data-part='root']", property: "padding-left" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(DRILL));
    rootPadStated = await probe(markup(ROOT_PAD_STYLE), targets());
    containerStated = await probe(markup("", `${DRILLED}: ${CONTAINER_STATED}`), targets(DRILL));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(DRILL));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(DRILL));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(DRILL));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(DRILL));
    }
  }, 180_000);

  it("probes the anatomy the engine stamps, and that the root takes a consumer's density attribute", () => {
    expect(ENGINE).toContain('"ds-container", "ds-container--modern"');
    expect(ENGINE).toContain('data-part="root"');
    expect(ENGINE).toContain("data-padding={");
    expect(ENGINE).toContain(`customStyle["${PAD}"] = \`\${customPadding}px\`;`);
    expect(ENGINE).toMatch(/\{\.\.\.rest\}\s*className=\{combinedClassName\}/);
  });

  it("measures a real read site and a real oracle for every rung in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries, ancestor or own, really move the oracle away from rest", () => {
    for (const channel of MOVING) {
      const rest = oracle(readings, "rest", channel, "padding-left");
      for (const scope of ["compact", "spacious", "ownCompact", "ownSpacious"] as const) {
        expect({ channel, scope, moved: oracle(readings, scope, channel, "padding-left") }).not.toEqual({
          channel,
          scope,
          moved: rest,
        });
      }
    }
  });

  it("(a) every rung paints the local scope's answer, not the root's, with the container as its own boundary too", () => {
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const channel of CHANNELS) {
        for (const property of PROPERTIES) {
          const painted = site(readings, scope, channel, property);
          const expected = oracle(readings, scope, channel, property);
          if (painted !== expected) drift.push(`${scope} ${channel} ${property}: painted ${painted}, local answer ${expected}`);
        }
      }
    }
    expect(drift).toEqual([]);
  });

  it("the container's own attribute is the boundary: its prop keeps its rung, and it outranks an ancestor", () => {
    for (const channel of MOVING) {
      expect(site(readings, "ownCompact", channel, "padding-left")).toBe(oracle(readings, "compact", channel, "padding-left"));
      expect(site(readings, "ownSpacious", channel, "padding-left")).toBe(oracle(readings, "spacious", channel, "padding-left"));
      expect(site(readings, "ownOverAncestor", channel, "padding-left")).toBe(site(readings, "ownCompact", channel, "padding-left"));
    }
    expect(site(readings, "ownCompact", "--ds-container-padding-lg", "padding-left")).not.toBe(
      site(readings, "ownCompact", "--ds-container-padding-md", "padding-left")
    );
  });

  it("pin: the none rung reads the zero rung and paints zero in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: site(readings, scope, INVARIANT, "padding-left") }).toEqual({ scope, painted: "0px" });
    }
  });

  it("pin: a numeric padding travels inline on the inset in force and paints exactly in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: readings.base[`custom|${scope}`] }).toEqual({ scope, painted: "20px" });
    }
  });

  it("pin: the inset in force is not a theme channel: never compiled, and a root statement of it paints nowhere", () => {
    expect(COMPILED.cssVariables[PAD]).toBeUndefined();
    expect(COMPILED.densityScopeBlock?.cssVariables[PAD]).toBeUndefined();
    for (const scope of SCOPE_NAMES) {
      for (const channel of CHANNELS) {
        expect({ scope, channel, painted: site(rootPadStated, scope, channel, "padding-left") }).toEqual({
          scope,
          channel,
          painted: oracle(rootPadStated, scope, channel, "padding-left"),
        });
      }
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: inset(containerStated, scope) }).toEqual({ scope, painted: CONTAINER_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: inset(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of [...BOUNDED, "ownCompact", "ownSpacious", "ownOverAncestor"] as const) {
      expect({ scope, painted: inset(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, DRILLED, "padding-left"),
      });
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
      expect({ scope, painted: inset(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, DRILLED, "padding-left"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", DRILLED, "padding-left");
    expect(inset(drills.layeredHeavy, "compact")).toBe(local);
    expect(inset(drills.unlayeredLighter, "compact")).toBe(local);
    expect(inset(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the container channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-0")).toBe(true);
    expect(DENSITY_AXIS.has("--ds-spacing-4")).toBe(true);
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
