/**
 * @fileoverview no-loss harness -- a var() chain resolver over the SHIPPED
 * bundles, so a token migration can be proven instead of argued.
 *
 * WHY THIS EXISTS. A premium token that is "reconnected" to an upstream
 * authority makes two claims at once: the default did not move, and the
 * upstream now does. Both are claims about COMPUTED output, and until this
 * module existed the programme could only assert them by reading source.
 * Source reading is exactly what missed that `--ds-input-md-height` is 40px
 * in three verticals and 36px in bithire -- a target that looked correct in
 * the one bundle someone happened to check.
 *
 * WHAT IT RESOLVES. `styles/*.css` are the real, committed, dual-scoped
 * bundles apps consume. This module parses one, collects the custom-property
 * declarations that are live in the DEFAULT state, and expands `var()`
 * recursively until no `var()` remains. The result is the resolved CHAIN --
 * `calc()` and `color-mix()` survive as symbolic text because arithmetic is
 * not what a no-loss proof is about; identity of the chain is.
 *
 * THE THREE DRILLS.
 *   upstreamMovesDownstream -- overriding the named upstream must change the
 *     channel's resolved value. A channel that ignores its declared upstream
 *     is a dead reconnection, and this goes red.
 *   restoreEqualsDefault -- removing the override must return the channel to
 *     the exact baseline string. This catches a resolver or a chain that
 *     retains state between reads.
 *   defaultIsUnchanged -- the channel's resolved value equals a recorded
 *     baseline, per bundle. This is the "BitHire default byte-identical" leg
 *     of the no-loss law, and because it runs per bundle it also catches the
 *     density trap: `--ds-spacing-N` is density-multiplied and the verticals
 *     ship 0.9 / 1 / 1.125, so a literal reconnected to the spacing scale
 *     holds in `platform` and moves in `bithire` and `evnto`.
 *
 * LIMITS, STATED PLAINLY.
 *   - This is BUNDLE resolution, not `getComputedStyle`. It does not lay out,
 *     does not evaluate `calc()`, and does not apply the full cascade
 *     algorithm. Browser-truth belongs to the Codex visual pass (FASE M).
 *   - Only DEFAULT-state declarations are collected. Dark mode, density
 *     attributes, `:lang()`, and every `@media` / `@supports` / `@container`
 *     context are excluded on purpose: a dark-mode value masquerading as the
 *     default is the failure this exclusion prevents. Conditional states are
 *     out of scope, not silently folded in.
 *   - Precedence is approximated as (tenant-scoped beats `:root`), then
 *     document order. Layer ordering is not modelled. Where that
 *     approximation could matter, `collectDeclarationSites` exposes every
 *     candidate so a caller can inspect rather than trust.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO. The tenant-divergence leg already
 * exists in `brand-theme/tests/themanagementmiami-invariants.test.ts`, and
 * the artifact byte-identity leg in `tenant-theme-artifact-stability.test.ts`.
 * They operate on the COMPILED BRAND THEME; this operates on the emitted CSS.
 * They are not duplicated here. Note also that themanagementmiami has no
 * emitted bundle at all -- it is a TS fixture that `build-vertical-artifacts`
 * deliberately leaves unregistered -- so per-vertical evidence in this module
 * comes from the three bundles that really ship.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

import postcss, { type Rule } from "postcss";

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolvePath(HERE, "../../../..");

/** The bundles that really ship, keyed by vertical. */
export const SHIPPED_BUNDLES = Object.freeze({
  bithire: "styles/bithire.css",
  platform: "styles/platform.css",
  evnto: "styles/evnto.css",
});

export type VerticalName = keyof typeof SHIPPED_BUNDLES;

/**
 * A selector fragment that makes a declaration conditional rather than
 * default. Any of these disqualifies the rule from the default state.
 */
const CONDITIONAL_SELECTOR = [
  "data-theme",
  ".dark",
  "data-density",
  "data-mode",
  "data-contrast",
  "data-motion",
  ":lang(",
  "prefers-",
  "forced-colors",
  ":not(:root)",
];

/** One place a channel is declared, with enough context to adjudicate it. */
export interface DeclarationSite {
  readonly value: string;
  readonly selector: string;
  readonly tenantScoped: boolean;
  readonly order: number;
}

export interface Bundle {
  readonly path: string;
  readonly sites: ReadonlyMap<string, readonly DeclarationSite[]>;
  /** The winning declaration per channel, after precedence. */
  readonly declarations: ReadonlyMap<string, string>;
}

function isDefaultStateRule(rule: Rule): boolean {
  const selector = rule.selector;
  if (CONDITIONAL_SELECTOR.some((fragment) => selector.includes(fragment))) return false;
  // Only the document root carries the token surface in the default state.
  if (!/:root|\bhtml\b|data-ds-root/.test(selector)) return false;
  // Any media/supports/container ancestor makes the declaration conditional.
  for (let node = rule.parent; node; node = (node as { parent?: unknown }).parent as never) {
    const asAtRule = node as { type?: string; name?: string };
    if (asAtRule.type === "atrule" && asAtRule.name !== "layer") return false;
  }
  return true;
}

/**
 * Parses a bundle and indexes every default-state custom property. Tenant
 * scope wins over `:root`; within a tier the last declaration wins.
 */
export function loadBundle(bundlePath: string, root = CORE_ROOT): Bundle {
  const absolute = resolvePath(root, bundlePath);
  const parsed = postcss.parse(readFileSync(absolute, "utf8"));
  const sites = new Map<string, DeclarationSite[]>();
  let order = 0;

  parsed.walkDecls((declaration) => {
    if (!declaration.prop.startsWith("--")) return;
    const parent = declaration.parent;
    if (!parent || parent.type !== "rule") return;
    const rule = parent as Rule;
    if (!isDefaultStateRule(rule)) return;
    const list = sites.get(declaration.prop) ?? [];
    list.push({
      value: declaration.value.trim(),
      selector: rule.selector,
      tenantScoped: /data-tenant|data-vertical/.test(rule.selector),
      order: order++,
    });
    sites.set(declaration.prop, list);
  });

  const declarations = new Map<string, string>();
  for (const [name, list] of sites) {
    const winner = [...list].sort((a, b) =>
      a.tenantScoped === b.tenantScoped ? a.order - b.order : a.tenantScoped ? 1 : -1
    )[list.length - 1];
    declarations.set(name, winner.value);
  }

  return { path: bundlePath, sites, declarations };
}

/** Splits `var(` contents into the name and its optional fallback. */
function splitVarArguments(inner: string): { name: string; fallback: string | null } {
  let depth = 0;
  for (let index = 0; index < inner.length; index += 1) {
    const character = inner[index];
    if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;
    else if (character === "," && depth === 0) {
      return { name: inner.slice(0, index).trim(), fallback: inner.slice(index + 1).trim() };
    }
  }
  return { name: inner.trim(), fallback: null };
}

/** Reads the balanced `var( ... )` starting at `open`, or null if unbalanced. */
function readBalanced(text: string, open: number): { inner: string; end: number } | null {
  let depth = 0;
  for (let index = open; index < text.length; index += 1) {
    if (text[index] === "(") depth += 1;
    else if (text[index] === ")") {
      depth -= 1;
      if (depth === 0) return { inner: text.slice(open + 1, index), end: index };
    }
  }
  return null;
}

/** A channel whose chain never terminates in a value. */
export const UNRESOLVED = "<unresolved>";

/**
 * Expands every `var()` in `expression` until none remain. `overrides` are
 * consulted before the bundle, which is how the upstream drill injects a
 * probe value without mutating the parsed bundle.
 */
export function expand(
  bundle: Bundle,
  expression: string,
  overrides: Readonly<Record<string, string>> = {},
  seen: readonly string[] = []
): string {
  const open = expression.indexOf("var(");
  if (open === -1) return expression;
  const balanced = readBalanced(expression, open + 3);
  if (!balanced) return expression;

  const { name, fallback } = splitVarArguments(balanced.inner);
  let replacement: string;
  if (seen.includes(name)) {
    replacement = UNRESOLVED; // cycle: a chain that refers back to itself
  } else {
    const bound = Object.prototype.hasOwnProperty.call(overrides, name)
      ? overrides[name]
      : bundle.declarations.get(name);
    if (bound !== undefined) {
      replacement = expand(bundle, bound, overrides, [...seen, name]);
    } else if (fallback !== null) {
      replacement = expand(bundle, fallback, overrides, [...seen, name]);
    } else {
      replacement = UNRESOLVED;
    }
  }

  const rebuilt =
    expression.slice(0, open) + replacement + expression.slice(balanced.end + 1);
  return expand(bundle, rebuilt, overrides, seen);
}

/**
 * The resolved value of a channel in this bundle. Returns null when the
 * channel is not declared at all -- distinct from `UNRESOLVED`, which means
 * declared but chaining to nothing.
 */
export function resolveChannel(
  bundle: Bundle,
  channel: string,
  overrides: Readonly<Record<string, string>> = {}
): string | null {
  const bound = Object.prototype.hasOwnProperty.call(overrides, channel)
    ? overrides[channel]
    : bundle.declarations.get(channel);
  if (bound === undefined) return null;
  return normalize(expand(bundle, bound, overrides, [channel]));
}

/** Whitespace-insensitive comparison form; CSS authors are not byte-stable. */
export function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export interface DrillResult {
  readonly passed: boolean;
  readonly detail: string;
}

/**
 * Overriding `upstream` must move `channel`. A reconnection that leaves the
 * value untouched is decorative, and this reports it as such.
 */
export function upstreamMovesDownstream(
  bundle: Bundle,
  channel: string,
  upstream: string,
  probe = "__probe__"
): DrillResult {
  const before = resolveChannel(bundle, channel);
  if (before === null) {
    return { passed: false, detail: `${channel} is not declared in ${bundle.path}` };
  }
  const after = resolveChannel(bundle, channel, { [upstream]: probe });
  if (before === after) {
    return {
      passed: false,
      detail: `${channel} ignores ${upstream}: still "${before}" after the probe`,
    };
  }
  return { passed: true, detail: `${channel}: "${before}" -> "${after}" via ${upstream}` };
}

/** Removing the override must return the channel to its exact baseline. */
export function restoreEqualsDefault(
  bundle: Bundle,
  channel: string,
  upstream: string,
  probe = "__probe__"
): DrillResult {
  const baseline = resolveChannel(bundle, channel);
  resolveChannel(bundle, channel, { [upstream]: probe });
  const restored = resolveChannel(bundle, channel);
  if (baseline !== restored) {
    return {
      passed: false,
      detail: `${channel} did not restore: "${baseline}" then "${restored}"`,
    };
  }
  return { passed: true, detail: `${channel} restored to "${baseline}"` };
}

/**
 * The channel resolves to `expected` in this bundle. Run per vertical: a
 * value that holds in one bundle and moves in another is the trap this leg
 * exists to catch.
 */
export function defaultIsUnchanged(
  bundle: Bundle,
  channel: string,
  expected: string
): DrillResult {
  const actual = resolveChannel(bundle, channel);
  const passed = actual !== null && actual === normalize(expected);
  return {
    passed,
    detail: passed
      ? `${channel} = "${actual}" in ${bundle.path}`
      : `${channel} = "${actual}" in ${bundle.path}, expected "${normalize(expected)}"`,
  };
}

/** Every default-state declaration site of a channel, for adjudication. */
export function collectDeclarationSites(
  bundle: Bundle,
  channel: string
): readonly DeclarationSite[] {
  return bundle.sites.get(channel) ?? [];
}

/** `styles/*.css` are ~4.5MB each and every consumer probe re-read them. */
const CONSUMER_TEXT = new Map<string, string>();

/**
 * The bundle with CSS comments removed, cached per absolute path. Stripping is
 * cheap here and closes the documented comment blind spot two ways: a
 * commented-out reference is no longer counted as a consumer, and a comment
 * sitting between the channel name and its closing paren can no longer defeat
 * boundary matching. The cache assumes the bundles do not change mid-process,
 * which holds for a test run over committed artifacts.
 */
function consumerText(bundlePath: string, root: string): string {
  const absolute = resolvePath(root, bundlePath);
  let text = CONSUMER_TEXT.get(absolute);
  if (text === undefined) {
    text = readFileSync(absolute, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    CONSUMER_TEXT.set(absolute, text);
  }
  return text;
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * True when some rule in the bundle READS the channel via `var()`.
 *
 * NAME BOUNDARY, NOT PREFIX. This used to be
 * `text.includes(`var(${channel}`)`, which scored a superstring as a read of
 * its base: `var(--ds-steps-item-bg-completed)` counted as a consumer of
 * `--ds-steps-item-bg-complete`, and likewise for
 * `--ds-dropdown-border`/`-color`, `--ds-shadow-error`/`-sm`,
 * `--ds-calendar-day-color`/`-other`, `--ds-image-border`/`-color`. Those five
 * were CONSERVATIVE errors: they blocked retirements, never licensed one.
 *
 * WHITESPACE, INCLUDING NEWLINES. The old form also only tolerated zero or one
 * space after `var(`, so it could not see the wrapped form the emitted bundles
 * really use:
 *
 *     --ds-material-card-background-active: var(
 *       --ds-color-bg-active,
 *       ...
 *
 * That blind spot ran the OTHER way — 392 channels in `styles/bithire.css` are
 * read only through a wrapped `var(` and were reported UNREAD, which would
 * license retiring a channel that ships. This is why the matcher tolerates
 * `\s*` on both sides of the name rather than counting spaces.
 *
 * The character after the name may only be `,` (a fallback follows) or `)`
 * (the reference ends) — in CSS there is no third continuation, so this is the
 * exact boundary set rather than a general non-identifier class.
 */
export function hasConsumer(bundlePath: string, channel: string, root = CORE_ROOT): boolean {
  const pattern = new RegExp(`var\\(\\s*${escapeForRegExp(channel)}\\s*[,)]`);
  return pattern.test(consumerText(bundlePath, root));
}
