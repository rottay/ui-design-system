/**
 * The Tabs focus indicator, read from the skin: every tab, selected or not,
 * wears the tenant focus signature on an overlay the list cannot clip, the
 * selected paint stays on the tab beneath it, and forced colors keep a
 * system-colour outline. The panel wears it on an inset overlay and the
 * overflow controls compose it with their own elevation, each only while it
 * holds focus itself.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css"),
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

interface ScopedRule extends Rule {
  readonly conditions: readonly string[];
}

/** Every innermost rule of `css` with the at-rule preludes that enclose it, outermost first. */
function scopedRules(css: string): ScopedRule[] {
  const found: ScopedRule[] = [];
  const stack: string[] = [];
  let start = 0;
  for (let at = 0; at < css.length; at += 1) {
    if (css[at] === "{") {
      stack.push(css.slice(start, at).replace(/\s+/g, " ").trim());
      start = at + 1;
    } else if (css[at] === "}") {
      const prelude = stack.pop() ?? "";
      const body = css.slice(start, at);
      if (!prelude.startsWith("@") && !body.includes("{")) {
        for (const selector of prelude.split(/,(?![^(]*\))/)) {
          found.push({ selector: selector.trim(), body, conditions: stack.filter((entry) => entry.startsWith("@")) });
        }
      }
      start = at + 1;
    }
  }
  return found;
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

const SIGNATURE = "var(--ds-tabs-focus-ring, var(--ds-focus-ring))";
const WIDTH = "var(--ds-tabs-focus-ring-width, var(--ds-focus-ring-width))";
const TAB = "[data-part='tab-button']";

const PANEL = "[data-part='tab-panel']";
const PANEL_SIGNATURE = "var(--ds-tabs-panel-focus-ring, var(--ds-focus-ring))";
const CONTROLS = ":is([data-part='overflow-previous'], [data-part='overflow-next'], [data-part='overflow-more'])";
const HOVER = ":is([data-state~='hovered'], :hover)";
const FORCED = "@media (forced-colors: active)";
const not = (channel: string): string => `@container not style(${channel}: none)`;

const scopedFocusRules = (part: string): ScopedRule[] =>
  scopedRules(SKIN).filter((rule) => rule.selector.includes(part) && rule.selector.includes(FOCUS));

const focusRules = (css: string): Rule[] =>
  rules(css).filter((rule) => rule.selector.includes(TAB) && rule.selector.includes(FOCUS));

describe("tabs focus signature", () => {
  it("paints the signature on an overlay of the focused tab, in every variant", () => {
    const overlay = focusRules(rest).filter((rule) => rule.selector.endsWith("::before"));
    const base = overlay.find((rule) => !rule.selector.includes("data-variant"));
    expect(base).toBeDefined();
    expect(declaration(base!.body, "box-shadow")).toBe(SIGNATURE);
    expect(declaration(base!.body, "inset")).toBe(`calc(var(--ds-focus-ring-offset) + ${WIDTH})`);
    expect(declaration(base!.body, "position")).toBe("absolute");
    expect(declaration(base!.body, "pointer-events")).toBe("none");
    expect(declaration(base!.body, "content")).toBe("''");
    for (const rule of overlay) {
      expect(rule.selector).toContain(`${TAB}${FOCUS}${SELF}::before`);
      expect(rule.selector).not.toContain("data-selected");
      expect(declaration(rule.body, "box-shadow") ?? SIGNATURE).toBe(SIGNATURE);
    }
  });

  it("leaves the tab's own shadow to the selected rule while focused", () => {
    const hosts = focusRules(rest).filter((rule) => !rule.selector.endsWith("::before"));
    expect(hosts.length).toBeGreaterThan(0);
    for (const rule of hosts) {
      expect(declaration(rule.body, "box-shadow")).toBeUndefined();
    }
  });

  it("never draws a solid outline in place of the signature", () => {
    for (const rule of focusRules(rest)) {
      const outline = declaration(rule.body, "outline");
      if (outline !== undefined) expect(outline).toBe(`${WIDTH} solid transparent`);
      expect(declaration(rule.body, "outline-color")).toBeUndefined();
    }
  });

  it("keeps a system-colour outline inside the tab in forced colors", () => {
    const hosts = focusRules(forced).filter((rule) => !rule.selector.endsWith("::before"));
    const host = hosts.find((rule) => rule.selector.endsWith(`${TAB}${FOCUS}${SELF}`));
    expect(host).toBeDefined();
    expect(declaration(host!.body, "outline")).toBe(`max(2px, ${WIDTH}) solid Highlight`);
    expect(declaration(host!.body, "outline-offset")).toMatch(/^calc\(-1 \* max\(2px, /);

    const overlay = focusRules(forced).filter((rule) => rule.selector.endsWith("::before"));
    const plain = overlay.find((rule) => !rule.selector.includes("data-selected"));
    const selected = overlay.find((rule) => rule.selector.includes("[data-selected='true']"));
    expect(declaration(plain!.body, "box-shadow")).toBe("none");
    expect(declaration(selected!.body, "box-shadow")).toBe(`inset 0 0 0 max(2px, ${WIDTH}) HighlightText`);
  });

  it("paints the panel signature on an inset overlay, only while the panel itself holds focus", () => {
    const panel = scopedFocusRules(PANEL);
    expect(panel.length).toBeGreaterThan(0);
    for (const rule of panel) expect(rule.selector).toContain(`${PANEL}${FOCUS}${SELF}`);

    const overlay = panel.filter((rule) => rule.conditions.length === 0);
    for (const rule of overlay) expect(rule.selector.endsWith(`${PANEL}${FOCUS}${SELF}::after`)).toBe(true);
    const base = overlay.find((rule) => !rule.selector.includes("data-panel-variant"));
    expect(declaration(base!.body, "box-shadow")).toBe(PANEL_SIGNATURE);
    expect(declaration(base!.body, "inset")).toBe(`calc(var(--ds-focus-ring-offset) + ${WIDTH})`);
    expect(declaration(base!.body, "position")).toBe("absolute");
    expect(declaration(base!.body, "pointer-events")).toBe("none");
    expect(declaration(base!.body, "content")).toBe("''");

    const contained = overlay.find((rule) => rule.selector.includes("[data-panel-variant='contained']"));
    expect(declaration(contained!.body, "border-radius")).toBe(
      `max(0px, calc(var(--ds-tabs-panel-radius, var(--ds-radius-lg)) - var(--ds-edge-standard-width) - var(--ds-focus-ring-offset) - ${WIDTH}))`
    );
  });

  it("anchors the overlay to the panel and leaves the panel's own shadow to its elevation", () => {
    const rest = scopedRules(SKIN).filter((rule) => rule.selector.endsWith(PANEL));
    const base = rest.find((rule) => rule.conditions.length === 0 && !rule.selector.includes("data-panel-variant"));
    expect(declaration(base!.body, "position")).toBe("relative");

    const hosts = scopedFocusRules(PANEL).filter((rule) => !rule.selector.endsWith("::after"));
    for (const rule of hosts) {
      expect(rule.conditions).toContain(FORCED);
      expect(declaration(rule.body, "box-shadow")).toBeUndefined();
    }
  });

  it("keeps a system-colour outline inside the focused panel in forced colors", () => {
    const panel = scopedFocusRules(PANEL).filter((rule) => rule.conditions.includes(FORCED));
    const plain = panel.find((rule) => rule.selector.endsWith(`${SELF}`) && !rule.selector.includes("data-panel-variant"));
    const contained = panel.find((rule) => rule.selector.includes("[data-panel-variant='contained']"));
    expect(declaration(plain!.body, "outline")).toBe(`max(2px, ${WIDTH}) solid Highlight`);
    expect(declaration(plain!.body, "outline-offset")).toBe(`calc(-1 * max(2px, ${WIDTH}))`);
    expect(declaration(contained!.body, "outline-offset")).toBe(
      `calc(-1 * max(2px, ${WIDTH}) - var(--ds-edge-standard-width))`
    );
    const overlay = panel.find((rule) => rule.selector.endsWith("::after"));
    expect(declaration(overlay!.body, "box-shadow")).toBe("none");
  });

  it("composes the overflow controls' elevation under the signature at rest and on hover", () => {
    const controls = scopedFocusRules(CONTROLS).filter((rule) => !rule.conditions.includes(FORCED));
    for (const rule of controls) expect(rule.selector.endsWith(`${FOCUS}${SELF}`)).toBe(true);

    const base = controls.filter((rule) => rule.conditions.length === 0);
    expect(base).toHaveLength(1);
    expect(declaration(base[0]!.body, "box-shadow")).toBe(SIGNATURE);

    const rest = controls.filter((rule) => rule.conditions.length > 0 && !rule.selector.includes(HOVER));
    expect(rest).toHaveLength(1);
    expect(rest[0]!.conditions).toEqual([not("--ds-tabs-overflow-control-shadow"), not("--ds-elevation-1")]);
    expect(declaration(rest[0]!.body, "box-shadow")).toBe(
      `${SIGNATURE}, var(--ds-tabs-overflow-control-shadow, var(--ds-elevation-1))`
    );

    const hovered = controls.filter((rule) => rule.selector.includes(HOVER));
    expect(hovered).toHaveLength(1);
    expect(hovered[0]!.conditions).toEqual([
      "@media (hover: hover)",
      not("--ds-tabs-overflow-control-shadow-hover"),
      not("--ds-elevation-2"),
    ]);
    expect(declaration(hovered[0]!.body, "box-shadow")).toBe(
      `${SIGNATURE}, var(--ds-tabs-overflow-control-shadow-hover, var(--ds-elevation-2))`
    );
  });

  it("floors the overflow controls' forced-colors outline at 2px", () => {
    const controls = scopedFocusRules(CONTROLS).filter((rule) => rule.conditions.includes(FORCED));
    expect(controls).toHaveLength(1);
    expect(controls[0]!.selector.endsWith(`${CONTROLS}${FOCUS}${SELF}`)).toBe(true);
    expect(declaration(controls[0]!.body, "outline")).toBe(`max(2px, ${WIDTH}) solid Highlight`);
  });
});
