/**
 * VERTICAL-DEAD-61 — brand-authored residue retirement, source-only.
 *
 * FASE B retired 61 names from the DS foundation source; their brand-authored
 * residue still shipped from rottay/bithire _source/extension.css. Under
 * owner GO Fable+Turing, those 112 declarations (49 rottay × dark+light +
 * 13 bithire, 12 root + accent-live-bg dark+light) were removed source-only.
 * Generated artifacts are intentionally left untouched: parity is
 * GENERATED-PENDING and regenerates on the next build:vertical-css run.
 *
 * Durable-contract design: this test pins the signed authorities (61 names,
 * hashes, ledger totals, historical receipt) and the absence of the DEAD
 * roster from every extension. Live volume numbers are checked as
 * decrease-only ceilings or delegated to the provenance gate, so future
 * CONFLICT/PALETTE drains do not break DEAD.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import postcss from "postcss";
import * as ts from "typescript";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const TOKENS_DIR = join(ROOT, "src/foundation/tokens");
const ARTIFACTS_DIR = join(TOKENS_DIR, "css/facade/artifacts");
const LEDGER_PATH = join(TOKENS_DIR, "residual-adjudication.json");
const BASELINE_PATH = join(ROOT, "scripts/artifact-provenance-gate.baseline.json");

const ROTTAY_DEAD_49 = [
  "--ds-anchor-border-color",
  "--ds-autocomplete-option-bg-selected",
  "--ds-avatar-default-border",
  "--ds-avatar-error-border",
  "--ds-avatar-gradient-border",
  "--ds-avatar-group-border-color",
  "--ds-avatar-primary-border",
  "--ds-avatar-secondary-border",
  "--ds-avatar-success-border",
  "--ds-avatar-warning-border",
  "--ds-backtop-bg-hover",
  "--ds-bg-active",
  "--ds-bg-disabled",
  "--ds-bg-hover",
  "--ds-bg-tertiary",
  "--ds-calendar-day-bg-hover",
  "--ds-calendar-day-bg-selected",
  "--ds-calendar-day-bg-today",
  "--ds-calendar-day-color",
  "--ds-calendar-day-color-selected",
  "--ds-checkbox-border-disabled",
  "--ds-color-accent-live-bg",
  "--ds-color-alpha-info-20",
  "--ds-datepicker-clear-color-hover",
  "--ds-datepicker-color-placeholder",
  "--ds-dropdown-border",
  "--ds-image-bg",
  "--ds-image-border",
  "--ds-inputnumber-border-hover",
  "--ds-inputnumber-control-color-hover",
  "--ds-list-item-border",
  "--ds-notification-border",
  "--ds-notification-content-color",
  "--ds-pagination-item-border-active",
  "--ds-radio-border-disabled",
  "--ds-radio-button-bg",
  "--ds-radio-button-bg-checked",
  "--ds-radio-button-border",
  "--ds-radio-button-color-checked",
  "--ds-shadow-error",
  "--ds-shadow-success",
  "--ds-shadow-warning",
  "--ds-slider-handle-shadow-hover",
  "--ds-slider-tooltip-bg",
  "--ds-slider-tooltip-color",
  "--ds-stats-grid-hover-shadow",
  "--ds-steps-item-bg-complete",
  "--ds-switch-bg-disabled",
  "--ds-tree-connector-color",
] as const;

const BITHIRE_DEAD_13 = [
  "--ds-badge-default-border",
  "--ds-badge-error-border",
  "--ds-badge-info-border",
  "--ds-badge-primary-border",
  "--ds-badge-secondary-border",
  "--ds-badge-success-border",
  "--ds-badge-warning-border",
  "--ds-button-default-border-color",
  "--ds-button-secondary-border-color",
  "--ds-chip-bg",
  "--ds-chip-border",
  "--ds-chip-color",
  "--ds-color-accent-live-bg",
] as const;

const DEAD_61 = [...new Set([...ROTTAY_DEAD_49, ...BITHIRE_DEAD_13])].sort();
const DEAD_SET = new Set(DEAD_61);

const PALETTE_ROTTAY_35 = [
  "--ds-color-primary-hover",
  "--ds-color-secondary-hover",
  "--ds-color-accent-hover",
  ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => `--ds-color-neutral-${s}`),
  "--ds-color-bg-overlay",
  "--ds-color-text-primary",
  "--ds-color-text-secondary",
  "--ds-color-text-tertiary",
  "--ds-color-text-muted",
  "--ds-color-text-disabled",
  "--ds-color-border",
  "--ds-color-border-primary",
  "--ds-color-border-secondary",
  "--ds-color-border-subtle",
  "--ds-color-border-tertiary",
  "--ds-color-success-bg",
  "--ds-color-success-border",
  "--ds-color-warning-bg",
  "--ds-color-warning-border",
  "--ds-color-error-bg",
  "--ds-color-error-border",
  "--ds-color-info-bg",
  "--ds-color-info-border",
  "--ds-color-interactive-bg-hover",
  "--ds-color-interactive-bg-active",
  "--ds-color-interactive-bg-muted",
] as const;

const PALETTE_BITHIRE_30 = [
  "--ds-color-primary-hover",
  "--ds-color-secondary-hover",
  "--ds-color-accent-hover",
  ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => `--ds-color-neutral-${s}`),
  "--ds-color-bg-primary",
  "--ds-color-bg-surface",
  "--ds-color-text-tertiary",
  "--ds-color-border",
  "--ds-color-border-tertiary",
  "--ds-color-border-subtle",
  "--ds-color-success-bg",
  "--ds-color-success-border",
  "--ds-color-warning-bg",
  "--ds-color-warning-border",
  "--ds-color-error-bg",
  "--ds-color-error-border",
  "--ds-color-info-bg",
  "--ds-color-info-border",
  "--ds-color-interactive-bg-hover",
  "--ds-color-interactive-bg-active",
  "--ds-color-interactive-bg-muted",
] as const;

const PALETTE_EVNTO_25 = [
  "--ds-color-primary-hover",
  "--ds-color-secondary-hover",
  "--ds-color-accent-hover",
  ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => `--ds-color-neutral-${s}`),
  "--ds-color-bg-overlay",
  "--ds-color-text-primary",
  "--ds-color-text-secondary",
  "--ds-color-text-tertiary",
  "--ds-color-text-muted",
  "--ds-color-text-disabled",
  "--ds-color-border-primary",
  "--ds-color-border-secondary",
  "--ds-color-success-bg",
  "--ds-color-warning-bg",
  "--ds-color-error-bg",
  "--ds-color-info-bg",
] as const;

const PALETTE_UNION_37 = [...new Set([...PALETTE_ROTTAY_35, ...PALETTE_BITHIRE_30, ...PALETTE_EVNTO_25])].sort();

const ledger = JSON.parse(readFileSync(LEDGER_PATH, "utf8")) as Record<string, unknown>;
const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as {
  capabilityGaps: Record<string, number>;
  metrics: Record<string, { bytes: number; rules: number; declarations: number; literals: number }>;
  grandfather: Record<string, { capabilityGapRegionSizes?: Record<string, number> }>;
};

/** Sorted roster + final newline, the hashing convention for these authorities. */
function rosterHash(names: readonly string[]): string {
  return createHash("sha256")
    .update([...names].sort().join("\n") + "\n")
    .digest("hex");
}

// ── shared recognizers ─────────────────────────────────────────────────────

/**
 * Extract the first argument of every `var()` call in a CSS declaration value.
 * Case-insensitive (`VAR(...)` works), skips block comments and strings, and
 * respects exact token boundaries so `--ds-a` does not match `--ds-a-b`.
 */
function cssVarArguments(value: string): string[] {
  const args: string[] = [];
  let i = 0;
  const len = value.length;

  const isIdentChar = (c: string) => /[a-zA-Z0-9_-]/.test(c);

  while (i < len) {
    const c = value[i];

    // skip block comments
    if (c === "/" && value[i + 1] === "*") {
      i += 2;
      while (i < len && !(value[i] === "*" && value[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    // skip strings
    if (c === '"' || c === "'") {
      const quote = c;
      i++;
      while (i < len) {
        if (value[i] === "\\") {
          i += 2;
          continue;
        }
        if (value[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // look for var( case-insensitively
    if ((c === "v" || c === "V") && /^var$/i.test(value.slice(i, i + 3)) && value[i + 3] === "(") {
      i += 4;
      // skip whitespace and comments before the first argument
      while (i < len) {
        if (/\s/.test(value[i])) {
          i++;
          continue;
        }
        if (value[i] === "/" && value[i + 1] === "*") {
          i += 2;
          while (i < len && !(value[i] === "*" && value[i + 1] === "/")) i++;
          i += 2;
          continue;
        }
        break;
      }

      if (value[i] === "-" && value[i + 1] === "-") {
        let j = i + 2;
        while (j < len && isIdentChar(value[j])) j++;
        const name = value.slice(i, j);

        // after the name, skip whitespace/comments and require ',' or ')'
        let k = j;
        while (k < len) {
          if (/\s/.test(value[k])) {
            k++;
            continue;
          }
          if (value[k] === "/" && value[k + 1] === "*") {
            k += 2;
            while (k < len && !(value[k] === "*" && value[k + 1] === "/")) k++;
            k += 2;
            continue;
          }
          break;
        }
        if (k < len && (value[k] === "," || value[k] === ")")) {
          args.push(name);
        }
        i = j;
        continue;
      }
    }

    i++;
  }

  return args;
}

const CSSOM_NAMES = new Set(["setProperty", "getPropertyValue", "removeProperty"]);

function isCssomCallee(expr: ts.Expression): boolean {
  if (ts.isPropertyAccessExpression(expr)) return CSSOM_NAMES.has(expr.name.text);
  if (ts.isElementAccessExpression(expr)) {
    const key = staticStringValue(expr.argumentExpression);
    return key !== undefined && CSSOM_NAMES.has(key);
  }
  return false;
}

function staticStringValue(node: ts.Node | undefined): string | undefined {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) return node.text;
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node)
  )
    return staticStringValue(node.expression);
  if (ts.isTypeAssertionExpression(node)) return staticStringValue(node.expression);
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = staticStringValue(node.left);
    const right = staticStringValue(node.right);
    if (left !== undefined && right !== undefined) return left + right;
  }
  return undefined;
}

function createSourceFile(source: string, fileName: string): ts.SourceFile {
  const scriptKind = fileName.endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : fileName.endsWith(".jsx")
      ? ts.ScriptKind.JSX
      : fileName.endsWith(".mts")
        ? ts.ScriptKind.MTS
        : fileName.endsWith(".cts")
          ? ts.ScriptKind.CTS
          : fileName.endsWith(".mjs") || fileName.endsWith(".js") || fileName.endsWith(".cjs")
            ? ts.ScriptKind.JS
            : ts.ScriptKind.TS;
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, scriptKind);
}

function createInMemoryChecker(sf: ts.SourceFile, fileName: string): ts.TypeChecker {
  const isJsx = fileName.endsWith(".tsx") || fileName.endsWith(".jsx");
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    allowJs: true,
    jsx: isJsx ? ts.JsxEmit.React : ts.JsxEmit.None,
    noEmit: true,
    skipLibCheck: true,
  };
  const host = ts.createCompilerHost(options, true);
  const originalGetSourceFile = host.getSourceFile;
  host.getSourceFile = (name, languageVersion, ...args) => {
    if (name === fileName) return sf;
    return (originalGetSourceFile as unknown as typeof host.getSourceFile)(name, languageVersion, ...args);
  };
  const program = ts.createProgram([fileName], options, host);
  return program.getTypeChecker();
}

function resolveIdentifier(node: ts.Identifier, checker: ts.TypeChecker): string | undefined {
  const symbol = checker.getSymbolAtLocation(node);
  if (!symbol) return undefined;
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!decl || !ts.isVariableDeclaration(decl)) return undefined;
  const list = decl.parent;
  if (!ts.isVariableDeclarationList(list)) return undefined;
  if (!(list.flags & ts.NodeFlags.Const)) return undefined;
  if (!decl.initializer) return undefined;
  return staticStringValue(decl.initializer);
}

function resolveCallArg(
  node: ts.Node | undefined,
  sf: ts.SourceFile,
  getChecker: () => ts.TypeChecker,
): string | undefined {
  if (!node) return undefined;
  const direct = staticStringValue(node);
  if (direct !== undefined) return direct;
  if (ts.isIdentifier(node)) return resolveIdentifier(node, getChecker());
  return undefined;
}

function extractStaticString(node: ts.Node): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) return node.text;
  if (ts.isJsxText(node)) return node.text;
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isTypeAssertionExpression(node)
  )
    return extractStaticString(node.expression);
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = extractStaticString(node.left);
    const right = extractStaticString(node.right);
    if (left !== undefined && right !== undefined) return left + right;
  }
  return undefined;
}

type ConsumerHit = { name: string; kind: "css-var" | "cssom" };

/**
 * Shared source scanner used by the live filesystem walk and by every consumer
 * mutant. For CSS it walks declarations with PostCSS + cssVarArguments. For
 * TS/JS/TSX/JSX it extracts every static string/template/JSX text, runs it
 * through cssVarArguments, and resolves CSSOM setProperty/getPropertyValue/
 * removeProperty calls with lexical const binding (TypeChecker), PropertyAccess
 * or static ElementAccess callee, and simple static concatenations.
 */
function scanDeadConsumerSource(text: string, fileName: string): ConsumerHit[] {
  if (fileName.endsWith(".css")) {
    const root = postcss.parse(text, { from: fileName });
    const hits: ConsumerHit[] = [];
    root.walkDecls((d) => {
      for (const name of cssVarArguments(d.value)) {
        if (DEAD_SET.has(name)) hits.push({ name, kind: "css-var" });
      }
    });
    return hits;
  }

  const sf = createSourceFile(text, fileName);
  let checker: ts.TypeChecker | undefined;
  function getChecker(): ts.TypeChecker {
    if (!checker) checker = createInMemoryChecker(sf, fileName);
    return checker;
  }
  const hits: ConsumerHit[] = [];

  function visit(node: ts.Node) {
    const staticText = extractStaticString(node);
    if (staticText !== undefined) {
      for (const name of cssVarArguments(staticText)) {
        if (DEAD_SET.has(name)) hits.push({ name, kind: "css-var" });
      }
    }

    if (ts.isCallExpression(node) && isCssomCallee(node.expression)) {
      const val = resolveCallArg(node.arguments[0], sf, getChecker);
      if (val && DEAD_SET.has(val)) hits.push({ name: val, kind: "cssom" });
    }

    ts.forEachChild(node, visit);
  }
  visit(sf);
  return hits;
}

function sourceFiles() {
  const out: string[] = [];
  const SOURCE_EXTS = /\.(css|ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
  const TEST_RE = /\.(test|spec|stories)\.(ts|tsx|js|jsx|mjs|cjs)$/;
  const GENERATED_INDEX_CSS_RE = /\/_generated\/index\.css$/;
  function walk(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (
          [
            "node_modules",
            ".next",
            "dist",
            "build",
            "out",
            ".turbo",
            "coverage",
            "storybook-static",
            "__tests__",
            "tests",
            "test-artifacts",
            "evidence",
          ].includes(e.name)
        )
          continue;
        walk(p);
      } else if (SOURCE_EXTS.test(e.name)) {
        if (TEST_RE.test(e.name)) continue;
        if (GENERATED_INDEX_CSS_RE.test(p)) continue;
        out.push(p);
      }
    }
  }
  walk(join(TOKENS_DIR, "../..")); // packages/core/src
  walk(join(TOKENS_DIR, "../../../../showroom/src"));
  return out;
}

/** Shared filesystem consumer scanner. */
function scanDeadConsumers(): Record<string, { file: string; count: number }[]> {
  const all: Record<string, { file: string; count: number }[]> = {};
  for (const f of sourceFiles()) {
    const tally = new Map<string, number>();
    const text = readFileSync(f, "utf8");
    for (const { name } of scanDeadConsumerSource(text, f)) {
      tally.set(name, (tally.get(name) ?? 0) + 1);
    }
    for (const [name, count] of tally) {
      (all[name] ??= []).push({ file: f, count });
    }
  }
  return all;
}

/** Shared extension absence enforcer used by live tests and re-insert mutants. */
function enforceExtensionDeadAbsent(cssText: string, roster: Set<string>): string[] {
  const root = postcss.parse(cssText);
  const violations: string[] = [];
  root.walkDecls((d) => {
    if (roster.has(d.prop)) violations.push(d.prop);
  });
  return [...new Set(violations)].sort();
}

// ── authority pins ─────────────────────────────────────────────────────────

describe("VERTICAL-DEAD-61 authority pins", () => {
  it("rosters are nonempty and hash to the signed values", () => {
    expect(ROTTAY_DEAD_49.length).toBe(49);
    expect(BITHIRE_DEAD_13.length).toBe(13);
    expect(DEAD_61.length).toBe(61);

    expect(rosterHash(ROTTAY_DEAD_49)).toBe(
      "ae3ce9da1d3a980834e19d6dd5400559a22f58c2d7465b38bf93b0e739efb4e1",
    );
    expect(rosterHash(BITHIRE_DEAD_13)).toBe(
      "27d1edc6685f3e3edcc8eef64af8ffadbe146501bc2037d161f25b8074909b9e",
    );
    expect(rosterHash(DEAD_61)).toBe(
      "0c77ff663d25e076723f77e729c4f2b1c7407ae3ac1b24bb445a44fd87767a27",
    );
  });

  it("PALETTE90 memberships hash to the signed values", () => {
    expect(PALETTE_ROTTAY_35.length).toBe(35);
    expect(PALETTE_BITHIRE_30.length).toBe(30);
    expect(PALETTE_EVNTO_25.length).toBe(25);
    expect(PALETTE_UNION_37.length).toBe(37);

    expect(rosterHash(PALETTE_ROTTAY_35)).toBe(
      "88d05e844187480a0f2c2312caf79b466239521ae1410288fc5ee428eae5bba0",
    );
    expect(rosterHash(PALETTE_BITHIRE_30)).toBe(
      "94f64e7280f0e4029bcee683060a8fa24e626c746309e954ad592c4b19c1be57",
    );
    expect(rosterHash(PALETTE_EVNTO_25)).toBe(
      "5a50d8e5ba17c4bd5e49b66a50012c28ea3e27767d8b73ea0b220d5a3ca0b7a4",
    );
    expect(rosterHash(PALETTE_UNION_37)).toBe(
      "6439f22d5ca9c01a12efe893f28f1ec0df3db81ba11107b503523070b39a9416",
    );
  });

  it("DEAD is disjoint from PALETTE and from CONFLICT9", () => {
    const paletteUnion = new Set(PALETTE_UNION_37);
    const conflict = new Set([
      "--ds-card-shadow-elevated",
      "--ds-color-bg-input",
      "--ds-color-error",
      "--ds-color-info",
      "--ds-font-family-base",
      "--ds-font-family-display",
      "--ds-font-family-heading",
      "--ds-color-bg-primary",
      "--ds-surface-card-border-strong",
    ]);
    expect(DEAD_61.filter((n) => paletteUnion.has(n))).toEqual([]);
    expect(DEAD_61.filter((n) => conflict.has(n))).toEqual([]);
  });
});

// ── ledger closure ─────────────────────────────────────────────────────────

describe("ledger is closed and the residue distribution is durable", () => {
  const entries = ledger.entries as Record<string, LedgerEntry>;
  type LedgerEntry = {
    brandAuthoredResidue?: {
      verdict: string;
      authoredIn?: Record<string, unknown>;
      meaning: string;
      historicalSnapshot?: { verdict: string; meaning: string };
      retiredBy?: string;
      retiredOn?: string;
    };
    readers: { coreSrc: number; showroom: number; apps: number };
    finalState: string;
    executionEvidence?: {
      partialRetirement?: string;
      partialRetirementHistoricalSnapshot?: string;
      stillShipsFrom?: unknown;
      shippedFromUntilResidueDrain?: unknown;
    };
  };

  const derivedDead = Object.entries(entries)
    .filter(([_, e]) => e.brandAuthoredResidue && e.readers.coreSrc === 0 && e.readers.showroom === 0 && e.readers.apps === 0)
    .map(([n]) => n)
    .sort();

  it("derives exactly the 61 signed DEAD names from the ledger", () => {
    expect(derivedDead).toEqual(DEAD_61);
  });

  it("every DEAD row is EXECUTED and carries explicit retirement provenance", () => {
    for (const name of DEAD_61) {
      const e = entries[name];
      expect(e.finalState, `${name} finalState`).toBe("EXECUTED");
      expect(e.brandAuthoredResidue?.verdict, `${name} verdict`).toBe("RETIRED_SOURCE_ONLY");
      expect(e.brandAuthoredResidue?.retiredBy, `${name} retiredBy`).toBe("VERTICAL-DEAD-61");
      expect(e.brandAuthoredResidue?.retiredOn, `${name} retiredOn`).toBe("2026-08-14");
      expect(e.brandAuthoredResidue?.historicalSnapshot?.verdict, `${name} historicalSnapshot`).toBe(
        "KEEP_BRAND_AUTHORED_PENDING_OWNER",
      );
    }
  });

  it("no DEAD row still claims a KEEP_PENDING or still-ships live state", () => {
    const livePattern = /KEEP_.*PENDING|still ships/i;
    for (const name of DEAD_61) {
      const e = entries[name];
      const liveView = JSON.parse(
        JSON.stringify({
          ...e,
          brandAuthoredResidue: { ...e.brandAuthoredResidue, historicalSnapshot: undefined },
          executionEvidence: { ...e.executionEvidence, partialRetirementHistoricalSnapshot: undefined },
        }),
      );
      expect(JSON.stringify(liveView), `${name} live fields must not assert pending/still-ships`).not.toMatch(livePattern);
    }
  });

  it("ledger final-state distribution and reconciliation are durable", () => {
    const computed = new Map<string, number>();
    for (const e of Object.values(entries)) {
      computed.set(e.finalState, (computed.get(e.finalState) ?? 0) + 1);
    }
    const expectedDistribution: Record<string, number> = {};
    for (const [state, count] of computed) expectedDistribution[state] = count;

    const distribution = (ledger.finalStateVocabulary as { distribution: Record<string, number> }).distribution;
    expect(distribution).toEqual(expectedDistribution);

    const totalRows = Object.keys(entries).length;
    expect(totalRows).toBe(Object.values(distribution).reduce((a, b) => a + b, 0));

    const canonicalOrder = ["EXECUTED", "KEEP_ACTIVE", "OWNER_DECISION", "SIGHTED_PENDING"];
    const parts = canonicalOrder
      .filter((s) => distribution[s] !== undefined)
      .map((s) => `${distribution[s]} ${s}`);
    expect((ledger.finalStateVocabulary as { reconciliation: string }).reconciliation).toBe(
      `${totalRows} rows = ${parts.join(" + ")}`,
    );
  });

  it("top-level receipt carries the 61/hash/memberships evidence", () => {
    const receipt = ledger.verticalDeadOnlySourceDrain as {
      id: string;
      names: number;
      verticalMemberships: number;
      declarationsRemoved: number;
      perVertical: Record<string, { names: number; declarations: number }>;
      rosterSha256: Record<string, string>;
      generatedParity: string;
    };
    expect(receipt.id).toBe("VERTICAL-DEAD-61");
    expect(receipt.names).toBe(61);
    expect(receipt.verticalMemberships).toBe(62);
    expect(receipt.declarationsRemoved).toBe(112);
    expect(receipt.perVertical.rottay).toEqual({ names: 49, declarations: 98 });
    expect(receipt.perVertical.bithire).toEqual({ names: 13, declarations: 14 });
    expect(receipt.perVertical.evnto).toEqual({ names: 0, declarations: 0 });
    expect(receipt.rosterSha256.global).toBe(
      "0c77ff663d25e076723f77e729c4f2b1c7407ae3ac1b24bb445a44fd87767a27",
    );
    expect(receipt.rosterSha256.rottay).toBe(
      "ae3ce9da1d3a980834e19d6dd5400559a22f58c2d7465b38bf93b0e739efb4e1",
    );
    expect(receipt.rosterSha256.bithire).toBe(
      "27d1edc6685f3e3edcc8eef64af8ffadbe146501bc2037d161f25b8074909b9e",
    );
    expect(receipt.generatedParity).toBe("GENERATED-PENDING");
  });

  it("exactly the 61 residue rows were touched; no other identity has retirement metadata", () => {
    const withResidue = Object.entries(entries).filter(([_, e]) => e.brandAuthoredResidue).map(([n]) => n);
    const withRetiredBy = Object.entries(entries).filter(
      ([_, e]) => e.brandAuthoredResidue?.retiredBy === "VERTICAL-DEAD-61",
    ).map(([n]) => n);
    expect(new Set(withResidue)).toEqual(new Set(DEAD_61));
    expect(new Set(withRetiredBy)).toEqual(new Set(DEAD_61));
  });
});

// ── extension absence ──────────────────────────────────────────────────────

describe("extensions no longer declare the DEAD names", () => {
  function extensionText(slug: string) {
    return readFileSync(join(ARTIFACTS_DIR, slug, "_source/extension.css"), "utf8");
  }

  it("rottay extension removed exactly the 49 DEAD names", () => {
    expect(enforceExtensionDeadAbsent(extensionText("rottay"), new Set(ROTTAY_DEAD_49))).toEqual([]);
  });

  it("bithire extension removed exactly the 13 DEAD names", () => {
    expect(enforceExtensionDeadAbsent(extensionText("bithire"), new Set(BITHIRE_DEAD_13))).toEqual([]);
  });

  it("evnto extension never carried any DEAD name", () => {
    expect(enforceExtensionDeadAbsent(extensionText("evnto"), DEAD_SET)).toEqual([]);
  });

  it("longer-prefix homonyms survive exact-name deletion", () => {
    const root = postcss.parse(extensionText("rottay"));
    let homonyms = 0;
    root.walkDecls((d) => {
      if (d.prop === "--ds-calendar-day-color-other") homonyms++;
    });
    expect(homonyms).toBe(2); // dark + light
  });
});

// ── durable baseline / gate contract ───────────────────────────────────────

describe("artifact provenance gate ratchets hold after the drain", () => {
  it("no DEAD name is among the live capability-gap re-declared channels", async () => {
    const gate = (await import("../../../../scripts/artifact-provenance-gate.mjs")) as {
      run: (opts: { baseline: unknown }) => { results: GateResult[] };
    };
    const { results } = gate.run({ baseline });
    const liveChannels = new Set<string>();
    for (const r of results) {
      for (const ch of r.observed.capabilityGapChannels) liveChannels.add(ch);
    }
    expect(DEAD_61.filter((n) => liveChannels.has(n))).toEqual([]);
  });

  it("R/B live volumes are at or below the post-DEAD baseline (decrease-only)", async () => {
    const gate = (await import("../../../../scripts/artifact-provenance-gate.mjs")) as {
      run: (opts: { baseline: unknown }) => { results: GateResult[] };
    };
    const { results } = gate.run({ baseline });
    for (const slug of ["rottay", "bithire"] as const) {
      const r = results.find((x) => x.slug === slug)!;
      const cap = baseline.metrics[slug];
      expect(r.metrics.total.bytes, `${slug} bytes`).toBeLessThanOrEqual(cap.bytes);
      expect(r.metrics.total.declarations, `${slug} declarations`).toBeLessThanOrEqual(cap.declarations);
      expect(r.metrics.total.literals, `${slug} literals`).toBeLessThanOrEqual(cap.literals);
      expect(r.capabilityGaps, `${slug} capabilityGaps`).toBeLessThanOrEqual(baseline.capabilityGaps[slug]);

      const allowedSizes = baseline.grandfather[slug].capabilityGapRegionSizes ?? {};
      const liveSizes = new Map(r.observed.capabilityGapRegionSizes);
      for (const [key, ceiling] of Object.entries(allowedSizes)) {
        expect(liveSizes.get(key) ?? 0, `${slug} ${key}`).toBeLessThanOrEqual(ceiling);
      }
    }
  });

  type GateResult = {
    slug: string;
    observed: { capabilityGapChannels: Iterable<string>; capabilityGapRegionSizes: Iterable<[string, number]> };
    metrics: { total: { bytes: number; declarations: number; literals: number } };
    capabilityGaps: number;
  };
});

// ── productive-consumer scan ───────────────────────────────────────────────

describe("zero productive consumers in Core + Showroom", () => {
  it("no DEAD name has a productive var()/property-access consumer", () => {
    expect(scanDeadConsumers()).toEqual({});
  });

  it("scanner positive controls find known live consumers", () => {
    const css = readFileSync(join(ROOT, "src/foundation/tokens/css/foundation/themes/default.css"), "utf8");
    const primary = cssVarArguments(css).filter((n) => n === "--ds-color-primary").length;
    const text = cssVarArguments(css).filter((n) => n === "--ds-color-text-primary").length;
    expect(primary).toBeGreaterThan(0);
    expect(text).toBeGreaterThan(0);
  });

  it("scanner respects exact token boundaries (homonym green)", () => {
    const sample = "var(--ds-calendar-day-color) var(--ds-calendar-day-color-other)";
    expect(cssVarArguments(sample).filter((n) => n === "--ds-calendar-day-color")).toHaveLength(1);
  });
});

// ── recognizer causal minima ───────────────────────────────────────────────

function namesFrom(hits: ConsumerHit[]): string[] {
  return hits.map((h) => h.name);
}

describe("shared recognizer causal minima", () => {
  it("detects var() with an inline comment before the name", () => {
    expect(namesFrom(scanDeadConsumerSource("color: var(/*gap*/--ds-chip-bg);", "x.css"))).toEqual(["--ds-chip-bg"]);
  });

  it("detects uppercase VAR()", () => {
    expect(namesFrom(scanDeadConsumerSource("color: VAR(--ds-chip-bg);", "x.css"))).toEqual(["--ds-chip-bg"]);
  });

  it("detects CSSOM setProperty with a template literal", () => {
    const src = "element.style.setProperty(`--ds-chip-bg`, 'red');";
    expect(namesFrom(scanDeadConsumerSource(src, "x.ts"))).toEqual(["--ds-chip-bg"]);
  });

  it("detects setProperty with a commented argument", () => {
    const src = 'element.style.setProperty("--ds-chip-bg" /* gap */ , \'red\');';
    expect(namesFrom(scanDeadConsumerSource(src, "x.ts"))).toEqual(["--ds-chip-bg"]);
  });

  it("detects setProperty through a simple const-bound identifier", () => {
    const src = "const x = \"--ds-chip-bg\"; element.style.setProperty(x, 'red');";
    expect(namesFrom(scanDeadConsumerSource(src, "x.ts"))).toEqual(["--ds-chip-bg"]);
  });

  it("does not count longer-prefix homonyms", () => {
    const css = "color: var(--ds-calendar-day-color-other);";
    expect(scanDeadConsumerSource(css, "x.css").filter((h) => h.name === "--ds-calendar-day-color")).toHaveLength(0);
  });
});

// ── scanner scope / callee boundaries ──────────────────────────────────────

describe("shared scanner scope and callee boundaries", () => {
  it("parameter shadow hides outer const dead binding (green)", () => {
    const src = `
      function a() {
        const x = "--ds-chip-bg";
        function b(x: string) {
          el.style.setProperty(x, v);
        }
      }
    `;
    expect(scanDeadConsumerSource(src, "x.ts")).toEqual([]);
  });

  it("inner const live shadows outer const dead (green)", () => {
    const src = `
      const x = "--ds-chip-bg";
      {
        const x = "--ds-color-primary";
        el.style.setProperty(x, v);
      }
    `;
    expect(scanDeadConsumerSource(src, "x.ts")).toEqual([]);
  });

  it("visible const alias to dead resolves through the type checker (red)", () => {
    const src = 'const y = "--ds-chip-bg"; el.style.setProperty(y, v);';
    expect(namesFrom(scanDeadConsumerSource(src, "x.ts"))).toEqual(["--ds-chip-bg"]);
  });

  it("bare local function named setProperty is not CSSOM (green)", () => {
    const src = `
      function setProperty(x: string, v: string) { /* no-op */ }
      setProperty("--ds-chip-bg", v);
    `;
    expect(scanDeadConsumerSource(src, "x.ts")).toEqual([]);
  });

  it("ElementAccessExpression with static key setProperty is CSSOM (red)", () => {
    const src = "el.style['setProperty']('--ds-chip-bg', v);";
    expect(namesFrom(scanDeadConsumerSource(src, "x.ts"))).toEqual(["--ds-chip-bg"]);
  });

  it("JSX style string containing var() is a productive consumer (red)", () => {
    const src = 'const u = <div style="color: var(/*gap*/--ds-chip-bg)" />;';
    expect(namesFrom(scanDeadConsumerSource(src, "x.tsx"))).toEqual(["--ds-chip-bg"]);
  });

  it("simple binary-concat const binding to dead is resolved (red)", () => {
    const src = 'const x = "--ds-" + "chip-bg"; el.style.setProperty(x, v);';
    expect(namesFrom(scanDeadConsumerSource(src, "x.ts"))).toEqual(["--ds-chip-bg"]);
  });
});

// ── planted mutants turn red ───────────────────────────────────────────────

describe("planted mutants turn red", () => {
  function insertDecl(cssText: string, selector: string, prop: string, value: string): string {
    const root = postcss.parse(cssText);
    root.walkRules((rule) => {
      if (rule.selector === selector) rule.append(postcss.decl({ prop, value }));
    });
    return root.toString();
  }

  it("re-inserting a rottay dark dead declaration is detected by the shared enforcer", () => {
    const mutated = insertDecl(
      readFileSync(join(ARTIFACTS_DIR, "rottay/_source/extension.css"), "utf8"),
      "html[data-tenant='rottay']:not([data-theme='light']):not(.light)",
      "--ds-bg-hover",
      "red",
    );
    expect(enforceExtensionDeadAbsent(mutated, new Set(ROTTAY_DEAD_49))).toContain("--ds-bg-hover");
  });

  it("re-inserting a rottay light dead declaration is detected by the shared enforcer", () => {
    const mutated = insertDecl(
      readFileSync(join(ARTIFACTS_DIR, "rottay/_source/extension.css"), "utf8"),
      "html[data-tenant='rottay'][data-theme='light'],\nhtml[data-tenant='rottay'].light",
      "--ds-bg-hover",
      "red",
    );
    expect(enforceExtensionDeadAbsent(mutated, new Set(ROTTAY_DEAD_49))).toContain("--ds-bg-hover");
  });

  it("re-inserting a bithire root dead declaration is detected by the shared enforcer", () => {
    const mutated = insertDecl(
      readFileSync(join(ARTIFACTS_DIR, "bithire/_source/extension.css"), "utf8"),
      'html[data-tenant="bithire"]:not([data-theme="dark"]):not(.dark)',
      "--ds-chip-bg",
      "red",
    );
    expect(enforceExtensionDeadAbsent(mutated, new Set(BITHIRE_DEAD_13))).toContain("--ds-chip-bg");
  });

  it("re-inserting a bithire dark dead declaration is detected by the shared enforcer", () => {
    const mutated = insertDecl(
      readFileSync(join(ARTIFACTS_DIR, "bithire/_source/extension.css"), "utf8"),
      'html[data-tenant="bithire"][data-theme="dark"],\nhtml[data-tenant="bithire"].dark',
      "--ds-color-accent-live-bg",
      "red",
    );
    expect(enforceExtensionDeadAbsent(mutated, new Set(BITHIRE_DEAD_13))).toContain("--ds-color-accent-live-bg");
  });

  it("a new CSS consumer of a DEAD name is detected by the shared scanner", () => {
    const fixture = ".x { color: var(/*gap*/--ds-chip-bg); }";
    expect(namesFrom(scanDeadConsumerSource(fixture, "x.css"))).toContain("--ds-chip-bg");
  });

  it("a new TS consumer of a DEAD name is detected by the shared scanner", () => {
    const fixture = "const x = `--ds-chip-bg`; el.style.setProperty(x, 'red');";
    expect(namesFrom(scanDeadConsumerSource(fixture, "x.ts"))).toEqual(["--ds-chip-bg"]);
  });

  it("ledger missing-row mutant fails closed", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const entry = (mutated.entries as Record<string, { finalState: string; brandAuthoredResidue?: { retiredBy?: string } }>)["--ds-chip-bg"];
    entry.finalState = "OWNER_DECISION";
    delete entry.brandAuthoredResidue?.retiredBy;
    const retired = Object.entries(mutated.entries).filter(([_, e]) => e.brandAuthoredResidue?.retiredBy === "VERTICAL-DEAD-61").length;
    expect(retired).not.toBe(61);
  });

  it("ledger extra-row mutant fails closed", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const entries = mutated.entries as Record<string, { brandAuthoredResidue?: { retiredBy?: string }; finalState?: string }>;
    entries["--ds-color-bg"].brandAuthoredResidue = { retiredBy: "VERTICAL-DEAD-61" };
    entries["--ds-color-bg"].finalState = "EXECUTED";
    const retired = Object.entries(entries).filter(([_, e]) => e.brandAuthoredResidue?.retiredBy === "VERTICAL-DEAD-61").length;
    expect(retired).not.toBe(61);
  });
});
