/** The menu channels a local density scope re-derives, measured in Chromium.
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
import { menuChromeDeriver } from "..";

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

const ENGINE = readFileSync(resolve(process.cwd(), "src/components/primitives/navigation/menu/engines/modern/index.tsx"), "utf8");
const SKIN = stripComments(
  readFileSync(resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css"), "utf8")
);

const PRODUCES = new Set<string>(menuChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

const ROOT = ".ds-menu.ds-menu--modern[data-part='root']";
const TOP_ITEM = `${ROOT} > [data-part='row'] > [data-part='item'][data-level='top']`;
const TRIGGER = `${ROOT} > [data-part='row'] > [data-part='trigger']`;
const DISCLOSURE = `${ROOT} [data-part='panel'][data-disclosure-panel='true']`;
const CHILD_ITEM = `${DISCLOSURE} [data-part='item'][data-level='child']`;
const GROUP = `${ROOT} > [data-part='group']`;

/** The pseudo-element and the keyframe a channel paints through inherit it from their originating
 *  element, so those sites read the channel's computed value there. */
const inherited = (channel: string) => ({ declaration: channel, properties: [channel] });

/** One read site per channel: the menu it sits in, the element, the declaration its oracle paints,
 *  and the computed properties read at both. */
const SITES = {
  "--ds-menu-padding-block": { menu: "vertical", site: ROOT, declaration: "padding-block", properties: ["padding-top"] },
  "--ds-menu-padding-inline": { menu: "vertical", site: ROOT, declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-menu-gap": { menu: "vertical", site: ROOT, declaration: "row-gap", properties: ["row-gap"] },
  "--ds-menu-horizontal-gap": { menu: "horizontal", site: ROOT, declaration: "column-gap", properties: ["column-gap"] },
  "--ds-menu-horizontal-padding-inline": {
    menu: "horizontal",
    site: ROOT,
    declaration: "padding-inline",
    properties: ["padding-left"],
  },
  "--ds-menu-collapsed-inline-size": { menu: "collapsed", site: ROOT, declaration: "width", properties: ["width"] },
  "--ds-menu-item-gap": { menu: "vertical", site: TOP_ITEM, declaration: "column-gap", properties: ["column-gap"] },
  "--ds-menu-item-height": { menu: "vertical", site: TOP_ITEM, declaration: "height", properties: ["height"] },
  "--ds-menu-item-padding-inline": { menu: "vertical", site: TOP_ITEM, declaration: "padding-inline", properties: ["padding-left"] },
  "--ds-menu-icon-column-size": { menu: "vertical", site: `${TOP_ITEM} > [data-part='icon']`, declaration: "width", properties: ["width"] },
  "--ds-menu-arrow-size": { menu: "vertical", site: `${TRIGGER} > [data-part='arrow-icon']`, declaration: "width", properties: ["width"] },
  "--ds-menu-item-child-height": { menu: "vertical", site: CHILD_ITEM, declaration: "height", properties: ["height"] },
  "--ds-menu-child-padding-inline": {
    menu: "vertical",
    site: CHILD_ITEM,
    declaration: "padding-inline-end",
    properties: ["padding-right"],
  },
  "--ds-menu-panel-enter-distance": { menu: "vertical", site: DISCLOSURE, ...inherited("--ds-menu-panel-enter-distance") },
  "--ds-menu-panel-margin-block": {
    menu: "vertical",
    site: `${GROUP} > [data-part='panel']`,
    declaration: "margin-block",
    properties: ["margin-top"],
  },
  "--ds-menu-group-margin-block": { menu: "vertical", site: GROUP, declaration: "margin-block", properties: ["margin-top", "margin-bottom"] },
  "--ds-menu-group-padding-block": {
    menu: "vertical",
    site: `${GROUP} > [data-part='group-label']`,
    declaration: "padding-block",
    properties: ["padding-top", "padding-bottom"],
  },
  "--ds-menu-group-padding-inline": {
    menu: "vertical",
    site: `${GROUP} > [data-part='group-label']`,
    declaration: "padding-inline",
    properties: ["padding-left"],
  },
  "--ds-menu-group-letter-spacing": {
    menu: "vertical",
    site: `${GROUP} > [data-part='group-label']`,
    declaration: "letter-spacing",
    properties: ["letter-spacing"],
  },
  "--ds-menu-divider-margin-block": {
    menu: "vertical",
    site: `${ROOT} > [data-part='divider']`,
    declaration: "margin-block",
    properties: ["margin-top"],
  },
  "--ds-menu-divider-margin-inline": {
    menu: "vertical",
    site: `${ROOT} > [data-part='divider']`,
    declaration: "margin-inline",
    properties: ["margin-left"],
  },
  "--ds-menu-item-horizontal-height": { menu: "horizontal", site: TOP_ITEM, declaration: "height", properties: ["height"] },
  "--ds-menu-current-rule-inset": {
    menu: "horizontal",
    site: `${TOP_ITEM}[data-selected='true']`,
    ...inherited("--ds-menu-current-rule-inset"),
  },
  "--ds-menu-submenu-indent": {
    menu: "compound",
    site: `${ROOT} .ds-menu-submenu__track > [data-part='panel']`,
    ...inherited("--ds-menu-submenu-indent"),
  },
  "--ds-menu-inline-indent": { menu: "vertical", site: CHILD_ITEM, declaration: "padding-left", properties: ["padding-left"] },
  "--ds-menu-level": { menu: "vertical", site: CHILD_ITEM, declaration: "padding-left", properties: ["padding-left"] },
} as const;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** Named pins, never (a) cells. The engine stamps the hierarchy data inline on every row, trigger and
 *  disclosure panel (level and a pixel indent), and the skin re-declares the level as `0` on the root,
 *  so no root or boundary statement of either name reaches the indent it paints. */
const INLINE_INDENT = "24px";
const levelStamp = (level: number) => `--ds-menu-level: ${level}; --ds-menu-inline-indent: ${INLINE_INDENT}`;
const SHADOWED: readonly Channel[] = ["--ds-menu-inline-indent", "--ds-menu-level"];
/** `:lang(ar) { letter-spacing: normal }` in the last layer masks the frozen group tracking channel. */
const MASKED = "--ds-menu-group-letter-spacing" as const;
const LIVE = CHANNELS.filter((channel) => !SHADOWED.includes(channel) && channel !== MASKED);
const DRILLED = "--ds-menu-item-height" as const;

/** What a level-1 child's inline-start padding owes: through the engine's stamp, and through the channels' own answer. */
const CHILD_START = PRODUCED["--ds-menu-child-padding-inline"];
const STAMP_ANSWER = `padding-left: calc(${CHILD_START} + 1 * ${INLINE_INDENT})`;
const CHANNEL_ANSWER = `padding-left: calc(${CHILD_START} + ${PRODUCED["--ds-menu-level"]} * ${PRODUCED["--ds-menu-inline-indent"]})`;

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

/** Tracking resolves against the group label's own font size, so its oracle carries it too. */
const ORACLE_EXTRA: Partial<Record<Channel, string>> = {
  [MASKED]: `font-size: ${PRODUCED["--ds-menu-group-font-size"]}`,
};

function oracleOf(channel: Channel): string {
  if (SHADOWED.includes(channel)) {
    return `<div data-oracle="${channel}" style="${CHANNEL_ANSWER}"></div><div data-stamp="${channel}" style="${STAMP_ANSWER}"></div>`;
  }
  const extra = ORACLE_EXTRA[channel] ? `; ${ORACLE_EXTRA[channel]}` : "";
  return `<div data-oracle="${channel}" style="${SITES[channel].declaration}: ${PRODUCED[channel]}${extra}"></div>`;
}

type Menu = (typeof SITES)[Channel]["menu"];
const MENUS: readonly Menu[] = ["vertical", "horizontal", "collapsed", "compound"];

const oracles = (menu: Menu) => CHANNELS.filter((channel) => SITES[channel].menu === menu).map(oracleOf).join("");

/** The anatomy the engine renders for each posture of the menu, plus one oracle per channel painting its expression in place. */
function menu(kind: Menu, rootStyle = ""): string {
  const top = (label: string, selected = false) =>
    `<li data-part="row" role="none"><a role="menuitem" data-part="item" data-level="top" data-selected="${selected}" style="${levelStamp(0)}">` +
    `<span data-part="icon">*</span><span data-part="label">${label}</span></a></li>`;
  const child = (label: string) =>
    `<li data-part="row" role="none"><a role="menuitem" data-part="item" data-level="child" data-selected="false" style="${levelStamp(1)}">` +
    `<span data-part="label">${label}</span></a></li>`;
  const root = (mode: string, extra: string, body: string) =>
    `<ul class="ds-menu ds-menu--modern" role="menu" data-part="root" data-variant="light" data-mode="${mode}"${extra} style="${rootStyle}">${body}${oracles(kind)}</ul>`;
  if (kind === "horizontal") return root("horizontal", "", top("Home", true) + top("Reports"));
  if (kind === "collapsed") return root("inline", ` data-collapsed="true"`, top("Home", true));
  if (kind === "compound") {
    return root(
      "inline",
      "",
      `<li class="ds-menu-submenu" role="none"><div role="menuitem" data-part="trigger" data-open="true" aria-expanded="true">` +
        `<span data-part="label">Reports</span><span data-part="arrow-icon" aria-hidden="true"></span></div>` +
        `<div class="ds-menu-submenu__track" data-open="true"><ul role="menu" data-part="panel" aria-hidden="false">` +
        `<li class="ds-menu-item" role="menuitem" data-part="item">Weekly</li></ul></div></li>`
    );
  }
  return root(
    "inline",
    "",
    [
      top("Home", true),
      `<li data-part="row" role="none"><div role="menuitem" data-part="trigger" data-level="top" data-open="true" style="${levelStamp(0)}">`,
      `<span data-part="icon">*</span><span data-part="label">Reports</span><span data-part="arrow-icon" aria-hidden="true"></span></div>`,
      `<ul role="group" data-part="panel" data-disclosure-panel="true" style="${levelStamp(0)}">${child("Weekly")}</ul></li>`,
      `<li data-part="divider" role="separator"></li>`,
      `<li data-part="group" role="presentation"><div data-part="group-label">Workspace</div>`,
      `<ul role="group" data-part="panel">${child("Files")}</ul></li>`,
    ].join("")
  );
}

const hostId = (scope: Scope, kind: Menu) => `${scope}-${kind}`;

function markup(extra = "", rootStyle = "", kinds: readonly Menu[] = MENUS): string {
  const hosts = SCOPE_NAMES.flatMap((scope) =>
    kinds.map((kind) => `<div id="${hostId(scope, kind)}" style="width: 480px">${SCOPES[scope](menu(kind, rootStyle))}</div>`)
  );
  return extra + hosts.join("");
}

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) => {
      const host = `#${hostId(scope, SITES[channel].menu)}`;
      return SITES[channel].properties.flatMap((property) => [
        { id: `site|${scope}|${channel}|${property}`, selector: `${host} ${SITES[channel].site}`, property },
        { id: `oracle|${scope}|${channel}|${property}`, selector: `${host} [data-oracle='${channel}']`, property },
        ...(SHADOWED.includes(channel)
          ? [{ id: `stamp|${scope}|${channel}|${property}`, selector: `${host} [data-stamp='${channel}']`, property }]
          : []),
      ]);
    })
  );
}

/** The masked pin reads the channel and its input where the group label sits. */
const MASK_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) => [
  { id: `mask-channel|${scope}`, selector: `#${hostId(scope, "vertical")} ${SITES[MASKED].site}`, property: MASKED },
  {
    id: `mask-input|${scope}`,
    selector: `#${hostId(scope, "vertical")} ${SITES[MASKED].site}`,
    property: "--ds-letter-spacing-wider",
  },
]);

const DRILL: readonly Channel[] = [DRILLED];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { ${DRILLED}: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the menu) and one ON the boundary (inline). */
const MENU_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="${DRILLED}: ${BOUNDARY_STATED}">`,
  menu("vertical"),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { ${DRILLED}: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { ${DRILLED}: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { ${DRILLED}: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement of the live channel and of both hierarchy channels, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const SHADOW_CARRIED: Readonly<Record<string, string>> = { "--ds-menu-inline-indent": "77px", "--ds-menu-level": "7" };
const STATED: Readonly<Record<string, string>> = { [DRILLED]: CARRIED, ...SHADOW_CARRIED };
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
  `<style>${css}</style><div data-ds-root data-vertical="bithire" data-tenant="acme">${markup("", "", ["vertical"])}</div>`;

let readings: ProbeReadings;
let rootStated: ProbeReadings;
let menuStated: ProbeReadings;
let carried: ProbeReadings;
let dbCarried: ProbeReadings;
let dbUncarried: ProbeReadings;
const drills: Record<string, ProbeReadings> = {};

const site = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`site|${scope}|${channel}|${property}`];
const oracle = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`oracle|${scope}|${channel}|${property}`];
const stamp = (from: ProbeReadings, scope: Scope, channel: Channel, property: string) =>
  from.base[`stamp|${scope}|${channel}|${property}`];

const itemHeight = (from: ProbeReadings, scope: Scope) => site(from, scope, DRILLED, "height");

describe("chrome/menu channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      ...MASK_TARGETS,
      { id: "onBoundary", selector: `#on-boundary ${TOP_ITEM}`, property: "height" },
    ]);
    rootStated = await probe(markup(ROOT_STYLE, "", ["vertical"]), targets(DRILL));
    menuStated = await probe(markup("", `${DRILLED}: ${MENU_STATED}`, ["vertical"]), targets(DRILL));
    carried = await probe(markup(`<style>${CARRIED_CSS}</style>`, "", ["vertical"]), targets([DRILLED, ...SHADOWED]));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(DRILL));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(DRILL));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(markup(`<style>${css}</style>`, "", ["vertical"]), targets(DRILL));
    }
  }, 180_000);

  it("probes the parts and the hierarchy stamps the engine writes", () => {
    expect(ENGINE).toContain("className={`ds-menu ds-menu--modern ${className}`.trim()}");
    expect(ENGINE).toContain("['--ds-menu-level' as string]: String(level),");
    expect(ENGINE).toContain("['--ds-menu-inline-indent' as string]: `${inlineIndent}px`,");
    expect(ENGINE.match(/style=\{getLevelStyleVars\(level, inlineIndent\)\}/g)?.length).toBe(3);
    for (const part of ["row", "icon", "label", "arrow-icon", "panel", "divider", "group", "group-label"]) {
      expect(ENGINE).toContain(`data-part="${part}"`);
    }
  });

  it("measures a real read site and a real oracle for every channel in every scope", () => {
    for (const [id, value] of Object.entries(readings.base)) {
      expect({ id, value }).not.toEqual({ id, value: expect.stringMatching(/^<no match|^$/) });
    }
  });

  it("the compact and spacious boundaries really move the oracle away from rest", () => {
    for (const channel of LIVE) {
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

  it("pin: the menu root re-declares the level as zero", () => {
    const rootRule = SKIN.match(/\.ds-menu\.ds-menu--modern\[data-part='root'\]\s*\{([^{}]*)\}/)?.[1] ?? "";
    expect(rootRule).toMatch(/--ds-menu-level:\s*0;/);
  });

  it("pin: a child row's indent paints the engine's hierarchy stamp in every scope, never the channels' own answer", () => {
    for (const scope of SCOPE_NAMES) {
      for (const channel of SHADOWED) {
        const painted = site(readings, scope, channel, "padding-left");
        expect({ scope, channel, painted }).toEqual({ scope, channel, painted: stamp(readings, scope, channel, "padding-left") });
        expect({ scope, channel, painted }).not.toEqual({ scope, channel, painted: oracle(readings, scope, channel, "padding-left") });
      }
    }
  });

  it("pin: a compiler-rank statement of a hierarchy channel is carried into both blocks and reaches no read site", () => {
    for (const [channel, value] of Object.entries(SHADOW_CARRIED)) {
      expect(carriedRoot[channel]).toBe(value);
      expect(carriedBlock?.cssVariables[channel]).toBe(value);
    }
    for (const scope of SCOPE_NAMES) {
      for (const channel of SHADOWED) {
        const painted = site(carried, scope, channel, "padding-left");
        expect({ scope, channel, painted }).toEqual({ scope, channel, painted: stamp(carried, scope, channel, "padding-left") });
      }
    }
  });

  it("pin: the group tracking is masked, its channel frozen at the root while :lang(ar) paints normal", () => {
    const rootValue = readings.base["mask-channel|rest"];
    expect(readings.base["mask-channel|arabic"]).toBe(rootValue);
    expect(readings.base["mask-input|arabic"].trim()).toBe("0");
    expect(readings.base["mask-input|arabic"].trim()).not.toBe(rootValue.trim());
    expect(site(readings, "arabic", MASKED, "letter-spacing")).toBe("normal");
    for (const scope of BOUNDED) {
      expect({ scope, painted: site(readings, scope, MASKED, "letter-spacing") }).toEqual({
        scope,
        painted: site(readings, "rest", MASKED, "letter-spacing"),
      });
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: itemHeight(menuStated, scope) }).toEqual({ scope, painted: MENU_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: itemHeight(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: itemHeight(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, DRILLED, "height"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot[DRILLED]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables[DRILLED]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: itemHeight(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual(STATED);
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: itemHeight(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: itemHeight(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, DRILLED, "height"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", DRILLED, "height");
    expect(itemHeight(drills.layeredHeavy, "compact")).toBe(local);
    expect(itemHeight(drills.unlayeredLighter, "compact")).toBe(local);
    expect(itemHeight(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the menu channels whose value reads a density-scope name", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-0")).toBe(true);
    expect(DENSITY_AXIS.has("--ds-spacing-12")).toBe(true);
    const densityExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, DENSITY_AXIS))
      .map(([channel]) => channel)
      .sort();
    const arabicExposed = Object.entries(PRODUCED)
      .filter(([, value]) => readsAny(value, ARABIC_AXIS))
      .map(([channel]) => channel);
    expect([...densityExposed, ...arabicExposed].sort()).toEqual([...CHANNELS].sort());
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
