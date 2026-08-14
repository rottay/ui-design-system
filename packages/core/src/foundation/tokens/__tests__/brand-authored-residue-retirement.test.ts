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

import { compileBrandTheme } from "../../../infrastructure/compilers/kernel/runtime/brand-theme";
import { bithireBrandTheme } from "../ts/presentation/brand-themes/bithire";
import { evntoBrandTheme } from "../ts/presentation/brand-themes/evnto";
import { rottayBrandTheme } from "../ts/presentation/brand-themes/rottay";

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

/**
 * VERTICAL-PALETTE-90/89 — move byte-equivalent palette channels from the
 * artifact extensions into the typed BrandPalette contract.
 *
 * planned90 = R35 + B30 + E25 (one name, --ds-color-bg-primary, collided with
 * VERTICAL-CONFLICT-9 and was pre-retired). executed89 = R35 + B29 + E25.
 */
const PALETTE_BITHIRE_29 = PALETTE_BITHIRE_30.filter((n) => n !== "--ds-color-bg-primary");
const PALETTE_UNION_36 = [...new Set([...PALETTE_ROTTAY_35, ...PALETTE_BITHIRE_29, ...PALETTE_EVNTO_25])].sort();
const PALETTE_MEMBERSHIP_89 = [...PALETTE_ROTTAY_35, ...PALETTE_BITHIRE_29, ...PALETTE_EVNTO_25].sort();

type RosterMode = "default" | "light" | "dark";

/**
 * Compile a brand theme live and hash the sorted "channel=value\n" pairs for
 * every channel in a PALETTE roster. This catches byte-equivalent drift: a
 * same-length value change (e.g. #D4D4D8 -> #A4A4A8) breaks the hash even though
 * roster and declaration counts stay the same.
 */
function compileRosterEffectiveHash(
  brandTheme: unknown,
  slug: string,
  roster: readonly string[],
  mode: RosterMode,
): { hash: string; pairs: string[]; vars: Record<string, string> } {
  const compiled = compileBrandTheme({
    brandTheme: brandTheme as never,
    tenantSlug: slug,
    verticalPersonality: {},
    verticalTokenOverrides: {},
  });
  const baseVars = compiled.cssVariables;
  const modeVars = compiled.modeBlocks?.find((b) => b.mode === mode)?.cssVariables ?? {};
  const vars = mode === "default" ? baseVars : { ...baseVars, ...modeVars };
  const pairs = roster
    .map((ch) => {
      const val = vars[ch];
      return val === undefined ? `${ch}=` : `${ch}=${val}`;
    })
    .sort();
  const hash = createHash("sha256").update(pairs.join("\n") + "\n").digest("hex");
  return { hash, pairs, vars };
}

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

describe("VERTICAL-PALETTE-90/89 authority pins", () => {
  it("planned90 rosters hash to the signed values", () => {
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

  it("executed89 rosters reflect the pre-retired CONFLICT channel", () => {
    expect(PALETTE_BITHIRE_29.length).toBe(29);
    expect(PALETTE_BITHIRE_29).not.toContain("--ds-color-bg-primary");
    expect(PALETTE_BITHIRE_30).toContain("--ds-color-bg-primary");

    expect(PALETTE_ROTTAY_35.length + PALETTE_BITHIRE_29.length + PALETTE_EVNTO_25.length).toBe(89);

    expect(rosterHash(PALETTE_BITHIRE_29)).toBe(
      "76404390b375eeb6d9a0dec6785b166f2cdcd4272a82cd50e029d4409baa6663",
    );
    expect(PALETTE_UNION_36.length).toBe(36);
    expect(rosterHash(PALETTE_UNION_36)).toBe(
      "4f7522b8360f55ad7e7b514ec2e690b8aa08326eb3d5e8c2262545231a1d6a9e",
    );
    expect(PALETTE_MEMBERSHIP_89.length).toBe(89);
    expect(rosterHash(PALETTE_MEMBERSHIP_89)).toBe(
      "b46fb3b4d364e07f05ecba8f5b488367b998c1b4d7d8e8c6993775725ed0fb84",
    );
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

// ── VERTICAL-PALETTE-90/89 extension absence ───────────────────────────────

describe("extensions no longer declare the PALETTE channels", () => {
  function extensionText(slug: string) {
    return readFileSync(join(ARTIFACTS_DIR, slug, "_source/extension.css"), "utf8");
  }

  it("rottay extension removed exactly the 35 PALETTE names", () => {
    expect(enforceExtensionDeadAbsent(extensionText("rottay"), new Set(PALETTE_ROTTAY_35))).toEqual([]);
  });

  it("bithire extension removed exactly the 29 executed PALETTE names", () => {
    expect(enforceExtensionDeadAbsent(extensionText("bithire"), new Set(PALETTE_BITHIRE_29))).toEqual([]);
  });

  it("bithire extension still does not declare the pre-retired --ds-color-bg-primary", () => {
    const root = postcss.parse(extensionText("bithire"));
    const violations: string[] = [];
    root.walkDecls((d) => {
      if (d.prop === "--ds-color-bg-primary") violations.push(d.prop);
    });
    expect(violations).toEqual([]);
  });

  it("evnto extension removed exactly the 25 PALETTE names", () => {
    expect(enforceExtensionDeadAbsent(extensionText("evnto"), new Set(PALETTE_EVNTO_25))).toEqual([]);
  });

});

// ── VERTICAL-PALETTE-90/89 compile-time propagation ────────────────────────

describe("compileBrandTheme propagates the moved PALETTE channels", () => {
  function compile(slug: string, theme: unknown) {
    return compileBrandTheme({
      brandTheme: theme as never,
      tenantSlug: slug,
      verticalPersonality: {},
      verticalTokenOverrides: {},
    });
  }

  it("rottay default (dark) emits the 35 moved channels from the base palette", () => {
    const { cssVariables } = compile("rottay", rottayBrandTheme);
    expect(cssVariables["--ds-color-primary-hover"]).toBe("#E0E0E0");
    expect(cssVariables["--ds-color-neutral-50"]).toBe("#101012");
    expect(cssVariables["--ds-color-bg-overlay"]).toBe("rgba(0, 0, 0, 0.64)");
    expect(cssVariables["--ds-color-text-primary"]).toBe("#F0F0F0");
    expect(cssVariables["--ds-color-border"]).toBe("#28282C");
    expect(cssVariables["--ds-color-success-bg"]).toBe("rgba(34, 197, 94, 0.10)");
    expect(cssVariables["--ds-color-interactive-bg-hover"]).toBe("rgba(255, 255, 255, 0.04)");
  });

  it("bithire default (light) emits the 29 executed channels from the base palette", () => {
    const { cssVariables } = compile("bithire", bithireBrandTheme);
    expect(cssVariables["--ds-color-primary-hover"]).toBe("#2c5587");
    expect(cssVariables["--ds-color-neutral-50"]).toBe("#f3f2ef");
    expect(cssVariables["--ds-color-bg-surface"]).toBe("#ffffff");
    expect(cssVariables["--ds-color-text-tertiary"]).toBe("#7f859b");
    expect(cssVariables["--ds-color-border"]).toBe("#d4e0ea");
    expect(cssVariables["--ds-color-success-bg"]).toBe("#f0fdf4");
    expect(cssVariables["--ds-color-interactive-bg-hover"]).toBe("rgba(10, 102, 194, 0.06)");
  });

  it("bithire --ds-color-bg-primary is the pre-retired CONFLICT channel, not a PALETTE re-ownership", () => {
    const { cssVariables } = compile("bithire", bithireBrandTheme);
    expect(cssVariables["--ds-color-bg-primary"]).toBe("#F4F8FB");
    expect(PALETTE_BITHIRE_29).not.toContain("--ds-color-bg-primary");
  });

  it("evnto default (light) emits the 25 moved channels from the base palette", () => {
    const { cssVariables } = compile("evnto", evntoBrandTheme);
    expect(cssVariables["--ds-color-primary-hover"]).toBe("#262626");
    expect(cssVariables["--ds-color-neutral-50"]).toBe("#fafafa");
    expect(cssVariables["--ds-color-bg-overlay"]).toBe("rgba(0, 0, 0, 0.5)");
    expect(cssVariables["--ds-color-text-primary"]).toBe("#111111");
    expect(cssVariables["--ds-color-border-primary"]).toBe("rgba(0, 0, 0, 0.08)");
    expect(cssVariables["--ds-color-success-bg"]).toBe("#f0fdf4");
  });

  it("evnto dark mode adds exactly the 7 signed reset pins", () => {
    const { modeBlocks } = compile("evnto", evntoBrandTheme);
    const dark = modeBlocks?.find((b) => b.mode === "dark");
    expect(dark).toBeDefined();
    expect(dark!.cssVariables["--ds-color-accent-hover"]).toBe("var(--ds-color-secondary-hover)");
    expect(dark!.cssVariables["--ds-color-bg-overlay"]).toBe("rgba(2, 6, 23, 0.88)");
    expect(dark!.cssVariables["--ds-color-text-tertiary"]).toBe("var(--ds-color-neutral-600)");
    expect(dark!.cssVariables["--ds-color-success-bg"]).toBe("var(--ds-color-success-50)");
    expect(dark!.cssVariables["--ds-color-warning-bg"]).toBe("var(--ds-color-warning-50)");
    expect(dark!.cssVariables["--ds-color-error-bg"]).toBe("var(--ds-color-error-50)");
    expect(dark!.cssVariables["--ds-color-info-bg"]).toBe("var(--ds-color-info-50)");

    const newDarkPins = [
      "--ds-color-accent-hover",
      "--ds-color-bg-overlay",
      "--ds-color-text-tertiary",
      "--ds-color-success-bg",
      "--ds-color-warning-bg",
      "--ds-color-error-bg",
      "--ds-color-info-bg",
    ];
    for (const pin of newDarkPins) {
      expect(dark!.cssVariables[pin]).toBeDefined();
    }
  });
});

// ── VERTICAL-PALETTE-90/89 full byte-equivalent parity ─────────────────────

describe("compileBrandTheme full roster parity (channel=value hash)", () => {
  it("R35 default (dark) matches the signed effective-value hash", () => {
    const { hash, pairs } = compileRosterEffectiveHash(rottayBrandTheme, "rottay", PALETTE_ROTTAY_35, "default");
    expect(pairs).toHaveLength(35);
    expect(hash).toBe("4c56c2cc2127928edc2eb328751cc85b8ad18479c85c8dedac528300069403dc");
  });

  it("B29 default (light) matches the signed effective-value hash", () => {
    const { hash, pairs } = compileRosterEffectiveHash(bithireBrandTheme, "bithire", PALETTE_BITHIRE_29, "default");
    expect(pairs).toHaveLength(29);
    expect(hash).toBe("b566d5de5021bfbfa52edf27665ff8123f9447a74b7a985dc1f076eec53ce299");
  });

  it("E25 default (light) matches the signed effective-value hash", () => {
    const { hash, pairs } = compileRosterEffectiveHash(evntoBrandTheme, "evnto", PALETTE_EVNTO_25, "default");
    expect(pairs).toHaveLength(25);
    expect(hash).toBe("4b95f40dd4b9b00733a1c0d383fd9eb47347f4e3166b18b0fcfe6ac90bf9211f");
  });

  it("R35 light mode effective map is complete and signed", () => {
    const { hash, pairs } = compileRosterEffectiveHash(rottayBrandTheme, "rottay", PALETTE_ROTTAY_35, "light");
    expect(pairs).toHaveLength(35);
    expect(hash).toBe("b62b25c12e5e5cad6d830f9fdaa4a5685708798178296e6f8db6c879b2c3e4d7");
  });

  it("B29 dark mode effective map is complete and signed", () => {
    const { hash, pairs } = compileRosterEffectiveHash(bithireBrandTheme, "bithire", PALETTE_BITHIRE_29, "dark");
    expect(pairs).toHaveLength(29);
    expect(hash).toBe("339ee08da2c71e97169d54166cc9ec562eb43bc33803d78486659b7574dcc538");
  });

  it("E25 dark mode effective map is complete and signed", () => {
    const { hash, pairs } = compileRosterEffectiveHash(evntoBrandTheme, "evnto", PALETTE_EVNTO_25, "dark");
    expect(pairs).toHaveLength(25);
    expect(hash).toBe("b49d1045c5476d50e85ceb362dc7e8de5489af87d0d9968cc06ff5ccb35fe7c3");
  });

  it("same-length value drift breaks the roster parity hash", () => {
    const mutated = JSON.parse(JSON.stringify(rottayBrandTheme)) as typeof rottayBrandTheme;
    mutated.palette.ramps.neutral[700] = "#A4A4A8";
    const { hash } = compileRosterEffectiveHash(mutated, "rottay", PALETTE_ROTTAY_35, "default");
    expect(hash).not.toBe("4c56c2cc2127928edc2eb328751cc85b8ad18479c85c8dedac528300069403dc");
  });

  it("evnto dark neutral ramp deletion or mutation breaks the dark roster parity hash", () => {
    const deleted = JSON.parse(JSON.stringify(evntoBrandTheme)) as typeof evntoBrandTheme;
    delete (deleted.modes.dark.palette.ramps as { neutral?: unknown }).neutral;
    const { hash: deletedHash } = compileRosterEffectiveHash(deleted, "evnto", PALETTE_EVNTO_25, "dark");
    expect(deletedHash).not.toBe("b49d1045c5476d50e85ceb362dc7e8de5489af87d0d9968cc06ff5ccb35fe7c3");

    const changed = JSON.parse(JSON.stringify(evntoBrandTheme)) as typeof evntoBrandTheme;
    changed.modes.dark.palette.ramps.neutral[500] = "#555555";
    const { hash: changedHash } = compileRosterEffectiveHash(changed, "evnto", PALETTE_EVNTO_25, "dark");
    expect(changedHash).not.toBe("b49d1045c5476d50e85ceb362dc7e8de5489af87d0d9968cc06ff5ccb35fe7c3");
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

  it("R/B/E live volumes are at or below the post-PALETTE baseline (decrease-only)", async () => {
    const gate = (await import("../../../../scripts/artifact-provenance-gate.mjs")) as {
      run: (opts: { baseline: unknown }) => { results: GateResult[] };
    };
    const { results } = gate.run({ baseline });
    for (const slug of ["rottay", "bithire", "evnto"] as const) {
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

  it("no PALETTE name is among the live capability-gap re-declared channels", async () => {
    const gate = (await import("../../../../scripts/artifact-provenance-gate.mjs")) as {
      run: (opts: { baseline: unknown }) => { results: GateResult[] };
    };
    const { results } = gate.run({ baseline });
    const paletteSet = new Set(PALETTE_UNION_36);
    const liveChannels = new Set<string>();
    for (const r of results) {
      for (const ch of r.observed.capabilityGapChannels) liveChannels.add(ch);
    }
    expect([...paletteSet].filter((n) => liveChannels.has(n))).toEqual([]);
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

// ── VERTICAL-PALETTE-90/89 planted mutants ─────────────────────────────────

describe("VERTICAL-PALETTE-90/89 planted mutants turn red", () => {
  function insertDecl(cssText: string, selector: string, prop: string, value: string): string {
    const root = postcss.parse(cssText);
    root.walkRules((rule) => {
      if (rule.selector === selector) rule.append(postcss.decl({ prop, value }));
    });
    return root.toString();
  }

  it("re-inserting a rottay PALETTE declaration is detected", () => {
    const mutated = insertDecl(
      readFileSync(join(ARTIFACTS_DIR, "rottay/_source/extension.css"), "utf8"),
      "html[data-tenant='rottay']:not([data-theme='light']):not(.light)",
      "--ds-color-bg-overlay",
      "red",
    );
    expect(enforceExtensionDeadAbsent(mutated, new Set(PALETTE_ROTTAY_35))).toContain("--ds-color-bg-overlay");
  });

  it("re-inserting a bithire PALETTE declaration is detected", () => {
    const mutated = insertDecl(
      readFileSync(join(ARTIFACTS_DIR, "bithire/_source/extension.css"), "utf8"),
      'html[data-tenant="bithire"]:not([data-theme="dark"]):not(.dark)',
      "--ds-color-bg-surface",
      "red",
    );
    expect(enforceExtensionDeadAbsent(mutated, new Set(PALETTE_BITHIRE_29))).toContain("--ds-color-bg-surface");
  });

  it("re-inserting an evnto PALETTE declaration is detected", () => {
    const mutated = insertDecl(
      readFileSync(join(ARTIFACTS_DIR, "evnto/_source/extension.css"), "utf8"),
      "html[data-tenant='evnto']:not([data-theme='dark']):not(.dark)",
      "--ds-color-text-primary",
      "red",
    );
    expect(enforceExtensionDeadAbsent(mutated, new Set(PALETTE_EVNTO_25))).toContain("--ds-color-text-primary");
  });

  it("double-counting the pre-retired --ds-color-bg-primary in B29 is wrong", () => {
    const b30AsB29 = [...PALETTE_BITHIRE_29, "--ds-color-bg-primary"];
    expect(b30AsB29.length).toBe(30);
    expect(rosterHash(b30AsB29)).not.toBe(rosterHash(PALETTE_BITHIRE_29));
  });

  it("an evnto dark reset pin omitted from modes.dark.palette is a compile regression", () => {
    const theme = JSON.parse(JSON.stringify(evntoBrandTheme)) as typeof evntoBrandTheme;
    delete (theme.modes.dark.palette as Record<string, unknown>).backgroundOverlayColor;
    const { modeBlocks } = compileBrandTheme({
      brandTheme: theme as never,
      tenantSlug: "evnto",
      verticalPersonality: {},
      verticalTokenOverrides: {},
    });
    const dark = modeBlocks?.find((b) => b.mode === "dark");
    expect(dark!.cssVariables["--ds-color-bg-overlay"]).not.toBe("rgba(2, 6, 23, 0.88)");
  });

  it("longer-prefix homonyms are not counted as PALETTE names", () => {
    // Plant a custom property whose name is a strict prefix extension of a
    // PALETTE channel. The shared enforcer matches declaration names exactly,
    // so the homonym must stay green.
    const mutated = [
      "html[data-tenant='evnto']:not([data-theme='dark']):not(.dark) {",
      "  --ds-color-text-primary-other: red;",
      "}",
      "",
    ].join("\n");
    expect(enforceExtensionDeadAbsent(mutated, new Set(PALETTE_EVNTO_25))).toEqual([]);
  });
});
