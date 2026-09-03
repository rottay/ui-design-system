/**
 * The `EngineTokenOverrides` type declared in `foundation/contracts` and the
 * three token rows that stayed in the runtime owner must still meet.
 */

import { describe, expect, it } from "vitest";

import {
  ENGINE_TOKENS,
  getEngineTokens,
} from "@/infrastructure/runtime/theming/foundation/engine-tokens";
import type { EngineTokenOverrides as RelocatedFromRuntime } from "@/infrastructure/runtime/theming/foundation/engine-tokens";
import type { EngineTokenOverrides } from "..";

describe("EngineTokenOverrides after the relocation", () => {
  it("still types every shipped engine's token row", () => {
    for (const engine of ["classic", "modern", "rustic"] as const) {
      const tokens: EngineTokenOverrides = getEngineTokens(engine);
      expect(typeof tokens.densityScale).toBe("number");
      expect(typeof tokens.borderRadius.md).toBe("string");
      expect(typeof tokens.shadows.md).toBe("string");
      expect(tokens.surface).toBeTypeOf("object");
      expect(tokens.motion).toBeTypeOf("object");
    }
  });

  it("keeps the old specifier valid: the runtime owner re-exports the name", () => {
    const viaRuntime: RelocatedFromRuntime = getEngineTokens("modern");
    const viaContract: EngineTokenOverrides = viaRuntime;
    expect(viaContract).toBe(viaRuntime);
  });

  it("leaves the three token rows where they were", () => {
    expect(Object.keys(ENGINE_TOKENS).sort()).toEqual([
      "classic",
      "modern",
      "rustic",
    ]);
  });

  it("preserves the declared engine surface law the posture matrix reads", () => {
    expect(getEngineTokens("classic").surface.useGradients).toBe(false);
    expect(getEngineTokens("classic").surface.useGlass).toBe(false);
    expect(getEngineTokens("rustic").surface.useGradients).toBe(false);
    expect(getEngineTokens("rustic").surface.useGlass).toBe(false);
    expect(getEngineTokens("modern").surface.useGradients).toBe(true);
    expect(getEngineTokens("modern").surface.useGlass).toBe(true);
  });
});
