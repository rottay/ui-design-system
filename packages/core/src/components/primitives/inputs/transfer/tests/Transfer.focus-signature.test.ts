/**
 * The Transfer focus indicator, read from the skin: the tenant focus signature on
 * the shell, a system-colour outline in forced colors, and one painter only.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css");
const read = (path: string) =>
  readFileSync(resolve(CSS_ROOT, path), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const SKIN = ["runtime/engines/modern/skin/transfer/index.css"].map(read).join("\n");
const PERSONALITY = read("runtime/personality/index.css");

const SHELLS = [
  /\.ds-transfer\.ds-transfer--modern \[data-part='panel-search'\]:is\(\[data-state~='focused'\], :focus\)/,
];

interface Rule {
  readonly selector: string;
  readonly body: string;
}

/** Every innermost rule of `css`, with its selector list on one line. */
function rules(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1]!.replace(/\s+/g, " ").trim(),
    body: match[2]!,
  }));
}

/** The text of every `@media (forced-colors: active)` block. */
function forcedColors(css: string): string {
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
  return blocks.join("\n");
}

describe("Transfer focus signature (skin contract)", () => {
  it("wears the signature channel on the focused shell, never a status halo or a solid outline", () => {
    expect(SKIN).toContain("var(--ds-transfer-search-shadow-focus, var(--ds-focus-ring))");
    // The halos the frozen engines read never paint a Modern field directly.
    for (const rule of rules(SKIN)) {
      // A keyframe step is a transient cue, not the focused rest.
      if (/^(?:\d|from|to)/.test(rule.selector)) continue;
      expect(rule.body, rule.selector).not.toMatch(
        /box-shadow:[^;]*--ds-input-(?:(?:error|warning|success)-)?shadow-focus/
      );
    }
    expect(SKIN).not.toContain("--ds-shadow-focus-ring");
  });

  it("keeps a visible system-colour outline on every focused shell in forced colors", () => {
    const forced = rules(forcedColors(SKIN));
    for (const shell of SHELLS) {
      const arm = forced.find((rule) => shell.test(rule.selector));
      expect(arm, String(shell)).toBeDefined();
      expect(arm!.body).toMatch(/outline:\s*max\(2px, var\(--ds-focus-ring-width\)\) solid Highlight;/);
      expect(arm!.body).toMatch(/outline-offset:\s*var\(--ds-focus-ring-offset\);/);
    }
  });

  it("paints one focus shadow on the native control, which is its own shell", () => {
    const CONTROL = /\[data-part='panel-search'\]:is\(/;
    const painting = rules(SKIN.slice(0, SKIN.indexOf("@media (forced-colors: active)"))).filter(
      (rule) =>
        CONTROL.test(rule.selector) &&
        /box-shadow:/.test(rule.body) &&
        !/\[data-(?:status|error)=/.test(rule.selector)
    );
    expect(painting.map((rule) => /box-shadow:\s*([^;]+);/.exec(rule.body)?.[1]?.trim())).toEqual([
      "var(--ds-transfer-search-shadow-focus, var(--ds-focus-ring))",
    ]);
  });

  it("is left alone by the raw-input rule, which skips every node the design system stamps", () => {
    const raw = rules(PERSONALITY).filter(
      (rule) => /^input:focus-visible:not\(/.test(rule.selector) && /var\(--ds-focus-ring\)/.test(rule.body)
    );
    expect(raw).toHaveLength(1);
    expect(raw[0]!.selector).toContain("[class^='ds-']");
    expect(raw[0]!.selector).toContain("[class*=' ds-']");
    // A substring test would also skip an application class such as `cards-grid-search`.
    expect(PERSONALITY).not.toContain("[class*='ds-']");
    expect(raw[0]!.selector).toContain("[data-part]");
    expect(PERSONALITY).not.toMatch(/(?:^|,)\s*input:focus-visible\s*\{/m);
  });
});
