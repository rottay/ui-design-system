/**
 * `EngineTokenOverrides` types one baseline per shipped engine, and the engine
 * adapter is its only owner: no lookup table, no runtime re-export, no second
 * answer to "what does this engine look like before a theme touches it".
 */

import { describe, expect, it } from "vitest";

import { resolveAdapter } from "@/infrastructure/compilers/runtime/theme/presentation/adapters";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import type { EngineTokenOverrides } from "..";

const SHIPPED: readonly EngineName[] = ["classic", "modern", "rustic"];

describe("every shipped engine authors exactly one baseline", () => {
  for (const engine of SHIPPED) {
    it(`${engine} types as EngineTokenOverrides`, () => {
      const tokens: EngineTokenOverrides = resolveAdapter(engine).tokenBaseline;
      expect(typeof tokens.densityScale).toBe("number");
      expect(typeof tokens.borderRadius.md).toBe("string");
      expect(typeof tokens.shadows.md).toBe("string");
      expect(tokens.surface).toBeTypeOf("object");
      expect(tokens.motion).toBeTypeOf("object");
    });
  }

  it("keeps the declared surface vocabulary the posture matrix reads", () => {
    expect(resolveAdapter("classic").tokenBaseline.surface.useGradients).toBe(false);
    expect(resolveAdapter("classic").tokenBaseline.surface.useGlass).toBe(false);
    expect(resolveAdapter("rustic").tokenBaseline.surface.useGradients).toBe(false);
    expect(resolveAdapter("rustic").tokenBaseline.surface.useGlass).toBe(false);
    expect(resolveAdapter("modern").tokenBaseline.surface.useGradients).toBe(true);
    expect(resolveAdapter("modern").tokenBaseline.surface.useGlass).toBe(true);
  });
});

describe("there is no second table to disagree with the adapters", () => {
  it("refuses an engine with no adapter instead of handing back a row", () => {
    expect(() => resolveAdapter("custom")).toThrow(/no theme adapter for engine "custom"/);
  });

  it("publishes no engine-keyed token lookup from the theming runtime", async () => {
    const tokens = (await import(
      "@/infrastructure/runtime/theming/composition/react/tokens"
    )) as Record<string, unknown>;
    expect(Object.keys(tokens)).not.toContain("ENGINE_TOKENS");
    expect(Object.keys(tokens)).not.toContain("getEngineTokens");
  });
});
