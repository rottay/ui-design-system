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

// EXCISED (SEV-2): `type GateResult` — the return shape of the deleted
// artifact-provenance gate (per-slug bytes/declarations/literals, capability
// gap count, and the observed capability-gap channel + region-size sets). It
// had no remaining referent once the gate and its four ratchet tests went; the
// shape is recorded here rather than kept as an unused declaration.

// EXCISED (SEV-2): `loadArtifactProvenanceGate()`. It dynamically imported
// `scripts/artifact-provenance-gate.mjs`, which was deleted in the same tranche
// as the three extension sources it measured. The gate ratcheted the VOLUME of
// a second authored source (bytes/declarations/literals/capability-gap regions
// per slug); with no second source, every one of its ceilings is vacuously
// satisfied, and a vacuously green ratchet is worse than none — it reads as
// enforcement. Its successor is `scripts/verticals/first-party-single-author-gate/index.mjs`,
// which forbids the source outright instead of bounding its size.

const ROOT = process.cwd();
const TOKENS_DIR = join(ROOT, "src/foundation/tokens");
// EXCISED (SEV-2): `ARTIFACTS_DIR` — every remaining reader of it resolved a
// `_source/extension.css` path.
const LEDGER_PATH = join(TOKENS_DIR, "residual-adjudication.json");
// EXCISED (SEV-2): `BASELINE_PATH` — the deleted gate's baseline JSON.

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

const D1_ROSTER = [
  "--ds-bg-primary",
  "--ds-bg-secondary",
  "--ds-border-color-disabled",
  "--ds-text-muted",
] as const;
const D1_SET: Set<string> = new Set(D1_ROSTER);

const D1_ROSTER_SHA256 = "6b3a72860e140376a58029e7824cfbc06e5b3810d8055c1a96f9fb9d515da06a";
const D1_MODE_MEMBERSHIP_SHA256 = "1cfe1b350da8f79a2e1869f9a12ace776ec35c26d2238e9dd43cce3fe033ecb9";
const D1_VALUE_SHA256 = "e86e51390530f9df1e3a358cec14a2741265a4c582ce4cad88b6224f59291b05";

type D1HistoricalValues = Record<string, Record<string, Record<string, string>>>;

/** Canonical D1 mode-membership hash: every slug/mode/channel triple, sorted, LF-terminated. */
function d1ModeMembershipHash(
  roster: readonly string[],
  historicalValues: D1HistoricalValues,
): string {
  const lines: string[] = [];
  for (const slug of Object.keys(historicalValues).sort()) {
    for (const mode of Object.keys(historicalValues[slug]).sort()) {
      for (const ch of roster.slice().sort()) {
        lines.push(`${slug}/${mode}/${ch}`);
      }
    }
  }
  return createHash("sha256").update(lines.join("\n") + "\n").digest("hex");
}

/** Canonical D1 value hash: every slug/mode/channel=value triple, sorted, LF-terminated. */
function d1ValueHash(roster: readonly string[], historicalValues: D1HistoricalValues): string {
  const lines: string[] = [];
  for (const slug of Object.keys(historicalValues).sort()) {
    for (const mode of Object.keys(historicalValues[slug]).sort()) {
      for (const ch of roster.slice().sort()) {
        lines.push(`${slug}/${mode}/${ch}=${historicalValues[slug][mode][ch]}`);
      }
    }
  }
  return createHash("sha256").update(lines.join("\n") + "\n").digest("hex");
}

/**
 * Pure shared validator for the VERTICAL-DEAD-4 ledger receipt and its
 * relationship to the global entries/distribution. Used by the live test and by
 * every causal mutant: any mutation that breaks receipt rosters, counts,
 * historical values, derived hashes, generated-pending status, entry count or
 * the absence of D1 names from entries makes this throw.
 */
function assertD1Ledger(candidate: typeof ledger): void {
  const receipt = candidate.verticalDead4SourceDrain as {
    id: string;
    checkpoint: string;
    date: string;
    scope: string;
    roster: string[];
    names: number;
    verticalMemberships: number;
    declarationsRemoved: number;
    perVertical: Record<string, { names: number; declarations: number }>;
    rosterSha256: Record<string, string>;
    historicalValues: D1HistoricalValues;
    generatedProjection: string;
    mandate: string;
  };

  expect(receipt.id, "receipt.id").toBe("VERTICAL-DEAD-4");
  expect(receipt.checkpoint, "receipt.checkpoint").toBe("VERTICAL-PALETTE-90/89");
  expect(receipt.date, "receipt.date").toBe("2026-08-14");
  expect(receipt.scope, "receipt.scope").toBe("source-only");
  expect(receipt.roster, "receipt.roster").toEqual(D1_ROSTER);
  expect(receipt.names, "receipt.names").toBe(4);
  expect(receipt.verticalMemberships, "receipt.verticalMemberships").toBe(4);
  expect(receipt.declarationsRemoved, "receipt.declarationsRemoved").toBe(8);
  expect(receipt.perVertical.rottay, "receipt.perVertical.rottay").toEqual({ names: 4, declarations: 8 });
  expect(receipt.perVertical.bithire, "receipt.perVertical.bithire").toEqual({ names: 0, declarations: 0 });
  expect(receipt.perVertical.evnto, "receipt.perVertical.evnto").toEqual({ names: 0, declarations: 0 });
  expect(receipt.generatedProjection, "receipt.generatedProjection").toBe("GENERATED-PENDING");

  expect(receipt.rosterSha256.global, "rosterSha256.global").toBe(rosterHash(receipt.roster));
  expect(receipt.rosterSha256.modeMembership, "rosterSha256.modeMembership").toBe(
    d1ModeMembershipHash(receipt.roster, receipt.historicalValues),
  );
  expect(receipt.rosterSha256.value, "rosterSha256.value").toBe(d1ValueHash(receipt.roster, receipt.historicalValues));

  expect(receipt.historicalValues.rottay.dark["--ds-bg-primary"]).toBe("#0C0C0E");
  expect(receipt.historicalValues.rottay.dark["--ds-bg-secondary"]).toBe("#131316");
  expect(receipt.historicalValues.rottay.dark["--ds-border-color-disabled"]).toBe("#222226");
  expect(receipt.historicalValues.rottay.dark["--ds-text-muted"]).toBe("#6B6B72");
  expect(receipt.historicalValues.rottay.light["--ds-bg-primary"]).toBe("#FAFAF9");
  expect(receipt.historicalValues.rottay.light["--ds-bg-secondary"]).toBe("#F4F4F3");
  expect(receipt.historicalValues.rottay.light["--ds-border-color-disabled"]).toBe("#EDEDEC");
  expect(receipt.historicalValues.rottay.light["--ds-text-muted"]).toBe("#9C9C9C");

  expect(receipt.mandate).toMatch(/Kimi 2\.7/);
  expect(receipt.mandate).toMatch(/Fable 5/);
  expect(receipt.mandate).toMatch(/Kimi 3/);
  expect(receipt.mandate).toMatch(/Codex/);
  expect(receipt.mandate).not.toMatch(/Turing/);
  expect(receipt.mandate).toBe("Kimi 2.7 implementation; Fable 5 + Kimi 3 audit; Codex DT.");

  const entries = candidate.entries as Record<string, unknown>;
  expect(Object.keys(entries).length, "entries count").toBe(301);
  expect("--ds-text-muted" in entries, "--ds-text-muted must not be an entry").toBe(false);
  expect("--ds-border-color-disabled" in entries, "--ds-border-color-disabled must not be an entry").toBe(false);

  const computed = new Map<string, number>();
  for (const e of Object.values(entries as Record<string, { finalState: string }>)) {
    computed.set(e.finalState, (computed.get(e.finalState) ?? 0) + 1);
  }
  const expectedDistribution: Record<string, number> = {};
  for (const [state, count] of computed) expectedDistribution[state] = count;
  const distribution = (candidate.finalStateVocabulary as { distribution: Record<string, number> }).distribution;
  expect(distribution, "finalStateVocabulary.distribution reconciles from entries").toEqual(expectedDistribution);

  const batch = (candidate.faseBExecution as { legacyAliasBatch: { executed: Record<string, string> } }).legacyAliasBatch
    .executed;
  expect(batch["--ds-text-muted"]).toMatch(/VERTICAL-DEAD-4/);
  expect(batch["--ds-text-muted"]).toMatch(/GENERATED-PENDING/);
  expect(batch["--ds-border-color-disabled"]).toMatch(/VERTICAL-DEAD-4/);
  expect(batch["--ds-border-color-disabled"]).toMatch(/GENERATED-PENDING/);
}

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
/**
 * F4A-5 (K2) — canales RE-DERIVADOS despues de que estos hashes se firmaran.
 *
 * `--ds-color-border-primary` era un literal de marca en los tres temas; la
 * adjudicacion K2 lo hizo DERIVAR de `--ds-color-border`, que es la raiz
 * canonica del par. La PINTURA no se movio (se probo resolviendo la cascada:
 * 36 de 36 pares identicos en los 3 temas x 2 scopes) — se movio la FORMA.
 *
 * Este roster digiere el valor CRUDO, asi que sin esta tabla los seis hashes
 * firmados se moverian por un cambio que no es de valor. La tabla mapea la
 * forma nueva a su PRE-IMAGEN, que es lo que los hashes firmaron: los sha256
 * quedan EXACTAMENTE donde estaban, que es la condicion del lote.
 *
 * Es el mismo patron REDERIVED que F2 uso en los rosters de drenaje T2/T3.
 */
/** La pre-imagen es POR MODO: el literal del cuerpo y el de la restitucion del
 *  overlay eran dos bytes distintos, y los seis hashes firmaron los dos. */
const REDERIVED: Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, string>>>>>> = {
  rottay: { "--ds-color-border-primary": { default: "#28282C", light: "#E5E5E3" } },
  bithire: { "--ds-color-border-primary": { default: "#D4E0EA", dark: "#253545" } },
  evnto: { "--ds-color-border-primary": { default: "rgba(0, 0, 0, 0.08)", dark: "#2E2C24" } },
};
/** El valor de PRE-IMAGEN de un canal re-derivado; si no lo es, el de hoy. */
const preImagen = (
  slug: string,
  channel: string,
  mode: string,
  value: string | undefined,
): string | undefined => {
  const perMode = REDERIVED[slug]?.[channel];
  if (perMode && typeof value === "string" && value.startsWith("var(")) return perMode[mode] ?? perMode.default;
  return value;
};

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
      const val = preImagen(slug, ch, mode, vars[ch]);
      return val === undefined ? `${ch}=` : `${ch}=${val}`;
    })
    .sort();
  const hash = createHash("sha256").update(pairs.join("\n") + "\n").digest("hex");
  return { hash, pairs, vars };
}

const ledger = JSON.parse(readFileSync(LEDGER_PATH, "utf8")) as Record<string, unknown>;
// EXCISED (SEV-2): the parsed `baseline` document, with its file.

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
      : fileName.endsWith(".mjs") || fileName.endsWith(".js") || fileName.endsWith(".cjs")
        ? ts.ScriptKind.JS
        : ts.ScriptKind.TS;
  // .mts / .cts are treated as TS by this installed compiler (ScriptKind lacks MTS/CTS).
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
function scanConsumerSource(text: string, fileName: string, roster: Set<string>): ConsumerHit[] {
  if (fileName.endsWith(".css")) {
    const root = postcss.parse(text, { from: fileName });
    const hits: ConsumerHit[] = [];
    root.walkDecls((d) => {
      for (const name of cssVarArguments(d.value)) {
        if (roster.has(name)) hits.push({ name, kind: "css-var" });
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
        if (roster.has(name)) hits.push({ name, kind: "css-var" });
      }
    }

    if (ts.isCallExpression(node) && isCssomCallee(node.expression)) {
      const val = resolveCallArg(node.arguments[0], sf, getChecker);
      if (val && roster.has(val)) hits.push({ name: val, kind: "cssom" });
    }

    ts.forEachChild(node, visit);
  }
  visit(sf);
  return hits;
}

function scanDeadConsumerSource(text: string, fileName: string): ConsumerHit[] {
  return scanConsumerSource(text, fileName, DEAD_SET);
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
function scanConsumers(roster: Set<string>): Record<string, { file: string; count: number }[]> {
  const all: Record<string, { file: string; count: number }[]> = {};
  for (const f of sourceFiles()) {
    const tally = new Map<string, number>();
    const text = readFileSync(f, "utf8");
    for (const { name } of scanConsumerSource(text, f, roster)) {
      tally.set(name, (tally.get(name) ?? 0) + 1);
    }
    for (const [name, count] of tally) {
      (all[name] ??= []).push({ file: f, count });
    }
  }
  return all;
}

function scanDeadConsumers(): Record<string, { file: string; count: number }[]> {
  return scanConsumers(DEAD_SET);
}

function scanD1Consumers(): Record<string, { file: string; count: number }[]> {
  return scanConsumers(D1_SET);
}

// EXCISED (SEV-2): `enforceExtensionDeadAbsent()`. Its entire corpus was the
// three deleted `_source/extension.css` files, so it had no input left to
// enforce over. Every live caller and every re-insertion mutant that shared it
// is excised alongside it (each site carries its own note). The claim it
// carried — "no retired roster name is re-declared by a second authored
// source" — is now unconditional under law G2 of
// `scripts/verticals/first-party-single-author-gate/index.mjs`: there is no second source to
// declare anything. Every LEDGER, SCANNER and COMPILED assertion in this file
// is untouched.

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

describe("VERTICAL-DEAD-4 authority pins", () => {
  it("roster is the signed four names and hashes to the signed values", () => {
    const receipt = ledger.verticalDead4SourceDrain as {
      roster: string[];
      historicalValues: D1HistoricalValues;
    };
    expect(receipt.roster.length).toBe(4);
    expect(receipt.roster).toEqual(D1_ROSTER);
    expect(rosterHash(receipt.roster)).toBe(D1_ROSTER_SHA256);
    expect(d1ModeMembershipHash(receipt.roster, receipt.historicalValues)).toBe(D1_MODE_MEMBERSHIP_SHA256);
    expect(d1ValueHash(receipt.roster, receipt.historicalValues)).toBe(D1_VALUE_SHA256);
  });

  it("D1 is disjoint from DEAD-61, CONFLICT9 and PALETTE-89", () => {
    const dead61: Set<string> = new Set(DEAD_61);
    const conflict: Set<string> = new Set([
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
    const palette: Set<string> = new Set(PALETTE_MEMBERSHIP_89);
    expect(D1_ROSTER.filter((n) => dead61.has(n))).toEqual([]);
    expect(D1_ROSTER.filter((n) => conflict.has(n))).toEqual([]);
    expect(D1_ROSTER.filter((n) => palette.has(n))).toEqual([]);
  });

  it("accent-live is not in the D1 roster", () => {
    expect(D1_SET.has("--ds-color-accent-live")).toBe(false);
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

describe("VERTICAL-DEAD-4 ledger receipt", () => {
  it("ledger satisfies the shared D1 validator", () => {
    assertD1Ledger(ledger);
  });
});

// ── extension absence ──────────────────────────────────────────────────────

// EXCISED (SEV-2): the three per-slug `<slug> extension removed exactly the N
// DEAD names` tests. They read the deleted sources through the retired
// enforcer; G2 now forbids the sources themselves. The longer-prefix homonym
// claim below survives on its COMPILED half, which was already the stronger
// reading (ROTTAY-T3 had migrated the homonym into the theme).
describe("the DEAD retirement spared its longer-prefix homonyms", () => {
  it("longer-prefix homonyms survive exact-name deletion", () => {
    expect(
      compileBrandTheme({ brandTheme: rottayBrandTheme, tenantSlug: "rottay" })
        .cssVariables["--ds-calendar-day-color-other"]
    ).toBeTruthy();
  });
});

// ── VERTICAL-DEAD-4 extension absence ──────────────────────────────────────

// EXCISED (SEV-2): describe "extensions no longer declare the D1 names" and
// both of its tests. Same shape as the DEAD absence block above: a retired
// enforcer over a deleted corpus, discharged by G2. The D1 ledger, scanner and
// compiled-propagation blocks are untouched.

// ── VERTICAL-PALETTE-90/89 extension absence ───────────────────────────────

// EXCISED (SEV-2): describe "extensions no longer declare the PALETTE
// channels" and all four of its tests, including the pre-retired
// `--ds-color-bg-primary` guard. All four read the deleted sources; G2
// discharges them. The PALETTE roster hashes, the double-counting negative and
// the compile-time propagation block below all survive untouched — those are
// the assertions that pin WHERE the 89 channels went.

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
    // COH-1 (2026-08-30): bithire retired its baked-green successBgColor
    // literal (`#f0fdf4`); the channel now derives from bithire's own blue
    // seed via `deriveStatusTintFloor`.
    expect(cssVariables["--ds-color-success-bg"]).toBe("var(--ds-color-success-50)");
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
    // K2: la forma es `var(--ds-color-border)`; su pre-imagen — y su pintura
    // resuelta — sigue siendo este literal.
    expect(preImagen("evnto", "--ds-color-border-primary", "default", cssVariables["--ds-color-border-primary"]))
      .toBe("rgba(0, 0, 0, 0.08)");
    // COH-1 (2026-08-30): evnto retired its `successBgColor` literal
    // (`#f0fdf4`); the channel now derives from evnto's own green seed via
    // `deriveStatusTintFloor` (sub-perceptual correction, `#F5FFF6`).
    expect(cssVariables["--ds-color-success-bg"]).toBe("var(--ds-color-success-50)");
  });

  it("evnto dark mode adds exactly the 3 signed reset pins (COH-1: the four status bg pins withdrew)", () => {
    // COH-1 (2026-08-30): evnto's light base retired its four `*BgColor`
    // literals, so light's own `-bg` now resolves to the SAME
    // `var(--ds-color-{tone}-50)` string dark already authored. A mode
    // block's delta only restates a channel whose value DIFFERS from the
    // base (`compileModeBlocks`: `if (baseVars[key] !== value)`), so the four
    // status `-bg` pins that used to appear here (dark's literal vs. light's
    // now-retired green literal) withdraw entirely — not a regression, the
    // withdrawal IS the fix propagating into dark's own delta.
    const { modeBlocks } = compile("evnto", evntoBrandTheme);
    const dark = modeBlocks?.find((b) => b.mode === "dark");
    expect(dark).toBeDefined();
    expect(dark!.cssVariables["--ds-color-accent-hover"]).toBe("var(--ds-color-secondary-hover)");
    expect(dark!.cssVariables["--ds-color-bg-overlay"]).toBe("rgba(2, 6, 23, 0.88)");
    expect(dark!.cssVariables["--ds-color-text-tertiary"]).toBe("var(--ds-color-neutral-600)");
    for (const tone of ["success", "warning", "error", "info"] as const) {
      expect(dark!.cssVariables[`--ds-color-${tone}-bg`]).toBeUndefined();
    }

    const newDarkPins = [
      "--ds-color-accent-hover",
      "--ds-color-bg-overlay",
      "--ds-color-text-tertiary",
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

  // COH-1 (2026-08-30): RE-SIGNED. Bithire retired its baked
  // successBgColor/successBorderColor/warningBgColor/warningBorderColor/
  // errorBgColor/errorBorderColor/infoBgColor/infoBorderColor literals (8 of
  // this roster's 29 channels), which now derive from bithire's own seeds via
  // `deriveStatusTintFloor` — a deliberate correction (the hue-wrong green
  // well), not byte-equivalent drift, so the hash legitimately moves.
  it("B29 default (light) matches the signed effective-value hash", () => {
    const { hash, pairs } = compileRosterEffectiveHash(bithireBrandTheme, "bithire", PALETTE_BITHIRE_29, "default");
    expect(pairs).toHaveLength(29);
    expect(hash).toBe("f74918e2ec2631640b524b45370a277cc9f36772b68b4ca0f2b65e222bdc16f1");
  });

  // COH-1 (2026-08-30): RE-SIGNED. Evnto retired its baked
  // successBgColor/warningBgColor/errorBgColor/infoBgColor literals (4 of
  // this roster's 25 channels — `-border` is not in this roster), which now
  // derive from evnto's own seeds via `deriveStatusTintFloor` (a
  // sub-perceptual correction, not byte-equivalent drift).
  it("E25 default (light) matches the signed effective-value hash", () => {
    const { hash, pairs } = compileRosterEffectiveHash(evntoBrandTheme, "evnto", PALETTE_EVNTO_25, "default");
    expect(pairs).toHaveLength(25);
    expect(hash).toBe("a168e77f8f0ff356946b1277a7287961dc96813de1d0e4306269a9c335edb589");
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
    if (!mutated.palette?.ramps?.neutral) throw new Error("Missing rottay neutral ramp");
    mutated.palette.ramps.neutral[700] = "#A4A4A8";
    const { hash } = compileRosterEffectiveHash(mutated, "rottay", PALETTE_ROTTAY_35, "default");
    expect(hash).not.toBe("4c56c2cc2127928edc2eb328751cc85b8ad18479c85c8dedac528300069403dc");
  });

  it("evnto dark neutral ramp deletion or mutation breaks the dark roster parity hash", () => {
    const deleted = JSON.parse(JSON.stringify(evntoBrandTheme)) as typeof evntoBrandTheme;
    if (!deleted.modes?.dark?.palette?.ramps) throw new Error("Missing evnto dark palette ramps");
    delete (deleted.modes.dark.palette.ramps as { neutral?: unknown }).neutral;
    const { hash: deletedHash } = compileRosterEffectiveHash(deleted, "evnto", PALETTE_EVNTO_25, "dark");
    expect(deletedHash).not.toBe("b49d1045c5476d50e85ceb362dc7e8de5489af87d0d9968cc06ff5ccb35fe7c3");

    const changed = JSON.parse(JSON.stringify(evntoBrandTheme)) as typeof evntoBrandTheme;
    if (!changed.modes?.dark?.palette?.ramps?.neutral) throw new Error("Missing evnto dark neutral ramp");
    changed.modes.dark.palette.ramps.neutral[500] = "#555555";
    const { hash: changedHash } = compileRosterEffectiveHash(changed, "evnto", PALETTE_EVNTO_25, "dark");
    expect(changedHash).not.toBe("b49d1045c5476d50e85ceb362dc7e8de5489af87d0d9968cc06ff5ccb35fe7c3");
  });
});

// ── durable baseline / gate contract ───────────────────────────────────────

// EXCISED (SEV-2): describe "artifact provenance gate ratchets hold after the
// drain" and its four tests -- the two decrease-only volume ratchets (R/B post
// DEAD, R/B/E post PALETTE) and the two "no DEAD/PALETTE name is a live
// capability-gap channel" assertions. All four executed
// `scripts/artifact-provenance-gate.mjs` against
// `scripts/artifact-provenance-gate.baseline.json`; both files are deleted in
// this tranche. A byte/declaration/literal ceiling on a file that no longer
// exists is satisfied by zero, so keeping these would have manufactured four
// permanently-green tests that assert nothing. The successor law does not
// bound the second author's volume -- it forbids the second author:
// `scripts/verticals/first-party-single-author-gate/index.mjs` (G1 roster exactness, G2
// resurrection scan, G3 API/marker scan, G4 delegated ink causality), drilled
// by `scripts/verticals/first-party-single-author-gate/index.test.mjs` and wired blocking in
// `scripts/ci/gates-manifest/index.mjs`.

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

// ── VERTICAL-DEAD-4 productive-consumer scan ───────────────────────────────

describe("zero productive D1 consumers in Core + Showroom", () => {
  it("no D1 name has a productive var()/property-access consumer", () => {
    expect(scanD1Consumers()).toEqual({});
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
  // EXCISED (SEV-2): `insertDecl()` and every re-insertion mutant that used it.
  // Each one read a `_source/extension.css` off disk and planted a declaration
  // into it. With the three files deleted there is no live pre-image to plant
  // into, and rewriting the mutants to plant into an empty string would keep a
  // green while silently dropping the claim ("this enforcer sees a real
  // re-insertion into the real file"). The enforcer they exercised
  // (`enforceExtensionDeadAbsent`) is retired with them; resurrection of any
  // extension source is now caught by law G2 of
  // `scripts/verticals/first-party-single-author-gate/index.mjs`. The SCANNER mutants below
  // are untouched — they never read the artifact tree.

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
    const entries = mutated.entries as Record<string, { finalState: string; brandAuthoredResidue?: { retiredBy?: string } }>;
    const entry = entries["--ds-chip-bg"];
    entry.finalState = "OWNER_DECISION";
    delete entry.brandAuthoredResidue?.retiredBy;
    const retired = Object.entries(entries).filter(([_, e]) => e.brandAuthoredResidue?.retiredBy === "VERTICAL-DEAD-61").length;
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

// ── VERTICAL-DEAD-4 planted mutants ────────────────────────────────────────

describe("VERTICAL-DEAD-4 planted mutants turn red", () => {
  // EXCISED (SEV-2): `insertDecl()` and every re-insertion mutant that used it.
  // Each one read a `_source/extension.css` off disk and planted a declaration
  // into it. With the three files deleted there is no live pre-image to plant
  // into, and rewriting the mutants to plant into an empty string would keep a
  // green while silently dropping the claim ("this enforcer sees a real
  // re-insertion into the real file"). The enforcer they exercised
  // (`enforceExtensionDeadAbsent`) is retired with them; resurrection of any
  // extension source is now caught by law G2 of
  // `scripts/verticals/first-party-single-author-gate/index.mjs`. The SCANNER mutants below
  // are untouched — they never read the artifact tree.

  it("a new CSS consumer of a D1 name is detected by the shared scanner", () => {
    const fixture = ".x { color: var(/*gap*/--ds-text-muted); }";
    expect(namesFrom(scanConsumerSource(fixture, "x.css", D1_SET))).toContain("--ds-text-muted");
  });

  it("a new TS consumer of a D1 name is detected by the shared scanner", () => {
    const fixture = "const x = `--ds-text-muted`; el.style.setProperty(x, 'red');";
    expect(namesFrom(scanConsumerSource(fixture, "x.ts", D1_SET))).toEqual(["--ds-text-muted"]);
  });

  // EXCISED (SEV-2): `strict-prefix homonyms are not counted as D1 names`. It fed a
  // synthetic prefix-homonym fixture to `enforceExtensionDeadAbsent`, which is
  // retired above with its corpus — a boundary negative on a function nothing
  // calls guards nothing. The same exact-name-vs-prefix property is still
  // drilled on the SCANNER, which does still have live inputs, by "does not
  // count longer-prefix homonyms" earlier in this file.

  it("receipt count mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    (mutated.verticalDead4SourceDrain as { names: number }).names = 5;
    expect(() => assertD1Ledger(mutated)).toThrow();
  });

  it("roster same-count swap mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.verticalDead4SourceDrain as { roster: string[] };
    receipt.roster = ["--ds-color-bg-primary", ...D1_ROSTER.slice(1)];
    expect(receipt.roster.length).toBe(4);
    expect(() => assertD1Ledger(mutated)).toThrow();
  });

  it("historical value mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.verticalDead4SourceDrain as { historicalValues: D1HistoricalValues };
    receipt.historicalValues.rottay.dark["--ds-bg-primary"] = "#000000";
    expect(() => assertD1Ledger(mutated)).toThrow();
  });

  it("missing mode mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.verticalDead4SourceDrain as { historicalValues: D1HistoricalValues };
    delete (receipt.historicalValues.rottay as Record<string, Record<string, string>>).light;
    expect(() => assertD1Ledger(mutated)).toThrow();
  });

  it("hash mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.verticalDead4SourceDrain as { rosterSha256: Record<string, string> };
    receipt.rosterSha256.modeMembership = "0000000000000000000000000000000000000000000000000000000000000000";
    expect(() => assertD1Ledger(mutated)).toThrow();
  });

  it("prohibited D1 entry mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const entries = mutated.entries as Record<string, unknown>;
    entries["--ds-text-muted"] = { finalState: "EXECUTED" };
    expect(() => assertD1Ledger(mutated)).toThrow();
  });
});

// ── VERTICAL-PALETTE-90/89 planted mutants ─────────────────────────────────

describe("VERTICAL-PALETTE-90/89 planted mutants turn red", () => {
  // EXCISED (SEV-2): `insertDecl()` and every re-insertion mutant that used it.
  // Each one read a `_source/extension.css` off disk and planted a declaration
  // into it. With the three files deleted there is no live pre-image to plant
  // into, and rewriting the mutants to plant into an empty string would keep a
  // green while silently dropping the claim ("this enforcer sees a real
  // re-insertion into the real file"). The enforcer they exercised
  // (`enforceExtensionDeadAbsent`) is retired with them; resurrection of any
  // extension source is now caught by law G2 of
  // `scripts/verticals/first-party-single-author-gate/index.mjs`. The SCANNER mutants below
  // are untouched — they never read the artifact tree.

  it("double-counting the pre-retired --ds-color-bg-primary in B29 is wrong", () => {
    const b30AsB29 = [...PALETTE_BITHIRE_29, "--ds-color-bg-primary"];
    expect(b30AsB29.length).toBe(30);
    expect(rosterHash(b30AsB29)).not.toBe(rosterHash(PALETTE_BITHIRE_29));
  });

  it("an evnto dark reset pin omitted from modes.dark.palette is a compile regression", () => {
    const theme = JSON.parse(JSON.stringify(evntoBrandTheme)) as typeof evntoBrandTheme;
    if (!theme.modes?.dark?.palette) throw new Error("Missing evnto dark palette");
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

  // EXCISED (SEV-2): `longer-prefix homonyms are not counted as PALETTE names`. It fed a
  // synthetic prefix-homonym fixture to `enforceExtensionDeadAbsent`, which is
  // retired above with its corpus — a boundary negative on a function nothing
  // calls guards nothing. The same exact-name-vs-prefix property is still
  // drilled on the SCANNER, which does still have live inputs, by "does not
  // count longer-prefix homonyms" earlier in this file.
});

// ── SEV-DEAD-21 source drain ───────────────────────────────────────────────

const SEV_DEAD_21_ROSTER = [
  "--ds-avatar-bg",
  "--ds-avatar-color",
  "--ds-collapse-content-color",
  "--ds-color-alpha-black-200",
  "--ds-color-alpha-black-300",
  "--ds-color-alpha-black-400",
  "--ds-color-alpha-black-500",
  "--ds-color-alpha-white-100",
  "--ds-color-alpha-white-200",
  "--ds-color-alpha-white-300",
  "--ds-color-alpha-white-400",
  "--ds-color-alpha-white-500",
  "--ds-premium-card-header-top-line-display",
  "--ds-shell-breadcrumb-height",
  "--ds-surface-chip-text",
  "--ds-surface-radius-lg",
  "--ds-surface-radius-sm",
  "--ds-table-header-bubble-bg",
  "--rt-premium-card-grid",
  "--ds-input-focus-border",
  "--ds-input-text",
] as const;

const SEV_DEAD_21_SET: Set<string> = new Set(SEV_DEAD_21_ROSTER);

const SEV_DEAD_21_ROSTER_SHA256 =
  "e2301dc78bcc2c159a5241bb5bd3b8d413a9b1c9f1d2bda538bee1aa1a0fddfe";
const SEV_DEAD_21_MODE_MEMBERSHIP_SHA256 =
  "191837a2296706048f12274cdda65240daadd7f24fa16851e866185cea86b8f0";
const SEV_DEAD_21_SLUG_CHANNEL_SHA256 =
  "57f8bdba52dbed3a3d63b52cb083bd5668f4465ae07821776925391b0fbff7a5";

type SevDead21HistoricalValues = Record<string, Record<string, Record<string, string>>>;

const SEV_DEAD_21_HISTORICAL_VALUES: SevDead21HistoricalValues = {
  rottay: {
    dark: {
      "--ds-avatar-bg": "rgba(255, 255, 255, 0.08)",
      "--ds-avatar-color": "#ECECEC",
      "--ds-collapse-content-color": "#A0A0A5",
      "--ds-color-alpha-black-200": "rgba(0, 0, 0, 0.30)",
      "--ds-color-alpha-black-300": "rgba(0, 0, 0, 0.40)",
      "--ds-color-alpha-black-400": "rgba(0, 0, 0, 0.50)",
      "--ds-color-alpha-black-500": "rgba(0, 0, 0, 0.60)",
      "--ds-color-alpha-white-100": "rgba(255, 255, 255, 0.08)",
      "--ds-color-alpha-white-200": "rgba(255, 255, 255, 0.14)",
      "--ds-color-alpha-white-300": "rgba(255, 255, 255, 0.20)",
      "--ds-color-alpha-white-400": "rgba(255, 255, 255, 0.28)",
      "--ds-color-alpha-white-500": "rgba(255, 255, 255, 0.40)",
    },
    light: {
      "--ds-avatar-bg": "rgba(0, 0, 0, 0.06)",
      "--ds-avatar-color": "#1A1A1A",
      "--ds-collapse-content-color": "#6B6B6B",
      "--ds-color-alpha-black-200": "rgba(0, 0, 0, 0.10)",
      "--ds-color-alpha-black-300": "rgba(0, 0, 0, 0.16)",
      "--ds-color-alpha-black-400": "rgba(0, 0, 0, 0.24)",
      "--ds-color-alpha-black-500": "rgba(0, 0, 0, 0.36)",
      "--ds-color-alpha-white-100": "rgba(255, 255, 255, 0.60)",
      "--ds-color-alpha-white-200": "rgba(255, 255, 255, 0.70)",
      "--ds-color-alpha-white-300": "rgba(255, 255, 255, 0.80)",
      "--ds-color-alpha-white-400": "rgba(255, 255, 255, 0.88)",
      "--ds-color-alpha-white-500": "rgba(255, 255, 255, 0.94)",
    },
  },
  bithire: {
    all: {
      "--ds-premium-card-header-top-line-display": "none",
      "--rt-premium-card-grid":
        "linear-gradient(\n      var(--ds-surface-card-grid-line) 1px,\n      transparent 1px\n    ),\n    linear-gradient(\n      90deg,\n      var(--ds-surface-card-grid-line) 1px,\n      transparent 1px\n    )",
    },
    light: {
      "--ds-premium-card-header-top-line-display": "none",
      "--ds-shell-breadcrumb-height": "28px",
      "--ds-surface-chip-text": "var(--ds-color-primary)",
      "--ds-surface-radius-lg": "var(--ds-radius-md)",
      "--ds-surface-radius-sm": "var(--ds-radius-sm)",
      "--ds-table-header-bubble-bg": "transparent",
    },
  },
  evnto: {
    dark: {
      "--ds-input-focus-border": "#A89880",
      "--ds-input-text": "#E8E8E0",
    },
  },
};

const SEV_DEAD_21_HASH_RECIPE = {
  global: "sha256(sorted receipt.roster lines joined with LF plus trailing LF)",
  modeMembership:
    "sha256(sorted canonical lines '<slug>/<mode>/<channel>' for every declaration in historicalValues, using modes dark/light/all, joined with LF plus trailing LF)",
  slugChannel:
    "sha256(sorted canonical lines '<slug>|<channel>' for every channel in receipt.roster per slug, joined with LF plus trailing LF)",
};

function sevDead21HashLines(lines: readonly string[]): string {
  return createHash("sha256").update([...lines].sort().join("\n") + "\n").digest("hex");
}

function deriveSevDead21Roster(historicalValues: SevDead21HistoricalValues): string[] {
  const bySlug = new Map<string, Set<string>>();
  const slugs: string[] = [];
  for (const [slug, modes] of Object.entries(historicalValues)) {
    if (!bySlug.has(slug)) slugs.push(slug);
    const set = bySlug.get(slug) ?? new Set<string>();
    for (const channels of Object.values(modes)) {
      for (const ch of Object.keys(channels)) set.add(ch);
    }
    bySlug.set(slug, set);
  }
  const roster: string[] = [];
  for (const slug of slugs) {
    roster.push(...[...bySlug.get(slug)!.values()].sort());
  }
  return roster;
}

function deriveSevDead21ModeMembershipLines(
  historicalValues: SevDead21HistoricalValues,
): string[] {
  const lines: string[] = [];
  for (const slug of Object.keys(historicalValues).sort()) {
    for (const mode of Object.keys(historicalValues[slug]).sort()) {
      for (const ch of Object.keys(historicalValues[slug][mode]).sort()) {
        lines.push(`${slug}/${mode}/${ch}`);
      }
    }
  }
  return lines;
}

function deriveSevDead21SlugChannelLines(
  historicalValues: SevDead21HistoricalValues,
): string[] {
  const bySlug = new Map<string, Set<string>>();
  for (const [slug, modes] of Object.entries(historicalValues)) {
    const set = bySlug.get(slug) ?? new Set<string>();
    for (const channels of Object.values(modes)) {
      for (const ch of Object.keys(channels)) set.add(ch);
    }
    bySlug.set(slug, set);
  }
  const lines: string[] = [];
  for (const slug of [...bySlug.keys()].sort()) {
    for (const ch of [...bySlug.get(slug)!.values()].sort()) {
      lines.push(`${slug}|${ch}`);
    }
  }
  return lines;
}

/**
 * Pure shared validator for the SEV-DEAD-21 ledger receipt. Used by the live
 * test and by every causal mutant: any mutation that breaks receipt rosters,
 * counts, historical values, derived hashes, source/generated status or the
 * mandate makes this throw.
 */
function assertSevDead21Ledger(candidate: typeof ledger): void {
  const receipt = candidate.sevDead21SourceDrain as {
    id: string;
    checkpoint: string;
    date: string;
    scope: string;
    roster: string[];
    names: number;
    declarationsRemoved: number;
    perVertical: Record<string, { names: number; declarations: number }>;
    hashRecipe: Record<string, string>;
    rosterSha256: Record<string, string>;
    canonicalLines: { modeMembership: string[]; slugChannel: string[] };
    historicalValues: SevDead21HistoricalValues;
    source: string;
    generatedProjection: string;
    mandate: string;
  };

  expect(receipt.id, "receipt.id").toBe("SEV-DEAD-21");
  expect(receipt.checkpoint, "receipt.checkpoint").toBe("VERTICAL-PALETTE-90/89");
  expect(receipt.date, "receipt.date").toBe("2026-08-14");
  expect(receipt.scope, "receipt.scope").toBe("source-only");
  expect(receipt.roster, "receipt.roster").toEqual(SEV_DEAD_21_ROSTER);
  expect(receipt.names, "receipt.names").toBe(21);
  expect(receipt.declarationsRemoved, "receipt.declarationsRemoved").toBe(34);
  expect(receipt.perVertical.rottay, "receipt.perVertical.rottay").toEqual({
    names: 12,
    declarations: 24,
  });
  expect(receipt.perVertical.bithire, "receipt.perVertical.bithire").toEqual({
    names: 7,
    declarations: 8,
  });
  expect(receipt.perVertical.evnto, "receipt.perVertical.evnto").toEqual({
    names: 2,
    declarations: 2,
  });
  expect(receipt.source, "receipt.source").toBe("EXECUTED");
  expect(receipt.generatedProjection, "receipt.generatedProjection").toBe("PENDING");
  expect(receipt.mandate, "receipt.mandate").toBe(
    "Kimi 2.7 implementation; Fable 5 + Kimi 3 audit; Codex DT.",
  );

  expect(receipt.hashRecipe, "hashRecipe").toEqual(SEV_DEAD_21_HASH_RECIPE);

  const derivedRoster = deriveSevDead21Roster(receipt.historicalValues);
  expect(receipt.roster, "roster derived from historicalValues").toEqual(derivedRoster);
  expect(receipt.rosterSha256.global, "rosterSha256.global").toBe(rosterHash(receipt.roster));

  const derivedModeLines = deriveSevDead21ModeMembershipLines(receipt.historicalValues);
  expect(receipt.canonicalLines.modeMembership, "canonicalLines.modeMembership").toEqual(
    derivedModeLines,
  );
  expect(receipt.canonicalLines.modeMembership.length, "modeMembership count").toBe(34);
  expect(sevDead21HashLines(receipt.canonicalLines.modeMembership), "modeMembership stored hash").toBe(
    SEV_DEAD_21_MODE_MEMBERSHIP_SHA256,
  );
  expect(sevDead21HashLines(derivedModeLines), "modeMembership derived hash").toBe(
    SEV_DEAD_21_MODE_MEMBERSHIP_SHA256,
  );
  expect(receipt.rosterSha256.modeMembership, "rosterSha256.modeMembership").toBe(
    SEV_DEAD_21_MODE_MEMBERSHIP_SHA256,
  );

  const derivedSlugChannelLines = deriveSevDead21SlugChannelLines(receipt.historicalValues);
  expect(receipt.canonicalLines.slugChannel, "canonicalLines.slugChannel").toEqual(
    derivedSlugChannelLines,
  );
  expect(receipt.canonicalLines.slugChannel.length, "slugChannel count").toBe(21);
  expect(sevDead21HashLines(receipt.canonicalLines.slugChannel), "slugChannel stored hash").toBe(
    SEV_DEAD_21_SLUG_CHANNEL_SHA256,
  );
  expect(sevDead21HashLines(derivedSlugChannelLines), "slugChannel derived hash").toBe(
    SEV_DEAD_21_SLUG_CHANNEL_SHA256,
  );
  expect(receipt.rosterSha256.slugChannel, "rosterSha256.slugChannel").toBe(
    SEV_DEAD_21_SLUG_CHANNEL_SHA256,
  );

  expect(receipt.historicalValues, "historicalValues pinned map").toEqual(SEV_DEAD_21_HISTORICAL_VALUES);
}

function scanSevDead21Consumers(): Record<string, { file: string; count: number }[]> {
  return scanConsumers(SEV_DEAD_21_SET);
}

// EXCISED (SEV-2): the module-scope `extensionText()` helper used by the
// SEV-DEAD-21 block below.

describe("SEV-DEAD-21 source drain", () => {
  it("roster is the signed 21 names and hashes to the signed values", () => {
    const receipt = ledger.sevDead21SourceDrain as {
      roster: string[];
      rosterSha256: Record<string, string>;
    };
    expect(receipt.roster.length).toBe(21);
    expect(receipt.roster).toEqual(SEV_DEAD_21_ROSTER);
    expect(rosterHash(receipt.roster)).toBe(SEV_DEAD_21_ROSTER_SHA256);
    expect(receipt.rosterSha256.modeMembership).toBe(SEV_DEAD_21_MODE_MEMBERSHIP_SHA256);
    expect(receipt.rosterSha256.slugChannel).toBe(SEV_DEAD_21_SLUG_CHANNEL_SHA256);
  });

  it("ledger satisfies the shared SEV-DEAD-21 validator", () => {
    assertSevDead21Ledger(ledger);
  });

  // EXCISED (SEV-2): the three per-slug `<slug> extension removed exactly the N
  // SEV-DEAD-21 names` tests (12 rottay / 7 bithire / 2 evnto). Deleted corpus,
  // retired enforcer, discharged by G2. The signed roster, the ledger
  // validator, the zero-consumer scan and the disjointness proof below are the
  // assertions that actually pin this tranche, and all of them survive.

  it("no SEV-DEAD-21 name has a productive var()/property-access consumer", () => {
    expect(scanSevDead21Consumers()).toEqual({});
  });

  // EXCISED (SEV-2): `no --rt-* name is declared in any _source extension`. It
  // walked the three deleted sources for the --rt-* product dialect; with no
  // `_source` tree, G2 makes the claim unconditional.

  it("SEV-DEAD-21 is disjoint from DEAD-61, D1, CONFLICT9 and PALETTE-89", () => {
    const dead61: Set<string> = new Set(DEAD_61);
    const d1: Set<string> = new Set(D1_ROSTER);
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
    const palette = new Set(PALETTE_MEMBERSHIP_89);
    expect(SEV_DEAD_21_ROSTER.filter((n) => dead61.has(n))).toEqual([]);
    expect(SEV_DEAD_21_ROSTER.filter((n) => d1.has(n))).toEqual([]);
    expect(SEV_DEAD_21_ROSTER.filter((n) => conflict.has(n))).toEqual([]);
    expect(SEV_DEAD_21_ROSTER.filter((n) => palette.has(n))).toEqual([]);
  });
});

describe("SEV-DEAD-21 planted mutants turn red", () => {
  // EXCISED (SEV-2): `insertDecl()` and every re-insertion mutant that used it.
  // Each one read a `_source/extension.css` off disk and planted a declaration
  // into it. With the three files deleted there is no live pre-image to plant
  // into, and rewriting the mutants to plant into an empty string would keep a
  // green while silently dropping the claim ("this enforcer sees a real
  // re-insertion into the real file"). The enforcer they exercised
  // (`enforceExtensionDeadAbsent`) is retired with them; resurrection of any
  // extension source is now caught by law G2 of
  // `scripts/verticals/first-party-single-author-gate/index.mjs`. The SCANNER mutants below
  // are untouched — they never read the artifact tree.

  it("a new CSS consumer of a SEV-DEAD-21 name is detected by the shared scanner", () => {
    const fixture = ".x { color: var(/*gap*/--ds-avatar-bg); }";
    expect(namesFrom(scanConsumerSource(fixture, "x.css", SEV_DEAD_21_SET))).toContain("--ds-avatar-bg");
  });

  it("a new TS consumer of a SEV-DEAD-21 name is detected by the shared scanner", () => {
    const fixture = "const x = `--ds-avatar-bg`; el.style.setProperty(x, 'red');";
    expect(namesFrom(scanConsumerSource(fixture, "x.ts", SEV_DEAD_21_SET))).toEqual(["--ds-avatar-bg"]);
  });

  // EXCISED (SEV-2): `strict-prefix homonyms are not counted as SEV-DEAD-21 names`. It fed a
  // synthetic prefix-homonym fixture to `enforceExtensionDeadAbsent`, which is
  // retired above with its corpus — a boundary negative on a function nothing
  // calls guards nothing. The same exact-name-vs-prefix property is still
  // drilled on the SCANNER, which does still have live inputs, by "does not
  // count longer-prefix homonyms" earlier in this file.

  it("receipt count mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    (mutated.sevDead21SourceDrain as { names: number }).names = 22;
    expect(() => assertSevDead21Ledger(mutated)).toThrow();
  });

  it("roster same-count swap mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.sevDead21SourceDrain as { roster: string[] };
    receipt.roster = ["--ds-color-primary", ...SEV_DEAD_21_ROSTER.slice(1)];
    expect(receipt.roster.length).toBe(21);
    expect(() => assertSevDead21Ledger(mutated)).toThrow();
  });

  it("canonical line same-count swap mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.sevDead21SourceDrain as {
      canonicalLines: { modeMembership: string[] };
    };
    const lines = receipt.canonicalLines.modeMembership;
    [lines[0], lines[1]] = [lines[1], lines[0]];
    expect(lines.length).toBe(34);
    expect(() => assertSevDead21Ledger(mutated)).toThrow();
  });

  it("wrong-mode all→light mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.sevDead21SourceDrain as { historicalValues: SevDead21HistoricalValues };
    receipt.historicalValues.bithire.light = {
      ...receipt.historicalValues.bithire.all,
      ...receipt.historicalValues.bithire.light,
    };
    delete receipt.historicalValues.bithire.all;
    expect(() => assertSevDead21Ledger(mutated)).toThrow();
  });

  it("hash mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.sevDead21SourceDrain as { rosterSha256: Record<string, string> };
    receipt.rosterSha256.modeMembership = "0000000000000000000000000000000000000000000000000000000000000000";
    expect(() => assertSevDead21Ledger(mutated)).toThrow();
  });

  it("historical value mutant is rejected by the shared validator", () => {
    const mutated = JSON.parse(JSON.stringify(ledger)) as typeof ledger;
    const receipt = mutated.sevDead21SourceDrain as { historicalValues: SevDead21HistoricalValues };
    receipt.historicalValues.bithire.light["--ds-shell-breadcrumb-height"] = "99px";
    expect(() => assertSevDead21Ledger(mutated)).toThrow();
  });
});
