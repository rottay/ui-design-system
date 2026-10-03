/**
 * The Anchor focus indicator, read from the skin: every focusable node wears
 * the tenant focus signature, never a solid outline, and keeps a system-colour
 * outline in forced colors.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/anchor/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

interface Rule {
  readonly selector: string;
  readonly body: string;
}

interface FocusNode {
  readonly name: string;
  readonly selector: RegExp;
  /** The signature rides an overlay hosted by the node instead of the node's own box. */
  readonly carrier: boolean;
}

const NODES: readonly FocusNode[] = [
  { name: "anchor link", selector: /\[data-part='item'\]/, carrier: true },
];

/** Every innermost rule of `css`, with its selector list on one line. */
function rules(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1]!.replace(/\s+/g, " ").trim(),
    body: match[2]!,
  }));
}

/** `css` split into its `@media (forced-colors: active)` blocks and the rest. */
function splitForcedColors(css: string): { forced: string; rest: string } {
  const marker = "@media (forced-colors: active)";
  let forced = "";
  let rest = "";
  let cursor = 0;
  for (let at = css.indexOf(marker); at !== -1; at = css.indexOf(marker, cursor)) {
    let end = css.indexOf("{", at) + 1;
    for (let depth = 1; depth > 0 && end < css.length; end += 1) {
      if (css[end] === "{") depth += 1;
      else if (css[end] === "}") depth -= 1;
    }
    rest += css.slice(cursor, at);
    forced += css.slice(at, end);
    cursor = end;
  }
  return { forced, rest: rest + css.slice(cursor) };
}

/** Each declaration of a rule body, whitespace collapsed, last statement of a property winning. */
function declarations(body: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const statement of body.split(";")) {
    const colon = statement.indexOf(":");
    if (colon === -1) continue;
    const value = statement.slice(colon + 1).replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")");
    found.set(statement.slice(0, colon).trim(), value.trim());
  }
  return found;
}

/** `value` as the cascade reads it: a stated channel wins, an unstated one yields to its fallback, a bare root read stays. */
function resolveReads(value: string, stated: Readonly<Record<string, string>> = {}): string {
  let resolved = "";
  for (let at = 0; at < value.length; ) {
    if (!value.startsWith("var(", at)) {
      resolved += value[at];
      at += 1;
      continue;
    }
    let end = at + 4;
    for (let depth = 1; depth > 0 && end < value.length; end += 1) {
      if (value[end] === "(") depth += 1;
      else if (value[end] === ")") depth -= 1;
    }
    const read = value.slice(at + 4, end - 1);
    const comma = read.indexOf(",");
    const name = (comma === -1 ? read : read.slice(0, comma)).trim();
    const fallback = comma === -1 ? `var(${name})` : resolveReads(read.slice(comma + 1).trim(), stated);
    resolved += stated[name] ?? fallback;
    at = end;
  }
  return resolved;
}

const { forced, rest } = splitForcedColors(SKIN);
const FOCUS = /focus-visible/;
const PAINTED_OUTLINE = /outline(?:-color)?:[^;]*(?:solid|dashed|dotted|double)\s+(?!\s|transparent\b)/;

describe("Anchor focus signature (skin contract)", () => {
  it("paints no solid outline on a focused node outside forced colors", () => {
    const focused = rules(rest).filter((rule) => FOCUS.test(rule.selector));
    expect(focused.length).toBeGreaterThan(0);
    for (const rule of focused) {
      expect(rule.body, rule.selector).not.toMatch(PAINTED_OUTLINE);
      expect(rule.body, rule.selector).not.toMatch(/outline-color:/);
      expect(rule.body, rule.selector).not.toMatch(/--ds-focus-ring-color/);
    }
  });

  it("wears the tenant focus signature on every focusable node", () => {
    const focused = rules(rest).filter((rule) => FOCUS.test(rule.selector));
    for (const node of NODES) {
      const painter = focused.filter(
        (rule) =>
          node.selector.test(rule.selector) &&
          /::after/.test(rule.selector) === node.carrier &&
          /box-shadow:\s*var\(--ds-focus-ring\)/.test(rule.body)
      );
      expect(painter.length, node.name).toBeGreaterThan(0);
      if (node.carrier) {
        for (const rule of painter) {
          expect(rule.body, node.name).toMatch(/content:\s*(?:''|"");/);
          expect(rule.body, node.name).toMatch(/position:\s*absolute;/);
          expect(rule.body, node.name).toMatch(/pointer-events:\s*none;/);
        }
      }
    }
  });

  it("keeps a visible system-colour outline on every focusable node in forced colors", () => {
    const arms = rules(forced).filter((rule) => FOCUS.test(rule.selector));
    for (const node of NODES) {
      const outline = arms.filter(
        (rule) =>
          node.selector.test(rule.selector) &&
          /outline:\s*max\(2px, .*\) solid Highlight;/.test(rule.body)
      );
      expect(outline.length, node.name).toBeGreaterThan(0);
      if (node.carrier) {
        const overlay = arms.filter(
          (rule) => node.selector.test(rule.selector) && /::after/.test(rule.selector)
        );
        expect(overlay.length, node.name).toBeGreaterThan(0);
        for (const rule of overlay) expect(rule.body, node.name).toMatch(/display:\s*none;/);
      }
    }
  });

  it("keeps both published focus hooks read by the overlay", () => {
    const overlay = rules(rest).filter(
      (rule) => FOCUS.test(rule.selector) && /::after/.test(rule.selector)
    );
    expect(overlay).toHaveLength(1);
    expect(overlay[0]!.body).toMatch(
      /inset:\s*calc\(var\(--ds-anchor-focus-ring-offset, var\(--ds-focus-ring-offset\)\) \+ var\(--ds-focus-ring-width\)\);/
    );
    const radius = declarations(overlay[0]!.body).get("border-radius") ?? "";
    expect(resolveReads(radius)).toBe(
      "max(0px, calc(var(--ds-radius-sm) - var(--ds-focus-ring-offset) - var(--ds-focus-ring-width)))"
    );
    expect(resolveReads(radius, { "--ds-anchor-focus-ring-radius": "6px" })).toBe(
      "max(0px, calc(6px - var(--ds-focus-ring-offset) - var(--ds-focus-ring-width)))"
    );
  });
});
