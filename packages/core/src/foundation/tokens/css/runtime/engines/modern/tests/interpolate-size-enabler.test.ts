/**
 * Contract test for the modern-engine `interpolate-size` enabler (W6-E). The
 * declaration is a documented no-op until a future rule pairs it with a
 * `height: auto` transition -- see the comment above the block in
 * interpolate-size.css (its own sheet: theme.css is line-count-ratcheted by
 * engine-token-audit, so engine-level platform declarations live beside it).
 * This test fails if the enabler regresses onto `:root` (leaking into the
 * classic/rustic engines), loses its `@supports` guard, is duplicated or
 * dropped, or its sheet falls out of the shipped engine cascade (index.css).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const CSS_PATH = resolve(
  process.cwd(),
  "src/foundation/tokens/css/runtime/engines/modern/interpolate-size.css"
);
const ENGINE_INDEX_PATH = resolve(
  process.cwd(),
  "src/foundation/tokens/css/runtime/engines/index.css"
);

const css = readFileSync(CSS_PATH, "utf8");

describe("modern engine theme: interpolate-size enabler", () => {
  it("declares interpolate-size:allow-keywords behind @supports, scoped to [data-engine='modern']", () => {
    expect(css).toMatch(
      /@supports \(interpolate-size: allow-keywords\) \{\s*\[data-engine='modern'\] \{[^}]*interpolate-size:\s*allow-keywords;[^}]*\}\s*\}/
    );
  });

  it("does not declare the enabler on :root (classic/rustic engines must stay unaffected)", () => {
    expect(css).not.toMatch(/:root\s*\{[^}]*interpolate-size:\s*allow-keywords/);
  });

  it("is declared exactly once (no duplicate enabler)", () => {
    // The trailing `;` distinguishes the actual declaration from the
    // `@supports (interpolate-size: allow-keywords)` feature-query text,
    // which contains the same substring without one.
    const occurrences = css.split("interpolate-size: allow-keywords;").length - 1;
    expect(occurrences).toBe(1);
  });

  it("ships through the engine cascade (imported by runtime/engines/index.css)", () => {
    const engineIndex = readFileSync(ENGINE_INDEX_PATH, "utf8");
    expect(engineIndex).toContain("./modern/interpolate-size.css");
  });
});
