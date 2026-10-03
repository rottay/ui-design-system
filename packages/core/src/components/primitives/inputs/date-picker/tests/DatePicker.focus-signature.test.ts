/**
 * The DatePicker focus indicator, read from the skin: the tenant focus signature on
 * the trigger inputs and the calendar controls, validation status on the border only,
 * a system-colour outline in forced colors, and one painter per focused node.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css");
const read = (path: string) =>
  readFileSync(resolve(CSS_ROOT, path), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const SKIN = read("runtime/engines/modern/skin/date-picker/index.css");
const PERSONALITY = read("runtime/personality/index.css");

/** Every node that paints focus, with the family channel it wears. */
const PAINTERS: Readonly<Record<string, readonly string[]>> = {
  "trigger-input": ["--ds-date-picker-shadow-focus"],
  "nav-button": ["--ds-date-picker-shadow-focus"],
  "cell": ["--ds-date-picker-shadow-focus"],
  "today-button": ["--ds-date-picker-shadow-focus"],
  "time-select": ["--ds-date-picker-shadow-focus"],
};

/** The gated status rings: part, status, channel. Empty when status stays on the border alone. */
const STATUS_RINGS: Readonly<Record<string, Readonly<Record<string, string>>>> = {};

/** Nodes a scroller clips: their forced-colors outline stays inside their own box. */
const CLIPPED: ReadonlySet<string> = new Set([]);

/** Wrappers and inner controls that sit around a painter and must paint nothing themselves. */
const SILENT: readonly string[] = ["root"];

const FOCUS = /\[data-part='([a-z-]+)'\](?:\[[^\]]+\])*(?::not\([^)]*\))*(?::is\(\[data-state~='(?:focus-visible|focused)'\], :focus(?:-visible)?\)|:focus-within)/;
const STATUS = /\[data-(?:status|invalid|error|warning|success)='(error|warning|success|true)'\]/;

interface Rule {
  readonly selector: string;
  readonly body: string;
}

interface FocusPaint {
  readonly selector: string;
  readonly part: string;
  readonly status: string | undefined;
  readonly body: string;
}

/** Every innermost rule of `css`, with its selector list on one line. */
function rules(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1]!.replace(/\s+/g, " ").trim(),
    body: match[2]!.replace(/\s+/g, " "),
  }));
}

/** Every `@media (forced-colors: active)` block of `css`. */
function forcedColors(css: string): string[] {
  const blocks: string[] = [];
  const marker = "@media (forced-colors: active)";
  for (let at = css.indexOf(marker); at !== -1; at = css.indexOf(marker, at + 1)) {
    let end = css.indexOf("{", at) + 1;
    for (let depth = 1; depth > 0 && end < css.length; end += 1) {
      if (css[end] === "{") depth += 1;
      else if (css[end] === "}") depth -= 1;
    }
    blocks.push(css.slice(at, end));
  }
  return blocks;
}

/** The selectors of `css` that address a focused node, one entry per selector. */
function focusSelectors(css: string): FocusPaint[] {
  const found: FocusPaint[] = [];
  for (const rule of rules(css)) {
    // A keyframe step is a transient cue, not the focused rest.
    if (/^(?:\d|from|to)/.test(rule.selector)) continue;
    for (const selector of rule.selector.split(/,\s*(?![^()]*\))/)) {
      const match = FOCUS.exec(selector);
      if (!match) continue;
      found.push({ selector, part: match[1]!, status: STATUS.exec(selector)?.[1], body: rule.body });
    }
  }
  return found;
}

const FORCED_BLOCKS = forcedColors(SKIN);
const FORCED = FORCED_BLOCKS.join("\n");
const OUTSIDE = FORCED_BLOCKS.reduce((css, block) => css.replace(block, ""), SKIN);
const shadowOf = (body: string) => /box-shadow:\s*([^;]+);/.exec(body)?.[1]?.trim();

describe("DatePicker focus signature (skin contract)", () => {
  it("wears the family's signature channel on every focused node, never a halo, a fixed recipe or a solid outline", () => {
    const painting = focusSelectors(OUTSIDE).filter((paint) => paint.status === undefined && shadowOf(paint.body));
    expect(new Set(painting.map((paint) => paint.part))).toEqual(new Set(Object.keys(PAINTERS)));
    for (const paint of painting) {
      const allowed = PAINTERS[paint.part]!.map((channel) => `var(${channel}, var(--ds-focus-ring))`);
      // The signature leads the list, so a resting or selection shadow never hides it.
      expect(allowed.some((ring) => shadowOf(paint.body)!.startsWith(ring)), paint.selector).toBe(true);
    }
    // The halos the frozen engines read and the foundation literal are one fixed shape under every signature.
    expect(SKIN).not.toMatch(/--ds-(?:input-(?:(?:error|warning|success)-)?|select-(?:error|warning|success)-)shadow-focus/);
    expect(SKIN).not.toContain("--ds-shadow-focus-ring");
    expect(OUTSIDE).not.toMatch(/outline:\s*var\(--ds-focus-ring-width\)\s+solid\s+(?!transparent)/);
    expect(OUTSIDE).not.toMatch(/outline:\s*[0-9.]+px\s+solid/);
  });

  it("keeps validation status on the border: a focused status frame paints only a gated ring", () => {
    const arms = focusSelectors(OUTSIDE).filter((paint) => paint.status !== undefined && shadowOf(paint.body));
    const expected = Object.entries(STATUS_RINGS).flatMap(([part, byStatus]) =>
      Object.entries(byStatus).map(([status, channel]) => `${part} ${status} var(${channel}, var(--ds-focus-ring))`)
    );
    expect(arms.map((arm) => `${arm.part} ${arm.status} ${shadowOf(arm.body)}`).sort()).toEqual(expected.sort());
  });

  it("keeps a visible system-colour outline on every focused node in forced colors", () => {
    const forced = focusSelectors(FORCED);
    for (const part of Object.keys(PAINTERS)) {
      const arms = forced.filter((arm) => arm.part === part && /outline:/.test(arm.body));
      expect(arms.length, part).toBeGreaterThan(0);
      for (const arm of arms) {
        expect(arm.body, arm.selector).toMatch(/outline:\s*max\(2px, var\(--ds-focus-ring-width\)\) solid Highlight;/);
        expect(arm.body, arm.selector).toMatch(
          CLIPPED.has(part)
            ? /outline-offset:\s*calc\(-1 \* max\(2px, var\(--ds-focus-ring-width\)\)\);/
            : /outline-offset:\s*var\(--ds-focus-ring-offset\);/
        );
      }
    }
    // Every part the skin paints on focus has an arm: none is left to a dropped shadow.
    const painted = new Set(focusSelectors(OUTSIDE).filter((paint) => shadowOf(paint.body)).map((paint) => paint.part));
    const armed = new Set(forced.filter((arm) => /outline:/.test(arm.body)).map((arm) => arm.part));
    expect([...painted].filter((part) => !armed.has(part))).toEqual([]);
  });

  it("has one painter per focused node: no wrapper or inner control paints beside it", () => {
    for (const part of SILENT) {
      const around = rules(SKIN).filter(
        (rule) =>
          new RegExp(`\\[data-part='${part}'\\][^ ,]*(?::focus|:is\\(\\[data-state~='focus)`).test(rule.selector) &&
          /(?:box-shadow|outline):\s*(?!none|0)/.test(rule.body)
      );
      expect(around.map((rule) => rule.selector), part).toEqual([]);
    }
    for (const paint of focusSelectors(OUTSIDE)) {
      expect(Object.keys(PAINTERS), paint.selector).toContain(paint.part);
    }
  });

  it("is left alone by the raw-input rule, which skips every node the design system stamps", () => {
    const raw = rules(PERSONALITY).filter(
      (rule) => /^input:focus-visible:not\(/.test(rule.selector) && /var\(--ds-focus-ring\)/.test(rule.body)
    );
    expect(raw).toHaveLength(1);
    expect(raw[0]!.selector).toContain("[data-part]");
    expect(PERSONALITY).not.toMatch(/(?:^|,)\s*input:focus-visible\s*\{/m);
  });
});
