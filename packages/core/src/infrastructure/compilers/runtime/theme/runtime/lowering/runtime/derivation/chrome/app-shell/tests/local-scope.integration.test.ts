/** The app-shell channels a local density scope re-derives, measured in Chromium.
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
import { appShellChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/structures/shell/app-shell/index.tsx"), "utf8");

const PRODUCES = new Set<string>(appShellChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** One read site per channel: the part (and its collapse state), the declaration its oracle paints,
 *  and the computed properties read at both. */
const SITES = {
  "--ds-app-shell-navigation-drawer-header-padding": {
    site: "[data-part='navigation-drawer-header']",
    declaration: "padding",
    properties: ["padding-left", "padding-right"],
  },
  "--ds-app-shell-navigation-logo-padding": {
    site: "[data-part='navigation-logo'][data-collapsed='false']",
    declaration: "padding",
    properties: ["padding-left"],
  },
  "--ds-app-shell-navigation-body-padding": {
    site: "[data-part='navigation-body'][data-collapsed='false']",
    declaration: "padding",
    properties: ["padding-top", "padding-bottom"],
  },
  "--ds-app-shell-navigation-body-padding-collapsed": {
    site: "[data-part='navigation-body'][data-collapsed='true']",
    declaration: "padding",
    properties: ["padding-top", "padding-left"],
  },
  "--ds-app-shell-navigation-body-scroll-padding-block-end": {
    site: "[data-part='navigation-body'][data-collapsed='false']",
    declaration: "scroll-padding-block-end",
    properties: ["scroll-padding-block-end"],
  },
  "--ds-app-shell-navigation-footer-padding": {
    site: "[data-part='navigation-footer'][data-collapsed='false']",
    declaration: "padding",
    properties: ["padding-top"],
  },
  "--ds-app-shell-navigation-footer-padding-collapsed": {
    site: "[data-part='navigation-footer'][data-collapsed='true']",
    declaration: "padding",
    properties: ["padding-top", "padding-left"],
  },
  "--ds-app-shell-navigation-trigger-margin-inline-end": {
    site: "[data-part='navigation-trigger']",
    declaration: "margin-inline-end",
    properties: ["margin-inline-end"],
  },
  "--ds-app-shell-header-padding-inline": {
    site: "[data-part='header']",
    declaration: "padding-inline",
    properties: ["padding-left", "padding-right"],
  },
  "--ds-app-shell-header-slot-gap": {
    site: "[data-part='header-right']",
    declaration: "gap",
    properties: ["column-gap"],
  },
  /* The skip link paints its channel only under :focus -- unfocused, the visually-hidden rule
     zeroes the padding -- and the probe cannot focus. Its site is a reader twin: a box inside the
     shell painting the INHERITED channel, which is all the focused link reads (nothing on the
     link re-declares it). The unfocused zero is pinned below. */
  "--ds-app-shell-skip-link-padding": {
    site: "[data-reader='--ds-app-shell-skip-link-padding']",
    declaration: "padding",
    properties: ["padding-left"],
  },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];
const SKIP_LINK = "--ds-app-shell-skip-link-padding" as const;

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
/** The nearest density stamp PortalScope re-stamps on the portaled drawer. */
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

/** The shell anatomy the skin selects -- the parts the engine stamps, both collapse states --
 *  plus one oracle per channel painting its expression in place. */
function shell(rootStyle = ""): string {
  const navigation = (collapsed: "true" | "false") =>
    [
      `<div data-part="navigation-logo" data-collapsed="${collapsed}">Logo</div>`,
      `<div data-part="navigation-body" data-collapsed="${collapsed}">Inbox</div>`,
      `<div data-part="navigation-footer" data-collapsed="${collapsed}">Signed in</div>`,
    ].join("");
  return [
    `<div class="ds-app-shell" data-part="root" style="${rootStyle}">`,
    `<a data-part="skip-link" href="#main">Skip</a>`,
    `<div data-part="navigation-drawer-header">Menu</div>`,
    navigation("false"),
    navigation("true"),
    `<div data-part="header"><button data-part="navigation-trigger" type="button">Nav</button>`,
    `<div data-part="header-right"><span>A</span><span>B</span></div></div>`,
    `<div data-reader="${SKIP_LINK}" style="padding: var(${SKIP_LINK})"></div>`,
    CHANNELS.map(oracleOf).join(""),
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope) => `scope-${scope}`;

function markup(extra = "", rootStyle = ""): string {
  return extra + SCOPE_NAMES.map((scope) => `<div id="${hostId(scope)}">${SCOPES[scope](shell(rootStyle))}</div>`).join("");
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

const SKIP_TARGETS: ProbeTarget[] = SCOPE_NAMES.map((scope) => ({
  id: `skip|${scope}`,
  selector: `#${hostId(scope)} [data-part='skip-link']`,
  property: "padding-left",
}));

const SLOT_GAP: readonly Channel[] = ["--ds-app-shell-header-slot-gap"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-app-shell-header-slot-gap: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the shell) and one ON the boundary (inline). */
const SHELL_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-app-shell-header-slot-gap: ${BOUNDARY_STATED}">`,
  shell(),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-app-shell-header-slot-gap: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-app-shell-header-slot-gap: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-app-shell-header-slot-gap: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-app-shell-header-slot-gap"],
  derive: () => ({ "--ds-app-shell-header-slot-gap": CARRIED }),
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

/** The real shell in its drawer posture, under the engine provider the engine-switched Sheet requires.
 *  The Sheet portals the drawer out of the anchor's lineage and PortalScope carries it across; the
 *  header opener clicks the real trigger once the shell has settled. */
const REAL_PROPS = `({ defaultEngine: "modern", children: React.createElement(require("./src/components/structures/shell/app-shell").AppShell, {
  adapt: { desktop: { navigation: "drawer" } },
  sidebar: { logo: "Logo", nav: "Inbox", footer: "Signed in" },
  header: {
    right: React.createElement(function Opener() {
      const ref = React.useRef(null);
      React.useEffect(() => {
        const timer = setTimeout(() => ref.current.closest("header").querySelector("[data-part='navigation-trigger']").click(), 0);
        return () => clearTimeout(timer);
      }, []);
      return React.createElement("span", { ref }, "A");
    }),
  },
  children: "Content",
}) })`;
const DRAWER = ".ds-app-shell__navigation-drawer";
const READY = `${DRAWER} [data-part='navigation-footer']`;

/** The drawer renders the expanded navigation only: the logo row, both collapsed states, the header
 *  chrome and the skip link stay in the shell's lineage, covered by the in-tree matrix above. */
const DRAWER_SITES: Readonly<Partial<Record<Channel, string>>> = {
  "--ds-app-shell-navigation-drawer-header-padding": `${DRAWER} [data-part='navigation-drawer-header']`,
  "--ds-app-shell-navigation-body-padding": `${DRAWER} [data-part='navigation-body']`,
  "--ds-app-shell-navigation-body-scroll-padding-block-end": `${DRAWER} [data-part='navigation-body']`,
  "--ds-app-shell-navigation-footer-padding": `${DRAWER} [data-part='navigation-footer']`,
};
const DRAWER_CHANNELS = Object.keys(DRAWER_SITES) as Channel[];
const DRAWER_BODY_PADDING = "--ds-app-shell-navigation-drawer-body-padding";

const DRAWER_STAMPS = [
  { id: "density", selector: "[data-portal-scope='true']", property: "@attr.data-density" },
  { id: "tenant", selector: "[data-portal-scope='true']", property: "@attr.data-tenant" },
  { id: "inAnchorLineage", selector: `[data-real-mount-host] ${DRAWER}`, property: "display" },
  /* The drawer body's padding is the shell's inline restatement over the Sheet's own, so no drawer
     part reads a --ds-sheet-* padding (those resolve once at :root, registered on the density roster). */
  { id: "bodyInline", selector: `${DRAWER}-body`, property: "@inline.padding" },
  { id: "bodyPadding", selector: `${DRAWER}-body`, property: "padding-top" },
];

const drawerTargets = (channels: readonly Channel[]) => [
  ...DRAWER_STAMPS,
  ...channels.flatMap((channel) =>
    SITES[channel].properties.flatMap((property) => [
      { id: `site|${channel}|${property}`, selector: DRAWER_SITES[channel] as string, property },
      { id: `oracle|${channel}|${property}`, selector: `[data-oracle='${channel}']`, property },
    ])
  ),
];

/** One scene per scope: the mount point and one oracle per drawer channel sit in the anchor's lineage. */
const DRAWER_SCENES: RealMountScene[] = SCOPE_NAMES.map((scope) => ({
  id: scope,
  markup: SCOPES[scope](`<div data-real-mount></div>${DRAWER_CHANNELS.map(oracleOf).join("")}`),
  ready: READY,
  targets: drawerTargets(DRAWER_CHANNELS),
}));

/** The scope flips posture while the drawer is open; the lineage observer re-stamps the portal. */
const DRAWER_FLIP: RealMountScene = {
  id: "flip",
  markup: `<div id="flip-scope" data-density="compact"><div data-real-mount></div>${DRAWER_CHANNELS.map(oracleOf).join("")}</div>`,
  ready: READY,
  targets: drawerTargets(DRAWER_CHANNELS),
  steps: [{ id: "spacious", selector: "#flip-scope", attributes: { "data-density": "spacious" } }],
};

let drawer: ProbeReadings;

let readings: ProbeReadings;
let rootStated: ProbeReadings;
let shellStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];

const slotGap = (from: ProbeReadings, scope: Scope) => site(from, scope, "--ds-app-shell-header-slot-gap", "column-gap");

describe("chrome/app-shell channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      ...SKIP_TARGETS,
      { id: "onBoundary", selector: "#on-boundary [data-part='header-right']", property: "column-gap" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE), targets(SLOT_GAP));
    shellStated = await probe(markup("", `--ds-app-shell-header-slot-gap: ${SHELL_STATED}`), targets(SLOT_GAP));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`), targets(SLOT_GAP));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(SLOT_GAP));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(SLOT_GAP));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`), targets(SLOT_GAP));
    }

    const bundle = await bundleRealMount({
      module: "src/infrastructure/runtime/engines/composition/react/provider",
      exportName: "EngineProvider",
      props: REAL_PROPS,
    });
    drawer = await measureRealMount({ vertical: "bithire", bundle, scenes: [...DRAWER_SCENES, DRAWER_FLIP] });
  }, 180_000);

  it("probes the parts the engine stamps", () => {
    for (const part of [
      "navigation-drawer-header",
      "navigation-logo",
      "navigation-body",
      "navigation-footer",
      "header-right",
    ]) {
      expect(ENGINE).toContain(`data-part="${part}"`);
    }
    expect(ENGINE).toContain("partAttributes('skip-link'");
    expect(ENGINE).toContain("partAttributes('navigation-trigger'");
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

  it("pin: the unfocused skip link paints no padding in any scope, so its site is the reader twin", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: readings.base[`skip|${scope}`] }).toEqual({ scope, painted: "0px" });
    }
    expect(site(readings, "rest", SKIP_LINK, "padding-left")).not.toBe("0px");
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: slotGap(shellStated, scope) }).toEqual({ scope, painted: SHELL_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: slotGap(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: slotGap(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-app-shell-header-slot-gap", "column-gap"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-app-shell-header-slot-gap"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-app-shell-header-slot-gap"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: slotGap(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-app-shell-header-slot-gap": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: slotGap(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: slotGap(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-app-shell-header-slot-gap", "column-gap"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-app-shell-header-slot-gap", "column-gap");
    expect(slotGap(drills.layeredHeavy, "compact")).toBe(local);
    expect(slotGap(drills.unlayeredLighter, "compact")).toBe(local);
    expect(slotGap(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("real mount: the drawer leaves the anchor's lineage and re-stamps its nearest scope", () => {
    for (const scope of SCOPE_NAMES) {
      const at = drawer[scope];
      expect({ scope, inAnchorLineage: at.inAnchorLineage }).toEqual({ scope, inAnchorLineage: expect.stringMatching(/^<no match/) });
      expect({ scope, density: at.density, tenant: at.tenant }).toEqual({ scope, density: NEAREST_DENSITY[scope], tenant: "bithire" });
    }
  });

  it("(a) real mount: every drawer channel on the portaled surface paints the anchor's local answer", () => {
    const drift: string[] = [];
    for (const scope of SCOPE_NAMES) {
      for (const channel of DRAWER_CHANNELS) {
        for (const property of SITES[channel].properties) {
          const painted = drawer[scope][`site|${channel}|${property}`];
          const expected = drawer[scope][`oracle|${channel}|${property}`];
          if (painted !== expected) drift.push(`${scope} ${channel} ${property}: painted ${painted}, local answer ${expected}`);
        }
      }
    }
    expect(drift).toEqual([]);
  });

  it("real mount: the compact drawer equals the in-tree compact control and leaves the root posture", () => {
    for (const channel of DRAWER_CHANNELS) {
      for (const property of SITES[channel].properties) {
        const portaled = drawer.compact[`site|${channel}|${property}`];
        expect({ channel, property, portaled }).toEqual({ channel, property, portaled: site(readings, "compact", channel, property) });
        expect({ channel, property, portaled }).not.toEqual({ channel, property, portaled: drawer.rest[`site|${channel}|${property}`] });
        expect({ channel, property, rest: drawer.rest[`site|${channel}|${property}`] }).toEqual({
          channel,
          property,
          rest: site(readings, "rest", channel, property),
        });
      }
    }
  });

  it("real mount: a posture flip on the open drawer's scope re-stamps the portal, which follows", () => {
    const before = drawer.flip;
    const after = drawer["flip>spacious"];
    expect(before.density).toBe("compact");
    expect(after.density).toBe("spacious");
    for (const channel of DRAWER_CHANNELS) {
      for (const property of SITES[channel].properties) {
        const id = `site|${channel}|${property}`;
        expect({ id, before: before[id] }).toEqual({ id, before: before[`oracle|${channel}|${property}`] });
        expect({ id, after: after[id] }).toEqual({ id, after: after[`oracle|${channel}|${property}`] });
        expect({ id, after: after[id] }).not.toEqual({ id, after: before[id] });
      }
    }
  });

  it("pin: the drawer body padding is a flat zero outside the density set, restated inline over the Sheet's", () => {
    expect(PRODUCED[DRAWER_BODY_PADDING]).toBe("0");
    expect(CHANNELS).not.toContain(DRAWER_BODY_PADDING);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, inline: drawer[scope].bodyInline, painted: drawer[scope].bodyPadding }).toEqual({
        scope,
        inline: `var(${DRAWER_BODY_PADDING}, 0)`,
        painted: "0px",
      });
    }
  });

  it("(c) the compiler projects exactly the app-shell channels whose value reads a density-scope name, none on the arabic axis", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-3")).toBe(true);
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
