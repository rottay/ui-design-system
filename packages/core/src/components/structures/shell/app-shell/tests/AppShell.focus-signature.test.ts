/**
 * The AppShell focus indicator, read from the skin: every focusable node wears
 * the tenant focus signature, never a solid outline, and keeps a system-colour
 * outline in forced colors.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/app-shell/index.css"),
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
  { name: "skip link", selector: /\[data-part="skip-link"\]/, carrier: false },
  { name: "navigation trigger", selector: /\[data-part="navigation-trigger"\]/, carrier: false },
  { name: "navigation close", selector: /\[data-part="navigation-close"\]/, carrier: true },
  { name: "content landmark", selector: /\[data-part="content"\]/, carrier: true },
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

const { forced, rest } = splitForcedColors(SKIN);
const FOCUS = /focus-visible/;
const PAINTED_OUTLINE = /outline(?:-color)?:[^;]*(?:solid|dashed|dotted|double)\s+(?!\s|transparent\b)/;

describe("AppShell focus signature (skin contract)", () => {
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
          expect(rule.body, node.name).toMatch(/position:\s*(?:absolute|fixed);/);
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

  it("pins the content landmark's overlay to the visible content area without positioning the landmark", () => {
    const CONTENT = /\[data-part="content"\]/;
    const focused = rules(rest).filter((rule) => FOCUS.test(rule.selector) && CONTENT.test(rule.selector));
    const landmark = focused.filter((rule) => !/::after/.test(rule.selector));
    const overlay = focused.filter((rule) => /::after/.test(rule.selector));
    expect(landmark).toHaveLength(1);
    expect(overlay).toHaveLength(1);
    // A positioned landmark would re-anchor absolutely positioned page content while it holds focus.
    expect(landmark[0]!.body).not.toMatch(/position:/);
    const body = overlay[0]!.body.replace(/\s+/g, " ");
    expect(body).toContain("position: fixed;");
    expect(body).toContain("var(--ds-shell-top-inset)");
    expect(body).toContain("var(--ds-shell-main-padding-block-end, var(--ds-shell-bottom-inset))");
    expect(body).toContain("var(--ds-shell-inline-start-inset)");
  });

  it("composes the skip-link signature with its lift only where the lift is not `none`", () => {
    expect(SKIN).toContain(
      "@container not (style(--ds-app-shell-skip-link-shadow: none) or style(--ds-elevation-2: none))"
    );
    const composed = rules(rest).filter((rule) =>
      /box-shadow:\s*var\(--ds-focus-ring\),\s*var\(--ds-app-shell-skip-link-shadow/.test(rule.body)
    );
    expect(composed).toHaveLength(1);
    expect(composed[0]!.selector).toContain('[data-part="skip-link"]');
  });
});
