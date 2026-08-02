/**
 * @fileoverview The rhythm-adoption census -- proof that the tenant
 * `appearance.rhythm` axis actually reaches the layout families it claims.
 *
 * WHY THIS READS SOURCE AND NOT THE BUNDLES. The rest of this folder resolves
 * `styles/*.css`, the committed bundles apps consume. Those bundles are build
 * products: a mount added to a skin today is invisible to `resolveChannel`
 * until someone regenerates them, so a bundle-based census would report a
 * freshly-landed adoption wave as absent. That is the wrong failure. This suite
 * therefore parses the AUTHORED CSS with the same postcss the harness uses, and
 * asserts on declarations rather than on computed values. It is a REACHABILITY
 * census -- "the axis is wired into these declarations" -- not a value proof.
 * Value proofs stay with the bundle drills next door, and browser truth stays
 * with the sighted pass.
 *
 * THE LAW BEING PINNED. Rhythm mounts on the PRESET tier and nowhere else:
 *
 *   1. A preset rung or a DS-declared room channel multiplies
 *      `--ds-rhythm-effective-scale` where it is ASSIGNED, so every consume
 *      site downstream stays a plain channel read.
 *   2. A consumer's numeric value is exact geometry, honored as-is. Where a
 *      component hook exists, only the FALLBACK carries the scale: a caller who
 *      names the value has stated geometry and keeps it.
 *   3. Sizes are density's axis, not rhythm's. Control heights, control
 *      padding, icon sizes and touch floors never appear here.
 *   4. No value multiplies the scale twice. Applying it once per shorthand
 *      COMPONENT is not twice; applying it to a channel that already carries it
 *      is, and that is the defect drill (c) exists to catch.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

import postcss from "postcss";
import { describe, it, expect } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolvePath(HERE, "../../../../..");
const CSS_ROOT = "src/foundation/tokens/css";

/** The channel every consumer reads. The raw `--ds-rhythm-scale` is the tenant
 *  input; this is the clamped derivation, and mounting the raw one would skip
 *  the clamp. Anchored by name so a rename cannot silently empty this census. */
const RHYTHM_CHANNEL = "--ds-rhythm-effective-scale";

/**
 * THE PINNED FAMILY LAW. Each row is a family that has adopted rhythm and the
 * number of declarations that must carry the axis. The counts are minimums:
 * widening a family stays green, dropping a mount goes red. A family removed
 * from this list is a coverage regression that must be argued in review, not
 * absorbed by a test that only counts a global total.
 */
const COVERED_FAMILIES = [
  { family: "layout primitives (Stack rungs + Space presets + Flex/Grid preset gaps)", file: `${CSS_ROOT}/presentation/components/skin/layout-primitives.css`, minimumSites: 14 },
  { family: "patterns (cards, listing grid, workflow, command home)", file: `${CSS_ROOT}/presentation/components/patterns.css`, minimumSites: 14 },
  { family: "widget board (grid seams + toolbar separation)", file: `${CSS_ROOT}/presentation/components/skin/widget-board.css`, minimumSites: 4 },
  { family: "page shell", file: `${CSS_ROOT}/runtime/engines/modern/skin/page-shell.css`, minimumSites: 6 },
  { family: "workbench header", file: `${CSS_ROOT}/runtime/engines/modern/skin/workbench-header.css`, minimumSites: 4 },
  { family: "cockpit header", file: `${CSS_ROOT}/runtime/engines/modern/skin/cockpit-header.css`, minimumSites: 5 },
  { family: "detail panel", file: `${CSS_ROOT}/runtime/engines/modern/skin/detail-panel.css`, minimumSites: 4 },
  { family: "layout frame (header/content/footer room)", file: `${CSS_ROOT}/runtime/engines/modern/skin/layout.css`, minimumSites: 4 },
  { family: "card", file: `${CSS_ROOT}/runtime/engines/modern/skin/card.css`, minimumSites: 3 },
  { family: "form field", file: `${CSS_ROOT}/runtime/engines/modern/skin/form-field.css`, minimumSites: 2 },
  { family: "list toolbar", file: `${CSS_ROOT}/runtime/engines/modern/skin/list-toolbar.css`, minimumSites: 1 },
] as const;

interface SourceDeclaration {
  readonly prop: string;
  readonly value: string;
  readonly selector: string;
}

function readDeclarations(file: string): readonly SourceDeclaration[] {
  const text = readFileSync(resolvePath(CORE_ROOT, file), "utf8");
  const parsed = postcss.parse(text, { from: file });
  const out: SourceDeclaration[] = [];
  parsed.walkDecls((declaration) => {
    const parent = declaration.parent;
    out.push({
      prop: declaration.prop,
      value: declaration.value,
      selector: parent && parent.type === "rule" ? (parent as { selector: string }).selector : "",
    });
  });
  return out;
}

function rhythmDeclarations(file: string): readonly SourceDeclaration[] {
  return readDeclarations(file).filter((d) => d.value.includes(RHYTHM_CHANNEL));
}

/** Raw source, for assertions about text the parser normalizes away. */
function CSS_SOURCE(file: string): string {
  return readFileSync(resolvePath(CORE_ROOT, file), "utf8");
}

/** Splits a value into top-level components: whitespace at paren depth zero. */
function topLevelComponents(value: string): readonly string[] {
  const out: string[] = [];
  let depth = 0;
  let current = "";
  for (const character of value) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (/\s/.test(character) && depth === 0) {
      if (current.trim()) out.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

/** Reads the balanced parenthesised span starting at `open`. */
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

/**
 * Rewrites every `var(NAME, FALLBACK)` to `var(NAME)` and returns the stripped
 * text plus the fallbacks it removed. A fallback is a SEPARATE arm of the
 * value -- it fires only when the name is undeclared -- so it must be audited
 * on its own rather than counted alongside the arm that shadows it.
 */
function stripFallbacks(text: string): { stripped: string; fallbacks: readonly string[] } {
  const fallbacks: string[] = [];
  let result = "";
  let cursor = 0;
  for (;;) {
    const open = text.indexOf("var(", cursor);
    if (open === -1) {
      result += text.slice(cursor);
      return { stripped: result, fallbacks };
    }
    const balanced = readBalanced(text, open + 3);
    if (!balanced) {
      result += text.slice(cursor);
      return { stripped: result, fallbacks };
    }
    const { name, fallback } = splitVarArguments(balanced.inner);
    if (fallback !== null) fallbacks.push(fallback);
    result += `${text.slice(cursor, open)}var(${name})`;
    cursor = balanced.end + 1;
  }
}

/**
 * Every component of `value` that multiplies the rhythm channel more than once
 * along one arm. A shorthand applying the scale once per component is legal and
 * must not be reported; `calc(x * scale * scale)` is the real defect.
 */
function doubleScaledArms(value: string): readonly string[] {
  const violations: string[] = [];
  for (const component of topLevelComponents(value)) {
    const { stripped, fallbacks } = stripFallbacks(component);
    for (const fallback of fallbacks) violations.push(...doubleScaledArms(fallback));
    if (stripped.split(RHYTHM_CHANNEL).length - 1 > 1) violations.push(component);
  }
  return violations;
}

/** Every custom property this arm READS, ignoring fallback arms. */
function channelsReadInArm(arm: string): readonly string[] {
  const { stripped } = stripFallbacks(arm);
  return [...stripped.matchAll(/var\((--[a-z0-9-]+)\)/gi)].map((match) => match[1]);
}

describe("rhythm adoption census (drill a: the axis reaches the covered families)", () => {
  it.each(COVERED_FAMILIES)(
    "$family mounts the rhythm channel on at least $minimumSites declarations",
    ({ file, minimumSites }) => {
      const mounted = rhythmDeclarations(file);
      expect(
        mounted.length,
        `${file} mounts ${RHYTHM_CHANNEL} on ${mounted.length} declarations, expected >= ${minimumSites}`
      ).toBeGreaterThanOrEqual(minimumSites);
    }
  );

  it("mounts the CLAMPED channel, never the raw tenant input", () => {
    for (const { file } of COVERED_FAMILIES) {
      for (const declaration of rhythmDeclarations(file)) {
        // `--ds-rhythm-scale` is the tenant input; reading it directly would
        // skip the 0.8..1.25 clamp the floor declares.
        expect(
          declaration.value.includes("var(--ds-rhythm-scale"),
          `${file} :: ${declaration.prop} reads the unclamped tenant input`
        ).toBe(false);
      }
    }
  });

  it("never wraps `var(` away from its channel name", () => {
    // A wrapped read -- `var(\n  --ds-form-field-gap,\n  calc(...))` -- is valid
    // CSS and paints correctly, which is exactly why it is dangerous: it
    // silently defeats every reader that greps for `var(--ds-form-field-gap`.
    // That includes this folder's own `hasConsumer` probe, so a wrap can hand
    // you a HOLLOW GREEN -- a consumer check that reports "absent" for a
    // channel that is right there. It cost six UI contract tests once. The
    // whole read stays on one line; long lines are the cheaper problem.
    const violations: string[] = [];
    for (const { file } of COVERED_FAMILIES) {
      for (const declaration of rhythmDeclarations(file)) {
        if (/var\(\s*[\n\r]/.test(declaration.value)) {
          violations.push(`${file} :: ${declaration.prop}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("POSITIVE CONTROL: the wrap detector fires on a wrapped read", () => {
    expect(/var\(\s*[\n\r]/.test("var(\n  --ds-x-gap,\n  calc(1px))")).toBe(true);
    expect(/var\(\s*[\n\r]/.test("var(--ds-x-gap, calc(1px))")).toBe(false);
  });

  it("keeps every mount on a logical property, so RTL is unaffected", () => {
    const PHYSICAL = /^(margin|padding)-(left|right)$/;
    for (const { file } of COVERED_FAMILIES) {
      for (const declaration of rhythmDeclarations(file)) {
        expect(
          PHYSICAL.test(declaration.prop),
          `${file} :: ${declaration.prop} is a physical side; rhythm mounts on logical properties only`
        ).toBe(false);
      }
    }
  });
});

describe("numeric sovereignty (drill b: exact geometry is never scaled)", () => {
  const LAYOUT_PRIMITIVES = `${CSS_ROOT}/presentation/components/skin/layout-primitives.css`;

  /** Declarations belonging to rules whose selector matches. */
  function declarationsFor(file: string, fragment: string): readonly SourceDeclaration[] {
    return readDeclarations(file).filter((d) => d.selector.includes(fragment));
  }

  it('the Stack "custom" rung carries no rhythm -- a caller\'s numeric gap is exact', () => {
    const custom = declarationsFor(LAYOUT_PRIMITIVES, '[data-spacing="custom"]');
    expect(custom.length).toBeGreaterThan(0);
    for (const declaration of custom) {
      expect(declaration.value).not.toContain(RHYTHM_CHANNEL);
    }
  });

  it('the Stack "none" rung carries no rhythm -- zero has no room to scale', () => {
    const none = declarationsFor(LAYOUT_PRIMITIVES, '[data-spacing="none"]');
    expect(none.length).toBeGreaterThan(0);
    for (const declaration of none) {
      expect(declaration.value).not.toContain(RHYTHM_CHANNEL);
    }
  });

  it("POSITIVE CONTROL: the preset rungs beside them DO carry rhythm", () => {
    // Without this leg the two assertions above would also pass against a file
    // where rhythm was never adopted at all, or where the channel was renamed.
    for (const rung of ['[data-spacing="md"]', '[data-spacing="xs"]', '[data-spacing="4xl"]']) {
      const declarations = declarationsFor(LAYOUT_PRIMITIVES, rung);
      expect(declarations.length, `${rung} has no declarations`).toBeGreaterThan(0);
      expect(
        declarations.some((d) => d.value.includes(RHYTHM_CHANNEL)),
        `${rung} lost its rhythm mount`
      ).toBe(true);
    }
  });

  it("Flex and Grid scale ONLY through an enumerated preset spelling", () => {
    // Flex's channel carries both a rung (`var(--ds-spacing-4, 1rem)`) and a
    // caller's measurement (`16px`), so the contract now stamps the preset
    // SPELLING and the stylesheet keys on it. The invariant that replaces the
    // old blanket ban: a rule that scales rhythm must be gated on a
    // `*-preset="<rung>"` match, because those attributes are stamped for rungs
    // and never for numbers. A scaled rule without that gate would reach a
    // measurement, which is the defect the enumeration exists to prevent.
    const scaled = readDeclarations(LAYOUT_PRIMITIVES).filter(
      (d) =>
        d.value.includes(RHYTHM_CHANNEL) &&
        /\.rottay-(flex|grid)/.test(d.selector)
    );
    expect(scaled.length, "Flex/Grid lost their rhythm mounts").toBeGreaterThan(0);
    for (const declaration of scaled) {
      expect(
        /-preset="(xs|sm|md|lg|xl|2xl|3xl|4xl)"/.test(declaration.selector),
        `${declaration.prop} scales without gating on an enumerated preset spelling`
      ).toBe(true);
    }
  });

  it("the UNGATED Flex/Grid gap rules stay exact -- numbers travel there", () => {
    const ungated = readDeclarations(LAYOUT_PRIMITIVES).filter(
      (d) =>
        /\.rottay-(flex|grid)/.test(d.selector) &&
        !/-preset="(xs|sm|md|lg|xl|2xl|3xl|4xl)"/.test(d.selector) &&
        /gap$/.test(d.prop)
    );
    expect(ungated.length, "the base gap rules disappeared").toBeGreaterThan(0);
    for (const declaration of ungated) {
      expect(
        declaration.value.includes(RHYTHM_CHANNEL),
        `${declaration.selector} { ${declaration.prop} } scales a value a caller may have stated exactly`
      ).toBe(false);
    }
  });

  it("`none` is never enumerated -- zero has no room to scale", () => {
    expect(CSS_SOURCE(LAYOUT_PRIMITIVES)).not.toContain('-preset="none"');
  });
});

describe("no double application (drill c: the scale lands exactly once)", () => {
  it("no arm of any covered declaration multiplies the scale twice", () => {
    const violations: string[] = [];
    for (const { file } of COVERED_FAMILIES) {
      for (const declaration of rhythmDeclarations(file)) {
        for (const arm of doubleScaledArms(declaration.value)) {
          violations.push(`${file} :: ${declaration.prop} :: ${arm}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("no scaled arm re-reads a channel that is itself rhythm-scaled", () => {
    // The cross-file leg. `--ds-listing-grid-gap` is scaled where patterns.css
    // declares it, so a consumer wrapping `var(--ds-listing-grid-gap)` in
    // another calc would square the scale. Reading it plainly is correct, and
    // carrying rhythm in the FALLBACK arm is correct too -- that arm fires only
    // when the declaration is absent, which is why fallbacks are stripped here.
    const scaledChannels = new Set<string>();
    for (const { file } of COVERED_FAMILIES) {
      for (const declaration of rhythmDeclarations(file)) {
        if (declaration.prop.startsWith("--")) scaledChannels.add(declaration.prop);
      }
    }
    expect(scaledChannels.size).toBeGreaterThan(0);

    const violations: string[] = [];
    for (const { file } of COVERED_FAMILIES) {
      for (const declaration of rhythmDeclarations(file)) {
        for (const component of topLevelComponents(declaration.value)) {
          const { stripped } = stripFallbacks(component);
          if (!stripped.includes(RHYTHM_CHANNEL)) continue;
          for (const channel of channelsReadInArm(component)) {
            if (channel !== RHYTHM_CHANNEL && scaledChannels.has(channel)) {
              violations.push(`${file} :: ${declaration.prop} re-scales ${channel}`);
            }
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("POSITIVE CONTROL: the detector fires on a genuine double", () => {
    // A drill that cannot fail proves nothing.
    expect(doubleScaledArms(`calc(var(--ds-spacing-4) * var(${RHYTHM_CHANNEL}, 1) * var(${RHYTHM_CHANNEL}, 1))`)).toHaveLength(1);
    expect(doubleScaledArms(`calc(calc(2px * var(${RHYTHM_CHANNEL}, 1)) * var(${RHYTHM_CHANNEL}, 1))`)).toHaveLength(1);
    // ...and stays silent on a shorthand that scales once per component.
    expect(
      doubleScaledArms(
        `calc(2px * var(${RHYTHM_CHANNEL}, 1)) calc(4px * var(${RHYTHM_CHANNEL}, 1)) calc(6px * var(${RHYTHM_CHANNEL}, 1))`
      )
    ).toEqual([]);
    // ...and on a hook whose fallback arm scales once per component.
    expect(
      doubleScaledArms(
        `var(--ds-hook, calc(2px * var(${RHYTHM_CHANNEL}, 1)) calc(4px * var(${RHYTHM_CHANNEL}, 1)))`
      )
    ).toEqual([]);
  });
});
