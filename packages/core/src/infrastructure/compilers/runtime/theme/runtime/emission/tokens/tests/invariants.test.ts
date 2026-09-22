/**
 * The executable form of I-1, I-4, I-5, I-6, I-7 and I-9, each beside the
 * mutant it refuses.
 *
 * A mutant here is planted as DATA -- the shape a defective emitter would
 * produce -- and the assertion shows the invariant rejecting it. That keeps the
 * drill honest without a second emitter in the tree to drift against.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CSS_TYPED_LEAF_REASONS,
  TOKEN_EMISSION_BOUNDS,
  type ThemeTokenLeaf,
  type TokenEmissionMode,
} from "@/contracts/theme/runtime/compilation";

import { compileThemeIntent, staticThemeIntent } from "../../../..";
import {
  TokenEmissionEnvironmentError,
  compilationScope,
  emitThemeTokens,
  type ResolvedBaseEnvironment,
} from "..";

const CORE_ROOT = process.cwd();
const VERTICALS = ["rottay", "bithire", "evnto"] as const;

/** Every CSS function a resolved leaf may not carry outside a declared `css` one. */
const FORBIDDEN_FUNCTIONS = [
  "var(",
  "calc(",
  "color-mix(",
  "clamp(",
  "min(",
  "max(",
  "env(",
] as const;

function baseEnvironment(vertical: string, mode: TokenEmissionMode): ResolvedBaseEnvironment {
  const document = JSON.parse(
    readFileSync(
      resolve(CORE_ROOT, `artifacts/generated/tokens/base-environment/${vertical}/${mode}/index.json`),
      "utf8"
    )
  ) as ResolvedBaseEnvironment;
  return {
    vertical: document.vertical,
    mode: document.mode,
    channels: document.channels,
    digest: document.digest,
  };
}

const documentFor = (vertical: (typeof VERTICALS)[number], mode: TokenEmissionMode, rootFontSizePx = 16) => {
  const { compiled } = compileThemeIntent(staticThemeIntent(vertical));
  return {
    compiled,
    document: emitThemeTokens(compiled, { mode, rootFontSizePx }, baseEnvironment(vertical, mode), {
      vertical,
      slug: vertical,
      engine: "modern",
      compilerVersion: "invariants",
      digest: "invariants",
    }),
  };
};

describe.each(VERTICALS)("%s", (vertical) => {
  const { compiled, document } = documentFor(vertical, "light");

  it("I-1: no CSS function text survives outside a declared css leaf", () => {
    const offenders: string[] = [];
    for (const [channel, leaf] of Object.entries(document.tokens)) {
      if (leaf.kind === "css") continue;
      const text = JSON.stringify(leaf);
      for (const call of FORBIDDEN_FUNCTIONS) {
        if (text.includes(call)) offenders.push(`${channel}: ${call}`);
      }
    }
    expect(offenders).toEqual([]);
    // Non-vacuity: the scan ran over a population and the roster is closed.
    expect(Object.keys(document.tokens).length).toBeGreaterThan(2500);
    for (const leaf of Object.values(document.tokens)) {
      if (leaf.kind !== "css") continue;
      expect(CSS_TYPED_LEAF_REASONS).toContain(leaf.reason);
    }
  });

  it("MUTANT M-1: a reference returned as a keyword is caught by I-1", () => {
    const planted: ThemeTokenLeaf = { kind: "keyword", value: "var(--ds-color-primary)" };
    expect(FORBIDDEN_FUNCTIONS.some((call) => JSON.stringify(planted).includes(call))).toBe(true);
  });

  it("MUTANT M-6: every leaf emitted as css trips the bound", () => {
    const leaves = Object.keys(document.tokens).length;
    expect(leaves / leaves).toBeGreaterThan(TOKEN_EMISSION_BOUNDS.maxCssTypedLeafRatio);
  });

  it("I-5: nothing unresolvable is passed off as a literal", () => {
    const refused = new Set<string>(document.unresolved.map((entry) => entry.channel));
    for (const channel of Object.keys(document.tokens)) expect(refused.has(channel)).toBe(false);
    expect([...refused, ...Object.keys(document.tokens)].sort()).toEqual(
      Object.keys(compiled.cssVariables).sort()
    );
    for (const entry of document.unresolved) {
      expect(typeof entry.reason).toBe("string");
      expect(entry).toHaveProperty("cause");
    }
    // The five real post-substitution refusals, the same five on all three
    // verticals: two px+rem (`--ds-app-shell-navigation-body-padding` and
    // `--ds-app-shell-navigation-body-scroll-padding-block-end`), one
    // rem+unitless (`--ds-pagination-jumper-width`, which reduces to
    // `calc(<rem> + 0)`), one %+px (`--ds-search-command-bar-voice-help-offset`)
    // and one dvw+px (`--ds-search-command-bar-voice-help-inline-size`). None
    // reduces without inventing a root font size or a viewport for a root that
    // is fluid, so the emitter refuses rather than guesses.
    const unitMix = document.unresolved.filter((entry) => entry.reason === "unit-mix");
    expect(unitMix.length).toBeGreaterThanOrEqual(5);
  });

  it("MUTANT M-4: a silently dropped channel is caught by I-5", () => {
    const dropped = Object.keys(document.tokens).slice(1);
    expect(
      [...dropped, ...document.unresolved.map((entry) => entry.channel)].length
    ).toBeLessThan(Object.keys(compiled.cssVariables).length);
  });

  it("MUTANT M-8: a unit mix that guessed a root font size would leave unresolved short", () => {
    const withoutRefusals = document.unresolved.filter((entry) => entry.reason !== "unit-mix");
    expect(withoutRefusals.length).toBeLessThan(document.unresolved.length);
  });

  it("I-7: CSS-typed leaves stay bounded", () => {
    const leaves = Object.values(document.tokens);
    const cssLeaves = leaves.filter((leaf) => leaf.kind === "css").length;
    expect(cssLeaves).toBeGreaterThan(0);
    expect(cssLeaves / leaves.length).toBeLessThanOrEqual(
      TOKEN_EMISSION_BOUNDS.maxCssTypedLeafRatio
    );
  });

  it("I-6: the environment is declared, never guessed", () => {
    expect(() =>
      emitThemeTokens(
        compiled,
        undefined as never,
        baseEnvironment(vertical, "light"),
        { vertical, slug: vertical, engine: "modern", compilerVersion: "x", digest: "y" }
      )
    ).toThrow(TokenEmissionEnvironmentError);
    expect(() =>
      emitThemeTokens(
        compiled,
        { mode: "light", rootFontSizePx: Number.NaN },
        baseEnvironment(vertical, "light"),
        { vertical, slug: vertical, engine: "modern", compilerVersion: "x", digest: "y" }
      )
    ).toThrow(TokenEmissionEnvironmentError);
    // M-3: resolving one mode against the other mode's root is refused at the
    // door rather than silently reported.
    expect(() =>
      emitThemeTokens(
        compiled,
        { mode: "dark", rootFontSizePx: 16 },
        baseEnvironment(vertical, "light"),
        { vertical, slug: vertical, engine: "modern", compilerVersion: "x", digest: "y" }
      )
    ).toThrow(TokenEmissionEnvironmentError);
  });

  it("I-6 (a): the two modes produce different documents", () => {
    const light = documentFor(vertical, "light").document;
    const dark = documentFor(vertical, "dark").document;
    const moved = Object.keys(light.tokens).filter(
      (channel) =>
        JSON.stringify(light.tokens[channel as keyof typeof light.tokens]) !==
        JSON.stringify(dark.tokens[channel as keyof typeof dark.tokens])
    );
    // The compilation-side floor, measured from the compiled mode block
    // (bithire 81, rottay 1, evnto 1), plus the mode-keyed base snapshot's own
    // contribution. The combined floor is pinned from the lot's first green
    // run (rottay 893, bithire 986, evnto 893) and may never fall below the
    // compilation-side one.
    const compilationSideFloor = compiled.modeBlocks
      .filter((block) => block.mode === "dark" || block.mode === "light")
      .reduce((most, block) => Math.max(most, Object.keys(block.cssVariables).length), 0);
    expect(moved.length).toBeGreaterThanOrEqual(compilationSideFloor);
    expect(moved.length).toBeGreaterThanOrEqual(800);
  });

  it("I-6 (b) / MUTANT M-9: two root font sizes move every rem-derived leaf", () => {
    const small = documentFor(vertical, "light", 16).document;
    const large = documentFor(vertical, "light", 20).document;
    const moved = Object.keys(small.tokens).filter(
      (channel) =>
        JSON.stringify(small.tokens[channel as keyof typeof small.tokens]) !==
        JSON.stringify(large.tokens[channel as keyof typeof large.tokens])
    );
    // Pinned from the first green run: 508 rem-derived leaves on each vertical.
    expect(moved.length).toBeGreaterThanOrEqual(500);
    for (const channel of moved.slice(0, 20)) {
      const leaf = large.tokens[channel as keyof typeof large.tokens];
      expect(leaf.kind).toBe("length");
    }
  });

  it("the mode block is a delta, never a new channel", () => {
    for (const block of compiled.modeBlocks) {
      const scope = compilationScope(compiled, block.mode);
      expect(Object.keys(scope).sort()).toEqual(Object.keys(compiled.cssVariables).sort());
    }
  });
});

describe("single-owner invariants", () => {
  const SRC = resolve(CORE_ROOT, "src");
  const read = (relative: string) => readFileSync(resolve(SRC, relative), "utf8");
  /** Prose names an owner; code calls it. The scan reads code. */
  const withoutComments = (source: string) =>
    source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

  it("I-4: the facade compiles exactly once and the emitter cannot compile at all", () => {
    const facade = withoutComments(
      read("infrastructure/compilers/runtime/theme/facade/runtime/tokens/index.ts")
    );
    const calls = facade.match(/\bcompileThemeIntent\s*\(/g) ?? [];
    expect(calls.length).toBe(1);
    for (const owner of ["index.ts", "resolve/index.ts", "evaluate/index.ts"]) {
      const source = withoutComments(
        read(`infrastructure/compilers/runtime/theme/runtime/emission/tokens/${owner}`)
      );
      expect(source).not.toMatch(/from\s+["'][^"']*runtime\/lowering/);
      expect(source).not.toMatch(/from\s+["'][^"']*runtime\/resolution/);
      expect(source).not.toMatch(/\bcompileTheme\b/);
    }
  });

  it("I-9: the var() resolver has exactly one implementation under src/", () => {
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const entry of readdirSync(dir)) {
        const full = resolve(dir, entry);
        if (statSync(full).isDirectory()) {
          if (entry !== "node_modules") walk(full, out);
        } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
          out.push(full);
        }
      }
      return out;
    };
    const owners = walk(SRC).filter((file) =>
      /export\s+function\s+splitVar\b/.test(readFileSync(file, "utf8"))
    );
    expect(owners.map((file) => file.slice(SRC.length + 1))).toEqual([
      "infrastructure/compilers/runtime/theme/runtime/emission/tokens/resolve/index.ts",
    ]);
  });

  it("I-9: the cascade instrument reads the productive resolver from dist", () => {
    const instrument = readFileSync(
      resolve(CORE_ROOT, "scripts/check/tokens/cascade/resolution/index.mjs"),
      "utf8"
    );
    expect(instrument).toMatch(/dist\/infrastructure\/compilers\/runtime\/theme\/runtime\/emission/);
    expect(instrument).not.toMatch(/^export function resolveValue\b/m);
    expect(instrument).not.toMatch(/^export function splitVar\b/m);
  });
});
