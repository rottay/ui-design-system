/**
 * Root authority across the WHOLE foundation.
 *
 * `root-component-authority.test.ts` beside this file guards ONE seam:
 * `themes/default` against `presentation/components/<family>`. It is blind to
 * a channel declared twice inside `foundation/**` itself, which is how the
 * `type` family ended up with two `:root` authorities stating different
 * values (`--ds-type-numeric-font-weight` 600 vs 500,
 * `--ds-type-code-font-variant-numeric` tabular-nums vs normal) and the winner
 * was decided by import order.
 *
 * The law: a `:root` channel has exactly one declaring file under
 * `foundation/**`, or -- when two files genuinely state it -- exactly one
 * value. Divergence is the defect; agreement is merely redundant.
 *
 * The residual list is DECREASE-ONLY. A row may leave it; nothing may join it.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const FOUNDATION_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Divergences that survive today, each with the owner that removes it.
 *
 * `base/shadows/index.css` is the declared write set of WO-DER-03 (shadows
 * derived by `color-mix` over the semantic colour); its acceptance gate takes
 * these three rows to zero. They are listed rather than tolerated so this gate
 * is green on a true statement instead of on a widened rule.
 */
const KNOWN_DIVERGENT: readonly string[] = [
  "--ds-shadow-focus-ring",
  "--ds-shadow-focus-ring-error",
  "--ds-shadow-inner",
];

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "tests" ? [] : cssFiles(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

const withoutComments = (css: string): string =>
  css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Exact `:root` bodies only; attribute-qualified scopes are outside this law. */
function exactRootBodies(css: string): string[] {
  const source = withoutComments(css);
  const bodies: string[] = [];
  for (const match of source.matchAll(/(^|})\s*:root\s*\{/g)) {
    const open = match.index! + match[0].lastIndexOf("{");
    let depth = 1;
    let cursor = open + 1;
    while (cursor < source.length && depth > 0) {
      if (source[cursor] === "{") depth += 1;
      if (source[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    if (depth !== 0) throw new Error("Unbalanced :root block");
    bodies.push(source.slice(open + 1, cursor - 1));
  }
  return bodies;
}

function rootDeclarations(css: string): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const body of exactRootBodies(css)) {
    for (const match of body.matchAll(/(--[a-z0-9-_]+)\s*:\s*([^;]+);/gi)) {
      declarations.set(match[1]!, match[2]!.trim().replace(/\s+/g, " "));
    }
  }
  return declarations;
}

function divergentChannels(
  override: Readonly<Record<string, string>> = {}
): Map<string, string[]> {
  const byChannel = new Map<string, Map<string, string[]>>();
  for (const file of cssFiles(FOUNDATION_ROOT)) {
    const key = relative(FOUNDATION_ROOT, file);
    const css = override[key] ?? readFileSync(file, "utf8");
    for (const [channel, value] of rootDeclarations(css)) {
      const values = byChannel.get(channel) ?? new Map<string, string[]>();
      values.set(value, [...(values.get(value) ?? []), key]);
      byChannel.set(channel, values);
    }
  }
  const divergent = new Map<string, string[]>();
  for (const [channel, values] of byChannel) {
    if (values.size > 1) divergent.set(channel, [...values.values()].flat());
  }
  return divergent;
}

describe("root authority across foundation/**", () => {
  it("has no channel declared twice at :root with different values", () => {
    const found = [...divergentChannels().keys()].sort();
    expect(found).toEqual([...KNOWN_DIVERGENT].sort());
  });

  it("includes the type family in its sweep", () => {
    const typeChannels = new Set<string>();
    for (const file of cssFiles(FOUNDATION_ROOT)) {
      for (const channel of rootDeclarations(readFileSync(file, "utf8")).keys()) {
        if (channel.startsWith("--ds-type-")) typeChannels.add(channel);
      }
    }
    expect(typeChannels.size).toBeGreaterThan(0);
    for (const channel of divergentChannels().keys()) {
      expect(channel.startsWith("--ds-type-"), channel).toBe(false);
    }
  });

  it("keeps the residual list decrease-only: every entry is still real", () => {
    const found = new Set(divergentChannels().keys());
    for (const channel of KNOWN_DIVERGENT) {
      expect(found.has(channel), `${channel} is fixed; remove it from the list`).toBe(true);
    }
  });

  it("turns red when a second foundation file restates a channel differently", () => {
    const target = "base/typography/index.css";
    const planted = `:root { --ds-line-height-normal: 9.9; }\n${readFileSync(
      join(FOUNDATION_ROOT, target),
      "utf8"
    )}`;
    expect([...divergentChannels({ [target]: planted }).keys()]).toContain(
      "--ds-line-height-normal"
    );
  });
});
