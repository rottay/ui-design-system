import assert from "node:assert/strict";
import test from "node:test";

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
} from "./lib/theme-channel-parity-graph.mjs";

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
