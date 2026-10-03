/**
 * The PasswordInput focus indicator, read from the skin: the tenant focus signature on
 * the shell, a system-colour outline in forced colors, and one painter only.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css");
const read = (path: string) =>
  readFileSync(resolve(CSS_ROOT, path), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const SKIN = ["runtime/engines/modern/skin/password-input/index.css"].map(read).join("\n");
const PERSONALITY = read("runtime/personality/index.css");

const SHELLS = [
  /\.ds-password-input\.ds-password-input--modern\[data-part='root'\]\[data-state~='focused'\]/,
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

describe("PasswordInput focus signature (skin contract)", () => {
  it("wears the signature channel on the focused shell, never a status halo or a solid outline", () => {
    expect(SKIN).toContain("var(--ds-input-focus-ring, var(--ds-focus-ring))");
    // The halos the frozen engines read never paint a Modern field directly.
    for (const rule of rules(SKIN)) {
      // A keyframe step is a transient cue, not the focused rest.
      if (/^(?:\d|from|to)/.test(rule.selector)) continue;
      expect(rule.body, rule.selector).not.toMatch(
        /box-shadow:[^;]*--ds-input-(?:(?:error|warning|success)-)?shadow-focus/
      );
    }
    expect(SKIN).not.toContain("--ds-shadow-focus-ring");
    const outside = SKIN.slice(0, SKIN.indexOf("@media (forced-colors: active)"));
    expect(outside).not.toMatch(/outline:\s*var\(--ds-focus-ring-width\)\s+solid\s+(?!transparent)/);
  });

  it("status arm reads the gated family channel, which rests on the signature until a theme authors a status ring", () => {
    for (const channel of ["--ds-input-focus-ring-error"]) {
      const arms = rules(SKIN).filter((rule) => rule.body.includes(`box-shadow: var(${channel}, var(--ds-focus-ring));`));
      expect(arms.length, channel).toBeGreaterThan(0);
      expect(arms.every((rule) => /focus/.test(rule.selector)), channel).toBe(true);
    }
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

  it("never paints a second focus shadow on the inner native control", () => {
    const INNER = /> \[data-part='control'\]/;
    const inner = rules(SKIN).filter((rule) => INNER.test(rule.selector));
    expect(inner.length).toBeGreaterThan(0);
    for (const rule of inner) {
      const shadow = /box-shadow:\s*([^;]+);/.exec(rule.body)?.[1];
      // An autofill inset is a surface, not a focus indicator.
      if (shadow !== undefined && !/1000px/.test(shadow)) expect(shadow.trim(), rule.selector).toBe("none");
      expect(rule.body, rule.selector).not.toMatch(/focus-ring|shadow-focus/);
    }
    expect(inner.some((rule) => /outline:\s*(?:0|none)\s*;/.test(rule.body))).toBe(true);
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
