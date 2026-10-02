/** The action-dock channels a local density scope re-derives, measured in Chromium.
 *  Each oracle paints the channel's own expression at the element: the answer the scope owes.
 *  The dock stamps `data-density` on its own root, so the dock itself is a boundary: its own
 *  attribute and an ancestor's are both measured. */
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
import { actionDockChromeDeriver } from "..";

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
  resolve(process.cwd(), "src/components/structures/workspace/action-dock/runtime/rendering/index.tsx"),
  "utf8"
);

const PRODUCES = new Set<string>(actionDockChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

const ROOT = "[data-part='root']";
const ACTIONS = ".ds-action-dock__actions";

/** One read site per channel: the part, the declaration its oracle paints, the computed properties read at both.
 *  A bottom dock paints its start padding from the channel alone; the end padding is a max() with the safe area. */
const SITES = {
  "--ds-action-dock-padding-inline": { site: ROOT, declaration: "padding-inline", properties: ["padding-left", "padding-right"] },
  "--ds-action-dock-padding-block": { site: ROOT, declaration: "padding-top", properties: ["padding-top"] },
  "--ds-action-dock-gap": { site: ACTIONS, declaration: "column-gap", properties: ["column-gap"] },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** Where the posture comes from: an ancestor boundary around a dock without the prop, or the dock's own attribute. */
interface Scope {
  readonly wrap: (inner: string) => string;
  readonly own?: "compact" | "comfortable" | "spacious";
}

const SCOPES = {
  rest: { wrap: (inner) => inner },
  compact: { wrap: (inner) => `<div data-density="compact">${inner}</div>` },
  comfortable: { wrap: (inner) => `<div data-density="comfortable">${inner}</div>` },
  spacious: { wrap: (inner) => `<div data-density="spacious">${inner}</div>` },
  nested: { wrap: (inner) => `<div data-density="spacious"><div data-density="compact">${inner}</div></div>` },
  reverseNested: { wrap: (inner) => `<div data-density="compact"><div data-density="spacious">${inner}</div></div>` },
  arabic: { wrap: (inner) => `<div lang="ar">${inner}</div>` },
  ownCompact: { wrap: (inner) => inner, own: "compact" },
  ownComfortable: { wrap: (inner) => inner, own: "comfortable" },
  ownSpacious: { wrap: (inner) => inner, own: "spacious" },
  ownOverAncestor: { wrap: (inner) => `<div data-density="spacious">${inner}</div>`, own: "compact" },
} as const satisfies Record<string, Scope>;

type ScopeName = keyof typeof SCOPES;
const SCOPE_NAMES = Object.keys(SCOPES) as ScopeName[];
const OWN: readonly ScopeName[] = ["ownCompact", "ownComfortable", "ownSpacious", "ownOverAncestor"];
const BOUNDED: readonly ScopeName[] = ["compact", "comfortable", "spacious", "nested", "reverseNested", ...OWN];
const UNBOUNDED: readonly ScopeName[] = ["rest", "arabic"];

function oracleOf(channel: Channel): string {
  return `<div data-oracle="${channel}" style="${SITES[channel].declaration}: ${PRODUCED[channel]}"></div>`;
}

/** The dock anatomy the rendering stamps (sticky, bottom), plus one oracle per channel inside the dock's own scope. */
function dock(own: Scope["own"], rootStyle = ""): string {
  const density = own ? ` data-density="${own}"` : "";
  return [
    `<div class="ds-action-dock" role="toolbar" data-part="root" data-placement="bottom"`,
    ` data-mode="sticky"${density} data-keyboard-open="false" style="${rootStyle}">`,
    `<div class="ds-action-dock__actions" style="display: flex">`,
    `<button type="button">Save</button><button type="button">Cancel</button></div>`,
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: ScopeName) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return (
    extra +
    SCOPE_NAMES.map((scope) => {
      const { wrap, own } = SCOPES[scope] as Scope;
      return `<div id="${hostId(scope)}">${wrap(dock(own, rootStyle))}</div>`;
    }).join("")
  );
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

const GAP: readonly Channel[] = ["--ds-action-dock-gap"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "30px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-action-dock-gap: ${ROOT_STATED}; }</style>`;

/** b1: a statement on the dock (below an ancestor boundary, or on the dock's own) and one ON an ancestor boundary. */
const DOCK_STATED = "32px";
const BOUNDARY_STATED = "33px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-action-dock-gap: ${BOUNDARY_STATED}">`,
  dock(undefined),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "40px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-action-dock-gap: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-action-dock-gap: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-action-dock-gap: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "30px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-action-dock-gap"],
  derive: () => ({ "--ds-action-dock-gap": CARRIED }),
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
let dockStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: ScopeName, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: ScopeName, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const gap = (from: ProbeReadings, scope: ScopeName) => site(from, scope, "--ds-action-dock-gap", "column-gap");

describe("chrome/action-dock channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      { id: "onBoundary", selector: `#on-boundary ${ACTIONS}`, property: "column-gap" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(GAP));
    dockStated = await probe(markup("", `--ds-action-dock-gap: ${DOCK_STATED}`), targets(GAP));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(GAP));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(GAP));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(GAP));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(GAP));
    }
  }, 180_000);

  it("probes the anatomy the rendering stamps: the density attribute sits on the dock's own root", () => {
    expect(RENDERING).toMatch(/data-part="root"\s+data-placement=\{position\}\s+data-mode=\{mode\}\s+data-density=\{density\}/);
    expect(RENDERING).toContain('className="ds-action-dock__actions"');
  });

  it("measures a real read site and a real oracle for every channel in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries, ancestor and own, really move the oracle away from rest", () => {
    for (const channel of CHANNELS) {
      const property = SITES[channel].properties[0];
      const rest = oracle(readings, "rest", channel, property);
      for (const scope of ["compact", "spacious", "ownCompact", "ownSpacious"] as const) {
        expect({ channel, scope, value: oracle(readings, scope, channel, property) }).not.toEqual({ channel, scope, value: rest });
      }
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

  it("own attribute: a dock with its own density paints what an ancestor boundary of that posture paints, and its own posture outranks an ancestor's", () => {
    const pairs: Array<[ScopeName, ScopeName]> = [
      ["ownCompact", "compact"],
      ["ownComfortable", "comfortable"],
      ["ownSpacious", "spacious"],
      ["ownOverAncestor", "compact"],
    ];
    for (const [own, ancestor] of pairs) {
      for (const channel of CHANNELS) {
        for (const property of SITES[channel].properties) {
          expect({ own, channel, property, painted: site(readings, own, channel, property) }).toEqual({
            own,
            channel,
            property,
            painted: site(readings, ancestor, channel, property),
          });
        }
      }
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope, the dock's own boundary included", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: gap(dockStated, scope) }).toEqual({ scope, painted: DOCK_STATED });
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
        painted: oracle(rootStated, scope, "--ds-action-dock-gap", "column-gap"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-action-dock-gap"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-action-dock-gap"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: gap(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-action-dock-gap": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: gap(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: gap(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-action-dock-gap", "column-gap"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight, on an ancestor and on the dock itself", () => {
    for (const scope of ["compact", "ownCompact"] as const) {
      const local = oracle(readings, scope, "--ds-action-dock-gap", "column-gap");
      expect({ scope, painted: gap(drills.layeredHeavy, scope) }).toEqual({ scope, painted: local });
      expect({ scope, painted: gap(drills.unlayeredLighter, scope) }).toEqual({ scope, painted: local });
      expect({ scope, painted: gap(drills.unlayeredHeavier, scope) }).toEqual({ scope, painted: OVERRIDE });
    }
  });

  it("(c) the compiler projects exactly the action-dock channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-3")).toBe(true);
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
