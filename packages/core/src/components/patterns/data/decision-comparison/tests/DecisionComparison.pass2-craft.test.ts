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

  it("rings the focused scrollport from the states dials and never the static fact rows", () => {
    const ring = skin.match(
      /\.ds-pattern-decision-comparison\.ds-engine-modern\s+\.ds-decision-comparison__viewport:focus-visible\s*\{([^}]*)\}/
    );
    expect(ring).not.toBeNull();
    const body = ring?.[1] ?? "";
    expect(body).toContain("var(--ds-focus-ring-width, 2px)");
    expect(body).toContain("var(--ds-focus-ring-color, var(--ds-color-primary))");
    expect(body).toContain("calc(var(--ds-focus-ring-offset, 2px) * -1)");
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
