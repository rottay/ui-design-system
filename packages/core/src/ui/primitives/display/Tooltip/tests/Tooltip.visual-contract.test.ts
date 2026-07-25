import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const modernSkin = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/runtime/engines/modern/skin/tooltip.css"
  ),
  "utf8"
);

describe("Tooltip modern visual contract", () => {
  it("keeps all four recipes token-owned and anatomically bounded", () => {
    for (const recipe of ["minimal", "inverse", "rich"] as const) {
      expect(modernSkin).toContain(`[data-recipe="${recipe}"]`);
    }
    expect(modernSkin).toContain("--ds-tooltip-bordered-background");
    expect(modernSkin).toContain("--ds-tooltip-minimal-background");
    expect(modernSkin).toContain("--ds-tooltip-inverse-background");
    expect(modernSkin).toContain("--ds-tooltip-rich-background");
    expect(modernSkin).not.toMatch(/#[\da-f]{3,8}\b/i);
  });

  it("uses calm directional motion with a complete reduced-motion exit", () => {
    expect(modernSkin).toContain("--ds-tooltip-enter-transition");
    expect(modernSkin).toContain("--ds-tooltip-exit-transition");
    expect(modernSkin).toContain("--ds-motion-ease-enter");
    expect(modernSkin).toContain("--ds-motion-ease-exit");

    const reducedMotion = modernSkin.slice(
      modernSkin.indexOf("@media (prefers-reduced-motion: reduce)")
    );
    expect(reducedMotion).toContain("transition: none");
    expect(reducedMotion).toContain("transform: none");
  });

  it("coordinates material texture, highlight, arrow and forced colors", () => {
    expect(modernSkin).toContain("--ds-tooltip-texture-current");
    expect(modernSkin).toContain("--ds-tooltip-highlight-current");
    expect(modernSkin).toContain("--ds-tooltip-arrow-safe-min-inline-size");
    expect(modernSkin).toContain(
      "background-image: var(--ds-tooltip-texture-current)"
    );
    expect(modernSkin).toContain("--ds-tooltip-arrow-anchor-offset");
    expect(modernSkin).toContain('[data-arrow-tracked="true"]');
    expect(modernSkin).toContain("inset-inline-start: clamp(");
    expect(modernSkin).toContain("@media (pointer: coarse)");
    expect(modernSkin).toContain("--ds-tooltip-touch-target");
    expect(modernSkin).toContain("@media (forced-colors: active)");
    expect(modernSkin).toContain("border-color: CanvasText");
  });

  it("keeps density, collision settle and product-level reduced motion token-owned", () => {
    for (const density of ["compact", "comfortable", "spacious"] as const) {
      expect(modernSkin).toContain(`[data-density="${density}"]`);
    }
    expect(modernSkin).toContain("--ds-tooltip-compact-padding-block");
    expect(modernSkin).toContain("--ds-tooltip-spacious-padding-inline");
    expect(modernSkin).toContain('[data-collision-adjusted="true"]');
    expect(modernSkin).toContain('--ds-tooltip-collision-shadow');
    expect(modernSkin).toContain('html[data-ds-motion="reduced"]');
  });

  it("never uses a colored side rail as state or decoration", () => {
    expect(modernSkin).not.toMatch(/border-(?:left|right):/);
    expect(modernSkin).not.toMatch(
      /box-shadow:\s*inset\s+[+-]?\d+(?:\.\d+)?(?:px|rem)\s+0/
    );
  });

  it("does not visually mutate the application-owned trigger when disabled", () => {
    const rootBlock = modernSkin.match(
      /\.rottay-tooltip-root[\s\S]*?\n\}/
    )?.[0];

    expect(rootBlock).toBeDefined();
    expect(rootBlock).not.toContain("opacity:");
    expect(rootBlock).not.toContain("cursor:");
  });
});
