import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const skin = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css"
  ),
  "utf8"
);

describe("DecisionComparison Pass 2 craft contract", () => {
  it("keeps material, geometry, hierarchy and motion externally themeable", () => {
    for (const channel of [
      "--ds-decision-comparison-radius",
      "--ds-decision-comparison-border",
      "--ds-decision-comparison-bg",
      "--ds-decision-comparison-shadow",
      "--ds-decision-comparison-toolbar-bg",
      "--ds-decision-comparison-verdict-bg",
      "--ds-decision-comparison-subject-bg",
      "--ds-decision-comparison-visual-grid-color",
      "--ds-decision-comparison-footer-bg",
      "--ds-decision-comparison-insight-bg",
      "--ds-decision-comparison-motion-duration",
      "--ds-decision-comparison-motion-easing",
      "--ds-decision-comparison-body-font-size",
      "--ds-decision-comparison-detail-font-size",
      "--ds-decision-comparison-title-font-size",
    ]) {
      expect(skin).toContain(channel);
    }
  });

  it("contains continuous container adaptation, RTL and accessible motion exits", () => {
    expect(skin).toContain("container-name: ds-decision-comparison");
    expect(skin).toContain("@container ds-decision-comparison (max-width: 62rem)");
    expect(skin).toContain("@container ds-decision-comparison (max-width: 47.9375rem)");
    expect(skin).toContain("@container ds-decision-comparison (max-width: 30rem)");
    expect(skin).toContain(":dir(rtl)");
    expect(skin).toContain("scroll-snap-stop: always");
    expect(skin).toContain("overflow-wrap: anywhere");
    expect(skin).toContain("text-overflow: clip");
    expect(skin).toContain(".ds-decision-comparison__fact:nth-child(even)");
    expect(skin).toContain("@media (prefers-reduced-motion: reduce)");
    expect(skin).toContain("animation: none");
    expect(skin).toContain("transition: none");
    expect(skin).toContain("@media (forced-colors: active)");
    expect(skin).toContain("outline: 2px solid Highlight");
  });

  it("wears the tenant focus signature on the root while the scrollport holds keyboard focus", () => {
    const condition =
      String.raw`\.ds-pattern-decision-comparison\.ds-engine-modern\[data-part="root"\]:has\(\s*>\s*\.ds-decision-comparison__viewport:focus-visible\s*\)`;
    const bodies = (selector: string): string[] =>
      [...skin.matchAll(new RegExp(`${selector}\\s*\\{([^}]*)\\}`, "g"))].map(
        (match) => match[1] ?? ""
      );
    const declaration = (body: string, property: string): string | undefined =>
      body.match(new RegExp(`(?:^|[;\\s])${property}:\\s*([^;]+);`))?.[1].trim();

    const [root, forcedRoot, ...extraRoot] = bodies(condition);
    const [overlay, forcedOverlay, ...extraOverlay] = bodies(`${condition}::after`);
    expect(extraRoot).toEqual([]);
    expect(extraOverlay).toEqual([]);

    expect(declaration(root ?? "", "box-shadow")).toBe(
      "var(--ds-focus-ring), var(--ds-decision-comparison-shadow)"
    );
    expect(declaration(root ?? "", "outline")).toBe(
      "var(--ds-focus-ring-width) solid transparent"
    );
    expect(declaration(root ?? "", "outline-offset")).toBe("var(--ds-focus-ring-offset)");

    expect(declaration(overlay ?? "", "box-shadow")).toBe("var(--ds-focus-ring)");
    expect(declaration(overlay ?? "", "content")).toBe('""');
    expect(declaration(overlay ?? "", "position")).toBe("absolute");
    expect(declaration(overlay ?? "", "inset")).toBe("0");
    expect(declaration(overlay ?? "", "pointer-events")).toBe("none");
    expect(overlay).not.toContain("border-radius");

    expect(declaration(forcedRoot ?? "", "outline")).toBe(
      "var(--ds-focus-ring-width) solid Highlight"
    );
    expect(declaration(forcedRoot ?? "", "box-shadow")).toBe("none");
    expect(declaration(forcedOverlay ?? "", "box-shadow")).toBe("none");
    const forcedColors = skin.slice(skin.lastIndexOf("@media (forced-colors: active)"));
    expect(forcedColors).toContain(forcedRoot);
    expect(forcedColors).toContain(forcedOverlay);

    const viewport = bodies(
      String.raw`\.ds-pattern-decision-comparison\.ds-engine-modern\s+\.ds-decision-comparison__viewport:focus-visible`
    );
    expect(viewport).toHaveLength(1);
    expect(viewport[0]?.trim()).toBe("outline: none;");

    const focusRules = [...skin.matchAll(/([^{}]*)\{([^{}]*)\}/g)].filter(
      ([, , body]) => (body ?? "").includes("--ds-focus-ring")
    );
    expect(focusRules).toHaveLength(3);
    for (const [, selector, body] of focusRules) {
      expect(selector).toMatch(new RegExp(condition));
      expect(body).not.toMatch(
        /outline(?:-color)?:[^;]*(?:--ds-focus-ring-color|--ds-color-primary)/
      );
    }
    expect(skin).not.toMatch(/:has\([^)]*:focus-within/);
    expect(skin).not.toMatch(/__viewport:focus(?!-visible)/);
    expect(skin).not.toMatch(/__fact[^,{]*:focus/);
  });

  it("uses top emphasis for the leading subject and never a colored side rail", () => {
    expect(skin).toContain("box-shadow: inset 0 3px 0 var(--ds-color-primary)");
    expect(skin).not.toMatch(/border-left\s*:/);
    expect(skin).not.toMatch(/border-inline-start\s*:/);
    expect(skin).not.toMatch(
      /box-shadow:\s*inset\s+[+-]?(?:\d*\.)?\d+(?:px|rem)\s+0/
    );
  });
});
