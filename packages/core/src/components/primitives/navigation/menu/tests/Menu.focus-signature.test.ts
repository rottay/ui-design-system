/**
 * The Menu focus indicator, read from the skin: every row wears the tenant
 * focus signature -- stated first and composed with the hovered or selected
 * shadow in the stacked modes, on an overlay the menubar cannot clip in the
 * horizontal mode -- and forced colors keep a system-colour outline.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

interface Rule {
  readonly selector: string;
  readonly body: string;
}

/** Every innermost rule of `css`, one per selector of its list. */
function rules(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap((match) =>
    match[1]!
      .split(/,(?![^(]*\))/)
      .map((selector) => ({ selector: selector.replace(/\s+/g, " ").trim(), body: match[2]! }))
  );
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

function declaration(body: string, property: string): string | undefined {
  let found: string | undefined;
  for (const statement of body.split(";")) {
    const colon = statement.indexOf(":");
    if (colon !== -1 && statement.slice(0, colon).trim() === property) {
      found = statement.slice(colon + 1).replace(/\s+/g, " ").trim();
    }
  }
  return found;
}

const FOCUS = ":is([data-state~='focus-visible'], :focus-visible)";
const SELF = ":not(:focus-within:not(:focus))";
const { forced, rest } = splitForcedColors(SKIN);

const SIGNATURE = "var(--ds-menu-focus-ring, var(--ds-focus-ring))";
const WIDTH = "var(--ds-menu-focus-ring-width, var(--ds-focus-ring-width))";
const STACKED = ".ds-menu--modern[data-part='root']:not([data-mode='horizontal'])";
const MENUBAR = ".ds-menu--modern[data-part='root'][data-mode='horizontal']";
const PARTS = ["item", "trigger"] as const;

const focusRules = (css: string): Rule[] => rules(css).filter((rule) => rule.selector.includes(FOCUS));

/** The `@container not style(<channel>: none)` guards that enclose the rule holding `needle`. */
function guardsAround(css: string, needle: string): string[] {
  const at = css.indexOf(needle);
  const guards: string[] = [];
  let depth = 0;
  for (let cursor = at; cursor >= 0; cursor -= 1) {
    if (css[cursor] === "}") depth += 1;
    else if (css[cursor] === "{") {
      if (depth > 0) depth -= 1;
      else {
        const head = css.slice(css.lastIndexOf("}", cursor) + 1, cursor);
        const guard = head.match(/@container not style\((--[\w-]+): none\)\s*$/);
        if (guard) guards.push(guard[1]!);
      }
    }
  }
  return guards;
}

describe("menu focus signature", () => {
  it("states the signature on every focused row of the stacked modes", () => {
    for (const part of PARTS) {
      const rule = focusRules(rest).find((r) => r.selector === `${STACKED} [data-part='${part}']${FOCUS}${SELF}`);
      expect(rule, part).toBeDefined();
      expect(declaration(rule!.body, "box-shadow")).toBe(SIGNATURE);
      expect(declaration(rule!.body, "outline")).toBe(`${WIDTH} solid transparent`);
    }
  });

  it("composes the signature first with the selected and the hovered shadow, each guarded against none", () => {
    const selected = `${SIGNATURE}, var(--ds-menu-item-shadow-active, var(--ds-elevation-2)), var(--ds-menu-item-keyline)`;
    const hovered = `${SIGNATURE}, var(--ds-menu-item-shadow-hover, var(--ds-elevation-1))`;
    const composed = focusRules(rest).filter((rule) => (declaration(rule.body, "box-shadow") ?? SIGNATURE) !== SIGNATURE);
    expect(composed.map((rule) => declaration(rule.body, "box-shadow"))).toEqual([selected, hovered, hovered]);
    expect(composed[0]!.selector).toBe(`${STACKED} [data-part='item'][data-selected='true']${FOCUS}${SELF}`);
    expect(guardsAround(rest, `box-shadow: ${selected}`).sort()).toEqual(
      ["--ds-elevation-2", "--ds-menu-item-keyline", "--ds-menu-item-shadow-active"]
    );
    expect(guardsAround(rest, `box-shadow: ${hovered}`).sort()).toEqual(
      ["--ds-elevation-1", "--ds-menu-item-shadow-hover"]
    );
  });

  it("starts every focused shadow with the signature", () => {
    for (const rule of focusRules(rest)) {
      const shadow = declaration(rule.body, "box-shadow");
      if (shadow !== undefined) expect(shadow.startsWith(SIGNATURE), rule.selector).toBe(true);
    }
  });

  it("paints the menubar signature on an overlay and leaves the row's own shadow alone", () => {
    for (const part of PARTS) {
      const host = focusRules(rest).find((r) => r.selector === `${MENUBAR} [data-part='${part}']${FOCUS}${SELF}`);
      const overlay = focusRules(rest).find((r) => r.selector === `${MENUBAR} [data-part='${part}']${FOCUS}${SELF}::after`);
      expect(host, part).toBeDefined();
      expect(overlay, part).toBeDefined();
      expect(declaration(host!.body, "box-shadow")).toBeUndefined();
      expect(declaration(overlay!.body, "box-shadow")).toBe(SIGNATURE);
      expect(declaration(overlay!.body, "inset")).toBe(`calc(var(--ds-focus-ring-offset) + ${WIDTH})`);
      expect(declaration(overlay!.body, "background")).toBe("none");
      expect(declaration(overlay!.body, "pointer-events")).toBe("none");
    }
  });

  it("never draws a solid outline in place of the signature", () => {
    for (const rule of focusRules(rest)) {
      const outline = declaration(rule.body, "outline");
      if (outline !== undefined) expect(outline).toBe(`${WIDTH} solid transparent`);
      expect(declaration(rule.body, "outline-color")).toBeUndefined();
    }
  });

  it("keeps a system-colour outline in forced colors, inside the row where it would be hidden", () => {
    const outline = `max(2px, ${WIDTH}) solid Highlight`;
    const inside = /^calc\(-1 \* max\(2px, /;
    const find = (selector: string): Rule[] => focusRules(forced).filter((rule) => rule.selector === selector);
    for (const part of PARTS) {
      const [stacked] = find(`${STACKED} [data-part='${part}']${FOCUS}${SELF}`);
      expect(declaration(stacked!.body, "outline")).toBe(outline);
      const [menubar] = find(`${MENUBAR} [data-part='${part}']${FOCUS}${SELF}`);
      expect(declaration(menubar!.body, "outline")).toBe(outline);
      expect(declaration(menubar!.body, "outline-offset")).toMatch(inside);
      const [overlay] = find(`${MENUBAR} [data-part='${part}']${FOCUS}${SELF}::after`);
      expect(declaration(overlay!.body, "box-shadow")).toBe("none");
    }
    for (const mode of [STACKED, MENUBAR]) {
      const selected = find(`${mode} [data-part='item'][data-selected='true']${FOCUS}${SELF}`);
      expect(selected.some((rule) => declaration(rule.body, "outline-color") === "HighlightText"), mode).toBe(true);
    }
    const [stackedSelected] = find(`${STACKED} [data-part='item'][data-selected='true']${FOCUS}${SELF}`);
    expect(declaration(stackedSelected!.body, "outline-offset")).toMatch(inside);
  });
});
