/**
 * The three first-party brand themes are authored in one normal form: a single
 * AUTHORED DECISIONS block that holds every brand-specific value and every
 * justified shipped pin, then a value-free exported skeleton that names the
 * contract's families in the contract's own order and only references those
 * decisions.
 *
 * The form is the point. Once it holds, a brand change is a decision edit and
 * never a structural one, and the three verticals stay diffable against each
 * other. This suite is causal: every rule is a pure function of the file text,
 * and every rule is drilled by mutating a COPY of that text and proving the
 * rule reddens. A rule that cannot fail is not a rule.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { FIRST_PARTY_BRAND_THEME_REQUIRED_KEYS } from "@/foundation/contracts/composition/tenants/themes";

const HERE = dirname(fileURLToPath(import.meta.url));
const BRAND_THEMES = resolve(
  HERE,
  "../../../../../../../foundation/tokens/ts/presentation/brand-themes",
);

const SLUGS = ["rottay", "bithire", "evnto"] as const;

const OPEN_FENCE = /^\/\/ ─+ AUTHORED DECISIONS ─+$/;
const CLOSE_FENCE = /^\/\/ ─+ END AUTHORED DECISIONS ─+$/;

/**
 * The roster every vertical authors, in order. A slot a vertical does not
 * author carries a placeholder comment instead of a const, so the roster is a
 * SUBSEQUENCE contract, not an equality one — but the order never varies and
 * no identifier outside this vocabulary may appear.
 */
const ROSTER = [
  "THEME_ID",
  "THEME_NAME",
  "DEFAULT_MODE",
  "OVERLAY_MODE",
  "SEED",
  "OVERLAY_SEED",
  "OVERLAY",
  "RECIPES",
  "EXPRESSIVE",
  "PALETTE",
  "TYPOGRAPHY",
  "SURFACES",
  "MOTION",
  "CHARTS",
  "CHROME",
  "CAPABILITIES",
] as const;

/** Section comments of the exported skeleton, in skeleton order. */
const SKELETON_COMMENTS = [
  "appearance — which mode the authored decisions above ARE.",
  "modes — the other mode, as a typed overlay the compiler merges and diffs.",
  "recipes — governed recipe-profile selection (DS-S001).",
  "expressive — governed expressive-profile selection (C1b).",
  "palette — ramps and semantic colour channels.",
  "typography — shipped font packs and heading/label strategy.",
  "surfaces — radius, elevation, glass/gradient/overlay posture.",
  "motion — compatibility choreography dial, governed as a capability.",
  "charts — chart personality posture.",
  "chrome — per-component chrome channels.",
  "capabilities — explicit disposition for every optional family.",
] as const;

const source = (slug: string): string =>
  readFileSync(resolve(BRAND_THEMES, slug, "index.ts"), "utf8");

// ── pure rules (each one is what the drills mutate against) ─────────────────

/** Line index of the two fences; -1 when the fence is missing. */
function fences(text: string): { open: number; close: number } {
  const lines = text.split("\n");
  return {
    open: lines.findIndex((l) => OPEN_FENCE.test(l)),
    close: lines.findIndex((l) => CLOSE_FENCE.test(l)),
  };
}

/** Top-level `const NAME` declarations, in source order. */
function rosterOf(text: string): string[] {
  return [...text.matchAll(/^const ([A-Z0-9_]+)[:\s]/gm)].map((m) => m[1]);
}

/** Section comments of the exported skeleton, in source order. */
function skeletonCommentsOf(text: string): string[] {
  const lines = text.split("\n").slice(fences(text).close);
  return lines
    .filter((l) => /^ {2}\/\/ [a-z]+ — /.test(l))
    .map((l) => l.replace(/^ {2}\/\/ /, ""));
}

/** Keys the exported skeleton actually assigns, in source order. */
function skeletonKeysOf(text: string): string[] {
  const lines = text.split("\n").slice(fences(text).close);
  return lines
    .filter((l) => /^ {2}[a-z][A-Za-z]*:/.test(l))
    .map((l) => l.slice(2, l.indexOf(":")));
}

/**
 * Code lines below the closing fence that carry a value rather than a
 * reference: a colour, a dimension, a shadow, a font name, a bare number, a
 * quoted enum, or any string literal at all.
 */
// CI-1 checker fix: this only stripped `//` line comments, not JSDoc block
// comments (`/** ... */`, continuation lines starting with `*`). The
// `@governor` documentation comments landed on 2026-08-21 (556b4fe548) below
// the fence -- legitimate governance prose, not values -- contain digits at a
// word boundary (e.g. "F4A-3b") that trip `\b\d`, a false positive this gap
// let through. A line whose trimmed form is a block-comment marker or
// continuation (`/**`, `*/`, or starts with `*`) is now excluded from the
// scan, same as a `//` line always was. This does not weaken the rule for
// real code: the two drill tests below inject their raw value/colour as
// actual skeleton content, not as prose inside a comment, so both still turn
// this rule red exactly as before.
function literalsBelowFence(text: string): string[] {
  const lines = text.split("\n").slice(fences(text).close);
  return lines.filter((line) => {
    const trimmed = line.trim();
    if (/^\/?\*/.test(trimmed) || trimmed === "/**") return false;
    const code = line.replace(/\/\/.*$/, "");
    if (!code.trim()) return false;
    return (
      /#[0-9a-fA-F]{3,8}\b/.test(code) ||
      /\b(rgba?|hsla?|oklch|color-mix|var)\s*\(/.test(code) ||
      /\b\d+(\.\d+)?(px|rem|em|%|ms|s)\b/.test(code) ||
      /['"]/.test(code) ||
      /\b\d/.test(code)
    );
  });
}

/**
 * Every pin marker must sit inside the decisions block, and must be justified
 * — a marker is only a pin when a rationale comment travels with it.
 */
function unjustifiedPins(text: string): string[] {
  const lines = text.split("\n");
  const { close } = fences(text);
  const bad: string[] = [];
  lines.forEach((line, i) => {
    if (!/PRESERVATION PINS|\bpinned\b|\bPIN\b/.test(line)) return;
    if (i > close) {
      bad.push(`below-fence:${i + 1}:${line.trim()}`);
      return;
    }
    const isComment = /^\s*(\/\/|\*|\/\*)/.test(line);
    if (!isComment) {
      bad.push(`not-a-comment:${i + 1}:${line.trim()}`);
      return;
    }
    // A rationale is at least two more comment lines around the marker.
    const near = [lines[i - 2], lines[i - 1], lines[i + 1], lines[i + 2]].filter(
      (l) => l !== undefined && /^\s*(\/\/|\*)/.test(l) && l.trim().length > 4,
    );
    if (near.length < 2) bad.push(`unjustified:${i + 1}:${line.trim()}`);
  });
  return bad;
}

// ── the rules hold on the shipped source ───────────────────────────────────

describe("first-party brand themes are in normal form", () => {
  it.each(SLUGS)("%s fences its authored decisions exactly once", (slug) => {
    const text = source(slug);
    const lines = text.split("\n");
    expect(lines.filter((l) => OPEN_FENCE.test(l))).toHaveLength(1);
    expect(lines.filter((l) => CLOSE_FENCE.test(l))).toHaveLength(1);
    const { open, close } = fences(text);
    expect(open).toBeGreaterThan(-1);
    expect(close).toBeGreaterThan(open);
  });

  it("authors the same roster vocabulary, in the same order, in all three", () => {
    for (const slug of SLUGS) {
      const roster = rosterOf(source(slug));
      // Vocabulary: nothing outside the shared roster is declared.
      expect(roster.filter((n) => !ROSTER.includes(n as never))).toEqual([]);
      // Order: the file's roster is a subsequence of the canonical roster.
      const canonical = ROSTER.filter((n) => roster.includes(n));
      expect(roster).toEqual([...canonical]);
    }
    // Every roster slot is authored by at least one vertical, so the shared
    // vocabulary carries no dead name.
    const authored = new Set(SLUGS.flatMap((slug) => rosterOf(source(slug))));
    expect([...ROSTER].filter((n) => !authored.has(n))).toEqual([]);
  });

  it("declares every roster const inside the decisions block", () => {
    for (const slug of SLUGS) {
      const text = source(slug);
      const { open, close } = fences(text);
      text.split("\n").forEach((line, i) => {
        if (!/^const [A-Z0-9_]+[:\s]/.test(line)) return;
        expect(i, `${slug}:${i + 1} declares a value outside the fence`).toBeGreaterThan(open);
        expect(i, `${slug}:${i + 1} declares a value below the fence`).toBeLessThan(close);
      });
    }
  });

  it("repeats one standardized skeleton, comments included, in all three", () => {
    for (const slug of SLUGS) {
      expect(skeletonCommentsOf(source(slug)), slug).toEqual([...SKELETON_COMMENTS]);
    }
  });

  it("names the contract's families in the contract's own order", () => {
    const required = [...FIRST_PARTY_BRAND_THEME_REQUIRED_KEYS];
    for (const slug of SLUGS) {
      const keys = skeletonKeysOf(source(slug));
      // Everything the contract demands is present, in the contract's order.
      expect(required.filter((k) => !keys.includes(k)), slug).toEqual([]);
      // `keys` is parsed text (`string[]`); `required` is the contract's literal
      // union. The membership test needs the WIDER haystack, so the read is
      // widened rather than the key narrowed — narrowing with a cast would
      // assert the very thing this line is measuring.
      expect(
        keys.filter((k) => (required as readonly string[]).includes(k)),
        slug,
      ).toEqual(required);
      // The optional extras sit at their fixed slots, never at the end.
      const skeletonOrder = SKELETON_COMMENTS.map((c) => c.split(" — ")[0]);
      expect(
        keys,
        `${slug} orders its keys like the skeleton`,
      ).toEqual(["id", "name", ...skeletonOrder.filter((k) => keys.includes(k))]);
    }
  });

  it("keeps the skeleton free of values", () => {
    for (const slug of SLUGS) {
      expect(literalsBelowFence(source(slug)), slug).toEqual([]);
    }
  });

  it("keeps every justified pin inside the decisions block", () => {
    for (const slug of SLUGS) {
      expect(unjustifiedPins(source(slug)), slug).toEqual([]);
    }
  });

  it("references the canonical Evnto presets in place, never inlined", () => {
    const text = source("evnto");
    expect(text).toContain("EVNTO_CANONICAL_MOTION");
    expect(text).toContain("EVNTO_CANONICAL_SURFACES");
    // The presets are consumed by the skeleton, so they cannot be copied into
    // a local decision and silently diverge from the baseline.
    const belowFence = text.split("\n").slice(fences(text).close).join("\n");
    expect(belowFence).toContain("motion: EVNTO_CANONICAL_MOTION,");
    expect(belowFence).toContain("...EVNTO_CANONICAL_SURFACES");
    const aboveFence = text.split("\n").slice(0, fences(text).close).join("\n");
    expect(aboveFence).not.toMatch(/^const (MOTION|EVNTO_CANONICAL_)/m);
  });
});

// ── negative drills: each rule reddens on a mutated copy, and only there ────

/**
 * The rules as predicates, so a drill is reversible in the strict sense: the
 * named rule holds on the shipped text and does NOT hold on the mutated copy.
 * A drill that merely perturbs some output would prove nothing.
 */
const RULES = {
  rosterVocabulary: (t: string) =>
    rosterOf(t).every((n) => (ROSTER as readonly string[]).includes(n)),
  rosterOrder: (t: string) => {
    const roster = rosterOf(t);
    return (
      JSON.stringify(roster) ===
      JSON.stringify(ROSTER.filter((n) => roster.includes(n)))
    );
  },
  skeletonFreeOfValues: (t: string) => literalsBelowFence(t).length === 0,
  skeletonComments: (t: string) =>
    JSON.stringify(skeletonCommentsOf(t)) === JSON.stringify(SKELETON_COMMENTS),
  skeletonKeyOrder: (t: string) => {
    const keys = skeletonKeysOf(t);
    const order = SKELETON_COMMENTS.map((c) => c.split(" — ")[0]);
    return (
      JSON.stringify(keys) ===
      JSON.stringify(["id", "name", ...order.filter((k) => keys.includes(k))])
    );
  },
  pinsJustifiedAndFenced: (t: string) => unjustifiedPins(t).length === 0,
  fencedOnce: (t: string) => {
    const { open, close } = fences(t);
    return open > -1 && close > open;
  },
} as const;

describe("the normal form is enforced, not merely satisfied", () => {
  const drills: ReadonlyArray<{
    name: string;
    slug: (typeof SLUGS)[number];
    rule: keyof typeof RULES;
    mutate: (text: string) => string;
  }> = [
    {
      name: "a roster name outside the shared vocabulary",
      slug: "rottay",
      rule: "rosterVocabulary",
      mutate: (t) => t.replace("\nconst PALETTE:", "\nconst ROTTAY_COLOURS:"),
    },
    {
      name: "two roster slots transposed",
      slug: "bithire",
      rule: "rosterOrder",
      mutate: (t) =>
        t.replace(
          /^(const DEFAULT_MODE = .*;)\n(const OVERLAY_MODE = .*;)$/m,
          "$2\n$1",
        ),
    },
    {
      name: "a value declared below the closing fence",
      slug: "evnto",
      rule: "skeletonFreeOfValues",
      mutate: (t) => t.replace("  charts: CHARTS,", "  charts: { mountDuration: 1200 },"),
    },
    {
      name: "a raw colour smuggled into the skeleton",
      slug: "rottay",
      rule: "skeletonFreeOfValues",
      mutate: (t) => t.replace("  chrome: CHROME,", '  chrome: { sidebar: { bg: "#0C0C0E" } },'),
    },
    {
      name: "a skeleton section comment reworded",
      slug: "bithire",
      rule: "skeletonComments",
      mutate: (t) => t.replace("  // charts — chart personality posture.", "  // charts"),
    },
    {
      name: "two skeleton sections transposed",
      slug: "rottay",
      rule: "skeletonKeyOrder",
      mutate: (t) =>
        t
          .replace("  // chrome — per-component chrome channels.\n  chrome: CHROME,\n\n", "")
          .replace(
            "  // palette — ramps and semantic colour channels.",
            "  // chrome — per-component chrome channels.\n  chrome: CHROME,\n\n  // palette — ramps and semantic colour channels.",
          ),
    },
    {
      name: "a pin pushed below the fence",
      slug: "evnto",
      rule: "pinsJustifiedAndFenced",
      mutate: (t) =>
        t.replace(
          "  capabilities: CAPABILITIES,",
          "  // ---- CTRL-04 PRESERVATION PINS (R1 Cohort 1) ----\n  capabilities: CAPABILITIES,",
        ),
    },
    {
      name: "a pin marker stripped of its justification",
      slug: "rottay",
      rule: "pinsJustifiedAndFenced",
      mutate: (t) =>
        t.replace(
          /\n\s*\/\/ NOT new product decisions\.[\s\S]*?receipts\/cohort-1-button-shadow-state-census\.json\./,
          "",
        ),
    },
    {
      name: "the closing fence deleted",
      slug: "bithire",
      rule: "fencedOnce",
      mutate: (t) => t.replace(/^\/\/ ─+ END AUTHORED DECISIONS ─+$/m, "// end"),
    },
  ];

  it.each(drills)("$name breaks $rule", ({ slug, rule, mutate }) => {
    const clean = source(slug);
    const dirty = mutate(clean);
    // The drill must actually bite the file it claims to mutate.
    expect(dirty, "drill did not change the source").not.toBe(clean);
    expect(RULES[rule](clean), `${rule} must hold on the shipped ${slug}`).toBe(true);
    expect(RULES[rule](dirty), `${rule} must fail on the mutated ${slug}`).toBe(false);
  });

  it.each(SLUGS)("%s satisfies every rule as shipped", (slug) => {
    const text = source(slug);
    for (const [name, rule] of Object.entries(RULES)) {
      expect(rule(text), `${slug} violates ${name}`).toBe(true);
    }
  });

  it("leaves the shipped sources untouched", () => {
    // Every drill above operated on a string copy; the files on disk still
    // pass every rule.
    for (const slug of SLUGS) {
      const text = source(slug);
      expect(literalsBelowFence(text), slug).toEqual([]);
      expect(unjustifiedPins(text), slug).toEqual([]);
      expect(skeletonCommentsOf(text), slug).toEqual([...SKELETON_COMMENTS]);
    }
  });
});
