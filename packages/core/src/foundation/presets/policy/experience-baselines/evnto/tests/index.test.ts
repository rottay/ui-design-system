import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import type { AnimationPersonalityTokens } from "@/foundation/contracts/kernel/tokens/personality";
import { PRODUCT_PROFILES } from "@/foundation/presets/product-profiles";
import { resolvePartialPersonalityCssVariables } from "@/foundation/tokens/ts/runtime/personality";
import { DEFAULT_PERSONALITY } from "@/infrastructure/runtime/personality/foundation/defaults";

import { EVNTO_CANONICAL_MOTION } from "..";

const PRESETS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

const RECORDED_MOTION = {
  intensity: 1.5,
  entrance: "slideUp",
  entranceDuration: 350,
  hoverLift: 4,
  hoverScale: 1.03,
  useSpring: true,
  springTension: 200,
  springFriction: 18,
  staggerDelay: 80,
  staggerMax: 600,
  pulseSpeed: "fast",
  skeletonStyle: "wave",
  countUpEnabled: true,
} as const;

const RECORDED_CHANNELS = {
  "--ds-badge-hover-transform": "translateY(-4px) scale(1.03)",
  "--ds-button-hover-transform": "translateY(-4px) scale(1.03)",
  "--ds-card-hover-transform": "translateY(-4px) scale(1.03)",
  "--ds-modal-animation-duration": "350ms",
  "--ds-modal-animation-timing": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "--ds-personality-animation-count-up-enabled": "1",
  "--ds-personality-animation-entrance": "slideUp",
  "--ds-personality-animation-entrance-duration": "350ms",
  "--ds-personality-animation-hover-lift": "4px",
  "--ds-personality-animation-hover-scale": 1.03,
  "--ds-personality-animation-intensity": 1.5,
  "--ds-personality-animation-offset-distance": "22px",
  "--ds-personality-animation-pulse-speed": "fast",
  "--ds-personality-animation-skeleton-style": "wave",
  "--ds-personality-animation-spring-friction": 18,
  "--ds-personality-animation-spring-tension": 200,
  "--ds-personality-animation-stagger-delay": "80ms",
  "--ds-personality-animation-stagger-max": "600ms",
  "--ds-skeleton-animation-duration": "1.1s",
} as const;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "tests" ? [] : sourceFiles(path);
    return /\.(?:ts|tsx)$/u.test(entry.name) && !/\.(?:test|spec)\./u.test(entry.name)
      ? [path]
      : [];
  });
}

describe("evnto experience baseline: motion", () => {
  it("is authored against the animation personality contract, field for field", () => {
    expectTypeOf(EVNTO_CANONICAL_MOTION).toMatchTypeOf<AnimationPersonalityTokens>();
    expectTypeOf<keyof typeof EVNTO_CANONICAL_MOTION>().toEqualTypeOf<
      keyof AnimationPersonalityTokens
    >();
    expect(Object.keys(EVNTO_CANONICAL_MOTION).sort()).toEqual(
      Object.keys(DEFAULT_PERSONALITY.animation).sort()
    );
  });

  it("conserves the thirteen authored values", () => {
    expect(Object.keys(EVNTO_CANONICAL_MOTION)).toHaveLength(13);
    expect(EVNTO_CANONICAL_MOTION).toEqual(RECORDED_MOTION);
    expect(Object.isFrozen(EVNTO_CANONICAL_MOTION)).toBe(true);
  });

  it("is the animation personality of the events.organizer profile, by reference", () => {
    expect(PRODUCT_PROFILES["events.organizer"].personality?.animation).toBe(
      EVNTO_CANONICAL_MOTION
    );
  });

  it("projects the recorded animation channels for the events.organizer profile", () => {
    const channels = resolvePartialPersonalityCssVariables(
      PRODUCT_PROFILES["events.organizer"].personality
    );
    expect(channels).toMatchObject(RECORDED_CHANNELS);
  });

  it("leaves no preset source that names the open-ended brand motion interface", () => {
    const files = sourceFiles(PRESETS_ROOT);
    expect(files.length).toBeGreaterThan(10);
    const retired = new RegExp(`\\b${["Brand", "Motion"].join("")}\\b`, "u");
    const offenders = files
      .filter((file) => retired.test(readFileSync(file, "utf-8")))
      .map((file) => relative(PRESETS_ROOT, file));
    expect(offenders).toEqual([]);
  });
});
