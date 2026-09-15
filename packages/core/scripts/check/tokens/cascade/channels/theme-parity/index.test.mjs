import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { packageRoot as findPackageRoot } from "../../../../../libraries/repo-root/index.mjs";
import {
  categoryOf,
  collectEmitterOwners,
  deductObligations,
  evaluateObligations,
  runThemeChannelParityGate,
} from "./index.mjs";

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
export interface FlatTheme {
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
    !fields.has("FlatTheme.id"),
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
export function emit(theme: FlatTheme) {
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
export function emit(theme: FlatTheme) {
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
export interface FlatTheme {
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
 * ledger now carries ONE live entry instead, `emitted-but-unconsumed.posture`
 * (owner INV-07) — asserted below — and the machinery keeps its full coverage
 * against this synthetic ledger, which is what stops a change of contents
 * from quietly retiring the drills with it.
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

test("Q1: C2's obligation is discharged and the ledger carries only INV-07's", () => {
  // The expiry was written to fire on exactly that lot, and it did: the two
  // declarations are gone from `BrandSegmentedChrome` and the entry with them.
  assert.equal(
    shippedLedger.obligations.some((entry) => entry.id.includes("BrandSegmentedChrome")),
    false,
  );
  assert.deepEqual(
    shippedLedger.obligations.map((entry) => entry.id),
    ["emitted-but-unconsumed.posture"],
  );
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

/* ---------------------------------------------------------------------- */
/* The emitter inventory is a TREE walk                                    */
/* ---------------------------------------------------------------------- */

/**
 * A field is `declared-but-unemitted` when the compiler does not emit it. It
 * is NOT unemitted when the inventory failed to open the file that emits it,
 * and the two must never produce the same red: the first is a hole in the
 * product, the second is a hole in the instrument. These drills hold the
 * difference from both ends -- a planted emission that only a nested owner
 * performs, and the shipped tree read once with each inventory.
 */

/** The pre-tree inventory, kept here as the mutant the walk has to beat. */
function oneLevelInventory() {
  const lowering = join(
    CORE_ROOT,
    "src/infrastructure/compilers/runtime/theme/runtime/lowering",
  );
  return [
    join(CORE_ROOT, "src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts"),
    ...readdirSync(join(lowering, "foundation")).sort().map((owner) => join(lowering, "foundation", owner, "index.ts")),
    ...readdirSync(join(lowering, "runtime")).sort().map((owner) => join(lowering, "runtime", owner, "index.ts")),
    join(lowering, "index.ts"),
  ];
}

test("DRILL: an emission only a nested owner performs is seen; a fixture's is not", () => {
  const planted = mkdtempSync(join(tmpdir(), "theme-parity-nested-"));
  const family = join(planted, "family");
  mkdirSync(join(family, "nested"), { recursive: true });
  mkdirSync(join(family, "tests"), { recursive: true });

  // The parent composes and never names the field — exactly the shape that
  // made BrandMotion.character look unemitted.
  writeFileSync(
    join(family, "index.ts"),
    `import { nestedVars } from "./nested";
export function familyVars(vars: Record<string, string>, card: Partial<Card> | undefined) {
  nestedVars(vars, card);
}
`,
  );
  writeFileSync(
    join(family, "nested", "index.ts"),
    `export function nestedVars(vars: Record<string, string>, card: Partial<Card> | undefined) {
  if (card?.bg) vars["--ds-drill-nested-bg"] = card.bg;
}
`,
  );
  // Same shape, inside tests/: it must stay out of the inventory, or a fixture
  // could certify any field as emitted.
  writeFileSync(
    join(family, "tests", "index.ts"),
    `export function fixtureVars(vars: Record<string, string>, card: Partial<Card> | undefined) {
  if (card?.border) vars["--ds-drill-fixture-border"] = card.border;
}
`,
  );

  assert.deepEqual(
    collectEmitterOwners(planted).map((file) => relative(planted, file)),
    ["family/index.ts", "family/nested/index.ts"],
  );

  const { registry } = parseTypeRegistry([{ file: "theme.ts", text: contract }]);
  const emitted = (files) =>
    new Set(
      parseEmitterMappings(
        files.map((file) => ({ file, text: readFileSync(file, "utf8") })),
        registry,
      ).emissions.map((emission) => emission.name),
    );

  assert.ok(
    !emitted([join(family, "index.ts")]).has("--ds-drill-nested-bg"),
    "the parent alone is blind to it — this is the defect the walk repairs",
  );
  const walked = emitted(collectEmitterOwners(planted));
  assert.ok(walked.has("--ds-drill-nested-bg"), "the nested owner's emission is seen");
  assert.ok(!walked.has("--ds-drill-fixture-border"), "a fixture never emits");

  rmSync(planted, { recursive: true, force: true });
});

test("DRILL: the four kit decisions their nested owners derive are emitted", () => {
  // Each of the four is read by a sub-owner the parent only composes.
  const nestedOwners = [
    "src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/elevation/border/index.ts",
    "src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/motion/character/index.ts",
    "src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/numeric/index.ts",
    "src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/roles/index.ts",
    "src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/weights/index.ts",
  ];
  const fields = [
    "BrandMotion.character",
    "BrandSurfaces.borderStyle",
    "BrandTypography.numeric",
    "BrandTypography.roleWeights",
  ];

  const shipped = runThemeChannelParityGate();
  const inventory = new Set(shipped.analysis.emitterFiles);
  for (const owner of nestedOwners) {
    assert.ok(inventory.has(owner), `the shipped inventory must reach ${owner}`);
  }
  const unemitted = new Set(shipped.graph.issues.declaredButUnemitted.map((issue) => issue.id));
  for (const field of fields) {
    assert.ok(!unemitted.has(field), `${field} is derived by a nested owner and is not unemitted`);
  }

  // The mutant: put the one-level inventory back and every one of the four
  // returns. That is what makes this a drill and not a snapshot.
  const regressed = runThemeChannelParityGate({ emitterFiles: oneLevelInventory() });
  const blind = new Set(regressed.graph.issues.declaredButUnemitted.map((issue) => issue.id));
  for (const field of fields) {
    assert.ok(blind.has(field), `${field} must be reported unemitted under the one-level read`);
  }
  assert.ok(
    blind.size > unemitted.size,
    "the one-level read reports strictly more, and every extra is an instrument defect",
  );
});

/* -------------------------------------------------------------------------- */
/* generated emitters, and the roll-up an obligation is netted out of          */
/* -------------------------------------------------------------------------- */

/** Declared fields with no emitter edge, for an arbitrary emitter inventory. */
function unemittedUnder(files) {
  const { registry } = parseTypeRegistry([{ file: "theme.ts", text: contract }]);
  const { fields } = collectDeclaredThemeFields(registry);
  const emitted = parseEmitterMappings(
    files.map((file) => ({ file, text: readFileSync(file, "utf8") })),
    registry,
  );
  const graph = buildThemeChannelParityGraph({
    declarations: fields,
    emissions: emitted.emissions,
    routedOwners: emitted.routedOwners,
    consumers: new Map(),
    overrideTokens: new Set(),
    dataProjectedOwners: new Set(),
  });
  return new Set(graph.issues.declaredButUnemitted.map((issue) => issue.id));
}

test("DRILL: an unimported __generated__ emitter cannot certify a channel; an imported one can", () => {
  const planted = mkdtempSync(join(tmpdir(), "theme-parity-generated-"));
  const family = join(planted, "family");
  mkdirSync(join(family, "__generated__"), { recursive: true });

  const composing = `export function familyVars(vars: Record<string, string>, card: Partial<Card> | undefined) {
  if (card?.bg) vars["--ds-card-bg"] = card.bg;
}
`;
  writeFileSync(join(family, "index.ts"), composing);
  // Nonproductive generated code: it writes the channel, nothing imports it.
  writeFileSync(
    join(family, "__generated__", "index.ts"),
    `export function generatedVars(vars: Record<string, string>, card: Partial<Card> | undefined) {
  if (card?.border) vars["--ds-card-border"] = card.border;
}
`,
  );

  const walked = collectEmitterOwners(planted);
  assert.deepEqual(
    walked.map((file) => relative(planted, file)),
    ["family/index.ts"],
    "an unimported generated owner is not in the inventory",
  );
  assert.ok(
    unemittedUnder(walked).has("Card.border"),
    "the real finding survives the plant — this is the false negative the productivity test closes",
  );

  // THE MUTANT: admit the generated file anyway, exactly as the inventory did
  // before the productivity test, and the finding disappears with nothing
  // productive emitting the channel.
  const naive = [join(family, "index.ts"), join(family, "__generated__", "index.ts")];
  assert.ok(
    !unemittedUnder(naive).has("Card.border"),
    "without the productivity test a nonproductive file certifies the emission",
  );

  // THE OTHER DIRECTION: a generated owner a productive owner imports is a
  // real emitter and must be admitted, or the fix would invent findings.
  writeFileSync(
    join(family, "index.ts"),
    `import { generatedVars } from "./__generated__";\n${composing}`,
  );
  const imported = collectEmitterOwners(planted);
  assert.deepEqual(
    imported.map((file) => relative(planted, file)),
    ["family/__generated__/index.ts", "family/index.ts"],
  );
  assert.ok(!unemittedUnder(imported).has("Card.border"));

  // And transitively: generated -> generated is still productive.
  mkdirSync(join(family, "__generated__", "deep"), { recursive: true });
  writeFileSync(
    join(family, "__generated__", "deep", "index.ts"),
    `export function deepVars(vars: Record<string, string>, card: Partial<Card> | undefined) {
  if (card?.border) vars["--ds-deep-border"] = card.border;
}
`,
  );
  writeFileSync(
    join(family, "__generated__", "index.ts"),
    `export * from "./deep";
export function generatedVars(vars: Record<string, string>, card: Partial<Card> | undefined) {
  if (card?.border) vars["--ds-card-border"] = card.border;
}
`,
  );
  assert.ok(
    collectEmitterOwners(planted).some((file) => file.endsWith("__generated__/deep/index.ts")),
    "the fixpoint reaches a generated owner imported only by another generated owner",
  );

  rmSync(planted, { recursive: true, force: true });
});

test("DRILL: only a runtime reference makes a generated emitter productive", () => {
  // The productivity test is a claim about what RUNS. A reference that type
  // erasure removes leaves the generated owner as unimported as an absent
  // line, so it must not certify the channel — a commented-out import that
  // counted would silently retire a real declared-but-unemitted finding.
  const generated = `export function generatedVars(vars: Record<string, string>, card: Partial<Card> | undefined) {
  if (card?.border) vars["--ds-card-border"] = card.border;
}
export type GeneratedVars = typeof generatedVars;
export class GeneratedEmitter {}
`;
  const composing = `export function familyVars(vars: Record<string, string>, card: Partial<Card> | undefined) {
  if (card?.bg) vars["--ds-card-bg"] = card.bg;
}
`;
  const underReference = (reference) => {
    const planted = mkdtempSync(join(tmpdir(), "theme-parity-erasure-"));
    const family = join(planted, "family");
    mkdirSync(join(family, "__generated__"), { recursive: true });
    writeFileSync(join(family, "__generated__", "index.ts"), generated);
    writeFileSync(join(family, "index.ts"), `${reference}${composing}`);
    const owners = collectEmitterOwners(planted);
    const outcome = {
      admitted: owners.some((file) => file.endsWith("__generated__/index.ts")),
      unemitted: unemittedUnder(owners).has("Card.border"),
    };
    rmSync(planted, { recursive: true, force: true });
    return outcome;
  };

  const erased = {
    "a line comment": `// import { generatedVars } from "./__generated__";\n`,
    "a block comment": `/* see ./__generated__ — import { generatedVars } from "./__generated__" */\n`,
    "a docblock mention": `/**\n * Emitted by ./__generated__/index.ts.\n */\n`,
    "a string mention": `const NOTE = "generated by ./__generated__";\n`,
    "an import type": `import type { GeneratedVars } from "./__generated__";\n`,
    "an inline type specifier": `import { type GeneratedVars } from "./__generated__";\n`,
    "an export type re-export": `export type { GeneratedVars } from "./__generated__";\n`,
    // Text that PARSES like an import is still text. A literal is data the
    // module never executes, so quoting the import — in either quote, or in a
    // template — must leave the owner as unimported as leaving the line out.
    "a quoted import statement": `const DOC = "import { generatedVars } from './__generated__';";\n`,
    "a quoted import with the quotes swapped": `const DOC = 'import { generatedVars } from "./__generated__";';\n`,
    "a quoted dynamic import": `const DOC = "await import('./__generated__')";\n`,
    "a template literal naming the import": "const DOC = `import { generatedVars } from './__generated__';`;\n",
    "a quoted import after a regex literal holding quotes": `const RE = /['"]\\/;/;\nconst DOC = "import { generatedVars } from './__generated__';";\n`,
    // A REGEX LITERAL AFTER CONTROL FLOW is still a literal. `/` opens a regex
    // whenever the previous token cannot end an expression, and the closing
    // bracket of a control-flow head or of a block cannot: reading either as
    // division walked into the literal and read the specifier inside it as an
    // import that nothing runs.
    "a regex after an if condition": `if (true) /[import("./__generated__")]/.test("sample");\n`,
    "a regex after a closing block": `if (true) {} /[require("./__generated__")]/.test("sample");\n`,
    "a regex after a while condition": `while (false) /[import("./__generated__")]/.test("sample");\n`,
    "a regex after an empty for head": `for (;;) /[import("./__generated__")]/.test("sample");\n`,
    "a regex after a switch block": `switch (1) {} /[import("./__generated__")]/.test("sample");\n`,
    "a regex returned from a function": `function pattern() { return /[import("./__generated__")]/; }\n`,
    // An import TYPE QUERY is erased with the type that holds it: `typeof
    // import(...)`, an alias right-hand side and an annotation all describe the
    // module's shape and none of them loads it.
    "a typeof import type query": `type GeneratedModule = typeof import("./__generated__");\nexport type { GeneratedModule };\n`,
    "an import type query in a type alias": `type Vars = import("./__generated__").GeneratedVars;\nexport type { Vars };\n`,
    "an import type query in an annotation": `export function take(mod: import("./__generated__").GeneratedVars) { return mod; }\n`,
    // PARENTHESES DO NOT MOVE A REFERENCE INTO VALUE POSITION: a redundant
    // grouping around an import type is the same annotation and erases with it.
    "a parenthesized import type in an annotation": `export let x: (import("./__generated__").GeneratedVars);\nexport type X = typeof x;\n`,
    "a doubly parenthesized import type": `export let x: ((import("./__generated__").GeneratedVars));\nexport type X = typeof x;\n`,
    "a parenthesized import type in a parameter": `export function take(mod: (import("./__generated__").GeneratedVars)) { return mod; }\n`,
    "a parenthesized typeof import query": `type GeneratedModule = (typeof import("./__generated__"));\nexport type { GeneratedModule };\n`,
    // And an object type separates MEMBERS with `;`, so the alias erasure has
    // to end at the `;` outside every bracket rather than at the first one.
    "an import type in an object type alias": `type Shape = {\n  first: string;\n  generated: import("./__generated__").GeneratedVars;\n};\nexport type { Shape };\n`,
    "a parenthesized import type in an object type alias": `type Shape = {\n  first: string;\n  generated: (import("./__generated__").GeneratedVars);\n};\nexport type { Shape };\n`,
    "an import type as a generic argument": `export type Wrapped = Array<import("./__generated__").GeneratedVars>;\n`,
    // A regex literal is a literal wherever the GRAMMAR puts one, and the
    // grammar knows shapes an approximation of it kept missing: `for await`
    // is a for-head like any other, and a statement terminated by automatic
    // semicolon insertion ends before the `/` on the next line.
    "a regex after a for-await head": `async function scan() { for await (const item of []) /[import("./__generated__")]/.test("sample"); }\n`,
    "a regex after an ASI-terminated debugger": `debugger\n/[import("./__generated__")]/.test("sample");\n`,
    "a regex after an ASI-terminated block": `{\n}\n/[require("./__generated__")]/.test("sample");\n`,
    "a regex after a do-while body": `do {} while (false)\n/[import("./__generated__")]/.test("sample");\n`,
    // A type position is a type position however the type is PARAMETERIZED: a
    // generic parameter carrying a default holds an `=` that has nothing to do
    // with the alias's own `=`, and only a parse can tell the two apart.
    "an import type in a defaulted generic alias": `type Shape<T = string> = import("./__generated__").GeneratedVars;\nexport type { Shape };\n`,
    "an import type in a multiply defaulted generic alias": `type Pair<A = string, B = Array<number>> = [A, B, import("./__generated__").GeneratedVars];\nexport type { Pair };\n`,
    "an import type in a defaulted generic interface": `export interface Holder<T = string> {\n  held: T;\n  generated: import("./__generated__").GeneratedVars;\n}\n`,
    "an import type in a conditional type": `type Pick<T> = T extends string ? import("./__generated__").GeneratedVars : never;\nexport type { Pick };\n`,
    "an import type as a satisfies operand": `export const shape = {} satisfies Partial<import("./__generated__").GeneratedVars>;\n`,
    // A heritage clause is type-space that PARSES as an expression, so these
    // hold a real call node and still erase. `class extends` is the one
    // heritage clause that runs, and it is a positive control below.
    "an import type in an interface extends clause": `interface Local extends import("./__generated__").GeneratedVars {}\nexport type { Local };\n`,
    "an import type in a class implements clause": `export class Local implements import("./__generated__").GeneratedVars {}\n`,
    "an import type in a generic interface extends clause": `interface Local<T = string> extends Partial<import("./__generated__").GeneratedVars> { held: T }\nexport type { Local };\n`,
    // AN AMBIENT DECLARATION ERASES THE CLAUSES THAT OTHERWISE RUN. A
    // `declare class` holds the one heritage clause that executes and a
    // `declare namespace` may hold an import-equals, but a `declare` subtree
    // is deleted whole, so neither loads the generated owner — reading the
    // heritage as a value reference retired a real finding from pure
    // type-space.
    "an ambient class extends clause": `declare class Local extends import("./__generated__").GeneratedEmitter {}\n`,
    "an exported ambient class extends clause": `export declare class Local extends import("./__generated__").GeneratedEmitter {}\n`,
    "an ambient class extending a required base": `declare class Local extends require("./__generated__").GeneratedEmitter {}\n`,
    "an ambient class extends clause with type arguments": `declare class Local extends import("./__generated__").GeneratedEmitter<string> {}\n`,
    "an ambient namespace holding an import-equals": `declare namespace Ambient {\n  import Generated = require("./__generated__");\n}\n`,
    "an ambient namespace holding a class extends clause": `declare namespace Ambient {\n  class Local extends import("./__generated__").GeneratedEmitter {}\n}\n`,
    "an ambient module augmentation holding a value import": `declare module "./neighbour" {\n  import { generatedVars } from "./__generated__";\n  export const held: typeof generatedVars;\n}\n`,
    "an ambient module augmentation holding a star re-export": `declare module "./neighbour" {\n  export * from "./__generated__";\n}\n`,
    "a global augmentation holding a class extends clause": `declare global {\n  class Local extends import("./__generated__").GeneratedEmitter {}\n}\nexport {};\n`,
  };
  for (const [shape, reference] of Object.entries(erased)) {
    const outcome = underReference(reference);
    assert.equal(outcome.admitted, false, `${shape} binds nothing at runtime and must not admit the owner`);
    assert.ok(outcome.unemitted, `${shape} must leave Card.border declared-but-unemitted`);
  }

  const binding = {
    "a named value import": `import { generatedVars } from "./__generated__";\n`,
    "a default import": `import generatedVars from "./__generated__";\n`,
    "a namespace import": `import * as generated from "./__generated__";\n`,
    "a mixed clause keeping one value": `import { type GeneratedVars, generatedVars } from "./__generated__";\n`,
    "a side-effect import": `import "./__generated__";\n`,
    "a value re-export": `export { generatedVars } from "./__generated__";\n`,
    "a star re-export": `export * from "./__generated__";\n`,
    "a dynamic import": `const load = () => import("./__generated__");\n`,
    "a require": `const generated = require("./__generated__");\n`,
    // The positive control for the type-query rule: a dynamic `import()` in
    // VALUE position does load the module, wherever the expression sits.
    "an awaited dynamic import": `export async function load() { return await import("./__generated__"); }\n`,
    "a dynamic import in an object property": `export const registry = { load: () => import("./__generated__") };\n`,
    // And the decoys must not SUPPRESS a real import that shares the file.
    "a real import beside a quoted decoy": `const DOC = "import { x } from './nowhere';";\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after a regex literal holding quotes": `const RE = /['"]\\/;/;\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after a URL in a line comment": `// see https://example.com/generated\nimport { generatedVars } from "./__generated__";\n`,
    // The positive controls for the regex rule. Skipping a real regex must not
    // eat the import beside it, and DIVISION must still be read as code: every
    // operand that can precede a `/` leaves the rest of the file scannable.
    "a real import after a regex following an if condition": `if (true) /['"]x/.test("sample");\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after a regex following a block": `if (true) {} /['"]x/.test("sample");\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after a division by a call result": `const ratio = fn() / 2;\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after a division by an indexed operand": `const ratio = sizes[0] / 2;\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after a division by a member": `const ratio = box.width / box.height;\nimport { generatedVars } from "./__generated__";\n`,
    // The positive controls for the alias erasure: an alias must be erased to
    // its own end and no further, whatever shape its body has.
    "a real import after a function type alias": `type Fn = (arg: string) => void;\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after an object type alias": `type Shape = {\n  first: string;\n  second: number;\n};\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after a multi-line union alias": `type Choice =\n  | "first"\n  | "second";\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after an alias with no semicolon": `type Bare = string\nimport { generatedVars } from "./__generated__";\n`,
    // The positive control for the parenthesis rule: a grouping around a VALUE
    // import still loads the module.
    "a parenthesized dynamic import": `export const load = () => (import("./__generated__"));\n`,
    "an awaited parenthesized dynamic import": `export async function load() { return await (import("./__generated__")); }\n`,
    "a dynamic import inside a block": `export function load() { if (true) { import("./__generated__"); } }\n`,
    // The positive controls for the parser's statement recognition: skipping a
    // real regex, a for-await head, an ASI boundary or a defaulted generic
    // alias must not eat the import that follows it.
    "a real import after a for-await loop": `export async function scan() { for await (const item of []) console.log(item); }\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after a debugger statement": `export function stop() { debugger }\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after a defaulted generic alias": `type Shape<T = string> = { held: T };\nimport { generatedVars } from "./__generated__";\nexport type { Shape };\n`,
    "a real import after a defaulted generic interface": `export interface Holder<T = string> { held: T }\nimport { generatedVars } from "./__generated__";\n`,
    "a dynamic import in a for-await head": `export async function load() { for await (const mod of [import("./__generated__")]) void mod; }\n`,
    "a dynamic import interpolated into a template": "export const note = `${import(\"./__generated__\")}`;\n",
    "an import-equals require": `import generated = require("./__generated__");\nexport const held = generated;\n`,
    "a dynamic import in a class extends clause": `export class Local extends (import("./__generated__") as never) {}\n`,
    // The positive controls for the ambience rule: the exclusion is about
    // `declare`, not about `extends`, `namespace` or the word "emitter". The
    // same clauses OUTSIDE an ambient declaration are real loads, and a
    // namespace without `declare` holds statements that really execute.
    "a class extending the generated emitter through a dynamic import": `export class Local extends (import("./__generated__").GeneratedEmitter as never) {}\n`,
    "a class extending the generated emitter through a require": `const { GeneratedEmitter } = require("./__generated__");\nexport class Local extends GeneratedEmitter {}\n`,
    "a class extending the generated emitter through a named import": `import { GeneratedEmitter } from "./__generated__";\nexport class Local extends GeneratedEmitter {}\n`,
    "a namespace holding an import-equals": `namespace Local {\n  import Generated = require("./__generated__");\n  export const held = Generated;\n}\n`,
    "a namespace holding a dynamic import": `namespace Local {\n  export const load = () => import("./__generated__");\n}\n`,
    // And the ambient subtree is skipped, not the file around it: a real
    // import beside a `declare` block must still admit the owner.
    "a real import beside an ambient class extends clause": `declare class Ambient extends import("./nowhere").Base {}\nimport { generatedVars } from "./__generated__";\n`,
    "a real import after an ambient module augmentation": `declare module "./neighbour" {\n  export const held: string;\n}\nimport { generatedVars } from "./__generated__";\n`,
  };
  for (const [shape, reference] of Object.entries(binding)) {
    const outcome = underReference(reference);
    assert.ok(outcome.admitted, `${shape} is a runtime reference and must admit the owner`);
    assert.equal(outcome.unemitted, false, `${shape} legitimately certifies Card.border`);
  }

  // The classification is about erasure, not about the word `type`: `{ type }`
  // and `{ type as T }` bind a value called `type` and survive.
  for (const reference of [
    `import { type } from "./__generated__";\n`,
    `import { type as GeneratedType } from "./__generated__";\n`,
  ]) {
    assert.ok(underReference(reference).admitted, "a binding named `type` is a value binding");
  }
});

test("the productivity test moves no number on the shipped lowering", () => {
  // Asserted relationally, not as a snapshot: the shipped inventory and an
  // inventory that admits every generated owner unconditionally produce the
  // SAME census, because the lowering has no generated owner at all. When one
  // appears, this comparison is what says whether it is productive.
  const lowering = join(CORE_ROOT, "src/infrastructure/compilers/runtime/theme/runtime/lowering");
  const naive = [join(CORE_ROOT, "src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts")];
  const walk = (dir) => {
    if (existsSync(join(dir, "index.ts"))) naive.push(join(dir, "index.ts"));
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || ["tests", "test", "fixtures", "__fixtures__", "stories"].includes(entry.name)) continue;
      walk(join(dir, entry.name));
    }
  };
  walk(lowering);

  const shipped = runThemeChannelParityGate();
  assert.deepEqual(
    shipped.analysis.emitterFiles.filter((file) => file.includes("__generated__")),
    [],
  );
  assert.deepEqual(shipped.analysis.emitterFiles.length, naive.length);
  assert.deepEqual(
    runThemeChannelParityGate({ emitterFiles: naive.sort() }).counters,
    shipped.counters,
  );
});

test("an obligated bucket is netted out of its category roll-up, exactly", () => {
  const counters = {
    "emitted-but-unconsumed.total": 208,
    "emitted-but-unconsumed.posture": 4,
    "emitted-but-unconsumed.card": 3,
  };
  const consumed = new Map([["emitted-but-unconsumed.posture", { count: 4 }]]);
  assert.deepEqual(deductObligations(counters, consumed), {
    "emitted-but-unconsumed.total": 204,
    "emitted-but-unconsumed.posture": 4,
    "emitted-but-unconsumed.card": 3,
  });
  assert.equal(counters["emitted-but-unconsumed.total"], 208, "the measured census is not mutated");

  // The deduction buys no slack anywhere else: a fifth dead channel in ANOTHER
  // bucket still consumes the roll-up and still breaks its own ceiling.
  const regressed = deductObligations(
    { ...counters, "emitted-but-unconsumed.total": 209, "emitted-but-unconsumed.card": 4 },
    consumed,
  );
  const evaluation = evaluateParityBaseline(regressed, baseline);
  assert.match(evaluation.errors.join("\n"), /emitted-but-unconsumed\.card=4; baseline=3/);
});

test("a category roll-up can never itself be obligated", () => {
  const rollUp = {
    obligations: [{ ...ledger.obligations[0], id: "declared-but-unemitted.total" }],
  };
  assert.match(
    evaluateObligations(rollUp, { "declared-but-unemitted.total": 23 }, options).failures.join(""),
    /is a category roll-up; obligate the bucket that holds the debt/,
  );
  const foreign = { obligations: [{ ...ledger.obligations[0], id: "not-a-census.bucket" }] };
  assert.match(
    evaluateObligations(foreign, { "not-a-census.bucket": 1 }, options).failures.join(""),
    /is not a census bucket id/,
  );
  assert.equal(categoryOf("emitted-but-unconsumed.posture"), "emitted-but-unconsumed");
  assert.equal(categoryOf("posture"), null);
});

test("INV-07: the shipped posture obligation holds against the live census, in both directions", () => {
  const shipped = runThemeChannelParityGate();
  const issuesByCategory = {
    "declared-but-unemitted": shipped.graph.issues.declaredButUnemitted,
    "emitted-but-unconsumed": shipped.graph.issues.emittedButUnconsumed,
    "consumed-but-unowned": shipped.graph.issues.consumedButUnowned,
  };
  const live = { resolveOwner: (category) => new Set(issuesByCategory[category].map((issue) => issue.id)) };

  const { failures, consumed } = evaluateObligations(shippedLedger, shipped.counters, live);
  assert.deepEqual(failures, []);
  assert.equal(consumed.size, 1);

  const [obligation] = shippedLedger.obligations;
  assert.equal(obligation.ownerLot, "INV-07");
  assert.equal(obligation.count, obligation.fields.length);
  for (const owner of [...obligation.legacyEmitterOwners, obligation.declaringOwner]) {
    assert.ok(existsSync(join(CORE_ROOT, owner)), `${owner} must exist while the obligation is open`);
  }

  // Q3: the bucket is NOT also a ceiling, and its roll-up is back at the value
  // it held before the tree walk — the ratchet reads it net of the obligation.
  assert.equal(Object.hasOwn(baseline.ceilings, "emitted-but-unconsumed.posture"), false);
  assert.equal(baseline.ceilings["emitted-but-unconsumed.total"], 206);
  const ratcheted = deductObligations(shipped.counters, consumed);
  assert.equal(ratcheted["emitted-but-unconsumed.total"], 204);
  assert.deepEqual(evaluateParityBaseline(ratcheted, baseline).errors, [
    "new unbaselined bucket: emitted-but-unconsumed.posture=4",
  ]);

  // The reason is checkable, not prose: the four channels are emitted by the
  // named deriver and read by nothing under src.
  const deriver = readFileSync(join(CORE_ROOT, obligation.legacyEmitterOwners[0]), "utf8");
  const consumers = new Map(
    shipped.graph.issues.emittedButUnconsumed.map((issue) => [issue.id, issue]),
  );
  for (const channel of obligation.fields) {
    assert.ok(deriver.includes(`"${channel}"`), `${channel} is emitted by the responsive deriver`);
    assert.ok(consumers.has(channel), `${channel} has no reader`);
  }
});
