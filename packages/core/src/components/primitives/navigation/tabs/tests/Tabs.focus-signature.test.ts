/**
 * The Tabs focus indicator, read from the skin: every tab, selected or not,
 * wears the tenant focus signature on an overlay the list cannot clip, the
 * selected paint stays on the tab beneath it, and forced colors keep a
 * system-colour outline.
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
});
