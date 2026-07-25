import assert from "node:assert/strict";
import test from "node:test";

import {
  buildParityCounters,
  buildThemeChannelParityGraph,
  collectDeclaredThemeFields,
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
