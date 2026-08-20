/**
 * CERT-FENCE-CONFLICT9 — temporary fase-aware fence for VERTICAL-CONFLICT-9.
 *
 * This test is a signed receipt until the D1 audit append is merged. It fences
 * two disjoint sets:
 *
 *   A = verticalConflict9Execution.sightedPending (6 artifact identities)
 *     Current  = effective value from the committed generated artifact
 *                (packages/.../artifacts/{slug}/index.css) resolved by
 *                PostCSS cascade for the exact (slug, mode) selector.
 *     Expected = in-process compileBrandTheme(...) value, never the stale
 *                compiled block inside the artifact.
 *
 *   B = ledger entries with finalState=SIGHTED_PENDING (6 browser-only rows)
 *     Verified read-only from residual-adjudication.json: executed:true,
 *     exact finalState, successor and executedFiles evidence, plus live source
 *     evidence in the named files.
 *
 * The matrix is 12 rows. The bithire/all identity for --ds-surface-card-border-strong
 * validates both light and dark effective targets inside the same row; the extension
 * currently wins in both bithire modes.
 *
 * Governance: Kimi 2.7 implementation; Fable 5 + Kimi 3 audit; Codex DT.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

import { compileBrandTheme } from "../../../infrastructure/compilers/kernel/runtime/brand-theme";
import { bithireBrandTheme } from "../ts/presentation/brand-themes/bithire";
import { rottayBrandTheme } from "../ts/presentation/brand-themes/rottay";

const ROOT = process.cwd();
const TOKENS_DIR = join(ROOT, "src/foundation/tokens");
const ARTIFACTS_DIR = join(TOKENS_DIR, "css/facade/artifacts");
const CSS_DIR = join(TOKENS_DIR, "css");
const LEDGER_PATH = join(TOKENS_DIR, "residual-adjudication.json");

const ledger = JSON.parse(readFileSync(LEDGER_PATH, "utf8")) as Record<string, unknown>;

type RosterMode = "default" | "light" | "dark";

type A6Row =
  | {
      set: "A";
      slug: string;
      mode: RosterMode;
      channel: string;
      current: string;
      expected: string;
    }
  | {
      set: "A";
      slug: string;
      mode: "all";
      channel: string;
      currentLight: string;
      currentDark: string;
      expectedLight: string;
      expectedDark: string;
    };

type B6Row = {
  set: "B";
  channel: string;
  finalState: string;
  executed: boolean;
  successor: string;
  executedFiles: string[];
};

type MatrixRow = A6Row | B6Row;

function isSingleModeRow(row: A6Row): row is Extract<A6Row, { mode: RosterMode }> {
  return row.mode !== "all";
}

function isAllModeRow(row: A6Row): row is Extract<A6Row, { mode: "all" }> {
  return row.mode === "all";
}

// ── canonical hash recipe ──────────────────────────────────────────────────
// Hash recipe: sha256( sorted canonical lines joined with '\n' + trailing '\n' )
// Each line format is published below and must be reproducible offline.

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

function sha256SortedLines(lines: string[]): string {
  return createHash("sha256").update([...lines].sort().join("\n") + "\n").digest("hex");
}

function canonicalA6Line(row: A6Row): string {
  if (row.mode === "all") {
    return `A|${row.slug}|all|${row.channel}|currentLight=${row.currentLight}|currentDark=${row.currentDark}|expectedLight=${row.expectedLight}|expectedDark=${row.expectedDark}`;
  }
  return `A|${row.slug}|${row.mode}|${row.channel}|current=${row.current}|expected=${row.expected}`;
}

function canonicalB6Line(row: B6Row): string {
  return `B|${row.channel}|finalState=${row.finalState}|executed=${row.executed}|successor=${row.successor}|files=${row.executedFiles.join(",")}`;
}

function canonicalLine(row: MatrixRow): string {
  return row.set === "A" ? canonicalA6Line(row) : canonicalB6Line(row);
}

// ── expected live values (never from the stale compiled artifact block) ────

function compileEffectiveValue(
  brandTheme: unknown,
  slug: string,
  mode: RosterMode,
  channel: string,
): string {
  const compiled = compileBrandTheme({
    brandTheme: brandTheme as never,
    tenantSlug: slug,
    verticalPersonality: {},
    verticalTokenOverrides: {},
  });
  const baseVars = compiled.cssVariables;
  const modeBlock = compiled.modeBlocks?.find((b) => b.mode === mode);
  const vars = mode === "default" ? baseVars : { ...baseVars, ...(modeBlock?.cssVariables ?? {}) };
  const val = vars[channel];
  if (val === undefined) {
    throw new Error(`compileBrandTheme(${slug}, ${mode}) did not emit ${channel}`);
  }
  return val;
}

// ── current committed-artifact value via PostCSS cascade ───────────────────

function matchesMode(selector: string, slug: string, mode: RosterMode): boolean {
  const hasSlug = selector.includes(`data-tenant='${slug}'`) || selector.includes(`data-tenant="${slug}"`);
  if (!hasSlug) return false;

  // Strip :not(...) predicates before testing positive theme membership, so
  // `:not(.light)` is not misclassified as a positive light selector.
  const positiveSelector = selector.replace(/:not\([^)]*\)/g, "");
  const hasPosLight = positiveSelector.includes("[data-theme='light']") || positiveSelector.includes(".light");
  const hasPosDark = positiveSelector.includes("[data-theme='dark']") || positiveSelector.includes(".dark");
  const hasNotLight = selector.includes(":not([data-theme='light'])") || selector.includes(":not(.light)");
  const hasNotDark = selector.includes(":not([data-theme='dark'])") || selector.includes(":not(.dark)");

  const hasAnyThemeQualifier = hasPosLight || hasPosDark || hasNotLight || hasNotDark;
  const isUnqualified = !hasAnyThemeQualifier;

  if (mode === "dark") {
    return isUnqualified || hasPosDark || hasNotLight;
  }
  if (mode === "light") {
    return isUnqualified || hasPosLight || hasNotDark;
  }
  return false;
}

function artifactEffectiveValueFromRoot(
  root: postcss.Root,
  slug: string,
  mode: RosterMode,
  channel: string,
): string {
  let lastValue: string | undefined;
  let lastIndex = -1;

  root.walkRules((rule) => {
    if (!matchesMode(rule.selector, slug, mode)) return;
    rule.walkDecls((decl) => {
      if (decl.prop !== channel) return;
      const offset = decl.source?.start?.offset ?? -1;
      if (offset > lastIndex) {
        lastValue = decl.value;
        lastIndex = offset;
      }
    });
  });

  if (lastValue === undefined) {
    throw new Error(`No declaration for ${channel} in ${slug}/${mode} artifact cascade`);
  }
  return lastValue;
}

function artifactEffectiveValue(slug: string, mode: RosterMode, channel: string): string {
  const cssText = readFileSync(join(ARTIFACTS_DIR, slug, "index.css"), "utf8");
  const root = postcss.parse(cssText, { from: join(ARTIFACTS_DIR, slug, "index.css") });
  return artifactEffectiveValueFromRoot(root, slug, mode, channel);
}

// Resolve a one-level var(--channel) chain through the same artifact cascade,
// stopping at the first non-var value or when a cycle is detected. Used to
// prove zeroEffective channels whose dark override is a ramp alias.
function resolvedArtifactValueFromRoot(
  root: postcss.Root,
  slug: string,
  mode: RosterMode,
  channel: string,
): string {
  let value = artifactEffectiveValueFromRoot(root, slug, mode, channel);
  const seen = new Set<string>();
  for (let i = 0; i < 5; i++) {
    const match = value.match(/^var\((--[^ ,)]+)\)$/);
    if (!match) break;
    const ref = match[1];
    if (seen.has(ref)) break;
    seen.add(ref);
    value = artifactEffectiveValueFromRoot(root, slug, mode, ref);
  }
  return value;
}

function resolvedArtifactValue(slug: string, mode: RosterMode, channel: string): string {
  const cssText = readFileSync(join(ARTIFACTS_DIR, slug, "index.css"), "utf8");
  const root = postcss.parse(cssText, { from: join(ARTIFACTS_DIR, slug, "index.css") });
  return resolvedArtifactValueFromRoot(root, slug, mode, channel);
}

// ── extension-segment phase detection ──────────────────────────────────────

function extensionSegmentText(slug: string): string {
  const cssText = readFileSync(join(ARTIFACTS_DIR, slug, "index.css"), "utf8");
  const marker = "/* === Declared artifact extension (authored source, mechanically scoped) === */";
  const idx = cssText.indexOf(marker);
  if (idx === -1) return "";
  return cssText.slice(idx);
}

function channelDeclaredInExtensionSegment(slug: string, channel: string): boolean {
  const segment = extensionSegmentText(slug);
  if (!segment) return false;
  const root = postcss.parse(segment, { from: `${slug}-extension-segment` });
  let found = false;
  root.walkDecls((decl) => {
    if (decl.prop === channel) found = true;
  });
  return found;
}

// ── A6 matrix (built live) ─────────────────────────────────────────────────

const A6_ROWS: A6Row[] = [
  {
    set: "A",
    slug: "rottay",
    mode: "dark",
    channel: "--ds-color-bg-input",
    current: normalizeWhitespace(artifactEffectiveValue("rottay", "dark", "--ds-color-bg-input")),
    expected: normalizeWhitespace(
      compileEffectiveValue(rottayBrandTheme, "rottay", "default", "--ds-color-bg-input"),
    ),
  },
  {
    set: "A",
    slug: "rottay",
    mode: "dark",
    channel: "--ds-font-family-base",
    current: normalizeWhitespace(artifactEffectiveValue("rottay", "dark", "--ds-font-family-base")),
    expected: normalizeWhitespace(
      compileEffectiveValue(rottayBrandTheme, "rottay", "default", "--ds-font-family-base"),
    ),
  },
  {
    set: "A",
    slug: "rottay",
    mode: "dark",
    channel: "--ds-font-family-display",
    current: normalizeWhitespace(artifactEffectiveValue("rottay", "dark", "--ds-font-family-display")),
    expected: normalizeWhitespace(
      compileEffectiveValue(rottayBrandTheme, "rottay", "default", "--ds-font-family-display"),
    ),
  },
  {
    set: "A",
    slug: "rottay",
    mode: "dark",
    channel: "--ds-font-family-heading",
    current: normalizeWhitespace(artifactEffectiveValue("rottay", "dark", "--ds-font-family-heading")),
    expected: normalizeWhitespace(
      compileEffectiveValue(rottayBrandTheme, "rottay", "default", "--ds-font-family-heading"),
    ),
  },
  {
    set: "A",
    slug: "bithire",
    mode: "light",
    channel: "--ds-color-bg-primary",
    current: normalizeWhitespace(artifactEffectiveValue("bithire", "light", "--ds-color-bg-primary")),
    expected: normalizeWhitespace(
      compileEffectiveValue(bithireBrandTheme, "bithire", "default", "--ds-color-bg-primary"),
    ),
  },
  {
    set: "A",
    slug: "bithire",
    mode: "all",
    channel: "--ds-surface-card-border-strong",
    currentLight: normalizeWhitespace(
      artifactEffectiveValue("bithire", "light", "--ds-surface-card-border-strong"),
    ),
    currentDark: normalizeWhitespace(
      artifactEffectiveValue("bithire", "dark", "--ds-surface-card-border-strong"),
    ),
    expectedLight: normalizeWhitespace(
      compileEffectiveValue(bithireBrandTheme, "bithire", "default", "--ds-surface-card-border-strong"),
    ),
    expectedDark: normalizeWhitespace(
      compileEffectiveValue(bithireBrandTheme, "bithire", "default", "--ds-surface-card-border-strong"),
    ),
  },
];

// ── B6 matrix (built live from ledger) ─────────────────────────────────────

const B6_CHANNELS = [
  "--ds-card-border-default",
  "--ds-input-placeholder",
  "--ds-input-disabled-bg",
  "--ds-color-background-subtle",
  "--ds-color-bg-success",
  "--ds-motion-duration-fast",
] as const;

const B6_ROWS: B6Row[] = B6_CHANNELS.map((channel) => {
  const entry = (ledger.entries as Record<string, Record<string, unknown>>)[channel];
  if (!entry) throw new Error(`Missing ledger entry for ${channel}`);
  return {
    set: "B",
    channel,
    finalState: String(entry.finalState),
    executed: Boolean(entry.executed),
    successor: String(entry.successor ?? ""),
    executedFiles: (entry.executedFiles as string[] | undefined) ?? [],
  };
});

const MATRIX12: MatrixRow[] = [...A6_ROWS, ...B6_ROWS];

// ── signed hashes (PRE = extension still declares the channels; POST = regen removed them) ──
// These literals are produced by the published sorted+LF recipe and must be
// reproducible offline. The test detects the current phase and expects the
// matching literal; the opposite literal is the contract for the post-regen
// state.

// Signed PRE hash: extension still declares the A6 channels (current != expected).
const A6_PRE_SHA256 = "d08ee3e7df182f40092aee9d699e38938b478d7addb9313284dc75af60e5e73f";
// Signed POST hash: extension no longer declares the A6 channels (current == expected).
const A6_POST_SHA256 = "f7ddd4a700b0343b4639a5643188cfea68ae0749cf6282854d63fe700c633778";
const MATRIX12_PRE_SHA256 = "bbe5929d7b3ac84e6ccc142333c62055ef50eac3b03af9b2e2ae4ee5d3f7c4da";
const MATRIX12_POST_SHA256 = "343483658e7f2a622fe744e4d2633f4dc83a7266552c3fdba13d01309c88f641";

function projectRowsToPost(rows: MatrixRow[]): MatrixRow[] {
  return rows.map((row) => {
    if (row.set !== "A") return { ...row };
    if (isAllModeRow(row)) {
      return {
        ...row,
        currentLight: row.expectedLight,
        currentDark: row.expectedDark,
      };
    }
    return { ...row, current: row.expected };
  });
}

// ── shared validators ──────────────────────────────────────────────────────

function assertConflict9Receipt(candidate: typeof ledger): void {
  const receipt = candidate.verticalConflict9Execution as {
    id: string;
    checkpoint: string;
    date: string;
    scope: string;
    roster: string[];
    rosterSha256: string;
    zeroEffective: string[];
    sightedPending: string[];
    generatedProjection: string;
  };

  expect(receipt.id, "receipt.id").toBe("VERTICAL-CONFLICT-9");
  expect(receipt.checkpoint, "receipt.checkpoint").toBe("DEAD-61");
  expect(receipt.date, "receipt.date").toBe("2026-08-14");
  expect(receipt.scope, "receipt.scope").toBe("source-only");
  expect(receipt.generatedProjection, "receipt.generatedProjection").toBe("PENDING");

  const expectedRoster = [
    "--ds-card-shadow-elevated",
    "--ds-color-bg-input",
    "--ds-color-bg-primary",
    "--ds-color-error",
    "--ds-color-info",
    "--ds-font-family-base",
    "--ds-font-family-display",
    "--ds-font-family-heading",
    "--ds-surface-card-border-strong",
  ];
  expect(receipt.roster, "receipt.roster").toEqual(expectedRoster);
  expect(receipt.rosterSha256, "receipt.rosterSha256").toBe(
    createHash("sha256").update(expectedRoster.sort().join("\n") + "\n").digest("hex"),
  );

  expect(receipt.zeroEffective, "receipt.zeroEffective").toEqual([
    "--ds-card-shadow-elevated",
    "--ds-color-error",
    "--ds-color-info",
  ]);

  expect(receipt.sightedPending, "receipt.sightedPending").toEqual([
    "--ds-color-bg-input (rottay dark)",
    "--ds-font-family-base (rottay dark)",
    "--ds-font-family-display (rottay dark)",
    "--ds-font-family-heading (rottay dark)",
    "--ds-color-bg-primary (bithire light)",
    "--ds-surface-card-border-strong (bithire all modes)",
  ]);
}

function countExactPropInText(cssText: string, channel: string): number {
  const root = postcss.parse(cssText, { from: "inline" });
  let count = 0;
  root.walkDecls((decl) => {
    if (decl.prop === channel) count += 1;
  });
  return count;
}

function countVarUsageInText(cssText: string, channel: string): number {
  const escaped = channel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`var\\(\\s*${escaped}\\s*[,)]`, "g");
  return (cssText.match(re) ?? []).length;
}

function countRulesUsingChannel(cssText: string, channel: string): number {
  const root = postcss.parse(cssText, { from: "inline" });
  const escaped = channel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`var\\(${escaped}\\)`);
  let count = 0;
  root.walkRules((rule) => {
    let uses = false;
    rule.walkDecls((decl) => {
      if (re.test(decl.value)) uses = true;
    });
    if (uses) count += 1;
  });
  return count;
}

function readCss(pathInsideTokens: string): string {
  return readFileSync(join(TOKENS_DIR, pathInsideTokens), "utf8");
}

type B6SourceTexts = {
  defaultCss: string;
  inputCss: string;
  modernInputCss: string;
  frameworkBridgeCss: string;
  terminalCss: string;
  exportButtonCss: string;
  chartCss: string;
};

function assertSightedPendingB6Sources(
  entries: Record<string, Record<string, unknown>>,
  sources: B6SourceTexts,
): void {
  const {
    defaultCss,
    inputCss,
    modernInputCss,
    frameworkBridgeCss,
    terminalCss,
    exportButtonCss,
    chartCss,
  } = sources;

  // --ds-card-border-default: old phantom gone; successor --ds-card-border alive in default.css.
  expect(entries["--ds-card-border-default"].successor).toBe("--ds-card-border");
  expect(countExactPropInText(defaultCss, "--ds-card-border-default")).toBe(0);
  expect(countExactPropInText(defaultCss, "--ds-card-border")).toBe(2);

  // --ds-input-placeholder: the alias READ tier is retired (EVNTO TERMINAL-2).
  // It was added 2026-08-02 as a defect fix and this pin recorded it as "the
  // canonical name now actually read by the modern input placeholder rule".
  // Evnto's drain retargeted the modern rule onto the successor it already
  // falls back to, `--ds-input-color-placeholder`, which is the only one of the
  // two with a typed contract owner. The alias had to go: `default.css`
  // declares it in the dark `:root` block, so as the FIRST link of the var()
  // chain it resolved for every dark page regardless of specificity and would
  // have beaten the compiled tenant channel. The successor claim below is
  // unchanged; only the read count moves, 1 -> 0. The NAME still survives in
  // `default.css` (now a read-less declaration) — retiring THAT is a later,
  // separate wave. Boundary regex: `--ds-input-placeholder-opacity` is a
  // different token and never counted here.
  expect(entries["--ds-input-placeholder"].successor).toMatch(/placeholder/);
  expect(countVarUsageInText(modernInputCss, "--ds-input-placeholder")).toBe(0);
  // The successor is not merely named — it is the channel actually read now.
  expect(
    countVarUsageInText(modernInputCss, "--ds-input-color-placeholder"),
  ).toBe(1);

  // --ds-input-disabled-bg: retargeted to --ds-input-bg-disabled; declared in input.css and read by framework-bridge.
  expect(entries["--ds-input-disabled-bg"].successor).toBe("--ds-input-bg-disabled");
  expect(entries["--ds-input-disabled-bg"].executedFiles).toContain(
    "src/foundation/tokens/css/runtime/engines/modern/framework-bridge.css",
  );
  expect(countExactPropInText(inputCss, "--ds-input-disabled-bg")).toBe(0);
  expect(countExactPropInText(inputCss, "--ds-input-bg-disabled")).toBe(1);
  expect(countVarUsageInText(frameworkBridgeCss, "--ds-input-bg-disabled")).toBe(1);

  // --ds-color-background-subtle: retargeted to --ds-color-bg-subtle; floor in default.css + 9 sites in data-terminal-card.
  expect(entries["--ds-color-background-subtle"].successor).toMatch(/--ds-color-bg-subtle/);
  expect(countExactPropInText(defaultCss, "--ds-color-background-subtle")).toBe(0);
  expect(countExactPropInText(defaultCss, "--ds-color-bg-subtle")).toBe(1);
  expect(countVarUsageInText(terminalCss, "--ds-color-bg-subtle")).toBe(9);

  // --ds-color-bg-success: retargeted to the success-bg + success-ink pair in export-button.css.
  expect(entries["--ds-color-bg-success"].successor).toMatch(/--ds-color-success-bg/);
  expect(entries["--ds-color-bg-success"].successor).toMatch(/--ds-color-success-ink/);
  expect(countExactPropInText(exportButtonCss, "--ds-color-bg-success")).toBe(0);
  expect(countVarUsageInText(exportButtonCss, "--ds-color-success-bg")).toBe(1);
  expect(countVarUsageInText(exportButtonCss, "--ds-color-success-ink")).toBe(1);
  expect(entries["--ds-color-bg-success"].executedFiles).toContain(
    "src/foundation/tokens/css/presentation/components/skin/export-button.css",
  );

  // --ds-motion-duration-fast: retargeted to --ds-motion-fast; 3 consumer rules in chart-foundation.css.
  expect(entries["--ds-motion-duration-fast"].successor).toBe("--ds-motion-fast");
  expect(countExactPropInText(chartCss, "--ds-motion-duration-fast")).toBe(0);
  expect(countRulesUsingChannel(chartCss, "--ds-motion-fast")).toBe(3);
  expect(entries["--ds-motion-duration-fast"].executedFiles).toContain(
    "src/foundation/tokens/css/presentation/components/skin/chart-foundation.css",
  );
}

function assertSightedPendingB6(candidate: typeof ledger): void {
  const entries = candidate.entries as Record<string, Record<string, unknown>>;

  for (const channel of B6_CHANNELS) {
    const entry = entries[channel];
    expect(entry, `${channel} entry exists`).toBeDefined();
    expect(entry.finalState, `${channel} finalState`).toBe("SIGHTED_PENDING");
    expect(entry.executed, `${channel} executed`).toBe(true);
  }

  assertSightedPendingB6Sources(entries, {
    defaultCss: readCss("css/foundation/themes/default.css"),
    inputCss: readCss("css/presentation/components/input.css"),
    modernInputCss: readCss("css/runtime/engines/modern/skin/input.css"),
    frameworkBridgeCss: readCss("css/runtime/engines/modern/framework-bridge.css"),
    terminalCss: readCss("css/presentation/components/skin/data-terminal-card.css"),
    exportButtonCss: readCss("css/presentation/components/skin/export-button.css"),
    chartCss: readCss("css/presentation/components/skin/chart-foundation.css"),
  });
}

function detectPhase(rows: A6Row[]): "PRE" | "POST" {
  const declared = rows.map((row) =>
    channelDeclaredInExtensionSegment(row.slug, row.channel),
  );
  const anyDeclared = declared.some(Boolean);
  const anyAbsent = declared.some((d) => !d);
  if (anyDeclared && anyAbsent) {
    throw new Error(
      `Mixed PRE/POST phase detected among A6 identities: ${rows.map((r) => r.channel).join(", ")}`,
    );
  }
  return anyDeclared ? "PRE" : "POST";
}

function assertMatrix12(candidate: MatrixRow[]): void {
  expect(candidate.length, "matrix row count").toBe(12);

  const aRows = candidate.filter((r): r is A6Row => r.set === "A");
  const bRows = candidate.filter((r): r is B6Row => r.set === "B");
  expect(aRows.length).toBe(6);
  expect(bRows.length).toBe(6);

  const phase = detectPhase(aRows);
  const a6Lines = aRows.map(canonicalA6Line);
  const matrixLines = candidate.map(canonicalLine);
  const a6Hash = sha256SortedLines(a6Lines);
  const matrixHash = sha256SortedLines(matrixLines);

  if (phase === "PRE") {
    expect(a6Hash, "A6 hash in PRE phase").toBe(A6_PRE_SHA256);
    expect(matrixHash, "matrix12 hash in PRE phase").toBe(MATRIX12_PRE_SHA256);
  } else {
    expect(a6Hash, "A6 hash in POST phase").toBe(A6_POST_SHA256);
    expect(matrixHash, "matrix12 hash in POST phase").toBe(MATRIX12_POST_SHA256);
  }

  for (const row of aRows) {
    if (row.mode === "all") {
      if (phase === "PRE") {
        expect(row.currentLight, `${row.channel} light current (PRE)`).not.toBe(row.expectedLight);
        expect(row.currentDark, `${row.channel} dark current (PRE)`).not.toBe(row.expectedDark);
      } else {
        expect(row.currentLight, `${row.channel} light current (POST)`).toBe(row.expectedLight);
        expect(row.currentDark, `${row.channel} dark current (POST)`).toBe(row.expectedDark);
      }
    } else if (phase === "PRE") {
      expect(row.current, `${row.channel} current (PRE)`).not.toBe(row.expected);
    } else {
      expect(row.current, `${row.channel} current (POST)`).toBe(row.expected);
    }
  }
}

// EXCISED (SEV-2): `function enforceConflict9Absent()`. It walked the three
// `_source/extension.css` files for any declaration whose property was on the
// signed CONFLICT9 roster, and threw naming slug and channel. Those three files
// were its entire corpus, so with them deleted the enforcer has nothing to
// enforce over and its self-drill would be a decoration. The claim it made —
// no CONFLICT9 channel is authored outside the compiler — is now carried by
// `scripts/verticals/first-party-single-author-gate/index.mjs` law G2, which is strictly
// stronger: the enforcer proved the files did not DECLARE those nine channels,
// and G2 proves no such file may exist to declare anything at all.

// ── tests ──────────────────────────────────────────────────────────────────

describe("CERT-FENCE-CONFLICT9 authority", () => {
  it("CONFLICT9 receipt is the signed 9-name roster with zeroEffective and sightedPending", () => {
    assertConflict9Receipt(ledger);
  });
});

describe("CERT-FENCE-CONFLICT9 matrix A6 (artifact current → live expected)", () => {
  it("A6 identities are in a single PRE or POST phase and match the signed hash", () => {
    assertMatrix12(MATRIX12);
  });

  it("A1 rottay dark --ds-color-bg-input moves from #0F0F12 to #131316", () => {
    const row = A6_ROWS.find((r) => r.channel === "--ds-color-bg-input")!;
    if (!isSingleModeRow(row)) throw new Error("Expected single-mode A6 row");
    expect(row.expected).toBe("#131316");
    if (detectPhase(A6_ROWS) === "PRE") {
      expect(row.current).toBe("#0F0F12");
    } else {
      expect(row.current).toBe(row.expected);
    }
  });

  it("A2-A4 rottay dark font families gain the live Public Sans + Noto Sans Arabic stack", () => {
    const liveStack =
      'var(--ds-font-pack-humanist-text, \'Public Sans\', ui-sans-serif, system-ui, -apple-system, sans-serif), "Noto Sans Arabic", sans-serif';
    const oldStack = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    for (const ch of ["--ds-font-family-base", "--ds-font-family-display", "--ds-font-family-heading"]) {
      const row = A6_ROWS.find((r) => r.channel === ch)!;
      if (!isSingleModeRow(row)) throw new Error("Expected single-mode A6 row");
      expect(row.expected).toBe(liveStack);
      if (detectPhase(A6_ROWS) === "PRE") {
        expect(row.current).toBe(oldStack);
      } else {
        expect(row.current).toBe(row.expected);
      }
    }
  });

  it("A5 bithire light --ds-color-bg-primary moves from #ffffff to #F4F8FB", () => {
    const row = A6_ROWS.find((r) => r.channel === "--ds-color-bg-primary")!;
    if (!isSingleModeRow(row)) throw new Error("Expected single-mode A6 row");
    expect(row.expected).toBe("#F4F8FB");
    if (detectPhase(A6_ROWS) === "PRE") {
      expect(row.current.toLowerCase()).toBe("#ffffff");
    } else {
      expect(row.current).toBe(row.expected);
    }
  });

  it("A6 bithire all --ds-surface-card-border-strong currently uses border-secondary in both modes, expected material-card-border-strong", () => {
    const row = A6_ROWS.find((r) => r.channel === "--ds-surface-card-border-strong")!;
    if (!isAllModeRow(row)) throw new Error("Expected all-mode A6 row");
    expect(row.expectedLight).toBe("var(--ds-material-card-border-strong)");
    expect(row.expectedDark).toBe("var(--ds-material-card-border-strong)");
    if (detectPhase(A6_ROWS) === "PRE") {
      expect(row.currentLight).toBe("var(--ds-color-border-secondary)");
      expect(row.currentDark).toBe("var(--ds-color-border-secondary)");
    } else {
      expect(row.currentLight).toBe(row.expectedLight);
      expect(row.currentDark).toBe(row.expectedDark);
    }
  });

  it("POST projection of A6 matches the signed A6_POST_SHA256 hash", () => {
    const postA6 = projectRowsToPost(A6_ROWS).filter((r): r is A6Row => r.set === "A");
    expect(sha256SortedLines(postA6.map(canonicalA6Line))).toBe(A6_POST_SHA256);
  });

  it("POST projection of matrix12 matches the signed MATRIX12_POST_SHA256 hash", () => {
    const postMatrix = projectRowsToPost(MATRIX12);
    expect(sha256SortedLines(postMatrix.map(canonicalLine))).toBe(MATRIX12_POST_SHA256);
  });

  it("a partial PRE/POST projection is rejected by the shared phase validator", () => {
    const partialA6 = [
      ...projectRowsToPost(A6_ROWS.slice(0, 3)),
      ...A6_ROWS.slice(3),
    ];
    expect(() => assertMatrix12([...partialA6, ...B6_ROWS])).toThrow();
  });
});

describe("CERT-FENCE-CONFLICT9 matrix B6 (ledger + source evidence)", () => {
  it("B6 entries are executed SIGHTED_PENDING with live source evidence", () => {
    assertSightedPendingB6(ledger);
  });
});

describe("CERT-FENCE-CONFLICT9 canaries", () => {
  it("three zeroEffective channels are not in the A matrix and match the live compile (raw or resolved)", () => {
    const aChannels = new Set(A6_ROWS.map((r) => r.channel));
    for (const ch of ["--ds-card-shadow-elevated", "--ds-color-error", "--ds-color-info"]) {
      expect(aChannels.has(ch)).toBe(false);
      // Rottay dark re-aliases error/info through 400-step ramp tokens; resolve
      // those aliases. Card shadow is already raw-equal.
      const raw = normalizeWhitespace(artifactEffectiveValue("rottay", "dark", ch));
      const expected = normalizeWhitespace(
        compileEffectiveValue(rottayBrandTheme, "rottay", "dark", ch),
      );
      const current = raw === expected ? raw : normalizeWhitespace(resolvedArtifactValue("rottay", "dark", ch));
      expect(current).toBe(expected);
    }
  });

  it(":not(.light) is not treated as a light match and light selectors do not match dark", () => {
    const darkSelector = "html[data-tenant='rottay']:not([data-theme='light']):not(.light)";
    const lightSelector = "html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light";
    expect(matchesMode(darkSelector, "rottay", "light")).toBe(false);
    expect(matchesMode(lightSelector, "rottay", "dark")).toBe(false);
    expect(matchesMode(darkSelector, "rottay", "dark")).toBe(true);
    expect(matchesMode(lightSelector, "rottay", "light")).toBe(true);
  });

  it("a control channel outside A/B is unchanged between compiled artifact and live compile", () => {
    const current = normalizeWhitespace(artifactEffectiveValue("rottay", "dark", "--ds-color-primary"));
    const expected = normalizeWhitespace(
      compileEffectiveValue(rottayBrandTheme, "rottay", "default", "--ds-color-primary"),
    );
    expect(current).toBe(expected);
  });

  // EXCISED (SEV-2): "source extensions contain none of the CONFLICT9 roster
  // channels" — the sole production caller of the removed enforcer, reading all
  // three deleted extension files. Replaced by law G2 (see the enforcer note).
});

describe("CERT-FENCE-CONFLICT9 mutants turn red", () => {
  it("mutating the live expected value breaks the A6 hash", () => {
    const mutated = A6_ROWS.map((r) => ({ ...r }));
    const row = mutated.find((r) => r.channel === "--ds-color-bg-input")!;
    if (!isSingleModeRow(row)) throw new Error("Expected single-mode A6 row");
    row.expected = "#000000";
    expect(sha256SortedLines(mutated.map(canonicalLine))).not.toBe(A6_PRE_SHA256);
  });

  it("mutating the committed artifact current value breaks the A6 hash", () => {
    const mutated = A6_ROWS.map((r) => ({ ...r }));
    const row = mutated.find((r) => r.channel === "--ds-color-bg-primary")!;
    if (!isSingleModeRow(row)) throw new Error("Expected single-mode A6 row");
    row.current = "#000000";
    expect(sha256SortedLines(mutated.map(canonicalLine))).not.toBe(A6_PRE_SHA256);
  });

  it("a same-count roster swap breaks the CONFLICT9 receipt validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.verticalConflict9Execution as { roster: string[] };
    receipt.roster = ["--ds-color-bg-primary", ...receipt.roster.slice(1)];
    expect(receipt.roster.length).toBe(9);
    expect(() => assertConflict9Receipt(mutated)).toThrow();
  });

  it("a hash mutation breaks the CONFLICT9 receipt validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.verticalConflict9Execution as { rosterSha256: string };
    receipt.rosterSha256 = "0".repeat(64);
    expect(() => assertConflict9Receipt(mutated)).toThrow();
  });

  // EXCISED (SEV-2): "re-inserting an A channel into rottay
  // _source/extension.css is detected by the shared enforcer" — the causal
  // drill for the removed enforcer. It read the real rottay extension, appended
  // `--ds-color-bg-input` to the dark rule and required a throw, then appended
  // the longer-prefix homonym `--ds-color-bg-input-foo` and required NO throw.
  // Retargeting it at a synthetic string would keep the green while testing a
  // function no production caller invokes. The exact-prefix precision it proved
  // is preserved in the G3 token scan of
  // `scripts/verticals/first-party-single-author-gate/index.mjs`, whose drills include a
  // matching negative, and the reinsertion channel itself is closed by G2.

  it("reverting a B6 retarget breaks the B6 validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const entry = (mutated.entries as Record<string, Record<string, unknown>>)["--ds-input-disabled-bg"];
    entry.successor = "--ds-input-disabled-bg";
    expect(() => assertSightedPendingB6(mutated)).toThrow();
  });

  function liveB6Sources(): B6SourceTexts {
    return {
      defaultCss: readCss("css/foundation/themes/default.css"),
      inputCss: readCss("css/presentation/components/input.css"),
      modernInputCss: readCss("css/runtime/engines/modern/skin/input.css"),
      frameworkBridgeCss: readCss("css/runtime/engines/modern/framework-bridge.css"),
      terminalCss: readCss("css/presentation/components/skin/data-terminal-card.css"),
      exportButtonCss: readCss("css/presentation/components/skin/export-button.css"),
      chartCss: readCss("css/presentation/components/skin/chart-foundation.css"),
    };
  }

  it("live B6 source evidence passes the shared source validator", () => {
    const entries = ledger.entries as Record<string, Record<string, unknown>>;
    expect(() => assertSightedPendingB6Sources(entries, liveB6Sources())).not.toThrow();
  });

  /**
   * EVNTO TERMINAL-2 causal guard. The B6 placeholder pin above flipped from
   * "the alias is read once" to "the alias is read zero times", so the pin is
   * only load-bearing if RESTORING the retired tier turns it red. Re-planting
   * the exact three-tier chain the modern skin carried before the drain must
   * break the validator.
   */
  it("restoring the retired --ds-input-placeholder read tier breaks the shared source validator", () => {
    const entries = ledger.entries as Record<string, Record<string, unknown>>;
    const sources = liveB6Sources();
    const drained = "color: var(--ds-input-color-placeholder, var(--ds-color-text-muted));";
    const restored =
      "color: var(--ds-input-placeholder, var(--ds-input-color-placeholder, var(--ds-color-text-muted)));";
    expect(sources.modernInputCss).toContain(drained);
    sources.modernInputCss = sources.modernInputCss.replace(drained, restored);
    expect(countVarUsageInText(sources.modernInputCss, "--ds-input-placeholder")).toBe(1);
    expect(() => assertSightedPendingB6Sources(entries, sources)).toThrow();
  });

  /**
   * The sibling homonym must not be what satisfies the zero-count pin: deleting
   * `--ds-input-placeholder-opacity` leaves the alias count at zero, so the
   * validator still passes. This is what proves the boundary regex, not the
   * absence of the opacity read, is doing the work.
   */
  it("the placeholder-opacity homonym is not what satisfies the zero-read pin", () => {
    const entries = ledger.entries as Record<string, Record<string, unknown>>;
    const sources = liveB6Sources();
    expect(sources.modernInputCss).toContain("opacity: var(--ds-input-placeholder-opacity);");
    sources.modernInputCss = sources.modernInputCss.replace(
      "opacity: var(--ds-input-placeholder-opacity);",
      "",
    );
    expect(countVarUsageInText(sources.modernInputCss, "--ds-input-placeholder")).toBe(0);
    expect(() => assertSightedPendingB6Sources(entries, sources)).not.toThrow();
  });

  it("placeholder/disabled source mutant breaks the shared source validator", () => {
    const entries = ledger.entries as Record<string, Record<string, unknown>>;
    const sources = liveB6Sources();
    sources.frameworkBridgeCss = sources.frameworkBridgeCss.replace(
      "var(--ds-input-bg-disabled)",
      "var(--ds-input-bg-disabled-mutant)",
    );
    expect(() => assertSightedPendingB6Sources(entries, sources)).toThrow();
  });

  it("subtle9 source mutant breaks the shared source validator", () => {
    const entries = ledger.entries as Record<string, Record<string, unknown>>;
    const sources = liveB6Sources();
    sources.terminalCss = sources.terminalCss.replace(
      "var(--ds-color-bg-subtle)",
      "var(--ds-color-bg-subtle-mutant)",
    );
    expect(() => assertSightedPendingB6Sources(entries, sources)).toThrow();
  });

  it("success pair source mutant breaks the shared source validator", () => {
    const entries = ledger.entries as Record<string, Record<string, unknown>>;
    const sources = liveB6Sources();
    sources.exportButtonCss = sources.exportButtonCss.replace(
      "background: var(--ds-color-success-bg);",
      "background: var(--ds-color-success-bg-mutant);",
    );
    expect(() => assertSightedPendingB6Sources(entries, sources)).toThrow();
  });

  it("motion3/card source mutant breaks the shared source validator", () => {
    const entries = ledger.entries as Record<string, Record<string, unknown>>;
    const sources = liveB6Sources();
    sources.chartCss = sources.chartCss.replace(
      "--_ds-chart-reveal-duration: var(--ds-motion-fast);",
      "--_ds-chart-reveal-duration: var(--ds-motion-fast-mutant);",
    );
    expect(() => assertSightedPendingB6Sources(entries, sources)).toThrow();
  });

  it("dropping one A identity from the matrix breaks the matrix12 hash", () => {
    const mutated = MATRIX12.filter((r) => !(r.set === "A" && r.channel === "--ds-color-bg-input"));
    expect(mutated.length).toBe(11);
    expect(sha256SortedLines(mutated.map(canonicalLine))).not.toBe(MATRIX12_PRE_SHA256);
  });

  it("mutating a zeroEffective ramp target breaks resolved equivalence", () => {
    const expected = normalizeWhitespace(
      compileEffectiveValue(rottayBrandTheme, "rottay", "dark", "--ds-color-error"),
    );
    expect(normalizeWhitespace(resolvedArtifactValue("rottay", "dark", "--ds-color-error"))).toBe(
      expected,
    );

    const cssText = readFileSync(join(ARTIFACTS_DIR, "rottay/index.css"), "utf8");
    const mutated = cssText.replace(
      "--ds-color-error-400: #F87171;",
      "--ds-color-error-400: #000000;",
    );
    const mutatedParsed = postcss.parse(mutated, { from: "rottay-mutant.css" });

    expect(
      normalizeWhitespace(
        resolvedArtifactValueFromRoot(mutatedParsed, "rottay", "dark", "--ds-color-error"),
      ),
    ).not.toBe(expected);
  });
});
