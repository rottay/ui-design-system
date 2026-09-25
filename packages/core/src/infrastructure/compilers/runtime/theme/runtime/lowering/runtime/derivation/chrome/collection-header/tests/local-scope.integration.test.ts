/** The collection-header channels a local density scope re-derives, measured in Chromium.
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
import { collectionHeaderChromeDeriver } from "..";

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
  resolve(process.cwd(), "src/components/structures/headers/collection/index.tsx"),
  "utf8"
);

const PRODUCES = new Set<string>(collectionHeaderChromeDeriver.produces);

const COMPILED = compileThemeIntent(staticThemeIntent("bithire")).compiled;
const PRODUCED: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(COMPILED.cssVariables).filter(([channel]) => PRODUCES.has(channel))
);

const readsAny = (value: string, names: Set<string>) =>
  [...value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].some((match) => names.has(match[1]));

/** The root postures the skin keys on, each rendered as the runtime composes it. */
type Host = "standard" | "editorialCompact" | "embedded" | "embeddedEditorial" | "minimal" | "minimalEmbedded";
const HOSTS: readonly Host[] = ["standard", "editorialCompact", "embedded", "embeddedEditorial", "minimal", "minimalEmbedded"];

const ROOT = ".ds-collection-header";
const SUBTITLE_ROW = "[data-part='subtitle-row']";
const QUICK_ACTIONS = "[data-part='quick-actions']";

/** One read site per channel: the host posture, the element, the declaration its oracle paints, the computed properties. */
const SITES = {
  "--ds-collection-header-padding-block-start": { host: "standard", at: ROOT, declaration: "padding-block-start", properties: ["padding-top"] },
  "--ds-collection-header-padding-inline": { host: "standard", at: ROOT, declaration: "padding-inline", properties: ["padding-left", "padding-right"] },
  "--ds-collection-header-padding-block-end": { host: "standard", at: ROOT, declaration: "padding-block-end", properties: ["padding-bottom"] },
  "--ds-collection-header-subtitle-row-gap": { host: "standard", at: SUBTITLE_ROW, declaration: "margin-block-start", properties: ["margin-top"] },
  "--ds-collection-header-subtitle-row-rule-gap": { host: "standard", at: SUBTITLE_ROW, declaration: "padding-block-start", properties: ["padding-top"] },
  "--ds-collection-header-chip-block-size": { host: "standard", at: "[data-part='meta-item']", declaration: "min-block-size", properties: ["min-height"] },
  "--ds-collection-header-chip-inline-padding": { host: "standard", at: "[data-part='meta-item']", declaration: "padding-inline", properties: ["padding-left", "padding-right"] },
  "--ds-collection-header-inline-meta-gap": { host: "standard", at: `${QUICK_ACTIONS} > :first-child`, declaration: "padding-inline-start", properties: ["padding-left"] },
  "--ds-collection-header-quick-actions-gap": { host: "standard", at: QUICK_ACTIONS, declaration: "gap", properties: ["column-gap", "row-gap"] },
  "--ds-collection-header-quick-actions-padding": { host: "standard", at: QUICK_ACTIONS, declaration: "padding", properties: ["padding-top", "padding-left"] },
  "--ds-collection-header-quick-actions-above-gap": { host: "standard", at: QUICK_ACTIONS, declaration: "margin-block-start", properties: ["margin-top"] },
  "--ds-collection-header-action-icon-gap": { host: "standard", at: "[data-part='quick-action-icon']", declaration: "margin-inline-end", properties: ["margin-right"] },
  "--ds-collection-header-rail-trailing-gap": { host: "standard", at: `${QUICK_ACTIONS} + *`, declaration: "margin-block-start", properties: ["margin-top"] },
  "--ds-collection-header-rail-trailing-row-gap": { host: "standard", at: `${QUICK_ACTIONS} + *`, declaration: "gap", properties: ["row-gap"] },
  "--ds-collection-header-keycap-block-size": { host: "standard", at: "[data-part='shortcut-pill']", declaration: "min-block-size", properties: ["min-height"] },
  "--ds-collection-header-keycap-inline-padding": { host: "standard", at: "[data-part='shortcut-pill']", declaration: "padding-inline", properties: ["padding-left", "padding-right"] },
  "--ds-collection-header-padding-compact-block-start": { host: "editorialCompact", at: ROOT, declaration: "padding-block-start", properties: ["padding-top"] },
  "--ds-collection-header-padding-compact-inline": { host: "editorialCompact", at: ROOT, declaration: "padding-inline", properties: ["padding-left", "padding-right"] },
  "--ds-collection-header-padding-compact-block-end": { host: "editorialCompact", at: ROOT, declaration: "padding-block-end", properties: ["padding-bottom"] },
  "--ds-collection-header-identity-gap": { host: "editorialCompact", at: "[data-part='identity']", declaration: "row-gap", properties: ["row-gap"] },
  "--ds-collection-header-padding-embedded-block-end": { host: "embedded", at: ROOT, declaration: "padding-block-end", properties: ["padding-bottom"] },
  "--ds-collection-header-subtitle-row-gap-treated": { host: "embedded", at: SUBTITLE_ROW, declaration: "margin-block-start", properties: ["margin-top"] },
  "--ds-collection-header-rail-grid-gap": { host: "embedded", at: "[data-part='secondary-rail']", declaration: "gap", properties: ["row-gap", "column-gap"] },
  "--ds-collection-header-padding-embedded-editorial-block-end": { host: "embeddedEditorial", at: ROOT, declaration: "padding-block-end", properties: ["padding-bottom"] },
  "--ds-collection-header-subtitle-row-gap-editorial": { host: "embeddedEditorial", at: SUBTITLE_ROW, declaration: "margin-block-start", properties: ["margin-top"] },
  "--ds-collection-header-subtitle-row-inline-gap-editorial": { host: "embeddedEditorial", at: SUBTITLE_ROW, declaration: "column-gap", properties: ["column-gap"] },
  "--ds-collection-header-quick-actions-above-gap-editorial": { host: "embeddedEditorial", at: QUICK_ACTIONS, declaration: "margin-block-start", properties: ["margin-top"] },
  "--ds-collection-header-padding-minimal": { host: "minimal", at: ROOT, declaration: "padding", properties: ["padding-top", "padding-bottom", "padding-left"] },
  "--ds-collection-header-padding-minimal-embedded-block": { host: "minimalEmbedded", at: ROOT, declaration: "padding-block", properties: ["padding-top", "padding-bottom"] },
  "--ds-collection-header-padding-minimal-embedded-inline": { host: "minimalEmbedded", at: ROOT, declaration: "padding-inline", properties: ["padding-left", "padding-right"] },
} as const satisfies Record<string, { host: Host; at: string; declaration: string; properties: readonly string[] }>;

type Channel = keyof typeof SITES;
const CHANNELS = Object.keys(SITES) as Channel[];

/** Named pins, never (a) cells: `:lang(ar) { letter-spacing: normal }` in the last layer masks each frozen
 *  tracking channel at its only read site; the code tracking resolves to 0 at the root, so it paints normal at rest too. */
const INERT = "--ds-collection-header-subtitle-tracking-code";
const MASKED = {
  "--ds-collection-header-chip-tracking": { host: "standard", at: "[data-part='meta-item']", input: "--ds-type-caption-letter-spacing" },
  "--ds-collection-header-subtitle-tracking-code": { host: "standard", at: "[data-part='subtitle']", input: "--ds-type-code-letter-spacing" },
  "--ds-collection-header-subtitle-tracking-compact-technical": { host: "editorialCompact", at: "[data-part='subtitle']", input: "--ds-letter-spacing-wider" },
  "--ds-collection-header-subtitle-tracking-caption": { host: "embedded", at: "[data-part='subtitle']", input: "--ds-type-caption-letter-spacing" },
} as const satisfies Record<string, { host: Host; at: string; input: string }>;

type Masked = keyof typeof MASKED;
const MASKED_CHANNELS = Object.keys(MASKED) as Masked[];

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

const box = (attributes: string, inner = "", part = "box-surface", tag = "div") =>
  `<${tag} class="rottay-box rottay-box--modern" data-component="box" data-part="${part}" ${attributes}>${inner}</${tag}>`;
const flex = (attributes: string, inner: string, part = "root") =>
  `<div class="rottay-flex rottay-flex--modern" data-component="flex" data-part="${part}" ${attributes}>${inner}</div>`;

const eyebrow = (embedded: boolean) => box(`data-embedded="${embedded}"`, "Workspace", "eyebrow", "span");
const title = (treatment: string, compact: boolean, editorial: boolean) =>
  box(`data-title-treatment="${treatment}" data-compact-layout="${compact}" data-editorial-tech="${editorial}"`, "Records", "title", "h1");
const identity = (compact: boolean, editorial: boolean, inner: string) =>
  box(`data-compact-layout="${compact}" data-editorial-tech="${editorial}"`, inner, "identity");

function defaultSubtitle(titleTreatment: string, subtitleTreatment: string, compact: boolean): string {
  const posture = `data-title-treatment="${titleTreatment}" data-compact-layout="${compact}"`;
  return flex(
    `data-align="start" data-variant="default" ${posture}`,
    box(`data-variant="default" ${posture} data-subtitle-treatment="${subtitleTreatment}"`, "Every open record", "subtitle", "span"),
    "subtitle-row"
  );
}

function editorialSubtitle(): string {
  return [
    flex(
      `data-align="start" data-variant="editorial-tech"`,
      box(`aria-hidden="true"`, "", "subtitle-divider") +
        box(`data-variant="editorial-tech" data-title-treatment="default" data-subtitle-treatment="default"`, "Every open record", "subtitle", "span"),
      "subtitle-row"
    ),
    box(`aria-hidden="true"`, "", "editorial-tech-rule"),
  ].join("");
}

const eyebrowRow = (inner: string) => flex(`data-align="center" data-justify="end" data-wrap="wrap" data-gap="uniform" style="--ds-flex-gap: 8px"`, inner);

function quickActions(embedded: boolean, editorial: boolean, withMeta: boolean): string {
  const meta = withMeta
    ? flex(`data-align="center" data-justify="end" data-wrap="wrap" data-gap="uniform" style="--ds-flex-gap: 6px"`, box(`data-tone="neutral"`, "12 active", "meta-item"))
    : "";
  const action = [
    `<button type="button" class="rottay-button ds-collection-header__quick-action ds-collection-header__quick-action--default" data-priority="standard">`,
    box(`data-icon-only="false"`, "+", "quick-action-icon", "span"),
    `New</button>`,
  ].join("");
  return box(
    `data-embedded="${embedded}" data-editorial-tech="${editorial}"`,
    meta + flex(`data-align="center" data-justify="end" data-wrap="wrap" data-gap="uniform" style="--ds-flex-gap: 8px"`, action),
    "quick-actions"
  );
}

const trailing = () =>
  box(
    "",
    flex(
      `data-align="center" data-justify="end" data-wrap="wrap" data-gap="uniform" style="--ds-flex-gap: 8px"`,
      box("", `<svg data-part="shortcuts-label-icon"></svg>Shortcuts`, "shortcuts-label") + box("", "N", "shortcut-pill")
    )
  );

/** The chrome each posture renders, following the runtime's own branches. */
const CHROME: Record<Host, string> = {
  standard: [
    identity(false, false, title("default", false, false) + defaultSubtitle("default", "mono-technical", false)),
    box("", eyebrowRow(eyebrow(false)) + quickActions(false, false, true) + trailing(), "secondary-rail"),
  ].join(""),
  editorialCompact: identity(true, true, eyebrow(false) + title("default", true, true) + defaultSubtitle("default", "mono-technical", true)),
  embedded: [
    identity(false, false, title("display", false, false) + defaultSubtitle("display", "default", false)),
    box("", eyebrowRow(eyebrow(true)), "secondary-rail"),
  ].join(""),
  embeddedEditorial: [
    identity(false, true, title("default", false, true) + editorialSubtitle()),
    box("", eyebrowRow(eyebrow(true)) + quickActions(true, true, false), "secondary-rail"),
  ].join(""),
  minimal: identity(false, false, eyebrow(false) + title("default", false, false)),
  minimalEmbedded: identity(false, false, eyebrow(true) + title("default", false, false)),
};

const POSTURE: Record<Host, { embedded: boolean; compact: boolean; minimal: boolean; editorial: boolean }> = {
  standard: { embedded: false, compact: false, minimal: false, editorial: false },
  editorialCompact: { embedded: false, compact: true, minimal: false, editorial: true },
  embedded: { embedded: true, compact: false, minimal: false, editorial: false },
  embeddedEditorial: { embedded: true, compact: false, minimal: false, editorial: true },
  minimal: { embedded: false, compact: false, minimal: true, editorial: false },
  minimalEmbedded: { embedded: true, compact: false, minimal: true, editorial: false },
};

/** The anatomy the runtime renders and the skin selects, plus one oracle per channel painting its expression in place. */
function collectionHeader(host: Host, rootStyle = "", chrome = CHROME[host]): string {
  const { embedded, compact, minimal, editorial } = POSTURE[host];
  const oracles = CHANNELS.filter((channel) => SITES[channel].host === host).map(oracleOf).join("");
  return [
    `<div class="rottay-box rottay-box--modern ds-structure ds-collection-header" data-component="box" data-part="root"`,
    ` data-embedded="${embedded}" data-compact="${compact}" data-minimal="${minimal}" data-editorial-tech="${editorial}"`,
    ` data-loading="false" style="${rootStyle}">`,
    flex(`data-align="start" data-justify="between" data-wrap="wrap" data-gap="uniform" style="--ds-flex-gap: 18px"`, chrome),
    oracles,
    `</div>`,
  ].join("");
}

const hostId = (scope: Scope, host: Host) => `${scope}-${host}`;

function markup(extra = "", rootStyle = "", hosts: readonly Host[] = HOSTS): string {
  return (
    extra +
    SCOPE_NAMES.flatMap((scope) =>
      hosts.map((host) => `<div id="${hostId(scope, host)}">${SCOPES[scope](collectionHeader(host, rootStyle))}</div>`)
    ).join("")
  );
}

function targets(channels: readonly Channel[] = CHANNELS): ProbeTarget[] {
  return SCOPE_NAMES.flatMap((scope) =>
    channels.flatMap((channel) => {
      const { host, at, properties } = SITES[channel];
      const within = `#${hostId(scope, host)}`;
      return properties.flatMap((property) => [
        { id: `site|${scope}|${channel}|${property}`, selector: `${within} ${at}`, property },
        { id: `oracle|${scope}|${channel}|${property}`, selector: `${within} [data-oracle='${channel}']`, property },
      ]);
    })
  );
}

/** Each masked pin reads its channel, its input and the painted tracking at its site. */
const MASK_TARGETS: ProbeTarget[] = SCOPE_NAMES.flatMap((scope) =>
  MASKED_CHANNELS.flatMap((channel) => {
    const { host, at, input } = MASKED[channel];
    const selector = `#${hostId(scope, host)} ${at}`;
    return [
      { id: `mask-channel|${scope}|${channel}`, selector, property: channel },
      { id: `mask-input|${scope}|${channel}`, selector, property: input },
      { id: `mask-site|${scope}|${channel}`, selector, property: "letter-spacing" },
    ];
  })
);

/** A distinct tracking stated on each masked site itself: the channel is live exactly where it moves the paint. */
const TRACKING_STATED: Record<Masked, string> = {
  "--ds-collection-header-chip-tracking": "3px",
  "--ds-collection-header-subtitle-tracking-code": "4px",
  "--ds-collection-header-subtitle-tracking-compact-technical": "5px",
  "--ds-collection-header-subtitle-tracking-caption": "6px",
};
function trackingStatedMarkup(): string {
  return SCOPE_NAMES.flatMap((scope) =>
    (["standard", "editorialCompact", "embedded"] as const).map((host) => {
      let chrome = CHROME[host];
      for (const channel of MASKED_CHANNELS.filter((name) => MASKED[name].host === host)) {
        const part = MASKED[channel].at.match(/data-part='([a-z-]+)'/)?.[1];
        chrome = chrome.replace(
          new RegExp(`(data-part="${part}")`),
          `$1 style="${channel}: ${TRACKING_STATED[channel]}"`
        );
      }
      return `<div id="${hostId(scope, host)}">${SCOPES[scope](collectionHeader(host, "", chrome))}</div>`;
    })
  ).join("");
}
const TRACKING_TARGETS: ProbeTarget[] = MASK_TARGETS.filter((target) => target.id.startsWith("mask-site|"));

const PADDING_INLINE: readonly Channel[] = ["--ds-collection-header-padding-inline"];

/** b2: a raw statement at the artifact's own root scope, one attribute more specific than the artifact. */
const ROOT_STATED = "50px";
const ROOT_STYLE = `<style>html[data-tenant][data-tenant] { --ds-collection-header-padding-inline: ${ROOT_STATED}; }</style>`;

/** b1: a statement below the boundary (on the header) and one ON the boundary (inline). */
const HEADER_STATED = "52px";
const BOUNDARY_STATED = "53px";
const ON_BOUNDARY = [
  `<div id="on-boundary"><div data-density="compact" style="--ds-collection-header-padding-inline: ${BOUNDARY_STATED}">`,
  collectionHeader("standard"),
  `</div></div>`,
].join("");

/** The consumer-override contract on the boundary element: layer and weight decide. */
const OVERRIDE = "60px";
const LAYER_DRILLS = {
  layeredHeavy: `@layer app { html body [data-density='compact'][data-density] { --ds-collection-header-padding-inline: ${OVERRIDE}; } }`,
  unlayeredHeavier: `html body [data-density='compact'][data-density] { --ds-collection-header-padding-inline: ${OVERRIDE}; }`,
  unlayeredLighter: `[data-density='compact'] { --ds-collection-header-padding-inline: ${OVERRIDE}; }`,
} as const;

/** b3: a compiler-rank statement, through a synthetic tenant-rank producer. */
const CARRIED = "50px";
const statedAtTenant: FamilyDeriver = {
  family: "stated-tenant",
  rank: "tenant",
  consumes: ["chrome.*"],
  produces: ["--ds-collection-header-padding-inline"],
  derive: () => ({ "--ds-collection-header-padding-inline": CARRIED }),
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
  `<style>${css}</style><div data-ds-root data-vertical="bithire" data-tenant="acme">${markup("", "", ["standard"])}</div>`;

let readings: ProbeReadings;
let trackingStated: ProbeReadings;
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

const paddingInline = (from: ProbeReadings, scope: Scope) =>
  site(from, scope, "--ds-collection-header-padding-inline", "padding-left");

describe("chrome/collection-header channels under a local scope", () => {
  beforeAll(async () => {
    const probe = (markupText: string, probeTargets: ProbeTarget[]) =>
      measureArms({ vertical: "bithire", markup: markupText, arms: { base: {} }, targets: probeTargets });
    const standardOnly = (extra = "", rootStyle = "") => markup(extra, rootStyle, ["standard"]);
    readings = await probe(markup() + ON_BOUNDARY, [
      ...targets(),
      ...MASK_TARGETS,
      { id: "onBoundary", selector: `#on-boundary ${ROOT}`, property: "padding-left" },
    ]);
    trackingStated = await probe(trackingStatedMarkup(), TRACKING_TARGETS);
    rootStated = await probe(standardOnly(ROOT_STYLE), targets(PADDING_INLINE));
    headerStated = await probe(
      standardOnly("", `--ds-collection-header-padding-inline: ${HEADER_STATED}`),
      targets(PADDING_INLINE)
    );
    carried = await probe(standardOnly(`<style>${CARRIED_CSS}</style>`), targets(PADDING_INLINE));
    dbCarried = await probe(dbRoot(dbCss(true)), targets(PADDING_INLINE));
    dbUncarried = await probe(dbRoot(dbCss(false)), targets(PADDING_INLINE));
    for (const [name, css] of Object.entries(LAYER_DRILLS)) {
      drills[name] = await probe(standardOnly(`<style>${css}</style>`), targets(PADDING_INLINE));
    }
  }, 240_000);

  it("probes the parts, postures and classes the runtime stamps", () => {
    for (const part of [
      "eyebrow",
      "meta-item",
      "identity",
      "title",
      "subtitle-row",
      "subtitle-divider",
      "subtitle",
      "editorial-tech-rule",
      "secondary-rail",
      "quick-action-icon",
      "shortcuts-label",
      "shortcuts-label-icon",
      "shortcut-pill",
    ]) {
      expect(RENDERING).toContain(`data-part="${part}"`);
    }
    expect(RENDERING).toContain("partAttributes('quick-actions'");
    expect(RENDERING).toContain("partAttributes('root'");
    expect(RENDERING).toContain('className="ds-structure ds-collection-header"');
    for (const attribute of [
      "data-embedded",
      "data-compact",
      "data-minimal",
      "data-editorial-tech",
      "data-compact-layout",
      "data-title-treatment",
      "data-subtitle-treatment",
      "data-icon-only",
    ]) {
      expect(RENDERING).toContain(`${attribute}={`);
    }
    for (const variant of ['data-variant="default"', 'data-variant="editorial-tech"']) {
      expect(RENDERING).toContain(variant);
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

  it("the tracking channels are live at rest: a statement on each read site moves its paint", () => {
    for (const channel of MASKED_CHANNELS) {
      for (const scope of ["rest", ...BOUNDED] as const) {
        expect({ channel, scope, painted: trackingStated.base[`mask-site|${scope}|${channel}`] }).toEqual({
          channel,
          scope,
          painted: TRACKING_STATED[channel],
        });
      }
      expect({ channel, painted: trackingStated.base[`mask-site|arabic|${channel}`] }).toEqual({ channel, painted: "normal" });
    }
  });

  it("pin: the code tracking resolves to 0 at the root, so rest and Arabic paint the same normal", () => {
    const at = (kind: string, scope: Scope) => readings.base[`${kind}|${scope}|${INERT}`];
    for (const scope of SCOPE_NAMES) {
      expect({ scope, channel: at("mask-channel", scope).trim() }).toEqual({ scope, channel: "0" });
      expect({ scope, input: at("mask-input", scope).trim() }).toEqual({ scope, input: "0" });
      expect({ scope, painted: at("mask-site", scope) }).toEqual({ scope, painted: "normal" });
    }
  });

  it("pin: each live tracking channel is masked, frozen at the root while :lang(ar) paints normal", () => {
    for (const channel of MASKED_CHANNELS.filter((name) => name !== INERT)) {
      const at = (kind: string, scope: Scope) => readings.base[`${kind}|${scope}|${channel}`];
      const rootValue = at("mask-channel", "rest");
      expect({ channel, frozen: at("mask-channel", "arabic") }).toEqual({ channel, frozen: rootValue });
      expect({ channel, input: at("mask-input", "arabic").trim() }).toEqual({ channel, input: "0" });
      expect({ channel, input: at("mask-input", "arabic").trim() }).not.toEqual({ channel, input: rootValue.trim() });
      expect({ channel, rest: at("mask-site", "rest") }).not.toEqual({ channel, rest: "normal" });
      expect({ channel, arabic: at("mask-site", "arabic") }).toEqual({ channel, arabic: "normal" });
      for (const scope of BOUNDED) {
        expect({ channel, scope, painted: at("mask-site", scope) }).toEqual({
          channel,
          scope,
          painted: at("mask-site", "rest"),
        });
      }
    }
  });

  it("(b1) a statement at or below the boundary wins in every scope", () => {
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: paddingInline(headerStated, scope) }).toEqual({ scope, painted: HEADER_STATED });
    }
    expect(readings.base.onBoundary).toBe(BOUNDARY_STATED);
  });

  it("(b2) the consumer contract: a raw root statement wins where no boundary intervenes and yields the local derived answer inside one", () => {
    for (const scope of UNBOUNDED) {
      expect({ scope, painted: paddingInline(rootStated, scope) }).toEqual({ scope, painted: ROOT_STATED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: paddingInline(rootStated, scope) }).toEqual({
        scope,
        painted: oracle(rootStated, scope, "--ds-collection-header-padding-inline", "padding-left"),
      });
    }
  });

  it("(b3) a compiler-rank statement is emitted in the root block AND the boundary block, and paints in every scope", () => {
    expect(carriedRoot["--ds-collection-header-padding-inline"]).toBe(CARRIED);
    expect(carriedBlock?.cssVariables["--ds-collection-header-padding-inline"]).toBe(CARRIED);
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: paddingInline(carried, scope) }).toEqual({ scope, painted: CARRIED });
    }
  });

  it("(b3) at the DB door the tenant delta carries the statement into every boundary, and the carry is load-bearing", () => {
    expect(carriedDelta.densityScopeVariables).toEqual({ "--ds-collection-header-padding-inline": CARRIED });
    expect(dbCss(true)).toContain(":where([data-density='compact']:not(:root)");
    for (const scope of SCOPE_NAMES) {
      expect({ scope, painted: paddingInline(dbCarried, scope) }).toEqual({ scope, painted: CARRIED });
    }
    for (const scope of BOUNDED) {
      expect({ scope, painted: paddingInline(dbUncarried, scope) }).toEqual({
        scope,
        painted: oracle(dbUncarried, scope, "--ds-collection-header-padding-inline", "padding-left"),
      });
    }
  });

  it("layer placement: the boundary rule is unlayered at the tenant scope's weight", () => {
    const local = oracle(readings, "compact", "--ds-collection-header-padding-inline", "padding-left");
    expect(paddingInline(drills.layeredHeavy, "compact")).toBe(local);
    expect(paddingInline(drills.unlayeredLighter, "compact")).toBe(local);
    expect(paddingInline(drills.unlayeredHeavier, "compact")).toBe(OVERRIDE);
  });

  it("(c) the compiler projects exactly the collection-header channels whose value reads a density-scope name", () => {
    expect(DENSITY_AXIS.has("--ds-spacing-2")).toBe(true);
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
    for (const channel of MASKED_CHANNELS) {
      expect({ channel, reads: PRODUCED[channel] }).toEqual({ channel, reads: expect.stringContaining(MASKED[channel].input) });
    }

    const projected = Object.keys(COMPILED.densityScopeBlock?.cssVariables ?? {}).filter((channel) =>
      PRODUCES.has(channel)
    );
    expect(projected.sort()).toEqual(densityExposed);
    for (const channel of projected) {
      expect(COMPILED.densityScopeBlock?.cssVariables[channel]).toBe(COMPILED.cssVariables[channel]);
    }
  });
});
