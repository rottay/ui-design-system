/**
 * Every tint rung names its role's channel, which the base theme declares
 * unconditionally -- so the scale compiles whether or not a preset seeds it.
 */
import { describe, expect, it } from "vitest";

import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { FIRST_PARTY_BASELINES, lowerTheme } from "@tests/support/theme-lowering";

const STEPS = [4, 8, 12, 16, 24] as const;
const ROLES = [
  { scale: "--ds-tint", colorVar: "--ds-color-primary" },
  { scale: "--ds-tint-success", colorVar: "--ds-color-success" },
  { scale: "--ds-tint-warning", colorVar: "--ds-color-warning" },
  { scale: "--ds-tint-error", colorVar: "--ds-color-error" },
  { scale: "--ds-tint-info", colorVar: "--ds-color-info" },
] as const;

/** Every `var(--ds-tint-*)` the block reads, with the channels that read it. */
function tintReads(cssVariables: Record<string, string>): Map<string, string[]> {
  const reads = new Map<string, string[]>();
  for (const [channel, value] of Object.entries(cssVariables)) {
    for (const match of value.matchAll(/var\((--ds-tint-[a-z0-9-]+)/g)) {
      reads.set(match[1], [...(reads.get(match[1]) ?? []), channel]);
    }
  }
  return reads;
}

describe.each(FIRST_PARTY_VERTICAL_SLUGS)("%s compiles the closed tint scale", (vertical) => {
  const { cssVariables, modeBlocks } = lowerTheme(FIRST_PARTY_BASELINES[vertical], vertical);

  it("declares all 25 rungs, whether or not the preset seeds the role", () => {
    for (const { scale, colorVar } of ROLES) {
      for (const step of STEPS) {
        expect(cssVariables[`${scale}-${step}`]).toBe(
          `color-mix(in oklab, var(${colorVar}) ${step}%, var(--ds-color-bg-primary))`,
        );
      }
    }
    expect(Object.keys(cssVariables).filter((key) => key.startsWith("--ds-tint-"))).toHaveLength(25);
  });

  it("declares every tint rung its own chrome reads", () => {
    const reads = tintReads(cssVariables);
    // Non-vacuity: the notifier reads 14 rungs and the alert 8 more.
    expect([...reads.values()].flat().length).toBeGreaterThanOrEqual(22);
    const undeclared = [...reads.keys()].filter((rung) => cssVariables[rung] === undefined);
    expect(undeclared, `${vertical} reads rungs it never declares`).toEqual([]);
  });

  it("keeps the scale out of the mode delta", () => {
    // A rung names its role's channel, so a mode overlay derives the identical
    // string and `compileModeBlocks` deduplicates it against the base block.
    for (const block of modeBlocks ?? []) {
      expect(Object.keys(block.cssVariables).filter((key) => key.startsWith("--ds-tint-"))).toEqual([]);
    }
  });
});
