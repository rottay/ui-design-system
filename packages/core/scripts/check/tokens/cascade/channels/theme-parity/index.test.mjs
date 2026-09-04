import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { packageRoot as findPackageRoot } from "../../../../../libraries/repo-root/index.mjs";
import { evaluateObligations } from "./index.mjs";

import {
  auditDataOnlyProjections,
  buildParityCounters,
  buildThemeChannelParityGraph,
  collectDeclaredThemeFields,
  DATA_ONLY_THEME_PROJECTIONS,
  evaluateParityBaseline,
  extractConsumedCssVariables,
  extractStringArrayExport,
  parseEmitterMappings,
  parseTypeRegistry,
} from "../../../../../libraries/tokens/index.mjs";

const contract = `
export interface BrandTheme {
  id: string;
  palette?: Palette;
  chrome?: Chrome;
}
export interface Palette { primary: string; forgotten?: string; }
export interface Chrome { card?: Card; repeated?: Card; }
export interface Card { bg?: string; border?: string; }
`;

test("declaration parser follows typed visual roots and deduplicates reused owners", () => {
  const { registry } = parseTypeRegistry([
    { file: "theme.ts", text: contract },
  ]);
  const { fields, unresolved } = collectDeclaredThemeFields(registry);
  assert.equal(unresolved.length, 0);
  assert.ok(fields.has("Palette.primary"));
  assert.ok(fields.has("Card.bg"));
  assert.deepEqual(fields.get("Card.bg").themePaths, [
    "chrome.card.bg",
    "chrome.repeated.bg",
  ]);
  assert.ok(
    !fields.has("BrandTheme.id"),
    "non-visual metadata root is excluded"
  );
});

test("emitter parser resolves aliases, helper literal domains and typed owners", () => {
  const { registry } = parseTypeRegistry([
    { file: "theme.ts", text: contract },
  ]);
  const emitter = `
function cardVars(vars: Record<string, string>, prefix: string, card: Partial<Card> | undefined) {
  if (!card) return;
  if (card.bg) vars[\`--ds-\${prefix}-bg\`] = card.bg;
  if (card.border) vars[\`--ds-\${prefix}-border\`] = card.border;
}
export function emit(theme: BrandTheme) {
  const vars: Record<string, string> = { '--ds-fixed': '1' };
  const p = theme.palette;
  if (p?.primary) vars['--ds-color-primary'] = p.primary;
  cardVars(vars, 'card', theme.chrome?.card);
  cardVars(vars, 'repeated-card', theme.chrome?.repeated);
  return vars;
}
`;
  const parsed = parseEmitterMappings(
    [{ file: "emitter.ts", text: emitter }],
    registry
  );
  const names = new Set(
    parsed.emissions.map((entry) => entry.name).filter(Boolean)
  );
  assert.ok(names.has("--ds-card-bg"));
  assert.ok(names.has("--ds-repeated-card-border"));
  assert.ok(names.has("--ds-color-primary"));
  const primary = parsed.emissions.find(
    (entry) => entry.name === "--ds-color-primary"
  );
  assert.ok(primary.owners.includes("Palette.primary"));
  const card = parsed.emissions.find((entry) => entry.name === "--ds-card-bg");
  assert.ok(card.owners.includes("Card.bg"));
  const fixed = parsed.emissions.find((entry) => entry.name === "--ds-fixed");
  assert.deepEqual(fixed.owners, ["CompilerDerived.emit"]);
});

test("static exhaustive field maps credit concrete owned emissions; unused or untyped maps do not", () => {
  const { registry } = parseTypeRegistry([
    { file: "theme.ts", text: contract },
  ]);
  const emitter = `
const CARD_VARIABLES = {
  bg: "--ds-card-bg",
  border: "--ds-card-border",
} as const satisfies Readonly<Record<keyof Card, string>>;
const PALETTE_VARIABLES = chromeVariableMap<Palette>("--ds-palette-", [
  "primary",
  "forgotten",
] as const);
const DEAD_MAP = {
  bg: "--ds-dead-bg",
} as const satisfies Readonly<Record<keyof Card, string>>;
const UNTYPED_MAP = {
  bg: "--ds-untyped-bg",
};
export function emit(theme: BrandTheme) {
  const vars: Record<string, string> = {};
  setMapped(vars, theme.chrome?.card, CARD_VARIABLES);
  setMapped(vars, theme.palette, PALETTE_VARIABLES);
  setMapped(vars, theme.chrome?.card, UNTYPED_MAP);
  return vars;
}
`;
  const parsed = parseEmitterMappings(
    [{ file: "emitter.ts", text: emitter }],
    registry
  );
  const byName = new Map(
    parsed.emissions.filter((entry) => entry.name).map((entry) => [entry.name, entry])
  );
  assert.ok(byName.has("--ds-card-bg"));
  assert.deepEqual(byName.get("--ds-card-bg").owners, ["Card.bg"]);
  assert.deepEqual(byName.get("--ds-card-border").owners, ["Card.border"]);
  assert.ok(
    byName.has("--ds-palette-primary"),
    "chromeVariableMap entries are credited with the kebab transform"
  );
  assert.deepEqual(byName.get("--ds-palette-forgotten").owners, [
    "Palette.forgotten",
  ]);
  assert.ok(
    !byName.has("--ds-dead-bg"),
    "a map no emitter references credits nothing"
  );
  assert.ok(
    !byName.has("--ds-untyped-bg"),
    "a map without a registered contract type credits nothing"
  );
});

test("consumer parser ignores comments and override parser reads the closed array", () => {
  const consumed = extractConsumedCssVariables(
    `/* var(--ds-comment-only) */ .x { color: var(--ds-color-primary); }`,
    "skin.css"
  );
  assert.deepEqual([...consumed], ["--ds-color-primary"]);
  const overrides = extractStringArrayExport(
    `
      const ROLES = ['card', 'panel'] as const;
      const FACETS = ['bg', 'border'] as const;
      const GENERATED = ROLES.flatMap((role) =>
        FACETS.map((facet) => \`--ds-\${role}-\${facet}\` as const)
      );
      export const TOKENS = ['--ds-a', ...GENERATED, '--ds-b'] as const;
    `,
    "TOKENS"
  );
  assert.deepEqual(
    [...overrides],
    [
      "--ds-a",
      "--ds-card-bg",
      "--ds-card-border",
      "--ds-panel-bg",
      "--ds-panel-border",
      "--ds-b",
    ]
  );
});

test("graph reports all three parity defect classes conservatively", () => {
  const declarations = new Map([
    [
      "Palette.primary",
      { owner: "Palette.primary", themePaths: ["palette.primary"] },
    ],
    [
      "Palette.forgotten",
      { owner: "Palette.forgotten", themePaths: ["palette.forgotten"] },
    ],
  ]);
  const emissions = [
    { name: "--ds-color-primary", pattern: null, owners: ["Palette.primary"] },
    { name: "--ds-color-orphan", pattern: null, owners: ["Palette.primary"] },
    { name: "--ds-color-mystery", pattern: null, owners: [] },
  ];
  const consumers = new Map([
    ["--ds-color-primary", new Set(["a.css"])],
    ["--ds-color-mystery", new Set(["b.css"])],
  ]);
  const graph = buildThemeChannelParityGraph({
    declarations,
    emissions,
    routedOwners: new Set(),
    consumers,
    overrideTokens: new Set(),
  });
  assert.deepEqual(
    graph.issues.declaredButUnemitted.map((issue) => issue.id),
    ["Palette.forgotten"]
  );
  assert.deepEqual(
    graph.issues.emittedButUnconsumed.map((issue) => issue.id),
    ["--ds-color-orphan"]
  );
  assert.deepEqual(
    graph.issues.consumedButUnowned.map((issue) => issue.id),
    ["--ds-color-mystery"]
  );
});

test("baseline is decrease-only per category and owner/namespace bucket", () => {
  const graph = {
    issues: {
      declaredButUnemitted: [{ owner: "Palette.a" }, { owner: "Palette.b" }],
      emittedButUnconsumed: [{ variable: "--ds-card-a" }],
      consumedButUnowned: [],
    },
  };
  const counters = buildParityCounters(graph);
  const same = evaluateParityBaseline(counters, { ceilings: counters });
  assert.equal(same.ok, true);
  const regression = evaluateParityBaseline(counters, {
    ceilings: { ...counters, "declared-but-unemitted.Palette": 1 },
  });
  assert.equal(regression.ok, false);
  assert.match(regression.errors.join("\n"), /parity regression/);
});

// ---------------------------------------------------------------------------
// Data-only projection roster (PARITY-P0)
//
// The four `anatomy` leaves are data-only by contract: they select a code-owned
// skin through a root `data-anatomy-*` attribute and must never reach CSS. They
// leave the "declared-but-unemitted" census only through a closed roster whose
// every pair is proven from source, so the exemption cannot degrade into "any
// field we could not find an emitter for".
// ---------------------------------------------------------------------------

const anatomyContract = `
export interface BrandTheme {
  chrome?: BrandChrome;
}
export interface BrandChrome {
  cardComponent?: BrandCardChrome;
  table?: BrandTableChrome;
  sidebar?: BrandSidebarChrome;
  layout?: BrandLayoutChrome;
}
export interface BrandCardChrome {
  anatomy?: "default" | "framed" | "underline" | "ghost";
  bg?: string;
}
export interface BrandTableChrome {
  anatomy?: "default" | "ruled" | "zebra" | "open";
}
export interface BrandSidebarChrome {
  anatomy?: "default" | "rail" | "panel";
}
export interface BrandLayoutChrome {
  anatomy?: "default" | "flat" | "floating";
}
`;

const anatomyProjector = `
const ANATOMY_ATTRIBUTE_BY_FAMILY = {
  cardComponent: "data-anatomy-card",
  table: "data-anatomy-table",
  sidebar: "data-anatomy-sidebar",
  layout: "data-anatomy-layout",
} as const;
export function tenantThemeAnatomyAttributes(artifact: Artifact): Record<string, string> {
  const chrome = artifact.normalizedAppearance.advanced?.chrome;
  const attributes: Record<string, string> = {};
  if (!chrome) return attributes;
  for (const family of Object.keys(ANATOMY_ATTRIBUTE_BY_FAMILY) as Family[]) {
    const variant = chrome[family]?.anatomy;
    if (typeof variant !== "string" || variant === "default") continue;
    attributes[ANATOMY_ATTRIBUTE_BY_FAMILY[family]] = variant;
  }
  return attributes;
}
`;

function auditAnatomy({
  contract = anatomyContract,
  projector = anatomyProjector,
  emissions = [],
} = {}) {
  const { registry } = parseTypeRegistry([{ file: "theme.ts", text: contract }]);
  const { fields } = collectDeclaredThemeFields(registry, {
    visualRoots: ["chrome"],
  });
  return {
    fields,
    ...auditDataOnlyProjections({
      registry,
      declarations: fields,
      projectionSources: [{ file: "tenant-theme.ts", text: projector }],
      emissions,
    }),
  };
}

test("roster is exactly the four anatomy pairs and every pair is proven causally", () => {
  assert.deepEqual(
    DATA_ONLY_THEME_PROJECTIONS.map((entry) => `${entry.owner}=>${entry.attribute}`),
    [
      "BrandCardChrome.anatomy=>data-anatomy-card",
      "BrandLayoutChrome.anatomy=>data-anatomy-layout",
      "BrandSidebarChrome.anatomy=>data-anatomy-sidebar",
      "BrandTableChrome.anatomy=>data-anatomy-table",
    ]
  );
  const audit = auditAnatomy();
  assert.deepEqual(audit.violations, []);
  assert.deepEqual(
    [...audit.provenOwners].sort(),
    DATA_ONLY_THEME_PROJECTIONS.map((entry) => entry.owner).sort()
  );
  // Proof is positive: the attribute came from the projector's own closed map.
  assert.deepEqual(
    audit.projections.map((entry) => `${entry.family}.${entry.field}->${entry.attribute}`).sort(),
    [
      "cardComponent.anatomy->data-anatomy-card",
      "layout.anatomy->data-anatomy-layout",
      "sidebar.anatomy->data-anatomy-sidebar",
      "table.anatomy->data-anatomy-table",
    ]
  );
});

test("proven data-only owners leave the census; unproven ones stay in it", () => {
  const audit = auditAnatomy();
  const consumers = new Map();
  const exempted = buildThemeChannelParityGraph({
    declarations: audit.fields,
    emissions: [],
    consumers,
    dataProjectedOwners: audit.provenOwners,
  });
  assert.deepEqual(
    exempted.issues.declaredButUnemitted.map((issue) => issue.id),
    ["BrandCardChrome.bg"],
    "only the real CSS leaf remains unemitted debt"
  );
  const unexempted = buildThemeChannelParityGraph({
    declarations: audit.fields,
    emissions: [],
    consumers,
    dataProjectedOwners: new Set(),
  });
  assert.equal(
    unexempted.issues.declaredButUnemitted.length,
    5,
    "without proof the four anatomy leaves are still counted"
  );
});

test("mutant: a data-only projection outside the roster is red", () => {
  const audit = auditAnatomy({
    projector: anatomyProjector.replace(
      '  layout: "data-anatomy-layout",',
      '  layout: "data-anatomy-layout",\n  modal: "data-anatomy-modal",'
    ),
  });
  assert.match(
    audit.violations.join("\n"),
    /unrostered data-only projection: data-anatomy-modal <- \[modal\]\.anatomy/
  );
});

test("mutant: a rostered pair with no source projection is red", () => {
  const audit = auditAnatomy({
    projector: anatomyProjector.replace('  table: "data-anatomy-table",\n', ""),
  });
  assert.match(
    audit.violations.join("\n"),
    /BrandTableChrome\.anatomy: no compiler source projects chrome\.table\.anatomy into a data-\* attribute/
  );
  assert.ok(!audit.provenOwners.has("BrandTableChrome.anatomy"));
  assert.ok(
    audit.provenOwners.has("BrandCardChrome.anatomy"),
    "the failure is per pair, not a blanket amnesty"
  );

  const dropped = auditAnatomy({
    projector: anatomyProjector.replace(
      "attributes[ANATOMY_ATTRIBUTE_BY_FAMILY[family]] = variant;",
      "attributes.somethingElse = variant;"
    ),
  });
  assert.equal(dropped.provenOwners.size, 0, "no write to the closed attribute domain proves nothing");
  assert.equal(dropped.violations.length, 4);

  const unguarded = auditAnatomy({
    projector: anatomyProjector.replace(' || variant === "default"', ""),
  });
  assert.match(
    unguarded.violations.join("\n"),
    /never guards the neutral value "default"/
  );
});

test("mutant: a rostered data-only field that emits a --ds variable is red", () => {
  const audit = auditAnatomy({
    emissions: [
      {
        name: "--ds-card-anatomy",
        pattern: null,
        owners: ["BrandCardChrome.anatomy"],
      },
    ],
  });
  assert.match(
    audit.violations.join("\n"),
    /BrandCardChrome\.anatomy: declared data-only but emits CSS variable\(s\) --ds-card-anatomy/
  );
  assert.ok(!audit.provenOwners.has("BrandCardChrome.anatomy"));
});

test("mutant: a CSS field disguised as data-only is red", () => {
  const openTyped = auditAnatomy({
    contract: anatomyContract.replace(
      '  anatomy?: "default" | "framed" | "underline" | "ghost";',
      "  anatomy?: string;"
    ),
  });
  assert.match(
    openTyped.violations.join("\n"),
    /BrandCardChrome\.anatomy: data-only fields must declare a closed string-literal union/
  );

  const noNeutral = auditAnatomy({
    contract: anatomyContract.replace(
      '  anatomy?: "default" | "framed" | "underline" | "ghost";',
      '  anatomy?: "framed" | "underline";'
    ),
  });
  assert.match(
    noNeutral.violations.join("\n"),
    /is missing the neutral value "default"/
  );

  const rerouted = auditAnatomy({
    contract: anatomyContract.replace(
      "  cardComponent?: BrandCardChrome;",
      "  cardComponent?: BrandTableChrome;"
    ),
  });
  assert.match(
    rerouted.violations.join("\n"),
    /chrome\.cardComponent\.anatomy: resolves to BrandTableChrome\.anatomy, not rostered BrandCardChrome\.anatomy/
  );
});

/* -------------------------------------------------------------------------- */
/* transitional obligations                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The instrument that replaced an opaque ceiling for
 * `declared-but-unemitted.BrandSegmentedChrome`. A ceiling would have made the
 * red vanish and recorded nothing; these drills pin that the obligation is
 * exact, expires structurally, and cannot be used as a second baseline.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const shippedLedger = JSON.parse(readFileSync(join(HERE, "obligations/index.json"), "utf8"));

/**
 * The obligation the mechanism was written for is DISCHARGED: its `ownerLot`
 * was C2, its resolution was DELETE_DECLARATION, and its expiry fired the
 * moment C2 relocated the lowering out of `kernel/runtime/brand-theme`. The
 * shipped ledger is therefore empty — asserted below — and the machinery keeps
 * its full coverage against this synthetic ledger, which is what stops an
 * emptied file from quietly retiring the drills with it.
 */
const ledger = {
  version: 1,
  obligations: [
    {
      id: "declared-but-unemitted.BrandSegmentedChrome",
      count: 2,
      fields: [
        "BrandSegmentedChrome.itemShadowSelected",
        "BrandSegmentedChrome.focusRing",
      ],
      ownerLot: "C2",
      resolution: "DELETE_DECLARATION",
      reason: "Synthetic fixture for the obligation drills; the shipped one is discharged.",
      declaringOwner: "src/foundation/contracts/composition/tenants/themes/index.ts",
      legacyEmitterOwners: [
        "src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts",
      ],
      expiry: { kind: "legacy-owner-relocation", note: "Fires when the owner moves." },
    },
  ],
};
const baseline = JSON.parse(readFileSync(join(HERE, "baseline/index.json"), "utf8"));

const LIVE_FIELDS = new Set([
  "BrandSegmentedChrome.itemShadowSelected",
  "BrandSegmentedChrome.focusRing",
]);
const options = { resolveOwner: () => LIVE_FIELDS };
const COUNTERS = { "declared-but-unemitted.BrandSegmentedChrome": 2 };

test("Q1: the shipped ledger is empty because C2 discharged its only obligation", () => {
  // The expiry was written to fire on exactly this lot, and it did: the two
  // declarations are gone from `BrandSegmentedChrome` and the entry with them.
  assert.deepEqual(shippedLedger.obligations, []);
  // Scoped to the ONE interface: `focusRing` is a live field on several other
  // chrome families, so a whole-file search would pass for the wrong reason.
  const contracts = readFileSync(
    join(CORE_ROOT, "src/foundation/contracts/composition/tenants/themes/index.ts"),
    "utf8",
  );
  const segmented = contracts.slice(
    contracts.indexOf("export interface BrandSegmentedChrome {"),
  );
  const body = segmented.slice(0, segmented.indexOf("\n}"));
  assert.ok(body.includes("itemBgSelected"), "the interface itself must still be here");
  assert.ok(!body.includes("itemShadowSelected"));
  assert.ok(!body.includes("focusRing"));
});

test("Q1b: the obligation shape is still validated, against a synthetic ledger", () => {
  assert.equal(ledger.obligations.length, 1);
  const [obligation] = ledger.obligations;
  for (const field of ["id", "ownerLot", "resolution", "reason", "declaringOwner"]) {
    assert.ok(typeof obligation[field] === "string" && obligation[field].trim().length > 0, field);
  }
  assert.equal(obligation.count, 2);
  assert.ok(obligation.expiry && typeof obligation.expiry.kind === "string");
  assert.ok(obligation.legacyEmitterOwners.length >= 1);
  for (const owner of [...obligation.legacyEmitterOwners, obligation.declaringOwner]) {
    assert.ok(existsSync(join(CORE_ROOT, owner)), `${owner} must exist while the obligation is open`);
  }
  const { failures, consumed } = evaluateObligations(ledger, COUNTERS, options);
  assert.deepEqual(failures, []);
  assert.equal(consumed.size, 1);
});

test("Q3/M8/M10: an obligation id may never also be a ceiling", () => {
  assert.equal(
    Object.hasOwn(baseline.ceilings, "declared-but-unemitted.BrandSegmentedChrome"),
    false,
    "the opaque-ceiling route must stay closed",
  );
  assert.ok(baseline._adoptions, "the reviewed adoption prose must still be in the baseline");
});

test("M4/M5/M6: the count is exact in BOTH directions", () => {
  const grew = evaluateObligations(ledger, { "declared-but-unemitted.BrandSegmentedChrome": 3 }, options);
  assert.match(grew.failures.join(""), /count mismatch: expected 2, measured 3/);
  const shrank = evaluateObligations(ledger, { "declared-but-unemitted.BrandSegmentedChrome": 1 }, options);
  assert.match(shrank.failures.join(""), /count mismatch: expected 2, measured 1/);
  const bogus = {
    obligations: [{ ...ledger.obligations[0], count: 99 }],
  };
  assert.match(evaluateObligations(bogus, COUNTERS, options).failures.join(""), /expected 99, measured 2/);
});

test("M1/M2/M11: a missing or fabricated legacy owner expires the obligation immediately", () => {
  const moved = {
    obligations: [{ ...ledger.obligations[0], legacyEmitterOwners: ["src/infrastructure/compilers/gone/index.ts"] }],
  };
  assert.match(
    evaluateObligations(moved, COUNTERS, options).failures.join(""),
    /EXPIRED: legacy owner .* no longer exists/,
  );
});

test("M3: a moved declaring owner expires the obligation", () => {
  const renamed = {
    obligations: [{ ...ledger.obligations[0], declaringOwner: "src/foundation/contracts/composition/tenants/theme/index.ts" }],
  };
  assert.match(
    evaluateObligations(renamed, COUNTERS, options).failures.join(""),
    /EXPIRED: declaring owner moved/,
  );
});

test("M7: an obligation stripped of its metadata is rejected, not skipped", () => {
  const stripped = { obligations: [{ id: "x", count: 1 }] };
  const failures = evaluateObligations(stripped, { x: 1 }, options).failures.join("");
  assert.match(failures, /is missing ownerLot/);
  assert.match(failures, /is missing reason/);
  assert.match(failures, /is missing an expiry/);
});

test("Q2/Q6: the obligation suppresses exactly one bucket and nothing else", () => {
  // Resolution path: with the fields gone, the bucket disappears and the
  // obligation reports itself as needing deletion rather than passing silently.
  const resolved = evaluateObligations(ledger, {}, options);
  assert.match(resolved.failures.join(""), /names a bucket the census no longer reports/);

  // And a field that stops being unemitted is reported by name.
  const partially = evaluateObligations(ledger, COUNTERS, {
    resolveOwner: () => new Set(["BrandSegmentedChrome.focusRing"]),
  });
  assert.match(partially.failures.join(""), /no longer unemitted: BrandSegmentedChrome.itemShadowSelected/);
});

test("Q7: both retired channels are dead across src, asserted rather than assumed", () => {
  // The retirement is enforced, not merely documented: if either channel came
  // back, the obligation's reason would be false and the C2 sweep wrong.
  const roots = [join(CORE_ROOT, "src")];
  const found = { "--ds-segmented-focus-ring": 0, "--ds-segmented-item-shadow-selected": 0 };
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const absolute = join(dir, entry.name);
      if (entry.isDirectory()) { walk(absolute); continue; }
      if (!/\.(ts|tsx|css)$/.test(entry.name)) continue;
      const source = readFileSync(absolute, "utf8");
      for (const channel of Object.keys(found)) {
        // A prose mention in a comment is not a declaration or a read.
        const declared = source.includes(`${channel}:`);
        const read = source.includes(`var(${channel}`);
        if (declared || read) found[channel] += 1;
      }
    }
  };
  for (const root of roots) walk(root);
  assert.deepEqual(found, {
    "--ds-segmented-focus-ring": 0,
    "--ds-segmented-item-shadow-selected": 0,
  });
});

test("Q8: the canonical channel that supersedes focusRing is real and read", () => {
  const themes = join(CORE_ROOT, "src/foundation/tokens/css/foundation/themes/default/index.css");
  assert.ok(existsSync(themes), "the default theme must exist for the duplication proof to hold");
  assert.match(readFileSync(themes, "utf8"), /--ds-focus-ring\s*:/);
  const segmented = join(
    CORE_ROOT,
    "src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css",
  );
  assert.ok(existsSync(segmented));
  assert.match(readFileSync(segmented, "utf8"), /var\(--ds-focus-ring/);
});
